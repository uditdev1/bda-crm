const Lead = require('../models/Lead');
const Client = require('../models/Client');
const Activity = require('../models/Activity');

exports.getLeads = async (req, res) => {
  try {
    const { status, priority, assignedTo, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;
    if (search) query.$or = [
      { companyName: { $regex: search, $options: 'i' } },
      { contactPerson: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
    if (req.user.role === 'bda') query.assignedTo = req.user._id;

    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, data: leads, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email avatar phone')
      .populate('createdBy', 'name');
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, data: lead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createLead = async (req, res) => {
  try {
    const lead = await Lead.create({ ...req.body, createdBy: req.user._id });
    await Activity.create({
      type: 'lead_created',
      description: `New lead ${lead.companyName} created`,
      performedBy: req.user._id,
      relatedLead: lead._id
    });
    await lead.populate('assignedTo', 'name email avatar');
    res.status(201).json({ success: true, data: lead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('assignedTo', 'name email avatar');
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    await Activity.create({
      type: 'lead_updated',
      description: `Lead ${lead.companyName} updated - status: ${lead.status}`,
      performedBy: req.user._id,
      relatedLead: lead._id
    });
    res.json({ success: true, data: lead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, message: 'Lead deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.convertLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    if (lead.isConverted) return res.status(400).json({ success: false, message: 'Lead already converted' });

    const client = await Client.create({
      companyName: lead.companyName,
      contactPerson: lead.contactPerson,
      email: lead.email,
      phone: lead.phone,
      industry: lead.industry,
      address: lead.address,
      city: lead.city,
      state: lead.state,
      assignedTo: lead.assignedTo,
      createdBy: req.user._id,
      convertedFrom: lead._id,
      notes: lead.notes
    });

    lead.isConverted = true;
    lead.convertedAt = new Date();
    lead.status = 'Won';
    await lead.save();

    await Activity.create({
      type: 'lead_converted',
      description: `Lead ${lead.companyName} converted to client`,
      performedBy: req.user._id,
      relatedLead: lead._id,
      relatedClient: client._id
    });

    res.json({ success: true, data: client, message: 'Lead converted to client successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getLeadStats = async (req, res) => {
  try {
    const byStatus = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, value: { $sum: '$estimatedValue' } } }
    ]);
    const bySource = await Lead.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ]);
    const byPriority = await Lead.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);
    res.json({ success: true, data: { byStatus, bySource, byPriority } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
