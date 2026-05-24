const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  contactPerson: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  industry: { type: String },
  gstNumber: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  pincode: { type: String },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  convertedFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  status: { type: String, enum: ['Active', 'Inactive', 'Prospect'], default: 'Active' },
  totalRevenue: { type: Number, default: 0 },
  notes: { type: String },
  website: { type: String },
  tags: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);
