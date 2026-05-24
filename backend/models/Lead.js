const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  companyName: { type: String, required: true, trim: true },
  contactPerson: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  industry: {
    type: String,
    enum: ['Automotive', 'Textile', 'Chemical', 'Electronics', 'Food Processing', 'Machinery', 'Packaging', 'Steel', 'Pharma', 'Other'],
    default: 'Other'
  },
  source: {
    type: String,
    enum: ['Cold Call', 'Email Campaign', 'Referral', 'Trade Show', 'Website', 'LinkedIn', 'Walk-in', 'Other'],
    default: 'Cold Call'
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost', 'On Hold'],
    default: 'New'
  },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  estimatedValue: { type: Number, default: 0 },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  notes: { type: String },
  followUpDate: { type: Date },
  tags: [{ type: String }],
  productInterest: [{ type: String }],
  convertedAt: { type: Date },
  isConverted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
