import { useLocation } from 'react-router-dom';
import { HiMenuAlt2, HiBell, HiSearch } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';

const pageTitles = {
  '/': 'Dashboard',
  '/leads': 'Lead Management',
  '/clients': 'Client Management',
  '/deals': 'Deals & Pipeline',
  '/tasks': 'Task Manager',
  '/team': 'Team Overview',
  '/reports': 'Reports & Analytics',
};

export default function Navbar({ onMenuClick }) {
  const { pathname } = useLocation();
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 px-4 lg:px-6 py-3.5 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg lg:hidden"
          onClick={onMenuClick}
        >
          <HiMenuAlt2 size={20} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-800 leading-none">{pageTitles[pathname] || 'Dashboard'}</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manufacturing BDA CRM</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2 text-sm text-slate-400">
          <HiSearch size={15} />
          <span>Quick search...</span>
          <kbd className="text-xs bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-400">⌘K</kbd>
        </div>
        <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg relative">
          <HiBell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="hidden md:block">
            <div className="text-sm font-semibold text-slate-700 leading-none">{user?.name}</div>
            <div className="text-xs text-slate-400 capitalize mt-0.5">{user?.role?.replace('_', ' ')}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
