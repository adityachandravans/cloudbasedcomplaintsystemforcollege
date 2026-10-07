import React from 'react';
import { ComplaintStatus, ComplaintPriority, UserRole } from '../../types';
import { getStatusBadgeStyle, getPriorityBadgeStyle, getRoleBadgeStyle } from '../../utils/formatters';

interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const { bg, label } = getStatusBadgeStyle(status);
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-3.5 py-1 text-sm font-semibold' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center rounded-full border ${bg} ${sizeClasses} shadow-sm transition-all`}>
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current"></span>
      {label}
    </span>
  );
};

interface PriorityBadgeProps {
  priority: ComplaintPriority;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const { bg, label } = getPriorityBadgeStyle(priority);
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center rounded ${bg} ${sizeClasses} font-semibold uppercase tracking-wider shadow-xs`}>
      {label}
    </span>
  );
};

export const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
  const bg = getRoleBadgeStyle(role);
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-semibold capitalize ${bg}`}>
      {role}
    </span>
  );
};
