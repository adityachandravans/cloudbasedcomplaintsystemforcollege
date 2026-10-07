import { Response } from 'express';
import { Department } from '../models/Department.js';
import { User } from '../models/User.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { logAuditEvent } from '../services/auditService.js';

export const getDepartments = async (req: AuthRequest, res: Response) => {
  try {
    const departments = await Department.find({ isActive: true })
      .populate('head', 'name email phone')
      .sort({ name: 1 });
    return res.json({ success: true, count: departments.length, departments });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllDepartmentsAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const departments = await Department.find()
      .populate('head', 'name email phone')
      .sort({ name: 1 });
    return res.json({ success: true, count: departments.length, departments });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createDepartment = async (req: AuthRequest, res: Response) => {
  try {
    const { name, code, description, headId } = req.body;

    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Name and Code are required' });
    }

    const dept = await Department.create({
      name,
      code: code.toUpperCase(),
      description,
      head: headId || null,
    });

    if (headId) {
      await User.findByIdAndUpdate(headId, { role: 'hod', department: name });
    }

    await logAuditEvent({
      userId: req.user?._id.toString(),
      userName: req.user?.name || 'Admin',
      userRole: req.user?.role || 'admin',
      action: 'CREATED_DEPARTMENT',
      entity: 'Department',
      entityId: dept._id.toString(),
    });

    return res.status(201).json({ success: true, department: dept });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDepartment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, code, description, headId, isActive } = req.body;

    const dept = await Department.findById(id);
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });

    if (name) dept.name = name;
    if (code) dept.code = code.toUpperCase();
    if (description !== undefined) dept.description = description;
    if (isActive !== undefined) dept.isActive = isActive;
    if (headId !== undefined) {
      dept.head = headId || undefined;
      if (headId) {
        await User.findByIdAndUpdate(headId, { role: 'hod', department: dept.name });
      }
    }

    await dept.save();

    await logAuditEvent({
      userId: req.user?._id.toString(),
      userName: req.user?.name || 'Admin',
      userRole: req.user?.role || 'admin',
      action: 'UPDATED_DEPARTMENT',
      entity: 'Department',
      entityId: id,
    });

    return res.json({ success: true, department: dept });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDepartment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await Department.findByIdAndDelete(id);

    await logAuditEvent({
      userId: req.user?._id.toString(),
      userName: req.user?.name || 'Admin',
      userRole: req.user?.role || 'admin',
      action: 'DELETED_DEPARTMENT',
      entity: 'Department',
      entityId: id,
    });

    return res.json({ success: true, message: 'Department deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
