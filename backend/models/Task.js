const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  type: {
    type: String,
    enum: ['Call', 'Email', 'Meeting', 'Demo', 'Follow-up', 'Site Visit', 'Proposal', 'Other'],
    default: 'Call'
  },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'], default: 'Pending' },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  dueDate: { type: Date },
  completedAt: { type: Date },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  relatedLead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  relatedClient: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  relatedDeal: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
