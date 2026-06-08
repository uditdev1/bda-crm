import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { HiPlus, HiSearch, HiPencil, HiTrash, HiViewBoards, HiViewList, HiCurrencyRupee } from 'react-icons/hi';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const STAGES = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
const stageColors = {
  'Prospecting': 'border-t-slate-400',
  'Qualification': 'border-t-blue-500',
  'Proposal': 'border-t-yellow-500',
  'Negotiation': 'border-t-orange-500',
  'Closed Won': 'border-t-green-500',
  'Closed Lost': 'border-t-red-400',
};

const emptyForm = { title: '', client: '', value: '', stage: 'Prospecting', probability: 10, expectedCloseDate: '', assignedTo: '', notes: '' };

export default function Deals() {
  const { user } = useAuth();
  const [deals, setDeals] = useState([]);
  const [clients, setClients] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('kanban');
  const [modal, setModal] = useState({ open: false, mode: 'create', deal: null });
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [search, setSearch] = useState('');
  const isAdmin = ['admin', 'manager', 'team_lead'].includes(user?.role);

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      const { data } = await api.get(`/deals?${params}&limit=100`);
      setDeals(data.data);
    } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchDeals(); }, [fetchDeals]);
  useEffect(() => {
    api.get('/clients?limit=100').then(r => setClients(r.data.data));
    api.get('/auth/team').then(r => setTeam(r.data.data));
  }, []);

  const dealsByStage = STAGES.reduce((acc, s) => {
    acc[s] = deals.filter(d => d.stage === s);
    return acc;
  }, {});

  const totalPipeline = deals.filter(d => !['Closed Won', 'Closed Lost'].includes(d.stage)).reduce((s, d) => s + d.value, 0);
  const wonValue = deals.filter(d => d.stage === 'Closed Won').reduce((s, d) => s + d.value, 0);

  const openCreate = () => { setForm({ ...emptyForm, assignedTo: user._id }); setModal({ open: true, mode: 'create', deal: null }); };
  const openEdit = (deal) => { setForm({ ...deal, client: deal.client?._id || '', assignedTo: deal.assignedTo?._id || '' }); setModal({ open: true, mode: 'edit', deal }); };

  const handleSave = async () => {
    if (!form.title || !form.client || !form.value) return toast.error('Title, client, and value required');
    setSaving(true);
    try {
      if (modal.mode === 'create') {
        const { data } = await api.post('/deals', form);
        setDeals(prev => [data.data, ...prev]);
        toast.success('Deal created!');
      } else {
        const { data } = await api.put(`/deals/${modal.deal._id}`, form);
        setDeals(prev => prev.map(d => d._id === data.data._id ? data.data : d));
        toast.success('Deal updated!');
      }
      setModal({ open: false });
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/deals/${id}`);
      setDeals(prev => prev.filter(d => d._id !== id));
      toast.success('Deal deleted');
    } catch { toast.error('Error'); }
  };

  const updateStage = async (dealId, newStage) => {
    try {
      const { data } = await api.put(`/deals/${dealId}`, { stage: newStage, probability: newStage === 'Closed Won' ? 100 : newStage === 'Closed Lost' ? 0 : undefined });
      setDeals(prev => prev.map(d => d._id === data.data._id ? data.data : d));
      if (newStage === 'Closed Won') toast.success('🏆 Deal Won!');
    } catch { toast.error('Error updating stage'); }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-500">Pipeline: <span className="font-bold text-slate-800">₹{(totalPipeline / 100000).toFixed(1)}L</span></div>
          <div className="text-sm text-slate-500">Won: <span className="font-bold text-green-700">₹{(wonValue / 100000).toFixed(1)}L</span></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button onClick={() => setView('kanban')} className={`px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${view === 'kanban' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>
              <HiViewBoards size={14} /> Board
            </button>
            <button onClick={() => setView('list')} className={`px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${view === 'list' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>
              <HiViewList size={14} /> List
            </button>
          </div>
          <button onClick={openCreate} className="btn-primary"><HiPlus size={16} /> Add Deal</button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
      ) : view === 'kanban' ? (
        /* Kanban Board */
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map(stage => {
            const stageDeals = dealsByStage[stage] || [];
            const stageValue = stageDeals.reduce((s, d) => s + d.value, 0);
            return (
              <div key={stage} className={`kanban-col border-t-4 ${stageColors[stage]}`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-xs font-bold text-slate-700">{stage}</div>
                    <div className="text-xs text-slate-400">₹{(stageValue / 100000).toFixed(1)}L</div>
                  </div>
                  <span className="w-5 h-5 bg-slate-200 rounded-full text-xs flex items-center justify-center font-bold text-slate-600">{stageDeals.length}</span>
                </div>
                <div className="space-y-2 min-h-[100px]">
                  {stageDeals.map(deal => (
                    <div key={deal._id} className="kanban-card group">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="text-xs font-semibold text-slate-800 leading-snug flex-1">{deal.title}</h4>
                        <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                          <button onClick={() => openEdit(deal)} className="p-1 hover:bg-slate-100 rounded"><HiPencil size={12} className="text-slate-500" /></button>
                          <button onClick={() => setDeleteDialog({ open: true, id: deal._id })} className="p-1 hover:bg-red-50 rounded"><HiTrash size={12} className="text-red-400" /></button>
                        </div>
                      </div>
                      <div className="text-xs text-blue-600 font-medium mb-2">{deal.client?.companyName}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">₹{(deal.value / 100000).toFixed(1)}L</span>
                        <span className="text-xs text-slate-400">{deal.probability}%</span>
                      </div>
                      {deal.expectedCloseDate && (
                        <div className="text-xs text-slate-400 mt-1">{format(new Date(deal.expectedCloseDate), 'dd MMM yyyy')}</div>
                      )}
                      {stage !== 'Closed Won' && stage !== 'Closed Lost' && (
                        <select
                          value={stage}
                          onChange={e => updateStage(deal._id, e.target.value)}
                          className="mt-2 w-full text-xs border border-slate-200 rounded px-1 py-0.5 text-slate-500 bg-white focus:outline-none"
                          onClick={e => e.stopPropagation()}
                        >
                          {STAGES.map(s => <option key={s}>{s}</option>)}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <HiSearch className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input className="input pl-9" placeholder="Search deals..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="table-th">Deal</th>
                  <th className="table-th">Client</th>
                  <th className="table-th">Stage</th>
                  <th className="table-th">Value</th>
                  <th className="table-th">Probability</th>
                  <th className="table-th">Close Date</th>
                  <th className="table-th">Assigned</th>
                  <th className="table-th">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deals.map(deal => (
                  <tr key={deal._id} className="hover:bg-slate-50">
                    <td className="table-td font-semibold text-slate-800">{deal.title}</td>
                    <td className="table-td text-blue-600">{deal.client?.companyName}</td>
                    <td className="table-td"><StatusBadge status={deal.stage} /></td>
                    <td className="table-td font-bold">₹{deal.value.toLocaleString('en-IN')}</td>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${deal.probability}%` }} />
                        </div>
                        <span className="text-xs text-slate-500">{deal.probability}%</span>
                      </div>
                    </td>
                    <td className="table-td text-xs">{deal.expectedCloseDate ? format(new Date(deal.expectedCloseDate), 'dd MMM yyyy') : '—'}</td>
                    <td className="table-td text-xs">{deal.assignedTo?.name || '—'}</td>
                    <td className="table-td">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(deal)} className="p-1.5 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600"><HiPencil size={15} /></button>
                        <button onClick={() => setDeleteDialog({ open: true, id: deal._id })} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600"><HiTrash size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Deal Modal */}
      <Modal isOpen={modal.open} onClose={() => setModal({ open: false })} title={modal.mode === 'create' ? 'New Deal' : 'Edit Deal'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><label className="label">Deal Title *</label><input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Q3 Supply Contract - Bajaj Auto" /></div>
          <div className="col-span-2">
            <label className="label">Client *</label>
            <select className="input" value={form.client} onChange={e => setForm(f => ({ ...f, client: e.target.value }))}>
              <option value="">Select client</option>
              {clients.map(c => <option key={c._id} value={c._id}>{c.companyName}</option>)}
            </select>
          </div>
          <div><label className="label">Deal Value (₹) *</label><input className="input" type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} /></div>
          <div><label className="label">Stage</label>
            <select className="input" value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))}>
              {STAGES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div><label className="label">Probability (%)</label><input className="input" type="number" min="0" max="100" value={form.probability} onChange={e => setForm(f => ({ ...f, probability: e.target.value }))} /></div>
          <div><label className="label">Expected Close Date</label><input className="input" type="date" value={form.expectedCloseDate ? form.expectedCloseDate.slice(0, 10) : ''} onChange={e => setForm(f => ({ ...f, expectedCloseDate: e.target.value }))} /></div>
          {isAdmin && (
            <div className="col-span-2"><label className="label">Assign To</label>
              <select className="input" value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}>
                <option value="">Select</option>
                {team.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>
          )}
          <div className="col-span-2"><label className="label">Notes</label><textarea className="input h-16 resize-none" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
        </div>
        <div className="flex gap-3 justify-end mt-5 pt-4 border-t">
          <button onClick={() => setModal({ open: false })} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving...' : modal.mode === 'create' ? 'Create Deal' : 'Update Deal'}</button>
        </div>
      </Modal>

      <ConfirmDialog isOpen={deleteDialog.open} onClose={() => setDeleteDialog({ open: false })} onConfirm={() => handleDelete(deleteDialog.id)} title="Delete Deal" message="Delete this deal permanently?" />
    </div>
  );
}
