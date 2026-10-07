import React, { useState, useEffect } from 'react';
import { User, UserRole, Department } from '../types';
import API from '../services/api';
import { Modal } from '../components/common/Modal';
import { RoleBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Pagination } from '../components/common/Pagination';
import { Users, UserPlus, Search, Edit3, Trash2, Power } from 'lucide-react';

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [department, setDepartment] = useState('');
  const [studentId, setStudentId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [phone, setPhone] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, [page, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 15 };
      if (roleFilter) params.role = roleFilter;
      if (search) params.search = search;

      const res = await API.get('/users', { params });
      if (res.data.success) {
        setUsers(res.data.users);
        setPages(res.data.pages);
        setTotal(res.data.total);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await API.get('/departments/public');
      if (res.data.success) setDepartments(res.data.departments);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPassword('Password@123');
    setRole('student');
    setDepartment('');
    setStudentId('');
    setEmployeeId('');
    setPhone('');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setPassword('');
    setRole(u.role);
    setDepartment(u.department || '');
    setStudentId(u.studentId || '');
    setEmployeeId(u.employeeId || '');
    setPhone(u.phone || '');
    setIsActive(u.isActive !== false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      const payload: any = {
        name,
        email,
        role,
        department,
        studentId,
        employeeId,
        phone,
        isActive,
      };
      if (password) payload.password = password;

      if (editingUser) {
        await API.put(`/users/${editingUser._id || editingUser.id}`, payload);
      } else {
        await API.post('/users', payload);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error('Failed to save user:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (userItem: User) => {
    try {
      await API.patch(`/users/${userItem._id || userItem.id}/toggle-status`);
      fetchUsers();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleDeleteUser = async (userItem: User) => {
    if (!window.confirm(`Are you sure you want to delete user "${userItem.name}"?`)) return;
    try {
      await API.delete(`/users/${userItem._id || userItem.id}`);
      fetchUsers();
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">User Management</h2>
          <p className="text-xs text-gray-500">Manage student, staff, HOD and admin accounts across campus</p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-brand-700 cursor-pointer"
        >
          <UserPlus className="mr-1.5 h-4 w-4" /> Add New User
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 rounded-xl border border-gray-200 bg-white p-3.5 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
            placeholder="Search by user name, email, student ID, employee ID..."
            className="w-full rounded-xl border border-gray-300 pl-10 pr-4 py-2 text-xs focus:border-brand-600 outline-hidden"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="rounded-xl border border-gray-300 px-3 py-2 text-xs font-semibold"
        >
          <option value="">All Roles</option>
          <option value="student">Students</option>
          <option value="staff">Staff Members</option>
          <option value="hod">Department Heads</option>
          <option value="admin">Administrators</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner message="Loading user accounts..." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 uppercase tracking-wider text-gray-500 border-b">
                <tr>
                  <th className="px-4 py-3.5 font-semibold">User Name</th>
                  <th className="px-4 py-3.5 font-semibold">Email</th>
                  <th className="px-4 py-3.5 font-semibold">Role</th>
                  <th className="px-4 py-3.5 font-semibold">Department</th>
                  <th className="px-4 py-3.5 font-semibold">ID Code</th>
                  <th className="px-4 py-3.5 font-semibold">Status</th>
                  <th className="px-4 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u._id || u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3.5 font-semibold text-gray-900">{u.name}</td>
                    <td className="px-4 py-3.5 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3.5">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-4 py-3.5">{u.department || '-'}</td>
                    <td className="px-4 py-3.5 font-mono">{u.studentId || u.employeeId || '-'}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.isActive !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {u.isActive !== false ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded cursor-pointer"
                          title="Toggle Active Status"
                        >
                          <Power className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 text-brand-600 hover:bg-brand-50 rounded cursor-pointer"
                          title="Edit User"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pages={pages} total={total} onPageChange={(p) => setPage(p)} />
        </div>
      )}

      {/* User Edit / Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? `Edit ${editingUser.name}` : 'Create New User Account'}
      >
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg p-2.5"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-lg p-2.5"
                required
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={editingUser ? 'Leave blank to keep current' : '••••••••'}
                className="w-full border rounded-lg p-2.5"
                required={!editingUser}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full border rounded-lg p-2.5 font-semibold"
              >
                <option value="student">Student</option>
                <option value="staff">Staff</option>
                <option value="hod">Department Head (HOD)</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full border rounded-lg p-2.5"
              >
                <option value="">-- None --</option>
                {departments.map((d) => (
                  <option key={d._id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Student ID / Employee ID</label>
              <input
                type="text"
                value={role === 'student' ? studentId : employeeId}
                onChange={(e) => role === 'student' ? setStudentId(e.target.value) : setEmployeeId(e.target.value)}
                className="w-full border rounded-lg p-2.5"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border rounded-lg p-2.5"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end space-x-2 border-t">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-4 py-2 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700"
            >
              Save Account
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
