import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Complaint, ComplaintStatus, ComplaintPriority } from '../types';
import API from '../services/api';
import { StatCard } from '../components/common/StatCard';
import { ComplaintTable } from '../components/complaints/ComplaintTable';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Pagination } from '../components/common/Pagination';
import {
  PlusCircle,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Stats summary counts
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0,
    reopened: 0,
  });

  useEffect(() => {
    fetchComplaints();
  }, [page, statusFilter, priorityFilter]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (search) params.search = search;

      const res = await API.get('/complaints', { params });
      if (res.data.success) {
        setComplaints(res.data.complaints);
        setPages(res.data.pages);
        setTotal(res.data.total);

        // Compute summary counts from backend records
        const allRes = await API.get('/complaints', { params: { limit: 1000 } });
        if (allRes.data.success) {
          const all: Complaint[] = allRes.data.complaints;
          setStats({
            total: all.length,
            pending: all.filter((c) => ['submitted', 'under_review'].includes(c.status)).length,
            inProgress: all.filter((c) => ['assigned', 'in_progress'].includes(c.status)).length,
            resolved: all.filter((c) => ['resolved', 'closed'].includes(c.status)).length,
            rejected: all.filter((c) => c.status === 'rejected').length,
            reopened: all.filter((c) => c.status === 'reopened').length,
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch student complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchComplaints();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Student Dashboard</h2>
          <p className="text-xs text-gray-500">Track and manage your submitted college complaints</p>
        </div>

        <button
          onClick={() => navigate('/complaints/new')}
          className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-700 cursor-pointer transition-all"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Create New Complaint
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Total Submitted"
          value={stats.total}
          icon={FileText}
          color="blue"
          onClick={() => { setStatusFilter(''); setPage(1); }}
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={Clock}
          color="purple"
          onClick={() => { setStatusFilter('submitted'); setPage(1); }}
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon={RefreshCw}
          color="amber"
          onClick={() => { setStatusFilter('in_progress'); setPage(1); }}
        />
        <StatCard
          title="Resolved"
          value={stats.resolved}
          icon={CheckCircle2}
          color="emerald"
          onClick={() => { setStatusFilter('resolved'); setPage(1); }}
        />
        <StatCard
          title="Reopened"
          value={stats.reopened}
          icon={RefreshCw}
          color="orange"
          onClick={() => { setStatusFilter('reopened'); setPage(1); }}
        />
        <StatCard
          title="Rejected"
          value={stats.rejected}
          icon={XCircle}
          color="rose"
          onClick={() => { setStatusFilter('rejected'); setPage(1); }}
        />
      </div>

      {/* Search & Filter Controls */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Complaint ID, Title, Location, or Category..."
              className="w-full rounded-xl border border-gray-300 pl-9 pr-4 py-2 text-xs focus:border-brand-600 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="rounded-xl border border-gray-300 px-3 py-2 text-xs font-semibold focus:border-brand-600"
            >
              <option value="">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="reopened">Reopened</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
              className="rounded-xl border border-gray-300 px-3 py-2 text-xs font-semibold focus:border-brand-600"
            >
              <option value="">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </form>
      </div>

      {/* Complaints Table */}
      {loading ? (
        <LoadingSpinner message="Fetching your complaints..." />
      ) : complaints.length === 0 ? (
        <EmptyState
          title="No complaints found"
          description="You haven't submitted any complaints matching this filter yet."
          actionButton={
            <button
              onClick={() => navigate('/complaints/new')}
              className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 cursor-pointer"
            >
              Submit First Complaint
            </button>
          }
        />
      ) : (
        <>
          <ComplaintTable complaints={complaints} userRole="student" />
          <Pagination page={page} pages={pages} total={total} onPageChange={(p) => setPage(p)} />
        </>
      )}
    </div>
  );
};
