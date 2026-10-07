import { Response } from 'express';
import { Category } from '../models/Category.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { logAuditEvent } from '../services/auditService.js';

export const getCategories = async (req: AuthRequest, res: Response) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    return res.json({ success: true, count: categories.length, categories });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllCategoriesAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    return res.json({ success: true, count: categories.length, categories });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, department } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Category name is required' });

    const cat = await Category.create({ name, description, department });

    await logAuditEvent({
      userId: req.user?._id.toString(),
      userName: req.user?.name || 'Admin',
      userRole: req.user?.role || 'admin',
      action: 'CREATED_CATEGORY',
      entity: 'Category',
      entityId: cat._id.toString(),
    });

    return res.status(201).json({ success: true, category: cat });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, department, isActive } = req.body;

    const cat = await Category.findById(id);
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });

    if (name) cat.name = name;
    if (description !== undefined) cat.description = description;
    if (department !== undefined) cat.department = department;
    if (isActive !== undefined) cat.isActive = isActive;

    await cat.save();

    await logAuditEvent({
      userId: req.user?._id.toString(),
      userName: req.user?.name || 'Admin',
      userRole: req.user?.role || 'admin',
      action: 'UPDATED_CATEGORY',
      entity: 'Category',
      entityId: id,
    });

    return res.json({ success: true, category: cat });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await Category.findByIdAndDelete(id);

    await logAuditEvent({
      userId: req.user?._id.toString(),
      userName: req.user?.name || 'Admin',
      userRole: req.user?.role || 'admin',
      action: 'DELETED_CATEGORY',
      entity: 'Category',
      entityId: id,
    });

    return res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
