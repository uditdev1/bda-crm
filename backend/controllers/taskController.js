const Task = require('../models/Task');
const Activity = require('../models/Activity');

exports.getTasks = async (req, res) => {
  try {
    const { status, priority, type, assignedTo, page = 1, limit = 30 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (type) query.type = type;
    if (assignedTo) query.assignedTo = assignedTo;
    if (req.user.role === 'bda') query.assignedTo = req.user._id;

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email avatar')
      .populate('relatedLead', 'companyName')
      .populate('relatedClient', 'companyName')
      .populate('relatedDeal', 'title')
      .sort({ dueDate: 1, priority: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Task.countDocuments(query);
    res.json({ success: true, data: tasks, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, createdBy: req.user._id });
    await Activity.create({
      type: 'task_created',
      description: `Task "${task.title}" created`,
      performedBy: req.user._id,
      relatedTask: task._id
    });
    await task.populate('assignedTo', 'name email avatar');
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    if (req.body.status === 'Completed') req.body.completedAt = new Date();
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('assignedTo', 'name email avatar');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    if (task.status === 'Completed') {
      await Activity.create({
        type: 'task_completed',
        description: `Task "${task.title}" completed`,
        performedBy: req.user._id,
        relatedTask: task._id
      });
    }
    res.json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
