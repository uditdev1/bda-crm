import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';
import { HiPlus, HiPencil, HiMail, HiPhone, HiBriefcase } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

const ROLES = ['admin', 'manager', 'team_lead', 'bda'];
const roleColors = { admin: 'bg-purple-100 text-purple-700', manager: 'bg-blue-100 text-blue-700', team_lead: 'bg-indigo-100 text-indigo-700', bda: 'bg-green-100 text-green-700' };
const roleLabels = { admin: 'Administrator', manager: 'Sales Manager', team_lead: 'Team Lead', bda: 'BDA Executive' };
const emptyForm = { name: '', email: '', password: '', role: 'bda', phone: '', department: 'Sales', target: '' };

export default function Team() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'create', member: null });
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/auth/team').then(r => { setMembers(r.data.data); setLoading(false); });
  }, []);

  const openCreate = () => { setForm(emptyForm); setModal({ open: true, mode: 'create' }); };
  const openEdit = (m) => { setForm({ ...m, password: '' }); setModal({ open: true, mode: 'edit', member: m }); };

  const handleSave = async () => {
    if (!form.name || !form.email) return toast.error('Name and email required');
    if (modal.mode === 'create' && !form.password) return toast.error('Password required');
    setSaving(true);
    try {
      if (modal.mode === 'create') {
        const { data } = await api.post('/auth/register', form);
        setMembers(prev => [...prev, data.user]);
        toast.success('Team member added!');
      } else {
        const updateData = { name: form.name, phone: form.phone, department: form.department };
        setMembers(prev => prev.map(m => m._id === modal.member._id ? { ...m, ...updateData } : m));
        toast.success('Member updated!');
      }
      setModal({ open: false });
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{members.length} team members</p>
        {user?.role === 'admin' && <button onClick={openCreate} className="btn-primary"><HiPlus size={16} /> Add Member</button>}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {ROLES.map(role => (
          <div key={role} className="card p-4 text-center">
            <div className="text-2xl font-bold text-slate-800">{members.filter(m => m.role === role).length}</div>
            <span className={`badge mt-1 ${roleColors[role]}`}>{roleLabels[role]}</span>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map(member => (
            <div key={member._id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-md">
                    {member.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{member.name}</h3>
                    <span className={`badge text-xs ${roleColors[member.role]}`}>{roleLabels[member.role]}</span>
                  </div>
                </div>
                {user?.role === 'admin' && (
                  <button onClick={() => openEdit(member)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><HiPencil size={15} /></button>
                )}
              </div>
              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-xs text-slate-600"><HiMail size={13} className="text-slate-400" /><span className="truncate">{member.email}</span></div>
                {member.phone && <div className="flex items-center gap-2 text-xs text-slate-600"><HiPhone size={13} className="text-slate-400" />{member.phone}</div>}
                <div className="flex items-center gap-2 text-xs text-slate-600"><HiBriefcase size={13} className="text-slate-400" />{member.department || 'Sales'}</div>
              </div>
              {member.target > 0 && (
                <div className="bg-slate-50 rounded-lg px-3 py-2 text-xs flex justify-between">
                  <span className="text-slate-500">Target</span>
                  <span className="font-bold text-slate-700">₹{(member.target / 100000).toFixed(1)}L/mo</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100">
                <div className={`w-2 h-2 rounded-full ${member.isActive ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                <span className={`text-xs font-medium ${member.isActive ? 'text-green-600' : 'text-slate-400'}`}>{member.isActive ? 'Active' : 'Inactive'}</span>
                {member.lastLogin && <span className="text-xs text-slate-400 ml-auto">Last: {new Date(member.lastLogin).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modal.open} onClose={() => setModal({ open: false })} title={modal.mode === 'create' ? 'Add Team Member' : 'Edit Member'} size="md">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><label className="label">Full Name *</label><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div><label className="label">Email *</label><input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
          <div><label className="label">{modal.mode === 'create' ? 'Password *' : 'New Password'}</label><input className="input" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder={modal.mode === 'edit' ? 'Leave blank to keep' : ''} /></div>
          <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
          <div><label className="label">Department</label><input className="input" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} /></div>
          <div><label className="label">Role</label>
            <select className="input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              {ROLES.map(r => <option key={r} value={r}>{roleLabels[r]}</option>)}
            </select>
          </div>
          <div><label className="label">Monthly Target (₹)</label><input className="input" type="number" value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))} /></div>
        </div>
        <div className="flex gap-3 justify-end mt-5 pt-4 border-t">
          <button onClick={() => setModal({ open: false })} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving...' : modal.mode === 'create' ? 'Add Member' : 'Update'}</button>
        </div>
      </Modal>
    </div>
  );
}
