import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { HiPlus, HiSearch, HiFilter, HiPencil, HiTrash, HiArrowRight, HiPhone, HiMail, HiRefresh } from 'react-icons/hi';
import { format } from 'date-fns';

const STATUSES = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost', 'On Hold'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const INDUSTRIES = ['Automotive', 'Textile', 'Chemical', 'Electronics', 'Food Processing', 'Machinery', 'Packaging', 'Steel', 'Pharma', 'Other'];
const SOURCES = ['Cold Call', 'Email Campaign', 'Referral', 'Trade Show', 'Website', 'LinkedIn', 'Walk-in', 'Other'];

const emptyForm = { companyName: '', contactPerson: '', email: '', phone: '', industry: 'Other', source: 'Cold Call', status: 'New', priority: 'Medium', estimatedValue: '', city: '', state: '', notes: '', assignedTo: '' };

export default function Leads() {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', priority: '' });
  const [modal, setModal] = useState({ open: false, mode: 'create', lead: null });
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [converting, setConverting] = useState(null);
  const [view, setView] = useState('table');

  const isAdmin = ['admin', 'manager', 'team_lead'].includes(user?.role);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (filters.status) params.set('status', filters.status);
      if (filters.priority) params.set('priority', filters.priority);
      const { data } = await api.get(`/leads?${params}`);
      setLeads(data.data);
      setTotal(data.total);
    } finally { setLoading(false); }
  }, [search, filters]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);
  useEffect(() => { api.get('/auth/team').then(r => setTeam(r.data.data)); }, []);

  const openCreate = () => { setForm({ ...emptyForm, assignedTo: user._id }); setModal({ open: true, mode: 'create', lead: null }); };
  const openEdit = (lead) => {
    setForm({ ...lead, assignedTo: lead.assignedTo?._id || '', estimatedValue: lead.estimatedValue || '' });
    setModal({ open: true, mode: 'edit', lead });
  };

  const handleSave = async () => {
    if (!form.companyName || !form.contactPerson || !form.email) return toast.error('Company, contact, and email are required');
    setSaving(true);
    try {
      if (modal.mode === 'create') {
        const { data } = await api.post('/leads', form);
        setLeads(prev => [data.data, ...prev]);
        toast.success('Lead created!');
      } else {
        const { data } = await api.put(`/leads/${modal.lead._id}`, form);
        setLeads(prev => prev.map(l => l._id === data.data._id ? data.data : l));
        toast.success('Lead updated!');
      }
      setModal({ open: false, mode: 'create', lead: null });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving lead');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/leads/${id}`);
      setLeads(prev => prev.filter(l => l._id !== id));
      toast.success('Lead deleted');
    } catch { toast.error('Error deleting lead'); }
  };

  const handleConvert = async (id) => {
    setConverting(id);
    try {
      await api.post(`/leads/${id}/convert`);
      toast.success('Lead converted to client!');
      fetchLeads();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Conversion failed');
    } finally { setConverting(null); }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{total} total leads</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchLeads} className="btn-secondary"><HiRefresh size={16} /></button>
          <button onClick={openCreate} className="btn-primary"><HiPlus size={16} /> Add Lead</button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-48 relative">
            <HiSearch className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input className="input pl-9" placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input w-auto" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
            <option value="">All Status</option>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="input w-auto" value={filters.priority} onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))}>
            <option value="">All Priority</option>
            {PRIORITIES.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
        ) : leads.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🎯</div>
            <p className="text-slate-500 font-medium">No leads found</p>
            <p className="text-slate-400 text-sm mt-1">Create your first lead to get started</p>
            <button onClick={openCreate} className="btn-primary mt-4 mx-auto"><HiPlus size={16} /> Add Lead</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="table-th">Company</th>
                  <th className="table-th">Contact</th>
                  <th className="table-th">Industry</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Priority</th>
                  <th className="table-th">Value</th>
                  <th className="table-th">Assigned</th>
                  <th className="table-th">Follow Up</th>
                  <th className="table-th">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map(lead => (
                  <tr key={lead._id} className="hover:bg-slate-50 transition-colors">
                    <td className="table-td">
                      <div className="font-semibold text-slate-800">{lead.companyName}</div>
                      <div className="text-xs text-slate-400">{lead.source}</div>
                    </td>
                    <td className="table-td">
                      <div className="font-medium">{lead.contactPerson}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <a href={`mailto:${lead.email}`} className="text-xs text-blue-600 hover:underline flex items-center gap-1"><HiMail size={11} />{lead.email}</a>
                      </div>
                    </td>
                    <td className="table-td text-slate-500">{lead.industry}</td>
                    <td className="table-td"><StatusBadge status={lead.status} /></td>
                    <td className="table-td"><StatusBadge status={lead.priority} /></td>
                    <td className="table-td font-medium text-slate-800">
                      {lead.estimatedValue ? `₹${lead.estimatedValue.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="table-td">
                      {lead.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">{lead.assignedTo.name?.charAt(0)}</div>
                          <span className="text-xs">{lead.assignedTo.name?.split(' ')[0]}</span>
                        </div>
                      ) : <span className="text-slate-400 text-xs">Unassigned</span>}
                    </td>
                    <td className="table-td text-xs text-slate-500">
                      {lead.followUpDate ? format(new Date(lead.followUpDate), 'dd MMM') : '—'}
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(lead)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <HiPencil size={15} />
                        </button>
                        {!lead.isConverted && lead.status !== 'Lost' && (
                          <button
                            onClick={() => handleConvert(lead._id)}
                            disabled={converting === lead._id}
                            className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Convert to Client"
                          >
                            {converting === lead._id ? <div className="w-3.5 h-3.5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" /> : <HiArrowRight size={15} />}
                          </button>
                        )}
                        {lead.isConverted && <span className="text-xs text-green-600 font-medium px-1">✓ Converted</span>}
                        <button onClick={() => setDeleteDialog({ open: true, id: lead._id })} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <HiTrash size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lead Modal */}
      <Modal isOpen={modal.open} onClose={() => setModal({ open: false })} title={modal.mode === 'create' ? 'Add New Lead' : 'Edit Lead'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="label">Company Name *</label>
            <input className="input" value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="label">Contact Person *</label>
            <input className="input" value={form.contactPerson} onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))} />
          </div>
          <div>
            <label className="label">Email *</label>
            <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
          <div>
            <label className="label">Industry</label>
            <select className="input" value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}>
              {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Source</label>
            <select className="input" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}>
              {SOURCES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Priority</label>
            <select className="input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
              {PRIORITIES.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Estimated Value (₹)</label>
            <input className="input" type="number" value={form.estimatedValue} onChange={e => setForm(f => ({ ...f, estimatedValue: e.target.value }))} />
          </div>
          <div>
            <label className="label">Follow Up Date</label>
            <input className="input" type="date" value={form.followUpDate ? form.followUpDate.slice(0, 10) : ''} onChange={e => setForm(f => ({ ...f, followUpDate: e.target.value }))} />
          </div>
          <div>
            <label className="label">City</label>
            <input className="input" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
          </div>
          <div>
            <label className="label">State</label>
            <input className="input" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} />
          </div>
          {isAdmin && (
            <div className="col-span-2">
              <label className="label">Assign To</label>
              <select className="input" value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}>
                <option value="">Select team member</option>
                {team.map(m => <option key={m._id} value={m._id}>{m.name} ({m.role})</option>)}
              </select>
            </div>
          )}
          <div className="col-span-2">
            <label className="label">Notes</label>
            <textarea className="input h-20 resize-none" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-5 pt-4 border-t border-slate-100">
          <button onClick={() => setModal({ open: false })} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : modal.mode === 'create' ? 'Create Lead' : 'Update Lead'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={() => handleDelete(deleteDialog.id)}
        title="Delete Lead"
        message="Are you sure you want to delete this lead? This action cannot be undone."
      />
    </div>
  );
}
