import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Complaint, ComplaintStatus } from '../../types';
import API from '../../services/api';
import { Paperclip } from 'lucide-react';

interface StatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: Complaint | null;
  onSuccess: () => void;
}

export const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  isOpen,
  onClose,
  complaint,
  onSuccess,
}) => {
  const [status, setStatus] = useState<ComplaintStatus>('in_progress');
  const [comment, setComment] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [proofFiles, setProofFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (complaint) {
      setStatus(complaint.status);
    }
  }, [complaint]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('status', status);
      formData.append('comment', comment);
      if (resolutionNotes) formData.append('resolutionNotes', resolutionNotes);

      if (proofFiles) {
        Array.from(proofFiles).forEach((file) => formData.append('proofFiles', file));
      }

      const res = await API.patch(`/complaints/${complaint._id}/status`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!complaint) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Update Status for ${complaint.complaintId}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">New Status:</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ComplaintStatus)}
            className="w-full rounded-lg border border-gray-300 p-2.5 text-xs focus:border-brand-500 font-semibold"
          >
            <option value="under_review">Under Review</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Status Comment:</label>
          <textarea
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Describe what action was taken..."
            className="w-full rounded-lg border border-gray-300 p-2.5 text-xs focus:border-brand-500"
            required
          ></textarea>
        </div>

        {status === 'resolved' && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 space-y-3">
            <h5 className="text-xs font-bold text-emerald-900">Resolution Proof & Details</h5>
            <div>
              <label className="block text-xs font-medium text-emerald-800 mb-1">
                Resolution Notes / Summary of Fix:
              </label>
              <textarea
                rows={2}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Explain how the issue was permanently fixed..."
                className="w-full rounded-lg border border-emerald-300 p-2.5 text-xs focus:border-emerald-500 bg-white"
              ></textarea>
            </div>

            <div>
              <label className="flex items-center text-xs font-medium text-emerald-800 cursor-pointer">
                <Paperclip className="mr-1 h-4 w-4" /> Upload Proof of Resolution (Images / Documents):
                <input
                  type="file"
                  multiple
                  onChange={(e) => setProofFiles(e.target.files)}
                  className="hidden"
                />
              </label>
              {proofFiles && proofFiles.length > 0 && (
                <p className="mt-1 text-[11px] text-emerald-700">
                  Selected: {Array.from(proofFiles).map((f) => f.name).join(', ')}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-2 pt-2 border-t">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 cursor-pointer"
          >
            Save Status
          </button>
        </div>
      </form>
    </Modal>
  );
};
