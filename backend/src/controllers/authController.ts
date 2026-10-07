import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { logAuditEvent } from '../services/auditService.js';

const generateToken = (id: string, role: string): string => {
  const secret = process.env.JWT_SECRET || 'college_complaint_jwt_secret_key_2026';
  return jwt.sign({ id, role }, secret, { expiresIn: '7d' });
};

// @desc    Register a new user (Student / Staff by self, Admin can create any)
// @route   POST /api/auth/register
export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, role, studentId, employeeId, department, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const assignedRole = role || 'student';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: assignedRole,
      studentId,
      employeeId,
      department,
      phone,
    });

    const token = generateToken(user._id.toString(), user.role);

    await logAuditEvent({
      userId: user._id.toString(),
      userName: user.name,
      userRole: user.role,
      action: 'USER_REGISTERED',
      entity: 'User',
      entityId: user._id.toString(),
    });

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        employeeId: user.employeeId,
        department: user.department,
        phone: user.phone,
        profileImage: user.profileImage,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Contact Admin.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id.toString(), user.role);

    await logAuditEvent({
      userId: user._id.toString(),
      userName: user.name,
      userRole: user.role,
      action: 'USER_LOGIN',
      entity: 'User',
      entityId: user._id.toString(),
    });

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        employeeId: user.employeeId,
        department: user.department,
        phone: user.phone,
        profileImage: user.profileImage,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        employeeId: user.employeeId,
        department: user.department,
        phone: user.phone,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const { name, phone, department, studentId, employeeId } = req.body;

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (department !== undefined) user.department = department;
    if (studentId !== undefined) user.studentId = studentId;
    if (employeeId !== undefined) user.employeeId = employeeId;

    await user.save();

    await logAuditEvent({
      userId: user._id.toString(),
      userName: user.name,
      userRole: user.role,
      action: 'PROFILE_UPDATED',
      entity: 'User',
      entityId: user._id.toString(),
    });

    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        employeeId: user.employeeId,
        department: user.department,
        phone: user.phone,
        profileImage: user.profileImage,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
