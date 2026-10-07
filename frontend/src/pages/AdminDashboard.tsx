import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { StatCard } from '../components/common/StatCard';
import { ComplaintTable } from '../components/complaints/ComplaintTable';
import {
  StatusPieChart,
  CategoryBarChart,
  DepartmentBarChart,
  PriorityChart,
  MonthlyTrendChart,
} from '../components/dashboard/AnalyticsCharts';
import { AssignStaffModal } from '../components/complaints/AssignStaffModal';
import { StatusUpdateModal } from '../components/complaints/StatusUpdateModal';
import { EscalateModal } from '../components/complaints/EscalateModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Complaint } from '../types';
import {
  Users,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
  Star,
  Award,
  Zap,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);

  useEffect(() => {
    fetchAdminAnalytics();
    fetchRecentComplaints();
  }, []);

  const fetchAdminAnalytics = async () => {
    try {
      const res = await API.get('/analytics/overview');
      if (res.data.success) {
        setStats(res.data.stats);
        setCharts(res.data.charts);
      }
    } catch (err) {
      console.error('Failed to fetch admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentComplaints = async () => {
    try {
      const res = await API.get('/complaints', { params: { limit: 8 } });
      if (res.data.success) {
        setRecentComplaints(res.data.complaints);
      }
    } catch (err) {
      console.error('Failed to fetch recent complaints:', err);
    }
  };

  const handleExportCSV = () => {
    const token = localStorage.getItem('complaint_token');
    window.open(`/api/complaints/export/csv?token=${token}`, '_blank');
  };

  if (loading) {
    return <LoadingSpinner message="Loading System Analytics & Monitoring..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header & Export Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">System Admin Dashboard</h2>
          <p className="text-xs text-gray-500">
            Real-time complaint monitoring, SLA analytics, and cloud metrics
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-gray-700 shadow-xs hover:bg-gray-50 cursor-pointer transition-all"
          >
            <Download className="mr-1.5 h-4 w-4 text-brand-600" /> Export CSV Report
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <StatCard title="Total Complaints" value={stats.totalComplaints} icon={FileText} color="blue" />
          <StatCard title="Pending Review" value={stats.pendingComplaints} icon={Clock} color="purple" />
          <StatCard title="In Progress" value={stats.inProgressComplaints} icon={Zap} color="amber" />
          <StatCard title="Resolved" value={stats.resolvedComplaints} icon={CheckCircle2} color="emerald" />
          <StatCard title="Escalated" value={stats.escalatedComplaints} icon={AlertTriangle} color="orange" />
          <StatCard title="Total System Users" value={stats.totalUsers} icon={Users} color="indigo" />
        </div>
      )}

      {/* KPI Performance Metrics Banner */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-900 uppercase">Resolution Success Rate</p>
              <h4 className="text-2xl font-bold text-emerald-700 mt-0.5">{stats.resolutionRate}%</h4>
              <p className="text-[10px] text-emerald-600 mt-0.5">Complaints successfully resolved</p>
            </div>
            <Award className="h-10 w-10 text-emerald-600 opacity-80" />
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-900 uppercase">Avg Resolution Time</p>
              <h4 className="text-2xl font-bold text-blue-700 mt-0.5">{stats.avgResolutionHours} hours</h4>
              <p className="text-[10px] text-blue-600 mt-0.5">Average SLA turnaround</p>
            </div>
            <Clock className="h-10 w-10 text-blue-600 opacity-80" />
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-900 uppercase">Student Satisfaction</p>
              <h4 className="text-2xl font-bold text-amber-700 mt-0.5">
                ★ {stats.avgRating} <span className="text-xs text-gray-500 font-normal">/ 5.0</span>
              </h4>
              <p className="text-[10px] text-amber-600 mt-0.5">Based on {stats.totalReviews} student reviews</p>
            </div>
            <Star className="h-10 w-10 text-amber-500 fill-amber-400 opacity-90" />
          </div>
        </div>
      )}

      {/* Analytics Charts Grid */}
      {charts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
              Complaints Breakdown by Status
            </h3>
            <StatusPieChart data={charts.complaintsByStatus} />
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
              Monthly Submission vs Resolution Trend
            </h3>
            <MonthlyTrendChart data={charts.monthlyTrend} />
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
              Top Complaint Categories
            </h3>
            <CategoryBarChart data={charts.complaintsByCategory} />
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
              Complaints Distribution by Department
            </h3>
            <DepartmentBarChart data={charts.complaintsByDepartment} />
          </div>
        </div>
      )}

      {/* Recent System Complaints Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">Recent Complaints Across Campus</h3>
          <button
            onClick={() => navigate('/complaints')}
            className="text-xs font-semibold text-brand-600 hover:underline cursor-pointer"
          >
            View All Complaints &rarr;
          </button>
        </div>

        <ComplaintTable
          complaints={recentComplaints}
          userRole="admin"
          onAssign={(c) => { setSelectedComplaint(c); setIsAssignModalOpen(true); }}
          onStatusUpdate={(c) => { setSelectedComplaint(c); setIsStatusModalOpen(true); }}
          onEscalate={(c) => { setSelectedComplaint(c); setIsEscalateModalOpen(true); }}
        />
      </div>

      {/* Modals */}
      <AssignStaffModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        complaint={selectedComplaint}
        onSuccess={() => { fetchAdminAnalytics(); fetchRecentComplaints(); }}
      />
      <StatusUpdateModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        complaint={selectedComplaint}
        onSuccess={() => { fetchAdminAnalytics(); fetchRecentComplaints(); }}
      />
      <EscalateModal
        isOpen={isEscalateModalOpen}
        onClose={() => setIsEscalateModalOpen(false)}
        complaint={selectedComplaint}
        onSuccess={() => { fetchAdminAnalytics(); fetchRecentComplaints(); }}
      />
    </div>
  );
};
