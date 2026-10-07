import React from 'react';
import { Complaint, UserRole } from '../../types';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import { formatDate, getSlaTimeRemaining } from '../../utils/formatters';
import { Eye, UserCheck, AlertTriangle, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ComplaintTableProps {
  complaints: Complaint[];
  userRole: UserRole;
  onAssign?: (complaint: Complaint) => void;
  onStatusUpdate?: (complaint: Complaint) => void;
  onEscalate?: (complaint: Complaint) => void;
}

export const ComplaintTable: React.FC<ComplaintTableProps> = ({
  complaints,
  userRole,
  onAssign,
  onStatusUpdate,
  onEscalate,
}) => {
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b">
            <tr>
              <th className="px-4 py-3.5 font-semibold">Complaint ID</th>
              <th className="px-4 py-3.5 font-semibold">Title</th>
              <th className="px-4 py-3.5 font-semibold">Category</th>
              <th className="px-4 py-3.5 font-semibold">Department</th>
              <th className="px-4 py-3.5 font-semibold">Priority</th>
              <th className="px-4 py-3.5 font-semibold">Status</th>
              <th className="px-4 py-3.5 font-semibold">Assigned To</th>
              <th className="px-4 py-3.5 font-semibold">Submitted Date</th>
              <th className="px-4 py-3.5 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {complaints.map((item) => {
              const sla = getSlaTimeRemaining(item.dueDate, ['resolved', 'closed'].includes(item.status));

              return (
                <tr
                  key={item._id}
                  className="hover:bg-gray-50/80 transition-colors"
                >
                  <td className="px-4 py-4 font-mono text-xs font-bold text-brand-700 whitespace-nowrap">
                    {item.complaintId}
                  </td>
                  <td className="px-4 py-4 max-w-xs">
                    <p
                      onClick={() => navigate(`/complaints/${item._id}`)}
                      className="font-semibold text-gray-900 hover:text-brand-600 cursor-pointer line-clamp-1"
                    >
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-400 line-clamp-1">{item.location}</p>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-xs font-medium text-gray-700">
                    {item.category}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-600">
                    {item.department}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <PriorityBadge priority={item.priority} size="sm" />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <StatusBadge status={item.status} size="sm" />
                      {item.isOverdue && !['resolved', 'closed'].includes(item.status) && (
                        <span className="text-[10px] font-bold text-red-600 uppercase tracking-tight">
                          ⚠️ {sla.text}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-xs">
                    {item.assignedTo ? (
                      <span className="font-medium text-gray-800">{item.assignedTo.name}</span>
                    ) : (
                      <span className="text-gray-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-500">
                    {formatDate(item.createdAt)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-xs font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => navigate(`/complaints/${item._id}`)}
                        className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100 hover:text-brand-600 transition-colors cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {['hod', 'admin'].includes(userRole) && onAssign && (
                        <button
                          onClick={() => onAssign(item)}
                          className="rounded-lg p-1.5 text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                          title="Assign Staff"
                        >
                          <UserCheck className="h-4 w-4" />
                        </button>
                      )}

                      {['staff', 'hod', 'admin'].includes(userRole) && onStatusUpdate && (
                        <button
                          onClick={() => onStatusUpdate(item)}
                          className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="Update Status"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                      )}

                      {['hod', 'admin'].includes(userRole) && onEscalate && item.status !== 'escalated' && !['resolved', 'closed'].includes(item.status) && (
                        <button
                          onClick={() => onEscalate(item)}
                          className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Escalate Issue"
                        >
                          <AlertTriangle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
