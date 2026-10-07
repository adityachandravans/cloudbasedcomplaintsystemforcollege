import React from 'react';
import { Complaint } from '../../types';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import { formatDate, getSlaTimeRemaining } from '../../utils/formatters';
import { Clock, MapPin, User, ArrowRight, Paperclip } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ComplaintCard: React.FC<{ complaint: Complaint }> = ({ complaint }) => {
  const navigate = useNavigate();
  const sla = getSlaTimeRemaining(complaint.dueDate, ['resolved', 'closed'].includes(complaint.status));

  return (
    <div
      onClick={() => navigate(`/complaints/${complaint._id}`)}
      className="group relative flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-xs transition-all duration-200 hover:border-brand-300 hover:shadow-md cursor-pointer"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
            {complaint.complaintId}
          </span>
          <div className="flex items-center space-x-2">
            <PriorityBadge priority={complaint.priority} size="sm" />
            <StatusBadge status={complaint.status} size="sm" />
          </div>
        </div>

        <h3 className="text-base font-semibold text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-1">
          {complaint.title}
        </h3>

        <p className="mt-1.5 text-xs text-gray-600 line-clamp-2 leading-relaxed">
          {complaint.description}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-gray-500 border-t pt-3">
          <div className="flex items-center">
            <MapPin className="mr-1 h-3.5 w-3.5 text-gray-400" />
            <span>{complaint.location}</span>
          </div>
          <div className="flex items-center">
            <User className="mr-1 h-3.5 w-3.5 text-gray-400" />
            <span>{complaint.createdBy?.name || 'Student'}</span>
          </div>
          {complaint.attachments && complaint.attachments.length > 0 && (
            <div className="flex items-center text-brand-600 font-medium">
              <Paperclip className="mr-1 h-3.5 w-3.5" />
              <span>{complaint.attachments.length} files</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs">
        <span className="flex items-center text-gray-500">
          <Clock className="mr-1 h-3.5 w-3.5" /> {formatDate(complaint.createdAt)}
        </span>

        <span
          className={`font-medium ${
            sla.isOverdue ? 'text-red-600 font-bold animate-pulse' : 'text-gray-600'
          }`}
        >
          {sla.text}
        </span>
      </div>
    </div>
  );
};
