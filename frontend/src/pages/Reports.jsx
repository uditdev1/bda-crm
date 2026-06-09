import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, LineChart, Line
} from 'recharts';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];
const STAGE_ORDER = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

export default function Reports() {
  const [data, setData] = useState(null);
  const [leadStats, setLeadStats] = useState(null);
  const [pipelineStats, setPipelineStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    Promise.all([
      api.get('/dashboard'),
      api.get('/leads/stats'),
      api.get('/deals/pipeline-stats'),
    ]).then(([dash, leads, pipeline]) => {
      setData(dash.data.data);
      setLeadStats(leads.data.data);
      setPipelineStats(pipeline.data.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const { stats, dealsChart, teamPerformance } = data || {};

  const monthlyData = (dealsChart || []).map(d => ({
    name: MONTHS[d._id.month - 1],
    deals: d.created,
    won: d.won,
    revenue: Math.round((d.value || 0) / 1000),
  }));

  const leadStatusData = (leadStats?.byStatus || []).map(d => ({ name: d._id, value: d.count }));
  const leadSourceData = (leadStats?.bySource || []).map(d => ({ name: d._id, value: d.count }));
  const leadPriorityData = (leadStats?.byPriority || []).map(d => ({ name: d._id, value: d.count }));

  const pipelineData = STAGE_ORDER.map(stage => {
    const found = (pipelineStats?.pipeline || []).find(p => p._id === stage);
    return { stage, count: found?.count || 0, value: Math.round((found?.value || 0) / 100000), probability: Math.round(found?.avgProbability || 0) };
  });

  const teamData = (teamPerformance || []).map(m => ({
    name: m.name?.split(' ')[0],
    leads: m.leadsCount,
    won: m.wonDeals,
    revenue: Math.round((m.revenue || 0) / 100000),
    target: Math.round((m.target || 0) / 100000),
  }));

  const TABS = ['overview', 'leads', 'pipeline', 'team'];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="card p-1 flex gap-1 w-fit">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Won Revenue', value: `₹${((stats?.wonDealsValue || 0) / 100000).toFixed(1)}L`, sub: `${stats?.wonDealsCount || 0} deals won` },
              { label: 'This Month', value: `₹${((stats?.revenueThisMonth || 0) / 100000).toFixed(1)}L`, sub: 'Monthly revenue' },
              { label: 'Total Leads', value: stats?.totalLeads || 0, sub: `${stats?.newLeadsThisMonth || 0} new this month` },
              { label: 'Open Deals', value: stats?.openDeals || 0, sub: 'Active pipeline' },
            ].map(k => (
              <div key={k.label} className="card p-5">
                <div className="text-2xl font-bold text-slate-800">{k.value}</div>
                <div className="text-sm font-medium text-slate-600 mt-0.5">{k.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{k.sub}</div>
              </div>
            ))}
          </div>

          <div className="card p-5">
            <h3 className="text-base font-semibold text-slate-800 mb-4">Monthly Sales Trend (Revenue ₹K)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="r1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="revenue" name="Revenue (₹K)" stroke="#3b82f6" strokeWidth={2} fill="url(#r1)" />
                <Line type="monotone" dataKey="won" name="Deals Won" stroke="#10b981" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'leads' && (
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="card p-5">
            <h3 className="text-base font-semibold text-slate-800 mb-4">Leads by Status</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={leadStatusData} cx="50%" cy="50%" outerRadius={90} innerRadius={55} paddingAngle={3} dataKey="value" nameKey="name">
                  {leadStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="card p-5">
            <h3 className="text-base font-semibold text-slate-800 mb-4">Lead Sources</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={leadSourceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} width={90} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="value" name="Leads" radius={[0, 4, 4, 0]}>
                  {leadSourceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card p-5">
            <h3 className="text-base font-semibold text-slate-800 mb-4">Leads by Priority</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={leadPriorityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="value" name="Leads" radius={[4, 4, 0, 0]}>
                  {leadPriorityData.map((e, i) => <Cell key={i} fill={e.name === 'Critical' ? '#ef4444' : e.name === 'High' ? '#f97316' : e.name === 'Medium' ? '#3b82f6' : '#94a3b8'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'pipeline' && (
        <div className="space-y-5">
          <div className="card p-5">
            <h3 className="text-base font-semibold text-slate-800 mb-4">Deal Pipeline (Value ₹L)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pipelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="stage" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis yAxisId="l" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar yAxisId="l" dataKey="value" name="Value (₹L)" radius={[4, 4, 0, 0]}>
                  {pipelineData.map((e, i) => <Cell key={i} fill={e.stage === 'Closed Won' ? '#10b981' : e.stage === 'Closed Lost' ? '#ef4444' : COLORS[i % 5]} />)}
                </Bar>
                <Bar yAxisId="r" dataKey="count" name="Deal Count" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100"><h3 className="text-base font-semibold text-slate-800">Pipeline Breakdown</h3></div>
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr><th className="table-th">Stage</th><th className="table-th">Deals</th><th className="table-th">Value</th><th className="table-th">Avg Prob.</th><th className="table-th">Weighted</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pipelineData.filter(p => p.count > 0).map(p => (
                  <tr key={p.stage} className="hover:bg-slate-50">
                    <td className="table-td font-medium">{p.stage}</td>
                    <td className="table-td">{p.count}</td>
                    <td className="table-td font-semibold">₹{p.value}L</td>
                    <td className="table-td">{p.probability}%</td>
                    <td className="table-td text-blue-600 font-semibold">₹{((p.value * p.probability) / 100).toFixed(1)}L</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'team' && (
        <div className="space-y-5">
          {teamData.length > 0 ? (
            <>
              <div className="card p-5">
                <h3 className="text-base font-semibold text-slate-800 mb-4">Revenue vs Target (₹L)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={teamData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="revenue" name="Revenue (₹L)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="target" name="Target (₹L)" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="card overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100"><h3 className="text-base font-semibold text-slate-800">Team Performance Table</h3></div>
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr><th className="table-th">Member</th><th className="table-th">Leads</th><th className="table-th">Won</th><th className="table-th">Revenue</th><th className="table-th">Target %</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(teamPerformance || []).map(m => {
                      const pct = m.target > 0 ? Math.min(100, Math.round((m.revenue / m.target) * 100)) : 0;
                      return (
                        <tr key={m._id} className="hover:bg-slate-50">
                          <td className="table-td">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">{m.name?.charAt(0)}</div>
                              <div><div className="font-medium">{m.name}</div><div className="text-xs text-slate-400 capitalize">{m.role?.replace('_', ' ')}</div></div>
                            </div>
                          </td>
                          <td className="table-td">{m.leadsCount}</td>
                          <td className="table-td text-green-600 font-medium">{m.wonDeals}</td>
                          <td className="table-td font-bold">₹{(m.revenue / 100000).toFixed(1)}L</td>
                          <td className="table-td">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden max-w-[80px]">
                                <div className={`h-full rounded-full ${pct >= 100 ? 'bg-green-500' : pct >= 60 ? 'bg-blue-500' : 'bg-orange-400'}`} style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-xs font-medium text-slate-600">{pct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : <div className="card text-center py-16"><p className="text-slate-400">No team data available</p></div>}
        </div>
      )}
    </div>
  );
}
