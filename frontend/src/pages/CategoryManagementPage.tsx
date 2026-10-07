import React, { useState, useEffect } from 'react';
import { Category, Department } from '../types';
import API from '../services/api';
import { Modal } from '../components/common/Modal';
import { Tags, Plus, Edit3, Trash2 } from 'lucide-react';

export const CategoryManagementPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchDepartments();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await API.get('/categories/admin');
      if (res.data.success) setCategories(res.data.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await API.get('/departments/public');
      if (res.data.success) setDepartments(res.data.departments);
    } catch (err) {
      console.error(err);
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setDepartment('');
    setIsModalOpen(true);
  };

  const openEditModal = (c: Category) => {
    setEditingCategory(c);
    setName(c.name);
    setDescription(c.description || '');
    setDepartment(c.department || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { name, description, department };
      if (editingCategory) {
        await API.put(`/categories/${editingCategory._id}`, payload);
      } else {
        await API.post('/categories', payload);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete category?')) return;
    try {
      await API.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Complaint Category Management</h2>
          <p className="text-xs text-gray-500">Configure issue categories and mapped departments</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-700 cursor-pointer"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <div key={c._id} className="rounded-xl border bg-white p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                {c.department || 'General'}
              </span>
              <div className="flex items-center space-x-1">
                <button onClick={() => openEditModal(c)} className="p-1 text-brand-600 hover:bg-gray-100 rounded">
                  <Edit3 className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(c._id)} className="p-1 text-rose-600 hover:bg-gray-100 rounded">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <h3 className="text-sm font-bold text-gray-900">{c.name}</h3>
            <p className="text-xs text-gray-600">{c.description || 'No description'}</p>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCategory ? 'Edit Category' : 'Create Category'}>
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold mb-1">Category Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded-lg p-2.5" required />
          </div>
          <div>
            <label className="block font-semibold mb-1">Mapped Department</label>
            <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full border rounded-lg p-2.5">
              <option value="">-- None --</option>
              {departments.map((d) => (
                <option key={d._id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Description</label>
            <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded-lg p-2.5" />
          </div>
          <div className="pt-2 flex justify-end space-x-2 border-t">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-brand-600 text-white font-semibold rounded-lg">Save Category</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
