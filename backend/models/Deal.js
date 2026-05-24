const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  title: { type: String, required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  value: { type: Number, required: true, default: 0 },
  stage: {
    type: String,
    enum: ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'],
    default: 'Prospecting'
  },
  probability: { type: Number, default: 10, min: 0, max: 100 },
  expectedCloseDate: { type: Date },
  actualCloseDate: { type: Date },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  products: [{ name: String, quantity: Number, unitPrice: Number }],
  notes: { type: String },
  lostReason: { type: String },
  tags: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Deal', dealSchema);
