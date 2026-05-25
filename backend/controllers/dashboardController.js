const Lead = require('../models/Lead');
const Client = require('../models/Client');
const Deal = require('../models/Deal');
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const User = require('../models/User');

exports.getDashboardStats = async (req, res) => {
  try {
    const isAdmin = ['admin', 'manager', 'team_lead'].includes(req.user.role);
    const userFilter = isAdmin ? {} : { assignedTo: req.user._id };

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalLeads, newLeadsThisMonth, totalClients, totalDeals,
      wonDeals, openDeals, totalTasks, pendingTasks, overdueTasks,
      revenueThisMonth, revenueLastMonth, activities, teamPerformance
    ] = await Promise.all([
      Lead.countDocuments(userFilter),
      Lead.countDocuments({ ...userFilter, createdAt: { $gte: startOfMonth } }),
      Client.countDocuments(userFilter),
      Deal.countDocuments(userFilter),
      Deal.aggregate([{ $match: { ...userFilter, stage: 'Closed Won' } }, { $group: { _id: null, count: { $sum: 1 }, value: { $sum: '$value' } } }]),
      Deal.countDocuments({ ...userFilter, stage: { $nin: ['Closed Won', 'Closed Lost'] } }),
      Task.countDocuments(userFilter),
      Task.countDocuments({ ...userFilter, status: 'Pending' }),
      Task.countDocuments({ ...userFilter, status: 'Pending', dueDate: { $lt: now } }),
      Deal.aggregate([{ $match: { ...userFilter, stage: 'Closed Won', updatedAt: { $gte: startOfMonth } } }, { $group: { _id: null, value: { $sum: '$value' } } }]),
      Deal.aggregate([{ $match: { ...userFilter, stage: 'Closed Won', updatedAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } }, { $group: { _id: null, value: { $sum: '$value' } } }]),
      Activity.find(isAdmin ? {} : { performedBy: req.user._id }).populate('performedBy', 'name avatar').sort({ createdAt: -1 }).limit(15),
      isAdmin ? User.aggregate([
        { $lookup: { from: 'leads', localField: '_id', foreignField: 'assignedTo', as: 'leads' } },
        { $lookup: { from: 'deals', localField: '_id', foreignField: 'assignedTo', as: 'deals' } },
        { $lookup: { from: 'tasks', localField: '_id', foreignField: 'assignedTo', as: 'tasks' } },
        { $project: { name: 1, role: 1, avatar: 1, target: 1, department: 1, leadsCount: { $size: '$leads' }, dealsCount: { $size: '$deals' }, wonDeals: { $size: { $filter: { input: '$deals', cond: { $eq: ['$$this.stage', 'Closed Won'] } } } }, revenue: { $sum: { $map: { input: { $filter: { input: '$deals', cond: { $eq: ['$$this.stage', 'Closed Won'] } } }, in: '$$this.value' } } }, tasksCompleted: { $size: { $filter: { input: '$tasks', cond: { $eq: ['$$this.status', 'Completed'] } } } } } },
        { $sort: { revenue: -1 } }
      ]) : []
    ]);

    const leadsByStatus = await Lead.aggregate([
      { $match: userFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const dealsChart = await Deal.aggregate([
      { $match: { createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } } },
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, created: { $sum: 1 }, won: { $sum: { $cond: [{ $eq: ['$stage', 'Closed Won'] }, 1, 0] } }, value: { $sum: { $cond: [{ $eq: ['$stage', 'Closed Won'] }, '$value', 0] } } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalLeads,
          newLeadsThisMonth,
          totalClients,
          totalDeals,
          wonDealsCount: wonDeals[0]?.count || 0,
          wonDealsValue: wonDeals[0]?.value || 0,
          openDeals,
          totalTasks,
          pendingTasks,
          overdueTasks,
          revenueThisMonth: revenueThisMonth[0]?.value || 0,
          revenueLastMonth: revenueLastMonth[0]?.value || 0,
        },
        leadsByStatus,
        dealsChart,
        activities,
        teamPerformance
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
