import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { LogIn, Key, UserCheck, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await API.post('/auth/login', { email, password });
      if (res.data.success) {
        login(res.data.token, res.data.user);
        const role = res.data.user.role;
        if (role === 'admin') navigate('/admin-dashboard');
        else if (role === 'hod') navigate('/hod-dashboard');
        else if (role === 'staff') navigate('/staff-dashboard');
        else navigate('/student-dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password@123');
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-2xl border border-slate-800 text-gray-900">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
        <p className="text-xs text-gray-500 mt-1">
          Sign in to access your complaint portal
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 p-3.5 text-xs text-red-700 border border-red-200 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g., student@college.edu"
            className="w-full rounded-xl border border-gray-300 p-3 text-xs focus:border-brand-600 focus:ring-2 focus:ring-brand-100 outline-hidden"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-gray-700">Password</label>
            <Link to="/forgot-password" className="text-xs text-brand-600 hover:underline">
              Forgot?
            </Link>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-gray-300 p-3 text-xs focus:border-brand-600 focus:ring-2 focus:ring-brand-100 outline-hidden"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-brand-600 py-3 text-xs font-bold text-white shadow-md hover:bg-brand-700 disabled:opacity-50 cursor-pointer transition-all flex items-center justify-center"
        >
          <LogIn className="mr-2 h-4 w-4" /> {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      {/* One-Click Quick Demo Login Preset Buttons */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 text-center mb-3">
          ⚡ One-Click Demo Credentials
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => handleDemoFill('student@college.edu')}
            className="rounded-lg bg-cyan-50 text-cyan-800 p-2 text-center font-medium border border-cyan-200 hover:bg-cyan-100 cursor-pointer"
          >
            🎓 Student
          </button>
          <button
            onClick={() => handleDemoFill('staff@college.edu')}
            className="rounded-lg bg-emerald-50 text-emerald-800 p-2 text-center font-medium border border-emerald-200 hover:bg-emerald-100 cursor-pointer"
          >
            🛠️ Staff
          </button>
          <button
            onClick={() => handleDemoFill('hod@college.edu')}
            className="rounded-lg bg-blue-50 text-blue-800 p-2 text-center font-medium border border-blue-200 hover:bg-blue-100 cursor-pointer"
          >
            👔 HOD
          </button>
          <button
            onClick={() => handleDemoFill('admin@college.edu')}
            className="rounded-lg bg-purple-50 text-purple-800 p-2 text-center font-medium border border-purple-200 hover:bg-purple-100 cursor-pointer"
          >
            👑 Admin
          </button>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-gray-500">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-brand-600 hover:underline">
          Register here
        </Link>
      </p>
    </div>
  );
};
