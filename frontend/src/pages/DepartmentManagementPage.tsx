import React, { useState, useEffect } from 'react';
import { Department, User } from '../types';
import API from '../services/api';
import { Modal } from '../components/common/Modal';
import { Building2, Plus, Edit3, Trash2 } from 'lucide-react';

export const DepartmentManagementPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [hods, setHods] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [headId, setHeadId] = useState('');

  useEffect(() => {
    fetchDepartments();
    fetchHods();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await API.get('/departments/admin');
      if (res.data.success) setDepartments(res.data.departments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHods = async () => {
    try {
      const res = await API.get('/users?role=hod');
      if (res.data.success) setHods(res.data.users);
    } catch (err) {
      console.error(err);
    }
  };

  const openCreateModal = () => {
    setEditingDept(null);
    setName('');
    setCode('');
    setDescription('');
    setHeadId('');
    setIsModalOpen(true);
  };

  const openEditModal = (d: Department) => {
    setEditingDept(d);
    setName(d.name);
    setCode(d.code);
    setDescription(d.description || '');
    setHeadId(d.head?._id || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { name, code, description, headId };
      if (editingDept) {
        await API.put(`/departments/${editingDept._id}`, payload);
      } else {
        await API.post('/departments', payload);
      }
      setIsModalOpen(false);
      fetchDepartments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this department?')) return;
    try {
      await API.delete(`/departments/${id}`);
      fetchDepartments();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Department Management</h2>
          <p className="text-xs text-gray-500">Configure academic & administrative departments</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-700 cursor-pointer"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Add Department
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((d) => (
          <div key={d._id} className="rounded-xl border bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold bg-brand-50 text-brand-700 px-2 py-0.5 rounded border border-brand-200">
                {d.code}
              </span>
              <div className="flex items-center space-x-1">
                <button onClick={() => openEditModal(d)} className="p-1 text-brand-600 hover:bg-gray-100 rounded">
                  <Edit3 className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(d._id)} className="p-1 text-rose-600 hover:bg-gray-100 rounded">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <h3 className="text-base font-bold text-gray-900">{d.name}</h3>
            <p className="text-xs text-gray-600 leading-relaxed">{d.description || 'No description provided'}</p>

            <div className="pt-2 border-t text-xs text-gray-500 flex justify-between items-center">
              <span>Department Head:</span>
              <span className="font-semibold text-gray-800">{d.head ? d.head.name : 'Unassigned'}</span>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingDept ? 'Edit Department' : 'Create Department'}>
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold mb-1">Department Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded-lg p-2.5" required />
          </div>
          <div>
            <label className="block font-semibold mb-1">Code (Short Prefix)</label>
            <input type="text" value={code} onChange={(e) => setCode(e.target.value)} className="w-full border rounded-lg p-2.5 uppercase" required />
          </div>
          <div>
            <label className="block font-semibold mb-1">Description</label>
            <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded-lg p-2.5" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Assign HOD</label>
            <select value={headId} onChange={(e) => setHeadId(e.target.value)} className="w-full border rounded-lg p-2.5">
              <option value="">-- None --</option>
              {hods.map((h) => (
                <option key={h._id || h.id} value={h._id || h.id}>{h.name} ({h.email})</option>
              ))}
            </select>
          </div>
          <div className="pt-2 flex justify-end space-x-2 border-t">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-brand-600 text-white font-semibold rounded-lg">Save Department</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
