import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Complaint, Feedback } from '../types';
import API from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { ComplaintTimeline } from '../components/complaints/ComplaintTimeline';
import { CommentSection } from '../components/complaints/CommentSection';
import { AssignStaffModal } from '../components/complaints/AssignStaffModal';
import { StatusUpdateModal } from '../components/complaints/StatusUpdateModal';
import { EscalateModal } from '../components/complaints/EscalateModal';
import { FeedbackModal } from '../components/complaints/FeedbackModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatDate, getSlaTimeRemaining } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  User,
  MapPin,
  Clock,
  Paperclip,
  UserCheck,
  MessageSquare,
  AlertTriangle,
  RefreshCw,
  Star,
  CheckCircle2,
  Building,
} from 'lucide-react';

export const ComplaintDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(true);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  const [reopenReason, setReopenReason] = useState('');
  const [showReopenInput, setShowReopenInput] = useState(false);
  const [reopening, setReopening] = useState(false);

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/complaints/${id}`);
      if (res.data.success) {
        setComplaint(res.data.complaint);
        // Fetch existing feedback if resolved
        if (['resolved', 'closed'].includes(res.data.complaint.status)) {
          fetchFeedback(res.data.complaint._id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch complaint details:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedback = async (complaintId: string) => {
    try {
      const res = await API.get(`/feedback/${complaintId}`);
      if (res.data.success) {
        setFeedback(res.data.feedback);
      }
    } catch (err) {
      console.error('Failed to fetch feedback:', err);
    }
  };

  const handleReopenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint || !reopenReason.trim()) return;

    try {
      setReopening(true);
      const res = await API.post(`/complaints/${complaint._id}/reopen`, { reason: reopenReason });
      if (res.data.success) {
        setShowReopenInput(false);
        fetchComplaintDetails();
      }
    } catch (err) {
      console.error('Failed to reopen complaint:', err);
    } finally {
      setReopening(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading complaint details..." />;
  }

  if (!complaint) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Complaint not found or access denied.</p>
        <button
          onClick={() => navigate('/complaints')}
          className="mt-4 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white"
        >
          Return to Complaints
        </button>
      </div>
    );
  }

  const isStudent = user?.role === 'student';
  const isHodOrAdmin = ['hod', 'admin'].includes(user?.role || '');
  const isStaffOrHigher = ['staff', 'hod', 'admin'].includes(user?.role || '');
  const sla = getSlaTimeRemaining(complaint.dueDate, ['resolved', 'closed'].includes(complaint.status));

  return (
    <div className="space-y-6">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-xl border border-gray-300 p-2 text-gray-600 hover:bg-gray-100 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded border border-brand-200">
                {complaint.complaintId}
              </span>
              <PriorityBadge priority={complaint.priority} />
              <StatusBadge status={complaint.status} size="lg" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mt-1">{complaint.title}</h2>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {isHodOrAdmin && (
            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="inline-flex items-center rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 cursor-pointer"
            >
              <UserCheck className="mr-1.5 h-4 w-4" /> Assign Staff
            </button>
          )}

          {isStaffOrHigher && (
            <button
              onClick={() => setIsStatusModalOpen(true)}
              className="inline-flex items-center rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 cursor-pointer"
            >
              <MessageSquare className="mr-1.5 h-4 w-4" /> Update Status
            </button>
          )}

          {isHodOrAdmin && complaint.status !== 'escalated' && !['resolved', 'closed'].includes(complaint.status) && (
            <button
              onClick={() => setIsEscalateModalOpen(true)}
              className="inline-flex items-center rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700 cursor-pointer"
            >
              <AlertTriangle className="mr-1.5 h-4 w-4" /> Escalate
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Complaint Details & Comments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Description Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Problem Description
            </h3>

            <p className="text-xs text-gray-800 leading-relaxed whitespace-pre-wrap">
              {complaint.description}
            </p>

            {/* Attachments Section */}
            {complaint.attachments && complaint.attachments.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="text-xs font-semibold text-gray-700 mb-2">Supporting Attachments:</h4>
                <div className="flex flex-wrap gap-2">
                  {complaint.attachments.map((file, idx) => (
                    <a
                      key={idx}
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-lg border border-gray-300 bg-gray-50 px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-gray-100"
                    >
                      <Paperclip className="mr-1.5 h-3.5 w-3.5 text-gray-500" />
                      {file.originalName}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Resolution Proof Section */}
            {complaint.resolutionNotes && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-2">
                <h4 className="text-xs font-bold text-emerald-900 flex items-center">
                  <CheckCircle2 className="mr-1.5 h-4 w-4 text-emerald-600" /> Resolution Proof & Notes
                </h4>
                <p className="text-xs text-emerald-800">{complaint.resolutionNotes}</p>
                {complaint.resolutionProof && complaint.resolutionProof.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {complaint.resolutionProof.map((proof, idx) => (
                      <a
                        key={idx}
                        href={proof.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-[11px] font-semibold text-emerald-800 bg-white px-2.5 py-1 rounded border border-emerald-300 hover:underline"
                      >
                        <Paperclip className="mr-1 h-3 w-3" /> {proof.originalName}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Student Action: Reopen & Feedback Buttons */}
            {isStudent && ['resolved', 'closed'].includes(complaint.status) && (
              <div className="border-t pt-4 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setIsFeedbackModalOpen(true)}
                    className="inline-flex items-center rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-600 cursor-pointer"
                  >
                    <Star className="mr-1.5 h-4 w-4 fill-white" /> Give Resolution Feedback
                  </button>

                  <button
                    onClick={() => setShowReopenInput(!showReopenInput)}
                    className="inline-flex items-center rounded-xl border border-orange-300 bg-orange-50 px-4 py-2 text-xs font-semibold text-orange-800 hover:bg-orange-100 cursor-pointer"
                  >
                    <RefreshCw className="mr-1.5 h-4 w-4" /> Issue Not Fixed? Reopen Complaint
                  </button>
                </div>

                {showReopenInput && (
                  <form onSubmit={handleReopenSubmit} className="rounded-xl border border-orange-200 bg-orange-50 p-4 space-y-3">
                    <label className="block text-xs font-bold text-orange-900">
                      Reason for Reopening:
                    </label>
                    <textarea
                      rows={2}
                      value={reopenReason}
                      onChange={(e) => setReopenReason(e.target.value)}
                      placeholder="Explain why the problem is still unresolved..."
                      className="w-full rounded-lg border border-orange-300 p-2.5 text-xs bg-white focus:outline-hidden"
                      required
                    ></textarea>
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowReopenInput(false)}
                        className="rounded-lg border px-3 py-1.5 text-xs text-gray-600 bg-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={reopening}
                        className="rounded-lg bg-orange-600 px-4 py-1.5 text-xs font-bold text-white"
                      >
                        Confirm Reopen
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Display Feedback rating if already submitted */}
            {feedback && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900">Student Resolution Rating:</span>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-4 w-4 ${
                          s <= feedback.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {feedback.comment && (
                  <p className="mt-1 text-xs text-amber-800 italic">"{feedback.comment}"</p>
                )}
              </div>
            )}
          </div>

          {/* Comments Component */}
          <CommentSection complaintId={complaint._id} />
        </div>

        {/* Right Column: Metadata Sidebar & Visual Lifecycle Timeline */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-4 text-xs">
            <h3 className="font-bold text-gray-900 uppercase tracking-wider text-xs border-b pb-2">
              Complaint Meta Details
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-gray-600">
                <span className="flex items-center"><Building className="mr-2 h-4 w-4 text-gray-400" /> Category</span>
                <span className="font-semibold text-gray-900">{complaint.category}</span>
              </div>

              <div className="flex items-center justify-between text-gray-600">
                <span className="flex items-center"><Building className="mr-2 h-4 w-4 text-gray-400" /> Department</span>
                <span className="font-semibold text-gray-900">{complaint.department}</span>
              </div>

              <div className="flex items-center justify-between text-gray-600">
                <span className="flex items-center"><MapPin className="mr-2 h-4 w-4 text-gray-400" /> Location</span>
                <span className="font-semibold text-gray-900">{complaint.location}</span>
              </div>

              <div className="flex items-center justify-between text-gray-600 border-t pt-2">
                <span className="flex items-center"><User className="mr-2 h-4 w-4 text-gray-400" /> Submitted By</span>
                <span className="font-semibold text-gray-900">{complaint.createdBy?.name}</span>
              </div>

              <div className="flex items-center justify-between text-gray-600">
                <span className="flex items-center"><UserCheck className="mr-2 h-4 w-4 text-gray-400" /> Assigned Staff</span>
                <span className="font-semibold text-gray-900">
                  {complaint.assignedTo ? complaint.assignedTo.name : 'Unassigned'}
                </span>
              </div>

              <div className="flex items-center justify-between text-gray-600 border-t pt-2">
                <span className="flex items-center"><Clock className="mr-2 h-4 w-4 text-gray-400" /> Created Date</span>
                <span className="font-semibold text-gray-900">{formatDate(complaint.createdAt)}</span>
              </div>

              <div className="flex items-center justify-between text-gray-600">
                <span className="flex items-center"><Clock className="mr-2 h-4 w-4 text-gray-400" /> SLA Target</span>
                <span className={`font-semibold ${sla.isOverdue ? 'text-red-600 animate-pulse font-bold' : 'text-gray-900'}`}>
                  {sla.text}
                </span>
              </div>
            </div>
          </div>

          {/* Visual Step Timeline */}
          <ComplaintTimeline history={complaint.history} currentStatus={complaint.status} />
        </div>
      </div>

      {/* Action Modals */}
      <AssignStaffModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        complaint={complaint}
        onSuccess={fetchComplaintDetails}
      />
      <StatusUpdateModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        complaint={complaint}
        onSuccess={fetchComplaintDetails}
      />
      <EscalateModal
        isOpen={isEscalateModalOpen}
        onClose={() => setIsEscalateModalOpen(false)}
        complaint={complaint}
        onSuccess={fetchComplaintDetails}
      />
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        complaintId={complaint._id}
        onSuccess={fetchComplaintDetails}
      />
    </div>
  );
};
