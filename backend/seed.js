require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

const User = require('./models/User');
const Lead = require('./models/Lead');
const Client = require('./models/Client');
const Deal = require('./models/Deal');
const Task = require('./models/Task');
const Activity = require('./models/Activity');

const seed = async () => {
  await connectDB();
  console.log('🌱 Seeding database...');

  await User.deleteMany({});
  await Lead.deleteMany({});
  await Client.deleteMany({});
  await Deal.deleteMany({});
  await Task.deleteMany({});
  await Activity.deleteMany({});

  const users = await User.insertMany([
    { name: 'Admin User', email: 'admin@isaii.in', password: await bcrypt.hash('admin123', 12), role: 'admin', phone: '9876543210', department: 'Management', target: 5000000 },
    { name: 'Rahul Sharma', email: 'rahul@isaii.in', password: await bcrypt.hash('password123', 12), role: 'team_lead', phone: '9876543211', department: 'Sales', target: 2000000 },
    { name: 'Priya Singh', email: 'priya@isaii.in', password: await bcrypt.hash('password123', 12), role: 'bda', phone: '9876543212', department: 'Sales', target: 1000000 },
    { name: 'Amit Kumar', email: 'amit@isaii.in', password: await bcrypt.hash('password123', 12), role: 'bda', phone: '9876543213', department: 'Sales', target: 1000000 },
    { name: 'Sneha Patel', email: 'sneha@isaii.in', password: await bcrypt.hash('password123', 12), role: 'manager', phone: '9876543214', department: 'Sales', target: 3000000 }
  ]);

  const leads = await Lead.insertMany([
    { companyName: 'Tata Steel Ltd', contactPerson: 'Vikram Mehta', email: 'vikram@tatasteel.com', phone: '9811234567', industry: 'Steel', source: 'Trade Show', status: 'Qualified', priority: 'High', estimatedValue: 850000, assignedTo: users[2]._id, createdBy: users[0]._id, city: 'Mumbai', state: 'Maharashtra', notes: 'Interested in industrial automation components', followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
    { companyName: 'Mahindra Auto Parts', contactPerson: 'Suresh Reddy', email: 'suresh@mahindra.com', phone: '9822345678', industry: 'Automotive', source: 'Cold Call', status: 'Contacted', priority: 'Medium', estimatedValue: 450000, assignedTo: users[3]._id, createdBy: users[1]._id, city: 'Pune', state: 'Maharashtra', followUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) },
    { companyName: 'Gujarat Chemicals Pvt Ltd', contactPerson: 'Anita Shah', email: 'anita@gujaratchem.com', phone: '9833456789', industry: 'Chemical', source: 'LinkedIn', status: 'Proposal Sent', priority: 'High', estimatedValue: 1200000, assignedTo: users[2]._id, createdBy: users[0]._id, city: 'Ahmedabad', state: 'Gujarat' },
    { companyName: 'Punjab Packaging Industries', contactPerson: 'Harpreet Kaur', email: 'harpreet@punjabpack.com', phone: '9844567890', industry: 'Packaging', source: 'Referral', status: 'New', priority: 'Low', estimatedValue: 320000, assignedTo: users[3]._id, createdBy: users[3]._id, city: 'Ludhiana', state: 'Punjab' },
    { companyName: 'Reliance Electronics', contactPerson: 'Deepak Joshi', email: 'deepak@relianceelec.com', phone: '9855678901', industry: 'Electronics', source: 'Email Campaign', status: 'Negotiation', priority: 'Critical', estimatedValue: 2500000, assignedTo: users[1]._id, createdBy: users[0]._id, city: 'Delhi', state: 'Delhi' },
    { companyName: 'Amul Food Processing', contactPerson: 'Ramesh Patel', email: 'ramesh@amulfood.com', phone: '9866789012', industry: 'Food Processing', source: 'Website', status: 'New', priority: 'Medium', estimatedValue: 680000, assignedTo: users[2]._id, createdBy: users[2]._id, city: 'Anand', state: 'Gujarat' },
    { companyName: 'Lupin Pharma', contactPerson: 'Kavita Nair', email: 'kavita@lupinpharma.com', phone: '9877890123', industry: 'Pharma', source: 'Cold Call', status: 'Lost', priority: 'High', estimatedValue: 1500000, assignedTo: users[3]._id, createdBy: users[1]._id, city: 'Mumbai', state: 'Maharashtra' },
    { companyName: 'Kirloskar Machinery', contactPerson: 'Sanjay Kirloskar', email: 'sanjay@kirloskar.com', phone: '9888901234', industry: 'Machinery', source: 'Trade Show', status: 'Qualified', priority: 'High', estimatedValue: 3200000, assignedTo: users[1]._id, createdBy: users[0]._id, city: 'Pune', state: 'Maharashtra' }
  ]);

  const clients = await Client.insertMany([
    { companyName: 'Bajaj Auto Ltd', contactPerson: 'Rajesh Bajaj', email: 'rajesh@bajaj.com', phone: '9800111222', industry: 'Automotive', gstNumber: '27AABCB1234F1ZX', address: 'Akurdi', city: 'Pune', state: 'Maharashtra', assignedTo: users[2]._id, createdBy: users[0]._id, totalRevenue: 4500000 },
    { companyName: 'SAIL (Steel Authority)', contactPerson: 'Pradeep Singh', email: 'pradeep@sail.com', phone: '9800222333', industry: 'Steel', gstNumber: '07AABCS1234C1ZX', address: 'Lodhi Road', city: 'Delhi', state: 'Delhi', assignedTo: users[1]._id, createdBy: users[0]._id, totalRevenue: 8900000 },
    { companyName: 'Asian Paints', contactPerson: 'Manish Mehta', email: 'manish@asianpaints.com', phone: '9800333444', industry: 'Chemical', address: 'Bhandup', city: 'Mumbai', state: 'Maharashtra', assignedTo: users[3]._id, createdBy: users[0]._id, totalRevenue: 2100000 }
  ]);

  const deals = await Deal.insertMany([
    { title: 'Industrial Conveyor Belt Supply - Bajaj', client: clients[0]._id, value: 1800000, stage: 'Proposal', probability: 60, expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), assignedTo: users[2]._id, createdBy: users[0]._id },
    { title: 'Steel Pipe Fittings - SAIL Q2', client: clients[1]._id, value: 3200000, stage: 'Negotiation', probability: 75, expectedCloseDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), assignedTo: users[1]._id, createdBy: users[0]._id },
    { title: 'Paint Manufacturing Equipment', client: clients[2]._id, value: 950000, stage: 'Closed Won', probability: 100, expectedCloseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), actualCloseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), assignedTo: users[3]._id, createdBy: users[0]._id },
    { title: 'Bajaj Auto Q3 Parts Order', client: clients[0]._id, value: 2400000, stage: 'Qualification', probability: 40, expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), assignedTo: users[2]._id, createdBy: users[1]._id },
    { title: 'SAIL Annual Maintenance Contract', client: clients[1]._id, value: 5600000, stage: 'Prospecting', probability: 20, expectedCloseDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), assignedTo: users[1]._id, createdBy: users[0]._id }
  ]);

  await Task.insertMany([
    { title: 'Follow up call - Tata Steel', description: 'Discuss proposal details and pricing', type: 'Call', status: 'Pending', priority: 'High', dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), assignedTo: users[2]._id, createdBy: users[0]._id, relatedLead: leads[0]._id },
    { title: 'Send revised quotation - Reliance', type: 'Email', status: 'Pending', priority: 'Urgent', dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000), assignedTo: users[1]._id, createdBy: users[0]._id, relatedLead: leads[4]._id },
    { title: 'Product demo for Kirloskar team', type: 'Demo', status: 'In Progress', priority: 'High', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), assignedTo: users[1]._id, createdBy: users[1]._id, relatedLead: leads[7]._id },
    { title: 'Bajaj site visit for measurement', type: 'Site Visit', status: 'Pending', priority: 'Medium', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), assignedTo: users[2]._id, createdBy: users[0]._id, relatedClient: clients[0]._id },
    { title: 'Prepare monthly sales report', type: 'Other', status: 'Pending', priority: 'Low', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), assignedTo: users[4]._id, createdBy: users[4]._id },
    { title: 'Contract negotiation meeting - SAIL', type: 'Meeting', status: 'Completed', priority: 'High', dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), completedAt: new Date(), assignedTo: users[1]._id, createdBy: users[0]._id, relatedDeal: deals[1]._id }
  ]);

  console.log('✅ Database seeded successfully!');
  console.log('\n📋 Login Credentials:');
  console.log('Admin:    admin@isaii.in    / admin123');
  console.log('Manager:  sneha@isaii.in    / password123');
  console.log('TL:       rahul@isaii.in    / password123');
  console.log('BDA:      priya@isaii.in    / password123');
  console.log('BDA:      amit@isaii.in     / password123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
