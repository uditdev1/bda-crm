const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['lead_created', 'lead_updated', 'lead_converted', 'deal_created', 'deal_updated', 'deal_won', 'deal_lost', 'task_created', 'task_completed', 'client_added', 'note_added', 'call_logged', 'email_sent', 'meeting_scheduled'],
    required: true
  },
  description: { type: String, required: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  relatedLead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  relatedClient: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  relatedDeal: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
  relatedTask: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  metadata: { type: Object }
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
