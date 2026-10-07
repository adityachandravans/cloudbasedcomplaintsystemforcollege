import { Complaint } from '../models/Complaint.js';

export const generateComplaintId = async (): Promise<string> => {
  const currentYear = new Date().getFullYear();
  const prefix = `CMP-${currentYear}-`;

  // Find the highest existing complaint ID for the current year
  const lastComplaint = await Complaint.findOne({
    complaintId: { $regex: new RegExp(`^${prefix}`) },
  }).sort({ createdAt: -1 });

  let sequence = 1;
  if (lastComplaint && lastComplaint.complaintId) {
    const parts = lastComplaint.complaintId.split('-');
    if (parts.length === 3) {
      const lastSeq = parseInt(parts[2], 10);
      if (!isNaN(lastSeq)) {
        sequence = lastSeq + 1;
      }
    }
  }

  const paddedSeq = sequence.toString().padStart(5, '0');
  return `${prefix}${paddedSeq}`;
};
