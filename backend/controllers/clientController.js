const Client = require('../models/Client');
const Deal = require('../models/Deal');
const Activity = require('../models/Activity');

exports.getClients = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) query.$or = [
      { companyName: { $regex: search, $options: 'i' } },
      { contactPerson: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
    if (req.user.role === 'bda') query.assignedTo = req.user._id;

    const total = await Client.countDocuments(query);
    const clients = await Client.find(query)
      .populate('assignedTo', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, data: clients, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).populate('assignedTo', 'name email avatar');
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
    const deals = await Deal.find({ client: client._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: client, deals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createClient = async (req, res) => {
  try {
    const client = await Client.create({ ...req.body, createdBy: req.user._id });
    await Activity.create({
      type: 'client_added',
      description: `New client ${client.companyName} added`,
      performedBy: req.user._id,
      relatedClient: client._id
    });
    res.status(201).json({ success: true, data: client });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('assignedTo', 'name email avatar');
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
    res.json({ success: true, data: client });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    await Client.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Client deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
