import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Complaint } from '../../types';
import API from '../../services/api';
import { AlertTriangle } from 'lucide-react';

interface EscalateModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: Complaint | null;
  onSuccess: () => void;
}

export const EscalateModal: React.FC<EscalateModalProps> = ({
  isOpen,
  onClose,
  complaint,
  onSuccess,
}) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;

    try {
      setLoading(true);
      const res = await API.patch(`/complaints/${complaint._id}/escalate`, { reason });
      if (res.data.success) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error('Failed to escalate complaint:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!complaint) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Escalate ${complaint.complaintId}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-800">
          <p className="flex items-center font-bold">
            <AlertTriangle className="mr-1.5 h-4 w-4 text-red-600" /> Warning: Escalation Notice
          </p>
          <p className="mt-1">
            Escalating this complaint will alert System Administrators and Department Heads immediately.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Escalation Reason / Justification:
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why this complaint requires immediate escalation..."
            className="w-full rounded-lg border border-gray-300 p-2.5 text-xs focus:border-red-500"
            required
          ></textarea>
        </div>

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
            disabled={loading || !reason.trim()}
            className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 cursor-pointer"
          >
            Confirm Escalation
          </button>
        </div>
      </form>
    </Modal>
  );
};
