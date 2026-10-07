import React from 'react';
import { HistoryItem, ComplaintStatus } from '../../types';
import { formatDate } from '../../utils/formatters';
import { CheckCircle2, Clock, User, AlertCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface ComplaintTimelineProps {
  history: HistoryItem[];
  currentStatus: ComplaintStatus;
}

const lifecycleSteps: { status: ComplaintStatus; label: string }[] = [
  { status: 'submitted', label: 'Submitted' },
  { status: 'under_review', label: 'Under Review' },
  { status: 'assigned', label: 'Assigned' },
  { status: 'in_progress', label: 'In Progress' },
  { status: 'resolved', label: 'Resolved' },
  { status: 'closed', label: 'Closed' },
];

export const ComplaintTimeline: React.FC<ComplaintTimelineProps> = ({ history, currentStatus }) => {
  const getStepState = (stepStatus: ComplaintStatus) => {
    const statusOrder = ['submitted', 'under_review', 'assigned', 'in_progress', 'resolved', 'closed'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepStatus);

    if (currentStatus === 'rejected') {
      if (stepStatus === 'submitted') return 'completed';
      return 'disabled';
    }

    if (stepIndex <= currentIndex && currentIndex !== -1) {
      return 'completed';
    }
    return 'pending';
  };

  return (
    <div className="space-y-6">
      {/* Horizontal Lifecycle Progress Bar */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
          Lifecycle Progress
        </h4>

        <div className="relative flex items-center justify-between">
          <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-gray-200 z-0"></div>

          {lifecycleSteps.map((step, idx) => {
            const state = getStepState(step.status);
            const isCompleted = state === 'completed';

            return (
              <div key={step.status} className="relative z-10 flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-brand-600 text-white ring-4 ring-brand-100'
                      : 'bg-white border-2 border-gray-300 text-gray-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : idx + 1}
                </div>
                <span className={`mt-2 text-xs font-medium ${isCompleted ? 'text-brand-900 font-semibold' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {currentStatus === 'escalated' && (
          <div className="mt-4 flex items-center rounded-lg bg-red-50 p-3 text-xs text-red-800 font-semibold border border-red-200">
            <AlertTriangle className="mr-2 h-4 w-4 text-red-600" />
            Complaint is currently ESCALATED due to priority or SLA delay.
          </div>
        )}

        {currentStatus === 'reopened' && (
          <div className="mt-4 flex items-center rounded-lg bg-orange-50 p-3 text-xs text-orange-800 font-semibold border border-orange-200">
            <RefreshCw className="mr-2 h-4 w-4 text-orange-600 animate-spin" />
            Complaint REOPENED by student for further resolution.
          </div>
        )}
      </div>

      {/* Detailed Vertical Event Log Timeline */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
          Activity Log & History Timeline
        </h4>

        <div className="relative border-l-2 border-brand-200 ml-4 space-y-6">
          {history.map((item, idx) => {
            const updaterName =
              typeof item.updatedBy === 'object' ? item.updatedBy?.name : item.updatedByName || 'System';
            const updaterRole =
              typeof item.updatedBy === 'object' ? item.updatedBy?.role : item.updatedByRole || '';

            return (
              <div key={idx} className="relative pl-6">
                <div className="absolute -left-2.5 top-0.5 h-5 w-5 rounded-full bg-brand-600 ring-4 ring-white flex items-center justify-center text-white">
                  <Clock className="h-3 w-3" />
                </div>

                <div className="rounded-lg bg-gray-50 p-3.5 border border-gray-200">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
                      {item.status.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-gray-400">{formatDate(item.timestamp)}</span>
                  </div>

                  {item.comment && <p className="mt-1 text-xs text-gray-700 font-medium">{item.comment}</p>}

                  <div className="mt-2 flex items-center text-[11px] text-gray-500">
                    <User className="mr-1 h-3 w-3 text-gray-400" />
                    <span>Updated by: <strong className="text-gray-800">{updaterName}</strong> ({updaterRole})</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
