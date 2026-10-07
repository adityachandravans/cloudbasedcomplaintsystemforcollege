import mongoose from 'mongoose';
import { AuditLog } from '../models/AuditLog.js';

export const logAuditEvent = async (params: {
  userId?: string | mongoose.Types.ObjectId;
  userName: string;
  userRole: string;
  action: string;
  entity: string;
  entityId?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
}) => {
  try {
    await AuditLog.create(params);
  } catch (err) {
    console.error('Failed to record audit log:', err);
  }
};
