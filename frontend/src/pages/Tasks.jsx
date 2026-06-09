import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { HiPlus, HiSearch, HiPencil, HiTrash, HiCheckCircle, HiClock, HiExclamation } from 'react-icons/hi';
import { format, isPast, isToday } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const TYPES = ['Call', 'Email', 'Meeting', 'Demo', 'Follow-up', 'Site Visit', 'Proposal', 'Other'];
const STATUSES = ['Pending', 'In Progress', 'Completed', 'Cancelled'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const emptyForm = { title: '', description: '', type: 'Call', status: 'Pending', priority: 'Medium', dueDate: '', assignedTo: '', notes: '' };
const typeIcons = { Call: '📞', Email: '📧', Meeting: '🤝', Demo: '💻', 'Follow-up': '🔔', 'Site Visit': '🏭', Proposal: '📄', Other: '📌' };

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '', type: '' });
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState({ open: false, mode: 'create', task: null });
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const isAdmin = ['admin', 'manager', 'team_lead'].includes(user?.role);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.priority) params.set('priority', filters.priority);
      if (filters.type) params.set('type', filters.type);
      const { data } = await api.get(`/tasks?${params}&limit=100`);
      setTasks(data.data);
    } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);
  useEffect(() => { api.get('/auth/team').then(r => setTeam(r.data.data)); }, []);

  const filteredTasks = tasks.filter(t => !search || t.title.toLowerCase().includes(search.toLowerCase()));
  const pendingTasks = filteredTasks.filter(t => t.status === 'Pending' || t.status === 'In Progress');
  const completedTasks = filteredTasks.filter(t => t.status === 'Completed');
  const overdueTasks = pendingTasks.filter(t => t.dueDate && isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate)));
  const todayTasks = pendingTasks.filter(t => t.dueDate && isToday(new Date(t.dueDate)));

  const openCreate = () => { setForm({ ...emptyForm, assignedTo: user._id }); setModal({ open: true, mode: 'create', task: null }); };
  const openEdit = (task) => {
    setForm({ ...task, assignedTo: task.assignedTo?._id || '', dueDate: task.dueDate ? task.dueDate.slice(0, 16) : '' });
    setModal({ open: true, mode: 'edit', task });
  };

  const handleSave = async () => {
    if (!form.title) return toast.error('Task title is required');
    setSaving(true);
    try {
      if (modal.mode === 'create') {
        const { data } = await api.post('/tasks', form);
        setTasks(prev => [data.data, ...prev]);
        toast.success('Task created!');
      } else {
        const { data } = await api.put(`/tasks/${modal.task._id}`, form);
        setTasks(prev => prev.map(t => t._id === data.data._id ? data.data : t));
        toast.success('Task updated!');
      }
      setModal({ open: false });
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleComplete = async (task) => {
    try {
      const { data } = await api.put(`/tasks/${task._id}`, { status: 'Completed' });
      setTasks(prev => prev.map(t => t._id === data.data._id ? data.data : t));
      toast.success('Task completed!');
    } catch { toast.error('Error'); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(prev => prev.filter(t => t._id !== id));
      toast.success('Task deleted');
    } catch { toast.error('Error'); }
  };

  const TaskCard = ({ task }) => {
    const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'Completed' && !isToday(new Date(task.dueDate));
    const isDueToday = task.dueDate && isToday(new Date(task.dueDate));
    return (
      <div className={`bg-white rounded-xl border p-4 hover:shadow-md transition-shadow ${isOverdue ? 'border-red-200 bg-red-50/30' : 'border-slate-200'}`}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-start gap-2.5 flex-1">
            <button onClick={() => task.status !== 'Completed' && handleComplete(task)}
              className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 transition-colors flex items-center justify-center ${task.status === 'Completed' ? 'bg-green-500 border-green-500' : 'border-slate-300 hover:border-green-400'}`}>
              {task.status === 'Completed' && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
            </button>
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-semibold leading-snug ${task.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-800'}`}>{task.title}</div>
              {task.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{task.description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={() => openEdit(task)} className="p-1 hover:bg-slate-100 rounded"><HiPencil size={13} className="text-slate-400" /></button>
            <button onClick={() => setDeleteDialog({ open: true, id: task._id })} className="p-1 hover:bg-red-50 rounded"><HiTrash size={13} className="text-red-300 hover:text-red-500" /></button>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap mt-2">
          <span className="text-sm">{typeIcons[task.type] || '📌'}</span>
          <StatusBadge status={task.priority} size="xs" />
          {task.status !== 'Pending' && <StatusBadge status={task.status} size="xs" />}
        </div>
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            {task.assignedTo && (
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">{task.assignedTo.name?.charAt(0)}</div>
                <span className="text-xs text-slate-500">{task.assignedTo.name?.split(' ')[0]}</span>
              </div>
            )}
          </div>
          {task.dueDate && (
            <div className={`flex items-center gap-1 text-xs font-medium ${isOverdue ? 'text-red-600' : isDueToday ? 'text-orange-600' : 'text-slate-500'}`}>
              {isOverdue && <HiExclamation size={13} />}
              {isDueToday && <HiClock size={13} />}
              {format(new Date(task.dueDate), 'dd MMM, h:mm a')}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', val: filteredTasks.length, color: 'text-slate-800' },
          { label: 'Active', val: pendingTasks.length, color: 'text-blue-600' },
          { label: 'Overdue', val: overdueTasks.length, color: 'text-red-600' },
          { label: 'Due Today', val: todayTasks.length, color: 'text-orange-600' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.val}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <HiSearch className="absolute left-3 top-2.5 text-slate-400" size={15} />
            <input className="input pl-8 text-sm py-2" placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 200 }} />
          </div>
          <select className="input w-auto text-sm py-2" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
            <option value="">All Status</option>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="input w-auto text-sm py-2" value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
            <option value="">All Types</option>
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <select className="input w-auto text-sm py-2" value={filters.priority} onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))}>
            <option value="">All Priority</option>
            {PRIORITIES.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <button onClick={openCreate} className="btn-primary"><HiPlus size={16} /> New Task</button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <HiClock className="text-blue-500" /> Active Tasks
              <span className="ml-auto text-xs font-normal text-slate-400">{pendingTasks.length}</span>
            </h3>
            {pendingTasks.length === 0 ? (
              <div className="card text-center py-10">
                <div className="text-3xl mb-2">🎉</div>
                <p className="text-slate-500 text-sm">All caught up!</p>
                <button onClick={openCreate} className="btn-primary mt-3 mx-auto text-xs"><HiPlus size={14} /> Add Task</button>
              </div>
            ) : (
              <div className="space-y-2">{pendingTasks.map(t => <TaskCard key={t._id} task={t} />)}</div>
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <HiCheckCircle className="text-green-500" /> Completed
              <span className="ml-auto text-xs font-normal text-slate-400">{completedTasks.length}</span>
            </h3>
            {completedTasks.length === 0 ? (
              <div className="card text-center py-10"><p className="text-slate-400 text-sm">No completed tasks yet</p></div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">{completedTasks.map(t => <TaskCard key={t._id} task={t} />)}</div>
            )}
          </div>
        </div>
      )}

      <Modal isOpen={modal.open} onClose={() => setModal({ open: false })} title={modal.mode === 'create' ? 'Create Task' : 'Edit Task'} size="md">
        <div className="space-y-4">
          <div><label className="label">Task Title *</label><input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Follow up call with Tata Steel" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Type</label>
              <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div><label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div><label className="label">Status</label>
              <select className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div><label className="label">Due Date & Time</label><input className="input" type="datetime-local" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} /></div>
          </div>
          {isAdmin && (
            <div><label className="label">Assign To</label>
              <select className="input" value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}>
                <option value="">Select member</option>
                {team.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>
          )}
          <div><label className="label">Description</label><textarea className="input h-20 resize-none" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
        </div>
        <div className="flex gap-3 justify-end mt-5 pt-4 border-t border-slate-100">
          <button onClick={() => setModal({ open: false })} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving...' : modal.mode === 'create' ? 'Create Task' : 'Update'}</button>
        </div>
      </Modal>

      <ConfirmDialog isOpen={deleteDialog.open} onClose={() => setDeleteDialog({ open: false })} onConfirm={() => handleDelete(deleteDialog.id)} title="Delete Task" message="Delete this task permanently?" />
    </div>
  );
}
