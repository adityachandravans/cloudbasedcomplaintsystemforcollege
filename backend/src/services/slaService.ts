import { ComplaintPriority, Complaint } from '../models/Complaint.js';

export const calculateDueDate = (priority: ComplaintPriority, startDate: Date = new Date()): Date => {
  const dueDate = new Date(startDate);
  switch (priority) {
    case 'critical':
      dueDate.setHours(dueDate.getHours() + 24); // 24 hours
      break;
    case 'high':
      dueDate.setHours(dueDate.getHours() + 48); // 2 days
      break;
    case 'medium':
      dueDate.setHours(dueDate.getHours() + 72); // 3 days
      break;
    case 'low':
    default:
      dueDate.setHours(dueDate.getHours() + 120); // 5 days
      break;
  }
  return dueDate;
};

export const updateOverdueStatuses = async (): Promise<number> => {
  const now = new Date();
  // Find open complaints past due date that are not resolved or closed
  const result = await Complaint.updateMany(
    {
      dueDate: { $lt: now },
      status: { $nin: ['resolved', 'closed', 'rejected'] },
      isOverdue: false,
    },
    {
      $set: { isOverdue: true },
    }
  );
  return result.modifiedCount;
};
