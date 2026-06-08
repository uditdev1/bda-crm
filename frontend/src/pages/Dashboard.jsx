import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { HiTrendingUp, HiTrendingDown, HiLightningBolt, HiUsers, HiBriefcase, HiCheckCircle, HiCurrencyRupee, HiExclamation, HiClock } from 'react-icons/hi';
import { formatDistanceToNow } from 'date-fns';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

function StatCard({ title, value, sub, icon: Icon, color, trend, trendVal }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
    cyan: 'bg-cyan-50 text-cyan-600',
  };
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon size={20} />
        </div>
        {trendVal !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
            {trend === 'up' ? <HiTrendingUp size={14} /> : <HiTrendingDown size={14} />}
            {trendVal}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-slate-800">{value}</div>
      <div className="text-sm font-medium text-slate-600 mt-0.5">{title}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(res => setData(res.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const { stats, leadsByStatus, dealsChart, activities, teamPerformance } = data || {};

  const revChange = stats?.revenueLastMonth ? Math.round(((stats.revenueThisMonth - stats.revenueLastMonth) / stats.revenueLastMonth) * 100) : 0;

  const chartData = (dealsChart || []).map(d => ({
    name: MONTHS[d._id.month - 1],
    deals: d.created,
    won: d.won,
    revenue: Math.round(d.value / 1000)
  }));

  const pieData = (leadsByStatus || []).map(d => ({ name: d._id, value: d.count }));

  const activityIcons = {
    lead_created: '🎯', lead_updated: '✏️', lead_converted: '🎉', deal_won: '🏆',
    deal_created: '💼', deal_updated: '📊', deal_lost: '❌', task_completed: '✅',
    client_added: '👥', task_created: '📋', call_logged: '📞', email_sent: '📧'
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}! 👋</h2>
          <p className="text-slate-500 text-sm">Here's what's happening with your sales today</p>
        </div>
        <div className="hidden lg:block text-right">
          <div className="text-sm font-medium text-slate-600">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Leads" value={stats?.totalLeads || 0} sub={`+${stats?.newLeadsThisMonth || 0} this month`} icon={HiLightningBolt} color="blue" trend="up" trendVal={12} />
        <StatCard title="Active Clients" value={stats?.totalClients || 0} icon={HiUsers} color="green" />
        <StatCard title="Open Deals" value={stats?.openDeals || 0} sub={`${stats?.wonDealsCount || 0} won`} icon={HiBriefcase} color="orange" />
        <StatCard
          title="Revenue This Month"
          value={`₹${((stats?.revenueThisMonth || 0) / 100000).toFixed(1)}L`}
          sub={`vs ₹${((stats?.revenueLastMonth || 0) / 100000).toFixed(1)}L last month`}
          icon={HiCurrencyRupee} color="purple"
          trend={revChange >= 0 ? 'up' : 'down'} trendVal={Math.abs(revChange)}
        />
        <StatCard title="Pending Tasks" value={stats?.pendingTasks || 0} icon={HiClock} color="cyan" />
        <StatCard title="Overdue Tasks" value={stats?.overdueTasks || 0} icon={HiExclamation} color="red" />
        <StatCard title="Total Deals Value" value={`₹${((stats?.wonDealsValue || 0) / 100000).toFixed(1)}L`} sub="Won deals" icon={HiTrendingUp} color="green" />
        <StatCard title="Total Tasks" value={stats?.totalTasks || 0} icon={HiCheckCircle} color="blue" />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Area Chart */}
        <div className="lg:col-span-2 card p-5">
          <h3 className="text-base font-semibold text-slate-800 mb-4">Sales Performance</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#colorRev)" name="Revenue (₹K)" />
              <Area type="monotone" dataKey="won" stroke="#10b981" strokeWidth={2} fill="transparent" name="Won Deals" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="card p-5">
          <h3 className="text-base font-semibold text-slate-800 mb-4">Leads by Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Recent Activities */}
        <div className="card p-5">
          <h3 className="text-base font-semibold text-slate-800 mb-4">Recent Activities</h3>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {(activities || []).length === 0 && <p className="text-slate-400 text-sm">No activities yet</p>}
            {(activities || []).map((act) => (
              <div key={act._id} className="flex items-start gap-3">
                <span className="text-lg flex-shrink-0">{activityIcons[act.type] || '📌'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 leading-snug">{act.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-blue-600 font-medium">{act.performedBy?.name}</span>
                    <span className="text-xs text-slate-400">{formatDistanceToNow(new Date(act.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Performance */}
        {(teamPerformance || []).length > 0 && (
          <div className="card p-5">
            <h3 className="text-base font-semibold text-slate-800 mb-4">Team Performance</h3>
            <div className="space-y-3">
              {(teamPerformance || []).slice(0, 5).map((member) => {
                const pct = member.target > 0 ? Math.min(100, Math.round((member.revenue / member.target) * 100)) : 0;
                return (
                  <div key={member._id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                          {member.name?.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-700">{member.name}</div>
                          <div className="text-xs text-slate-400">{member.leadsCount} leads · {member.wonDeals} won</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-slate-800">₹{(member.revenue / 100000).toFixed(1)}L</div>
                        <div className="text-xs text-slate-400">{pct}% target</div>
                      </div>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-green-500' : pct >= 60 ? 'bg-blue-500' : 'bg-orange-400'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
