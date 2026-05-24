# 🏭 ISAII CRM — BDA Team Module for Manufacturing Company

A full-stack **MERN** CRM system for the Business Development Associate team of a manufacturing company. Manages lead pipelines, client relations, deal tracking, tasks, and team performance analytics.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+  |  MongoDB (local or Atlas)  |  npm

### 1. Clone & Setup Backend
```bash
git clone https://github.com/YOUR_USERNAME/bda-crm.git
cd bda-crm/backend
npm install
```

Create `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/bda_crm
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=30d
NODE_ENV=development
```

Seed demo data, then start:
```bash
npm run seed   # creates demo users, leads, clients, deals, tasks
npm run dev    # starts server on :5000
```

### 2. Setup Frontend
```bash
cd ../frontend
npm install
npm run dev    # starts on :5173
```

---

## 🔑 Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@isaii.in | admin123 |
| Manager | sneha@isaii.in | password123 |
| Team Lead | rahul@isaii.in | password123 |
| BDA | priya@isaii.in | password123 |

---

## 🎯 Modules

- **Dashboard** — KPIs, activity feed, team performance, sales charts
- **Leads** — Full CRUD, status pipeline, priority, convert to client
- **Clients** — Client cards with revenue tracking
- **Deals** — Kanban board + list view, stage management
- **Tasks** — Call/Email/Meeting tasks with overdue alerts
- **Team** — Member profiles, roles, target tracking
- **Reports** — Charts: monthly trends, lead sources, pipeline funnel, team comparison

---

## 📁 Structure

```
bda-crm/
├── backend/          # Express + MongoDB API
│   ├── controllers/
│   ├── models/       # User, Lead, Client, Deal, Task, Activity
│   ├── routes/
│   ├── middleware/   # JWT auth
│   ├── seed.js
│   └── server.js
└── frontend/         # React + Vite + Tailwind
    └── src/
        ├── pages/    # Dashboard, Leads, Clients, Deals, Tasks, Team, Reports
        ├── components/
        ├── context/
        └── api/
```

---

## 🛠️ Tech Stack

**Backend:** Node.js · Express · MongoDB · Mongoose · JWT · bcryptjs  
**Frontend:** React 18 · Vite · Tailwind CSS · Recharts · Axios · react-router-dom

---

## 🔐 Role-Based Access

| Feature | Admin | Manager | Team Lead | BDA |
|---------|-------|---------|-----------|-----|
| Full Dashboard | ✅ | ✅ | ✅ | Own data |
| All Leads/Deals | ✅ | ✅ | ✅ | Own only |
| Team & Reports | ✅ | ✅ | ✅ | ❌ |
| Add Team Members | ✅ | ❌ | ❌ | ❌ |

---

**Module:** BDA Team Module for Manufacturing | **Stack:** MERN | **Assessment:** ISAII AI Intern Role
