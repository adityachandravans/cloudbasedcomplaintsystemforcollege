import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Department, Category, ComplaintPriority } from '../types';
import { PlusCircle, Paperclip, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export const CreateComplaintPage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState<ComplaintPriority>('medium');
  const [files, setFiles] = useState<FileList | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const [catRes, deptRes] = await Promise.all([
        API.get('/categories/public'),
        API.get('/departments/public'),
      ]);

      if (catRes.data.success) {
        setCategories(catRes.data.categories);
        if (catRes.data.categories.length > 0) setCategory(catRes.data.categories[0].name);
      }
      if (deptRes.data.success) {
        setDepartments(deptRes.data.departments);
        if (deptRes.data.departments.length > 0) setDepartment(deptRes.data.departments[0].name);
      }
    } catch (err) {
      console.error('Failed to fetch options:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!title || !description || !category || !department || !location) {
      return setError('Please fill out all required fields.');
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('department', department);
      formData.append('location', location);
      formData.append('priority', priority);

      if (files) {
        Array.from(files).forEach((file) => formData.append('attachments', file));
      }

      const res = await API.post('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setSuccessMsg(`Complaint ${res.data.complaint.complaintId} created successfully!`);
        setTimeout(() => {
          navigate(`/complaints/${res.data.complaint._id}`);
        }, 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Submit New Complaint</h2>
          <p className="text-xs text-gray-500">
            Provide detailed information to help college authorities resolve your issue quickly
          </p>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-700 border border-red-200 flex items-center">
          <AlertCircle className="mr-2 h-4 w-4" /> {error}
        </div>
      )}

      {successMsg && (
        <div className="rounded-xl bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 border border-emerald-200 flex items-center">
          <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" /> {successMsg}
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Complaint Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Wi-Fi disconnected in Lab 2 / Water leakage in Hostel B"
              className="w-full rounded-xl border border-gray-300 p-3 text-xs focus:border-brand-600 outline-hidden"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-3 text-xs focus:border-brand-600 outline-hidden"
                required
              >
                {categories.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Responsible Department <span className="text-red-500">*</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-3 text-xs focus:border-brand-600 outline-hidden"
                required
              >
                {departments.map((d) => (
                  <option key={d._id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Campus Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Science Block Room 304 / Hostel Block A Room 12"
                className="w-full rounded-xl border border-gray-300 p-3 text-xs focus:border-brand-600 outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Urgency / Priority Level <span className="text-red-500">*</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ComplaintPriority)}
                className="w-full rounded-xl border border-gray-300 p-3 text-xs font-semibold focus:border-brand-600 outline-hidden"
              >
                <option value="low">Low (Target: 5 Days)</option>
                <option value="medium">Medium (Target: 3 Days)</option>
                <option value="high">High (Target: 2 Days)</option>
                <option value="critical">Critical (Target: 24 Hours)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Detailed Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue, step by step, including any error messages or physical damage..."
              className="w-full rounded-xl border border-gray-300 p-3 text-xs focus:border-brand-600 outline-hidden"
              required
            ></textarea>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Attach Evidence (Images / PDF / Documents)
            </label>
            <div className="mt-1 flex justify-center rounded-xl border-2 border-dashed border-gray-300 px-6 py-4">
              <div className="text-center">
                <Paperclip className="mx-auto h-8 w-8 text-gray-400" />
                <div className="mt-2 flex text-xs text-gray-600">
                  <label className="relative cursor-pointer font-semibold text-brand-600 hover:underline">
                    <span>Upload files</span>
                    <input
                      type="file"
                      multiple
                      onChange={(e) => setFiles(e.target.files)}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">PNG, JPG, PDF, DOC up to 10MB each</p>
              </div>
            </div>
            {files && files.length > 0 && (
              <div className="mt-2 text-xs text-brand-700 font-medium">
                Selected files: {Array.from(files).map((f) => f.name).join(', ')}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-xl border border-gray-300 px-5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center rounded-xl bg-brand-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-700 disabled:opacity-50 cursor-pointer transition-all"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> {loading ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
