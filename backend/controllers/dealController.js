const Deal = require('../models/Deal');
const Activity = require('../models/Activity');

exports.getDeals = async (req, res) => {
  try {
    const { stage, assignedTo, search, page = 1, limit = 50 } = req.query;
    const query = {};
    if (stage) query.stage = stage;
    if (assignedTo) query.assignedTo = assignedTo;
    if (search) query.$or = [{ title: { $regex: search, $options: 'i' } }];
    if (req.user.role === 'bda') query.assignedTo = req.user._id;

    const deals = await Deal.find(query)
      .populate('client', 'companyName contactPerson email')
      .populate('assignedTo', 'name email avatar')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Deal.countDocuments(query);
    const totalValue = await Deal.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$value' }, weighted: { $sum: { $multiply: ['$value', { $divide: ['$probability', 100] }] } } } }
    ]);

    res.json({ success: true, data: deals, total, totalValue: totalValue[0] || { total: 0, weighted: 0 } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDeal = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate('client', 'companyName contactPerson email phone')
      .populate('assignedTo', 'name email avatar');
    if (!deal) return res.status(404).json({ success: false, message: 'Deal not found' });
    res.json({ success: true, data: deal });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createDeal = async (req, res) => {
  try {
    const deal = await Deal.create({ ...req.body, createdBy: req.user._id });
    await Activity.create({
      type: 'deal_created',
      description: `New deal "${deal.title}" created worth ₹${deal.value.toLocaleString()}`,
      performedBy: req.user._id,
      relatedDeal: deal._id
    });
    await deal.populate('client', 'companyName');
    await deal.populate('assignedTo', 'name email avatar');
    res.status(201).json({ success: true, data: deal });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateDeal = async (req, res) => {
  try {
    const old = await Deal.findById(req.params.id);
    const deal = await Deal.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('client', 'companyName contactPerson email')
      .populate('assignedTo', 'name email avatar');

    if (!deal) return res.status(404).json({ success: false, message: 'Deal not found' });

    let actType = 'deal_updated';
    let actDesc = `Deal "${deal.title}" updated`;
    if (old.stage !== deal.stage) {
      if (deal.stage === 'Closed Won') { actType = 'deal_won'; actDesc = `Deal "${deal.title}" WON! ₹${deal.value.toLocaleString()}`; }
      else if (deal.stage === 'Closed Lost') { actType = 'deal_lost'; actDesc = `Deal "${deal.title}" lost`; }
      else actDesc = `Deal "${deal.title}" moved to ${deal.stage}`;
    }

    await Activity.create({ type: actType, description: actDesc, performedBy: req.user._id, relatedDeal: deal._id });
    res.json({ success: true, data: deal });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteDeal = async (req, res) => {
  try {
    await Deal.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deal deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPipelineStats = async (req, res) => {
  try {
    const pipeline = await Deal.aggregate([
      { $group: { _id: '$stage', count: { $sum: 1 }, value: { $sum: '$value' }, avgProbability: { $avg: '$probability' } } },
      { $sort: { _id: 1 } }
    ]);
    const monthlyRevenue = await Deal.aggregate([
      { $match: { stage: 'Closed Won' } },
      { $group: { _id: { month: { $month: '$updatedAt' }, year: { $year: '$updatedAt' } }, revenue: { $sum: '$value' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);
    res.json({ success: true, data: { pipeline, monthlyRevenue } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
