import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { HiPlus, HiSearch, HiPencil, HiTrash, HiOfficeBuilding, HiPhone, HiMail, HiLocationMarker } from 'react-icons/hi';

const emptyForm = { companyName: '', contactPerson: '', email: '', phone: '', industry: '', gstNumber: '', address: '', city: '', state: '', pincode: '', status: 'Active', notes: '', website: '', assignedTo: '' };

export default function Clients() {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState({ open: false, mode: 'create', client: null });
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const isAdmin = ['admin', 'manager', 'team_lead'].includes(user?.role);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const { data } = await api.get(`/clients?${params}`);
      setClients(data.data);
    } finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { fetchClients(); }, [fetchClients]);
  useEffect(() => { api.get('/auth/team').then(r => setTeam(r.data.data)); }, []);

  const openCreate = () => { setForm({ ...emptyForm, assignedTo: user._id }); setModal({ open: true, mode: 'create', client: null }); };
  const openEdit = (c) => { setForm({ ...c, assignedTo: c.assignedTo?._id || '' }); setModal({ open: true, mode: 'edit', client: c }); };

  const handleSave = async () => {
    if (!form.companyName || !form.contactPerson || !form.email) return toast.error('Required fields missing');
    setSaving(true);
    try {
      if (modal.mode === 'create') {
        const { data } = await api.post('/clients', form);
        setClients(prev => [data.data, ...prev]);
        toast.success('Client added!');
      } else {
        const { data } = await api.put(`/clients/${modal.client._id}`, form);
        setClients(prev => prev.map(c => c._id === data.data._id ? data.data : c));
        toast.success('Client updated!');
      }
      setModal({ open: false });
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/clients/${id}`);
      setClients(prev => prev.filter(c => c._id !== id));
      toast.success('Client deleted');
    } catch { toast.error('Error deleting client'); }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{clients.length} clients</p>
        <button onClick={openCreate} className="btn-primary"><HiPlus size={16} /> Add Client</button>
      </div>

      <div className="card p-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 relative">
          <HiSearch className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input className="input pl-9" placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-auto" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          {['Active', 'Inactive', 'Prospect'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.length === 0 ? (
            <div className="col-span-3 card text-center py-16">
              <div className="text-4xl mb-3">🏢</div>
              <p className="text-slate-500 font-medium">No clients yet</p>
              <button onClick={openCreate} className="btn-primary mt-4 mx-auto"><HiPlus size={16} />Add Client</button>
            </div>
          ) : clients.map(client => (
            <div key={client._id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <HiOfficeBuilding className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{client.companyName}</h3>
                    <p className="text-xs text-slate-500">{client.industry || 'N/A'}</p>
                  </div>
                </div>
                <StatusBadge status={client.status} />
              </div>
              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="font-medium">{client.contactPerson}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <HiMail size={12} /><span className="truncate">{client.email}</span>
                </div>
                {client.phone && <div className="flex items-center gap-1.5 text-xs text-slate-500"><HiPhone size={12} />{client.phone}</div>}
                {(client.city || client.state) && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <HiLocationMarker size={12} />{[client.city, client.state].filter(Boolean).join(', ')}
                  </div>
                )}
              </div>
              {client.totalRevenue > 0 && (
                <div className="bg-green-50 rounded-lg px-3 py-2 mb-3 text-xs">
                  <span className="text-slate-500">Total Revenue: </span>
                  <span className="font-bold text-green-700">₹{client.totalRevenue.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button onClick={() => openEdit(client)} className="flex-1 btn-secondary justify-center py-1.5"><HiPencil size={14} />Edit</button>
                <button onClick={() => setDeleteDialog({ open: true, id: client._id })} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <HiTrash size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modal.open} onClose={() => setModal({ open: false })} title={modal.mode === 'create' ? 'Add Client' : 'Edit Client'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Company Name *</label><input className="input" value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} /></div>
          <div><label className="label">Contact Person *</label><input className="input" value={form.contactPerson} onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))} /></div>
          <div><label className="label">Email *</label><input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
          <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
          <div><label className="label">Industry</label><input className="input" value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} /></div>
          <div><label className="label">GST Number</label><input className="input" value={form.gstNumber} onChange={e => setForm(f => ({ ...f, gstNumber: e.target.value }))} /></div>
          <div><label className="label">City</label><input className="input" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /></div>
          <div><label className="label">State</label><input className="input" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} /></div>
          <div><label className="label">Status</label>
            <select className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              {['Active', 'Inactive', 'Prospect'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div><label className="label">Website</label><input className="input" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} /></div>
          {isAdmin && (
            <div className="col-span-2"><label className="label">Assign To</label>
              <select className="input" value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}>
                <option value="">Select</option>
                {team.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>
          )}
          <div className="col-span-2"><label className="label">Address</label><input className="input" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
          <div className="col-span-2"><label className="label">Notes</label><textarea className="input h-16 resize-none" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
        </div>
        <div className="flex gap-3 justify-end mt-5 pt-4 border-t">
          <button onClick={() => setModal({ open: false })} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving...' : modal.mode === 'create' ? 'Add Client' : 'Update'}</button>
        </div>
      </Modal>

      <ConfirmDialog isOpen={deleteDialog.open} onClose={() => setDeleteDialog({ open: false })} onConfirm={() => handleDelete(deleteDialog.id)} title="Delete Client" message="Delete this client permanently?" />
    </div>
  );
}
