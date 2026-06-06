import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { HiEye, HiEyeOff, HiChartBar } from 'react-icons/hi';

export default function Login() {
  const { login, loading } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(form.email, form.password);
  };

  const quickLogin = (email, password) => setForm({ email, password });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-900/50">
            <HiChartBar className="text-white text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-white">ISAII CRM</h1>
          <p className="text-slate-400 text-sm mt-1">BDA Team Module — Manufacturing</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-1">Welcome back</h2>
          <p className="text-slate-500 text-sm mb-6">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                className="input"
                placeholder="you@isaii.in"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button type="button" className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <HiEyeOff size={18} /> : <HiEye size={18} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Signing in...</> : 'Sign In'}
            </button>
          </form>

          {/* Quick logins */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-xs text-slate-500 font-medium mb-3">Quick login (demo accounts):</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Admin', email: 'admin@isaii.in', pass: 'admin123' },
                { label: 'Manager', email: 'sneha@isaii.in', pass: 'password123' },
                { label: 'Team Lead', email: 'rahul@isaii.in', pass: 'password123' },
                { label: 'BDA', email: 'priya@isaii.in', pass: 'password123' },
              ].map(({ label, email, pass }) => (
                <button
                  key={email}
                  type="button"
                  onClick={() => quickLogin(email, pass)}
                  className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-600 py-1.5 px-2 rounded-lg border border-slate-200 transition-colors text-left"
                >
                  <div className="font-medium text-slate-800">{label}</div>
                  <div className="text-slate-400 truncate">{email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
