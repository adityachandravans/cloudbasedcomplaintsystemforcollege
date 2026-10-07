import { ComplaintPriority, ComplaintStatus, UserRole } from '../types';

export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const formatShortDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

export const getStatusBadgeStyle = (status: ComplaintStatus) => {
  switch (status) {
    case 'submitted':
      return { bg: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Submitted' };
    case 'under_review':
      return { bg: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Under Review' };
    case 'assigned':
      return { bg: 'bg-indigo-100 text-indigo-800 border-indigo-200', label: 'Assigned' };
    case 'in_progress':
      return { bg: 'bg-amber-100 text-amber-800 border-amber-200', label: 'In Progress' };
    case 'resolved':
      return { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Resolved' };
    case 'closed':
      return { bg: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Closed' };
    case 'rejected':
      return { bg: 'bg-rose-100 text-rose-800 border-rose-200', label: 'Rejected' };
    case 'reopened':
      return { bg: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Reopened' };
    case 'escalated':
      return { bg: 'bg-red-100 text-red-900 border-red-300 font-bold animate-pulse', label: 'ESCALATED' };
    default:
      return { bg: 'bg-gray-100 text-gray-700 border-gray-200', label: status };
  }
};

export const getPriorityBadgeStyle = (priority: ComplaintPriority) => {
  switch (priority) {
    case 'critical':
      return { bg: 'bg-red-600 text-white font-bold', label: 'Critical' };
    case 'high':
      return { bg: 'bg-orange-500 text-white font-medium', label: 'High' };
    case 'medium':
      return { bg: 'bg-yellow-500 text-gray-900 font-medium', label: 'Medium' };
    case 'low':
      return { bg: 'bg-blue-500 text-white font-normal', label: 'Low' };
    default:
      return { bg: 'bg-gray-500 text-white', label: priority };
  }
};

export const getRoleBadgeStyle = (role: UserRole) => {
  switch (role) {
    case 'admin':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'hod':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'staff':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'student':
      return 'bg-cyan-100 text-cyan-800 border-cyan-200';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getSlaTimeRemaining = (dueDateString: string, isResolved: boolean): { text: string; isOverdue: boolean } => {
  if (isResolved) return { text: 'Completed', isOverdue: false };
  const due = new Date(dueDateString).getTime();
  const now = new Date().getTime();
  const diffMs = due - now;

  if (diffMs <= 0) {
    const overdueHours = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60));
    return { text: `Overdue by ${overdueHours}h`, isOverdue: true };
  }

  const hoursLeft = Math.floor(diffMs / (1000 * 60 * 60));
  if (hoursLeft > 24) {
    const daysLeft = Math.floor(hoursLeft / 24);
    return { text: `${daysLeft} days remaining`, isOverdue: false };
  }
  return { text: `${hoursLeft} hours remaining`, isOverdue: false };
};
