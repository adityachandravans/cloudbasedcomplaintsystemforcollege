import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { RoleBadge } from '../components/common/Badge';
import { User, Mail, Phone, Building, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [studentId, setStudentId] = useState(user?.studentId || '');
  const [employeeId, setEmployeeId] = useState(user?.employeeId || '');

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage('');
      const res = await API.put('/auth/profile', { name, phone, department, studentId, employeeId });
      if (res.data.success) {
        updateUser(res.data.user);
        setMessage('Profile updated successfully!');
      }
    } catch (err: any) {
      console.error('Failed to update profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">User Profile</h2>
        <p className="text-xs text-gray-500">Manage your account information and contact details</p>
      </div>

      {message && (
        <div className="flex items-center rounded-xl bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs text-center flex flex-col items-center justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-3xl font-bold border-2 border-brand-300 shadow-inner mb-4">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
          <p className="text-xs text-gray-500">{user.email}</p>

          <div className="mt-3">
            <RoleBadge role={user.role} />
          </div>

          <div className="mt-6 w-full space-y-2 border-t pt-4 text-left text-xs">
            <div className="flex items-center justify-between text-gray-600">
              <span className="flex items-center"><Building className="mr-2 h-4 w-4 text-gray-400" /> Dept</span>
              <span className="font-semibold text-gray-800">{user.department || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between text-gray-600">
              <span className="flex items-center"><ShieldCheck className="mr-2 h-4 w-4 text-gray-400" /> ID</span>
              <span className="font-semibold text-gray-800">{user.studentId || user.employeeId || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
          <h4 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b">Edit Account Details</h4>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-3 text-xs focus:border-brand-600"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Email (Read Only)</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 555-0199"
                  className="w-full rounded-xl border border-gray-300 p-3 text-xs focus:border-brand-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-3 text-xs focus:border-brand-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  {user.role === 'student' ? 'Student ID' : 'Employee ID'}
                </label>
                <input
                  type="text"
                  value={user.role === 'student' ? studentId : employeeId}
                  onChange={(e) => user.role === 'student' ? setStudentId(e.target.value) : setEmployeeId(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-3 text-xs focus:border-brand-600"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-brand-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-brand-700 cursor-pointer shadow-sm"
              >
                {loading ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
