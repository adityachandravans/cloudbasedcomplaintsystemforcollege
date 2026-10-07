import React, { useState, useEffect } from 'react';
import { Complaint } from '../types';
import API from '../services/api';
import { StatCard } from '../components/common/StatCard';
import { ComplaintTable } from '../components/complaints/ComplaintTable';
import { StatusUpdateModal } from '../components/complaints/StatusUpdateModal';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Pagination } from '../components/common/Pagination';
import { FileText, Clock, CheckCircle2, AlertOctagon, RefreshCw, Flame } from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [stats, setStats] = useState({
    assigned: 0,
    inProgress: 0,
    resolved: 0,
    overdue: 0,
    highPriority: 0,
  });

  useEffect(() => {
    fetchAssignedComplaints();
  }, [page]);

  const fetchAssignedComplaints = async () => {
    try {
      setLoading(true);
      const res = await API.get('/complaints', { params: { page, limit: 10, assignedOnly: 'true' } });
      if (res.data.success) {
        setComplaints(res.data.complaints);
        setPages(res.data.pages);
        setTotal(res.data.total);

        // Fetch overall stats
        const allRes = await API.get('/complaints', { params: { limit: 1000, assignedOnly: 'true' } });
        if (allRes.data.success) {
          const all: Complaint[] = allRes.data.complaints;
          setStats({
            assigned: all.length,
            inProgress: all.filter((c) => ['assigned', 'in_progress', 'reopened'].includes(c.status)).length,
            resolved: all.filter((c) => ['resolved', 'closed'].includes(c.status)).length,
            overdue: all.filter((c) => c.isOverdue && !['resolved', 'closed'].includes(c.status)).length,
            highPriority: all.filter((c) => ['high', 'critical'].includes(c.priority)).length,
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch staff complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStatusModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setIsStatusModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-bold text-gray-900">Staff Workstation Dashboard</h2>
        <p className="text-xs text-gray-500">Manage and resolve assigned complaints efficiently</p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard title="Assigned to Me" value={stats.assigned} icon={FileText} color="indigo" />
        <StatCard title="In Progress" value={stats.inProgress} icon={RefreshCw} color="amber" />
        <StatCard title="Resolved" value={stats.resolved} icon={CheckCircle2} color="emerald" />
        <StatCard title="High / Critical" value={stats.highPriority} icon={Flame} color="orange" />
        <StatCard title="Overdue SLA" value={stats.overdue} icon={AlertOctagon} color="rose" />
      </div>

      {/* Complaints Table */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-900">Assigned Complaints List</h3>

        {loading ? (
          <LoadingSpinner message="Loading assigned complaints..." />
        ) : complaints.length === 0 ? (
          <EmptyState
            title="No assigned complaints"
            description="You currently have no pending assigned complaints."
          />
        ) : (
          <>
            <ComplaintTable
              complaints={complaints}
              userRole="staff"
              onStatusUpdate={handleOpenStatusModal}
            />
            <Pagination page={page} pages={pages} total={total} onPageChange={(p) => setPage(p)} />
          </>
        )}
      </div>

      {/* Status Update Modal */}
      <StatusUpdateModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        complaint={selectedComplaint}
        onSuccess={fetchAssignedComplaints}
      />
    </div>
  );
};
