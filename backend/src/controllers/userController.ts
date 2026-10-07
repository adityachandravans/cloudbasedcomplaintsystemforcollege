import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { logAuditEvent } from '../services/auditService.js';

// @desc    Get all users with filter & search
// @route   GET /api/users
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { role, department, search, page = 1, limit = 50 } = req.query;

    const query: any = {};
    if (role) query.role = role;
    if (department) query.department = department;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    return res.json({
      success: true,
      count: users.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      users,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a user (Admin only)
// @route   POST /api/users
export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, role, studentId, employeeId, department, phone } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, password, and role' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      studentId,
      employeeId,
      department,
      phone,
    });

    await logAuditEvent({
      userId: req.user?._id.toString(),
      userName: req.user?.name || 'Admin',
      userRole: req.user?.role || 'admin',
      action: 'ADMIN_CREATED_USER',
      entity: 'User',
      entityId: user._id.toString(),
      newValue: { name, email, role, department },
    });

    return res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        isActive: user.isActive,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a user
// @route   PUT /api/users/:id
export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, role, department, studentId, employeeId, phone, isActive, password } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const oldVal = { name: user.name, role: user.role, department: user.department, isActive: user.isActive };

    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (role) user.role = role;
    if (department !== undefined) user.department = department;
    if (studentId !== undefined) user.studentId = studentId;
    if (employeeId !== undefined) user.employeeId = employeeId;
    if (phone !== undefined) user.phone = phone;
    if (isActive !== undefined) user.isActive = isActive;

    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(password, salt);
    }

    await user.save();

    await logAuditEvent({
      userId: req.user?._id.toString(),
      userName: req.user?.name || 'Admin',
      userRole: req.user?.role || 'admin',
      action: 'ADMIN_UPDATED_USER',
      entity: 'User',
      entityId: user._id.toString(),
      oldValue: oldVal,
      newValue: { name: user.name, role: user.role, department: user.department, isActive: user.isActive },
    });

    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        isActive: user.isActive,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle user active status
// @route   PATCH /api/users/:id/toggle-status
export const toggleUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isActive = !user.isActive;
    await user.save();

    await logAuditEvent({
      userId: req.user?._id.toString(),
      userName: req.user?.name || 'Admin',
      userRole: req.user?.role || 'admin',
      action: user.isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      entity: 'User',
      entityId: user._id.toString(),
    });

    return res.json({ success: true, isActive: user.isActive });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await User.findByIdAndDelete(id);

    await logAuditEvent({
      userId: req.user?._id.toString(),
      userName: req.user?.name || 'Admin',
      userRole: req.user?.role || 'admin',
      action: 'ADMIN_DELETED_USER',
      entity: 'User',
      entityId: id,
    });

    return res.json({ success: true, message: 'User deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
