import React, { useState, useEffect } from 'react';
import { Complaint, Department, Category } from '../types';
import API from '../services/api';
import { ComplaintTable } from '../components/complaints/ComplaintTable';
import { ComplaintCard } from '../components/complaints/ComplaintCard';
import { AssignStaffModal } from '../components/complaints/AssignStaffModal';
import { StatusUpdateModal } from '../components/complaints/StatusUpdateModal';
import { EscalateModal } from '../components/complaints/EscalateModal';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Pagination } from '../components/common/Pagination';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Filter,
  Download,
  LayoutGrid,
  List,
  PlusCircle,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ComplaintsListPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [overdueFilter, setOverdueFilter] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [page, statusFilter, categoryFilter, departmentFilter, priorityFilter, overdueFilter, sortBy, order]);

  const fetchOptions = async () => {
    try {
      const [catRes, deptRes] = await Promise.all([
        API.get('/categories/public'),
        API.get('/departments/public'),
      ]);
      if (catRes.data.success) setCategories(catRes.data.categories);
      if (deptRes.data.success) setDepartments(deptRes.data.departments);
    } catch (err) {
      console.error('Failed to fetch options:', err);
    }
  };

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: 15,
        sortBy,
        order,
      };
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (departmentFilter) params.department = departmentFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (overdueFilter) params.isOverdue = 'true';
      if (search) params.search = search;

      const res = await API.get('/complaints', { params });
      if (res.data.success) {
        setComplaints(res.data.complaints);
        setPages(res.data.pages);
        setTotal(res.data.total);
      }
    } catch (err) {
      console.error('Failed to fetch complaints list:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchComplaints();
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setCategoryFilter('');
    setDepartmentFilter('');
    setPriorityFilter('');
    setOverdueFilter(false);
    setPage(1);
  };

  const handleExportCSV = () => {
    const token = localStorage.getItem('complaint_token');
    window.open(`/api/complaints/export/csv?token=${token}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Complaints Directory</h2>
          <p className="text-xs text-gray-500">Search, filter, and track all submitted campus complaints</p>
        </div>

        <div className="flex items-center space-x-2">
          {user?.role === 'student' && (
            <button
              onClick={() => navigate('/complaints/new')}
              className="inline-flex items-center rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-700 cursor-pointer"
            >
              <PlusCircle className="mr-1.5 h-4 w-4" /> Create Complaint
            </button>
          )}

          {['admin', 'hod'].includes(user?.role || '') && (
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 cursor-pointer"
            >
              <Download className="mr-1.5 h-4 w-4 text-brand-600" /> Export CSV
            </button>
          )}

          <div className="flex items-center rounded-xl border border-gray-300 bg-white p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs cursor-pointer ${
                viewMode === 'table' ? 'bg-brand-600 text-white' : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs cursor-pointer ${
                viewMode === 'grid' ? 'bg-brand-600 text-white' : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, title, description, location..."
              className="w-full rounded-xl border border-gray-300 pl-10 pr-4 py-2.5 text-xs focus:border-brand-600 outline-hidden"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-700 cursor-pointer"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t text-xs">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="rounded-xl border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 focus:border-brand-600"
          >
            <option value="">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
            <option value="reopened">Reopened</option>
            <option value="escalated">Escalated</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
            className="rounded-xl border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 focus:border-brand-600"
          >
            <option value="">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="rounded-xl border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 focus:border-brand-600"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c.name}>{c.name}</option>
            ))}
          </select>

          <select
            value={departmentFilter}
            onChange={(e) => { setDepartmentFilter(e.target.value); setPage(1); }}
            className="rounded-xl border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 focus:border-brand-600"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d.name}>{d.name}</option>
            ))}
          </select>

          <label className="flex items-center text-xs text-red-700 font-semibold px-2 py-1 bg-red-50 rounded border border-red-200 cursor-pointer">
            <input
              type="checkbox"
              checked={overdueFilter}
              onChange={(e) => { setOverdueFilter(e.target.checked); setPage(1); }}
              className="mr-1.5 h-3.5 w-3.5 rounded text-red-600"
            />
            Overdue Only
          </label>

          {(statusFilter || categoryFilter || departmentFilter || priorityFilter || overdueFilter || search) && (
            <button
              onClick={clearFilters}
              className="flex items-center text-xs font-semibold text-gray-500 hover:text-red-600 ml-auto cursor-pointer"
            >
              <X className="mr-1 h-3.5 w-3.5" /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Content View */}
      {loading ? (
        <LoadingSpinner message="Loading complaints..." />
      ) : complaints.length === 0 ? (
        <EmptyState
          title="No complaints matching criteria"
          description="Try modifying your search keywords or clearing active status filters."
          actionButton={
            <button
              onClick={clearFilters}
              className="rounded-xl border px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Clear All Filters
            </button>
          }
        />
      ) : viewMode === 'table' ? (
        <>
          <ComplaintTable
            complaints={complaints}
            userRole={user?.role || 'student'}
            onAssign={(c) => { setSelectedComplaint(c); setIsAssignModalOpen(true); }}
            onStatusUpdate={(c) => { setSelectedComplaint(c); setIsStatusModalOpen(true); }}
            onEscalate={(c) => { setSelectedComplaint(c); setIsEscalateModalOpen(true); }}
          />
          <Pagination page={page} pages={pages} total={total} onPageChange={(p) => setPage(p)} />
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {complaints.map((c) => (
              <ComplaintCard key={c._id} complaint={c} />
            ))}
          </div>
          <Pagination page={page} pages={pages} total={total} onPageChange={(p) => setPage(p)} />
        </>
      )}

      {/* Action Modals */}
      <AssignStaffModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        complaint={selectedComplaint}
        onSuccess={fetchComplaints}
      />
      <StatusUpdateModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        complaint={selectedComplaint}
        onSuccess={fetchComplaints}
      />
      <EscalateModal
        isOpen={isEscalateModalOpen}
        onClose={() => setIsEscalateModalOpen(false)}
        complaint={selectedComplaint}
        onSuccess={fetchComplaints}
      />
    </div>
  );
};
