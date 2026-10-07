import { Response } from 'express';
import { AuditLog } from '../models/AuditLog.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const { action, entity, page = 1, limit = 50 } = req.query;

    const query: any = {};
    if (action) query.action = action;
    if (entity) query.entity = entity;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    return res.json({
      success: true,
      count: logs.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      logs,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
