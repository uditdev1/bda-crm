import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HiHome, HiUserGroup, HiUsers, HiBriefcase, HiCheckCircle,
  HiChartBar, HiCog, HiLogout, HiMenuAlt2, HiX, HiLightningBolt
} from 'react-icons/hi';

const navItems = [
  { path: '/', icon: HiHome, label: 'Dashboard', roles: ['admin', 'manager', 'team_lead', 'bda'] },
  { path: '/leads', icon: HiLightningBolt, label: 'Leads', roles: ['admin', 'manager', 'team_lead', 'bda'] },
  { path: '/clients', icon: HiUsers, label: 'Clients', roles: ['admin', 'manager', 'team_lead', 'bda'] },
  { path: '/deals', icon: HiBriefcase, label: 'Deals & Pipeline', roles: ['admin', 'manager', 'team_lead', 'bda'] },
  { path: '/tasks', icon: HiCheckCircle, label: 'Tasks', roles: ['admin', 'manager', 'team_lead', 'bda'] },
  { path: '/team', icon: HiUserGroup, label: 'Team', roles: ['admin', 'manager', 'team_lead'] },
  { path: '/reports', icon: HiChartBar, label: 'Reports', roles: ['admin', 'manager', 'team_lead'] },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const allowedItems = navItems.filter(item => item.roles.includes(user?.role));

  const roleLabel = { admin: 'Administrator', manager: 'Sales Manager', team_lead: 'Team Lead', bda: 'BDA Executive' };

  return (
    <>
      {/* Overlay for mobile */}
      {open && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={onClose} />}

      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 flex flex-col transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <HiChartBar className="text-white text-lg" />
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-none">ISAII CRM</div>
              <div className="text-slate-400 text-xs mt-0.5">BDA Team Module</div>
            </div>
          </div>
          <button className="lg:hidden text-slate-400 hover:text-white" onClick={onClose}>
            <HiX size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-3 mb-2">Main Menu</div>
          {allowedItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-active' : 'sidebar-inactive'}`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="px-3 py-3 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">{user?.name}</div>
              <div className="text-slate-400 text-xs truncate">{roleLabel[user?.role]}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="sidebar-link sidebar-inactive w-full text-red-400 hover:bg-red-500/10 hover:text-red-400"
          >
            <HiLogout size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
