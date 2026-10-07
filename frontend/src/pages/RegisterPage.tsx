import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { Department } from '../types';
import { UserPlus } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'student' | 'staff'>('student');
  const [idNumber, setIdNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');

  const [departments, setDepartments] = useState<Department[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await API.get('/departments/public');
      if (res.data.success) {
        setDepartments(res.data.departments);
        if (res.data.departments.length > 0) {
          setDepartment(res.data.departments[0].name);
        }
      }
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      setLoading(true);
      const payload = {
        name,
        email,
        password,
        role,
        department,
        phone,
        studentId: role === 'student' ? idNumber : undefined,
        employeeId: role === 'staff' ? idNumber : undefined,
      };

      const res = await API.post('/auth/register', payload);
      if (res.data.success) {
        login(res.data.token, res.data.user);
        navigate(role === 'staff' ? '/staff-dashboard' : '/student-dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg bg-white rounded-2xl p-8 shadow-2xl border border-slate-800 text-gray-900">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
        <p className="text-xs text-gray-500 mt-1">Register for the College Complaint System</p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 p-3.5 text-xs text-red-700 border border-red-200 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-brand-600 outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Account Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'student' | 'staff')}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-xs font-semibold focus:border-brand-600 outline-hidden"
            >
              <option value="student">Student</option>
              <option value="staff">Staff Member</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@college.edu"
              className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-brand-600 outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              {role === 'student' ? 'Student ID' : 'Employee ID'}
            </label>
            <input
              type="text"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              placeholder={role === 'student' ? 'STU-2026-101' : 'STF-101'}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-brand-600 outline-hidden"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-brand-600 outline-hidden"
              required
            >
              {departments.map((d) => (
                <option key={d._id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555-0199"
              className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-brand-600 outline-hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-brand-600 outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-brand-600 outline-hidden"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-brand-600 py-3 text-xs font-bold text-white shadow-md hover:bg-brand-700 disabled:opacity-50 cursor-pointer transition-all flex items-center justify-center mt-2"
        >
          <UserPlus className="mr-2 h-4 w-4" /> {loading ? 'Registering...' : 'Complete Registration'}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-gray-500">
        Already registered?{' '}
        <Link to="/login" className="font-semibold text-brand-600 hover:underline">
          Sign in here
        </Link>
      </p>
    </div>
  );
};
