import { Response } from 'express';
import mongoose from 'mongoose';
import { Complaint, ComplaintPriority, ComplaintStatus, IAttachment } from '../models/Complaint.js';
import { User } from '../models/User.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { generateComplaintId } from '../utils/idGenerator.js';
import { calculateDueDate, updateOverdueStatuses } from '../services/slaService.js';
import { StorageService } from '../services/storageService.js';
import { createNotification } from '../services/notificationService.js';
import { logAuditEvent } from '../services/auditService.js';

// @desc    Create new complaint
// @route   POST /api/complaints
export const createComplaint = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { title, description, category, department, location, priority } = req.body;

    if (!title || !description || !category || !department || !location) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields' });
    }

    const complaintPriority: ComplaintPriority = (priority as ComplaintPriority) || 'medium';
    const complaintId = await generateComplaintId();
    const dueDate = calculateDueDate(complaintPriority);

    // Process uploaded attachments
    const attachments: IAttachment[] = [];
    if (req.files && Array.isArray(req.files)) {
      (req.files as Express.Multer.File[]).forEach((file) => {
        const formatted = StorageService.formatFile(file);
        attachments.push({
          ...formatted,
          uploadedAt: new Date(),
        });
      });
    }

    const newComplaint = await Complaint.create({
      complaintId,
      title,
      description,
      category,
      department,
      location,
      priority: complaintPriority,
      status: 'submitted',
      createdBy: user._id,
      dueDate,
      attachments,
      history: [
        {
          status: 'submitted',
          updatedBy: user._id,
          updatedByName: user.name,
          updatedByRole: user.role,
          comment: 'Complaint submitted by student',
          timestamp: new Date(),
        },
      ],
    });

    // Send notification to student
    await createNotification(
      user._id,
      'Complaint Submitted Successfully',
      `Your complaint ${complaintId} (${title}) has been submitted and is under review.`,
      'submission',
      newComplaint._id
    );

    // Notify HODs of the department
    const hods = await User.find({ role: 'hod', department: department, isActive: true });
    for (const hod of hods) {
      await createNotification(
        hod._id,
        'New Department Complaint Received',
        `A new ${complaintPriority} priority complaint (${complaintId}) was submitted for ${department}.`,
        'submission',
        newComplaint._id
      );
    }

    await logAuditEvent({
      userId: user._id.toString(),
      userName: user.name,
      userRole: user.role,
      action: 'COMPLAINT_CREATED',
      entity: 'Complaint',
      entityId: newComplaint.complaintId,
    });

    return res.status(201).json({
      success: true,
      complaint: newComplaint,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get complaints with search, filter, sorting, pagination
// @route   GET /api/complaints
export const getComplaints = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    // Ensure overdue statuses are updated in the background
    await updateOverdueStatuses();

    const {
      status,
      category,
      department,
      priority,
      isOverdue,
      search,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 20,
    } = req.query;

    const query: any = {};

    // Role-based visibility scoping
    if (user.role === 'student') {
      query.createdBy = user._id;
    } else if (user.role === 'staff') {
      // Staff can see complaints assigned to them, or complaints in their department if requested
      if (req.query.assignedOnly === 'false') {
        query.department = user.department;
      } else {
        query.assignedTo = user._id;
      }
    } else if (user.role === 'hod') {
      if (user.department) {
        query.department = user.department;
      }
    }
    // Admin has full visibility (no forced query restrictions unless provided in query params)

    // Apply explicit filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (department) query.department = department;
    if (priority) query.priority = priority;
    if (isOverdue === 'true') query.isOverdue = true;

    // Search filter
    if (search) {
      const searchRegex = { $regex: search as string, $options: 'i' };
      query.$or = [
        { complaintId: searchRegex },
        { title: searchRegex },
        { description: searchRegex },
        { location: searchRegex },
        { category: searchRegex },
      ];
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const sortOption: any = {};
    if (sortBy === 'priority') {
      // Custom priority sort can be handled in code or simple field sort
      sortOption.priority = order === 'asc' ? 1 : -1;
    } else {
      sortOption[sortBy as string] = order === 'asc' ? 1 : -1;
    }

    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .populate('createdBy', 'name email studentId department phone')
      .populate('assignedTo', 'name email employeeId department phone')
      .populate('history.updatedBy', 'name role')
      .sort(sortOption)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    return res.json({
      success: true,
      count: complaints.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      complaints,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get complaint details by ID or complaintId
// @route   GET /api/complaints/:id
export const getComplaintById = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { id } = req.params;

    let complaint;
    if (mongoose.Types.ObjectId.isValid(id)) {
      complaint = await Complaint.findById(id);
    }
    if (!complaint) {
      complaint = await Complaint.findOne({ complaintId: id });
    }

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Populate references
    await complaint.populate([
      { path: 'createdBy', select: 'name email studentId department phone profileImage' },
      { path: 'assignedTo', select: 'name email employeeId department phone profileImage' },
      { path: 'history.updatedBy', select: 'name role' },
    ]);

    // Check permissions
    if (user.role === 'student' && complaint.createdBy._id.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    return res.json({
      success: true,
      complaint,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update complaint status & resolution details
// @route   PATCH /api/complaints/:id/status
export const updateComplaintStatus = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { id } = req.params;
    const { status, comment, resolutionNotes } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    const oldStatus = complaint.status;
    complaint.status = status as ComplaintStatus;

    // Handle resolution proof uploads
    const proofFiles: IAttachment[] = [];
    if (req.files && Array.isArray(req.files)) {
      (req.files as Express.Multer.File[]).forEach((file) => {
        const formatted = StorageService.formatFile(file);
        proofFiles.push({
          ...formatted,
          uploadedAt: new Date(),
        });
      });
    }

    if (proofFiles.length > 0) {
      complaint.resolutionProof = [...(complaint.resolutionProof || []), ...proofFiles];
    }

    if (resolutionNotes) {
      complaint.resolutionNotes = resolutionNotes;
    }

    if (status === 'resolved') {
      complaint.resolvedAt = new Date();
    } else if (status === 'closed') {
      complaint.closedAt = new Date();
    }

    // Add to history timeline
    complaint.history.push({
      status: status as ComplaintStatus,
      updatedBy: user._id,
      updatedByName: user.name,
      updatedByRole: user.role,
      comment: comment || `Status updated from ${oldStatus} to ${status}`,
      timestamp: new Date(),
    });

    await complaint.save();

    // Notify Student
    await createNotification(
      complaint.createdBy,
      `Complaint ${complaint.complaintId} Updated`,
      `Your complaint status has changed to "${status.replace('_', ' ').toUpperCase()}". ${
        comment ? `Note: ${comment}` : ''
      }`,
      status === 'resolved' ? 'resolution' : status === 'rejected' ? 'rejection' : 'status_change',
      complaint._id
    );

    await logAuditEvent({
      userId: user._id.toString(),
      userName: user.name,
      userRole: user.role,
      action: 'COMPLAINT_STATUS_UPDATED',
      entity: 'Complaint',
      entityId: complaint.complaintId,
      oldValue: { status: oldStatus },
      newValue: { status },
    });

    return res.json({
      success: true,
      complaint,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Assign or reassign complaint to a staff member
// @route   PATCH /api/complaints/:id/assign
export const assignComplaint = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { id } = req.params;
    const { staffId, comment } = req.body;

    if (!staffId) {
      return res.status(400).json({ success: false, message: 'Staff ID is required for assignment' });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    const staff = await User.findById(staffId);
    if (!staff || (staff.role !== 'staff' && staff.role !== 'hod' && staff.role !== 'admin')) {
      return res.status(400).json({ success: false, message: 'Invalid staff member selected' });
    }

    const prevStaff = complaint.assignedTo;
    complaint.assignedTo = staff._id;

    if (complaint.status === 'submitted' || complaint.status === 'under_review') {
      complaint.status = 'assigned';
    }

    complaint.history.push({
      status: complaint.status,
      updatedBy: user._id,
      updatedByName: user.name,
      updatedByRole: user.role,
      comment: comment || `Complaint assigned to staff member ${staff.name}`,
      timestamp: new Date(),
    });

    await complaint.save();

    // Notify assigned staff
    await createNotification(
      staff._id,
      'Complaint Assigned to You',
      `You have been assigned complaint ${complaint.complaintId}: "${complaint.title}". Priority: ${complaint.priority.toUpperCase()}`,
      'assignment',
      complaint._id
    );

    // Notify student
    await createNotification(
      complaint.createdBy,
      'Complaint Assigned',
      `Your complaint ${complaint.complaintId} has been assigned to ${staff.name} for resolution.`,
      'status_change',
      complaint._id
    );

    await logAuditEvent({
      userId: user._id.toString(),
      userName: user.name,
      userRole: user.role,
      action: 'COMPLAINT_ASSIGNED',
      entity: 'Complaint',
      entityId: complaint.complaintId,
      oldValue: { assignedTo: prevStaff },
      newValue: { assignedTo: staff._id, staffName: staff.name },
    });

    return res.json({
      success: true,
      complaint,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Escalate complaint
// @route   PATCH /api/complaints/:id/escalate
export const escalateComplaint = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { id } = req.params;
    const { reason } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    complaint.status = 'escalated';
    complaint.escalatedAt = new Date();
    complaint.escalatedReason = reason || 'Escalated due to SLA breach or urgency';

    complaint.history.push({
      status: 'escalated',
      updatedBy: user._id,
      updatedByName: user.name,
      updatedByRole: user.role,
      comment: `Escalated: ${complaint.escalatedReason}`,
      timestamp: new Date(),
    });

    await complaint.save();

    // Notify admins and HOD
    const admins = await User.find({ role: 'admin', isActive: true });
    for (const admin of admins) {
      await createNotification(
        admin._id,
        'CRITICAL: Complaint Escalated',
        `Complaint ${complaint.complaintId} (${complaint.title}) was escalated! Reason: ${complaint.escalatedReason}`,
        'escalation',
        complaint._id
      );
    }

    await logAuditEvent({
      userId: user._id.toString(),
      userName: user.name,
      userRole: user.role,
      action: 'COMPLAINT_ESCALATED',
      entity: 'Complaint',
      entityId: complaint.complaintId,
    });

    return res.json({
      success: true,
      complaint,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reopen a resolved/closed complaint (Student only)
// @route   POST /api/complaints/:id/reopen
export const reopenComplaint = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim() === '') {
      return res.status(400).json({ success: false, message: 'Reason for reopening is required' });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    if (complaint.createdBy.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the original student can reopen this complaint' });
    }

    complaint.status = 'reopened';
    complaint.reopenedCount += 1;
    complaint.reopenedReason = reason;

    complaint.history.push({
      status: 'reopened',
      updatedBy: user._id,
      updatedByName: user.name,
      updatedByRole: user.role,
      comment: `Reopened by student: ${reason}`,
      timestamp: new Date(),
    });

    await complaint.save();

    if (complaint.assignedTo) {
      await createNotification(
        complaint.assignedTo,
        'Complaint Reopened by Student',
        `Complaint ${complaint.complaintId} was reopened. Reason: "${reason}"`,
        'reopened',
        complaint._id
      );
    }

    await logAuditEvent({
      userId: user._id.toString(),
      userName: user.name,
      userRole: user.role,
      action: 'COMPLAINT_REOPENED',
      entity: 'Complaint',
      entityId: complaint.complaintId,
    });

    return res.json({
      success: true,
      complaint,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export complaints to CSV (Admin/HOD)
// @route   GET /api/complaints/export/csv
export const exportComplaintsCSV = async (req: AuthRequest, res: Response) => {
  try {
    const { status, category, department, priority } = req.query;

    const query: any = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (department) query.department = department;
    if (priority) query.priority = priority;

    const complaints = await Complaint.find(query)
      .populate('createdBy', 'name email studentId')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    let csvContent = 'Complaint ID,Title,Category,Department,Priority,Status,Created By,Assigned To,Submitted Date,Due Date,Is Overdue\n';

    complaints.forEach((c: any) => {
      const studentName = c.createdBy ? c.createdBy.name : 'Unknown';
      const staffName = c.assignedTo ? c.assignedTo.name : 'Unassigned';
      const titleEscaped = `"${c.title.replace(/"/g, '""')}"`;
      const submittedDate = new Date(c.createdAt).toISOString().split('T')[0];
      const dueDate = new Date(c.dueDate).toISOString().split('T')[0];

      csvContent += `${c.complaintId},${titleEscaped},${c.category},${c.department},${c.priority},${c.status},"${studentName}","${staffName}",${submittedDate},${dueDate},${c.isOverdue ? 'Yes' : 'No'}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=complaints-export.csv');
    return res.status(200).send(csvContent);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
