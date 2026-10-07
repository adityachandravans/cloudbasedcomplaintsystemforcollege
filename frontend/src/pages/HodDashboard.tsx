import React, { useState, useEffect } from 'react';
import { Complaint, User } from '../types';
import API from '../services/api';
import { StatCard } from '../components/common/StatCard';
import { ComplaintTable } from '../components/complaints/ComplaintTable';
import { AssignStaffModal } from '../components/complaints/AssignStaffModal';
import { StatusUpdateModal } from '../components/complaints/StatusUpdateModal';
import { EscalateModal } from '../components/complaints/EscalateModal';
import { WorkloadBarChart } from '../components/dashboard/AnalyticsCharts';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Pagination } from '../components/common/Pagination';
import { Building2, Clock, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const HodDashboard: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [workload, setWorkload] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    escalated: 0,
    overdue: 0,
  });

  useEffect(() => {
    fetchDepartmentComplaints();
    fetchStaffWorkload();
  }, [page]);

  const fetchDepartmentComplaints = async () => {
    try {
      setLoading(true);
      const res = await API.get('/complaints', { params: { page, limit: 10 } });
      if (res.data.success) {
        setComplaints(res.data.complaints);
        setPages(res.data.pages);
        setTotal(res.data.total);

        // Fetch counts
        const allRes = await API.get('/complaints', { params: { limit: 1000 } });
        if (allRes.data.success) {
          const all: Complaint[] = allRes.data.complaints;
          setStats({
            total: all.length,
            pending: all.filter((c) => ['submitted', 'under_review'].includes(c.status)).length,
            resolved: all.filter((c) => ['resolved', 'closed'].includes(c.status)).length,
            escalated: all.filter((c) => c.status === 'escalated').length,
            overdue: all.filter((c) => c.isOverdue && !['resolved', 'closed'].includes(c.status)).length,
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch department complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffWorkload = async () => {
    try {
      const res = await API.get('/analytics/staff-workload');
      if (res.data.success) {
        setWorkload(res.data.staffWorkload);
      }
    } catch (err) {
      console.error('Failed to fetch staff workload:', err);
    }
  };

  const handleAssignClick = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setIsAssignModalOpen(true);
  };

  const handleStatusClick = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setIsStatusModalOpen(true);
  };

  const handleEscalateClick = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setIsEscalateModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-bold text-gray-900">Department Head Dashboard</h2>
        <p className="text-xs text-gray-500">
          Department: <strong className="text-brand-600 font-semibold">{user?.department}</strong> | Monitor SLA & Staff Allocations
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard title="Dept Complaints" value={stats.total} icon={Building2} color="blue" />
        <StatCard title="Unassigned / Pending" value={stats.pending} icon={Clock} color="amber" />
        <StatCard title="Resolved" value={stats.resolved} icon={CheckCircle2} color="emerald" />
        <StatCard title="Escalated" value={stats.escalated} icon={AlertTriangle} color="orange" />
        <StatCard title="Overdue SLA" value={stats.overdue} icon={AlertOctagon} color="rose" />
      </div>

      {/* Staff Workload Chart */}
      {workload.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
            Department Staff Workload Allocation
          </h3>
          <WorkloadBarChart data={workload} />
        </div>
      )}

      {/* Department Complaints List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-900">Department Complaints List</h3>

        {loading ? (
          <LoadingSpinner message="Loading department complaints..." />
        ) : complaints.length === 0 ? (
          <EmptyState
            title="No department complaints"
            description="There are currently no complaints registered for your department."
          />
        ) : (
          <>
            <ComplaintTable
              complaints={complaints}
              userRole="hod"
              onAssign={handleAssignClick}
              onStatusUpdate={handleStatusClick}
              onEscalate={handleEscalateClick}
            />
            <Pagination page={page} pages={pages} total={total} onPageChange={(p) => setPage(p)} />
          </>
        )}
      </div>

      {/* Modals */}
      <AssignStaffModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        complaint={selectedComplaint}
        onSuccess={() => { fetchDepartmentComplaints(); fetchStaffWorkload(); }}
      />
      <StatusUpdateModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        complaint={selectedComplaint}
        onSuccess={() => { fetchDepartmentComplaints(); fetchStaffWorkload(); }}
      />
      <EscalateModal
        isOpen={isEscalateModalOpen}
        onClose={() => setIsEscalateModalOpen(false)}
        complaint={selectedComplaint}
        onSuccess={fetchDepartmentComplaints}
      />
    </div>
  );
};
