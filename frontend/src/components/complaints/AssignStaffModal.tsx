import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { User, Complaint } from '../../types';
import API from '../../services/api';

interface AssignStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: Complaint | null;
  onSuccess: () => void;
}

export const AssignStaffModal: React.FC<AssignStaffModalProps> = ({
  isOpen,
  onClose,
  complaint,
  onSuccess,
}) => {
  const [staffList, setStaffList] = useState<User[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && complaint) {
      fetchStaffMembers();
      setSelectedStaffId(complaint.assignedTo?._id || '');
    }
  }, [isOpen, complaint]);

  const fetchStaffMembers = async () => {
    try {
      // Fetch staff belonging to the department or all staff
      const res = await API.get('/users?role=staff');
      if (res.data.success) {
        setStaffList(res.data.users);
      }
    } catch (err) {
      console.error('Failed to fetch staff members:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint || !selectedStaffId) return;

    try {
      setLoading(true);
      const res = await API.patch(`/complaints/${complaint._id}/assign`, {
        staffId: selectedStaffId,
        comment,
      });

      if (res.data.success) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error('Failed to assign staff:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!complaint) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Assign Staff for ${complaint.complaintId}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Select Staff Member:
          </label>
          <select
            value={selectedStaffId}
            onChange={(e) => setSelectedStaffId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-2.5 text-xs focus:border-brand-500"
            required
          >
            <option value="">-- Choose Staff Member --</option>
            {staffList.map((staff) => (
              <option key={staff._id || staff.id} value={staff._id || staff.id}>
                {staff.name} ({staff.department || 'Staff'}) - {staff.email}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Assignment Note (Optional):
          </label>
          <textarea
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Instructions for the assigned technician..."
            className="w-full rounded-lg border border-gray-300 p-2.5 text-xs focus:border-brand-500"
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
            disabled={loading || !selectedStaffId}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 cursor-pointer"
          >
            Confirm Assignment
          </button>
        </div>
      </form>
    </Modal>
  );
};
