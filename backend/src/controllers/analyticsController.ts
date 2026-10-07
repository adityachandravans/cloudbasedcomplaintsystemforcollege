import { Response } from 'express';
import { Complaint } from '../models/Complaint.js';
import { User } from '../models/User.js';
import { Feedback } from '../models/Feedback.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

// @desc    Get overall system analytics for Admin Dashboard
// @route   GET /api/analytics/overview
export const getOverviewAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    // Build department restriction if user is HOD
    const filterQuery: any = {};
    if (user.role === 'hod' && user.department) {
      filterQuery.department = user.department;
    }

    // User counts
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalStaff = await User.countDocuments({ role: 'staff' });
    const totalHODs = await User.countDocuments({ role: 'hod' });

    // Complaint counts
    const totalComplaints = await Complaint.countDocuments(filterQuery);
    const pendingComplaints = await Complaint.countDocuments({ ...filterQuery, status: { $in: ['submitted', 'under_review'] } });
    const inProgressComplaints = await Complaint.countDocuments({ ...filterQuery, status: { $in: ['assigned', 'in_progress', 'reopened'] } });
    const resolvedComplaints = await Complaint.countDocuments({ ...filterQuery, status: { $in: ['resolved', 'closed'] } });
    const rejectedComplaints = await Complaint.countDocuments({ ...filterQuery, status: 'rejected' });
    const escalatedComplaints = await Complaint.countDocuments({ ...filterQuery, status: 'escalated' });
    const overdueComplaints = await Complaint.countDocuments({ ...filterQuery, isOverdue: true, status: { $nin: ['resolved', 'closed', 'rejected'] } });

    // Resolution rate
    const resolutionRate = totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 0;

    // Average resolution time (in hours)
    const resolvedItems = await Complaint.find({
      ...filterQuery,
      status: { $in: ['resolved', 'closed'] },
      resolvedAt: { $exists: true },
    }).select('createdAt resolvedAt');

    let totalResolutionHours = 0;
    resolvedItems.forEach((item) => {
      if (item.resolvedAt && item.createdAt) {
        const hours = (new Date(item.resolvedAt).getTime() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60);
        totalResolutionHours += hours;
      }
    });

    const avgResolutionHours = resolvedItems.length > 0 ? (totalResolutionHours / resolvedItems.length).toFixed(1) : '0.0';

    // Complaints by Status breakdown
    const complaintsByStatus = await Complaint.aggregate([
      { $match: filterQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Complaints by Category
    const complaintsByCategory = await Complaint.aggregate([
      { $match: filterQuery },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Complaints by Department
    const complaintsByDepartment = await Complaint.aggregate([
      { $match: filterQuery },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Complaints by Priority
    const complaintsByPriority = await Complaint.aggregate([
      { $match: filterQuery },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    // Feedback ratings summary
    const feedbackSummary = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const avgRating = feedbackSummary.length > 0 ? feedbackSummary[0].avgRating.toFixed(1) : '0.0';
    const totalReviews = feedbackSummary.length > 0 ? feedbackSummary[0].totalReviews : 0;

    // Recent 6 months trend
    const monthlyTrend = await Complaint.aggregate([
      { $match: filterQuery },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          submitted: { $sum: 1 },
          resolved: {
            $sum: {
              $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0],
            },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    return res.json({
      success: true,
      stats: {
        totalUsers,
        totalStudents,
        totalStaff,
        totalHODs,
        totalComplaints,
        pendingComplaints,
        inProgressComplaints,
        resolvedComplaints,
        rejectedComplaints,
        escalatedComplaints,
        overdueComplaints,
        resolutionRate,
        avgResolutionHours: parseFloat(avgResolutionHours),
        avgRating: parseFloat(avgRating),
        totalReviews,
      },
      charts: {
        complaintsByStatus: complaintsByStatus.map((c) => ({ name: c._id, count: c.count })),
        complaintsByCategory: complaintsByCategory.map((c) => ({ name: c._id, count: c.count })),
        complaintsByDepartment: complaintsByDepartment.map((c) => ({ name: c._id, count: c.count })),
        complaintsByPriority: complaintsByPriority.map((c) => ({ name: c._id, count: c.count })),
        monthlyTrend: monthlyTrend.map((m) => ({
          month: `${m._id.year}-${m._id.month.toString().padStart(2, '0')}`,
          submitted: m.submitted,
          resolved: m.resolved,
        })),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get staff workload analytics (HOD / Admin)
// @route   GET /api/analytics/staff-workload
export const getStaffWorkload = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const query: any = { role: { $in: ['staff', 'hod'] } };
    if (user.role === 'hod' && user.department) {
      query.department = user.department;
    }

    const staffMembers = await User.find(query).select('name email role department');

    const workloadList = await Promise.all(
      staffMembers.map(async (staff) => {
        const totalAssigned = await Complaint.countDocuments({ assignedTo: staff._id });
        const inProgress = await Complaint.countDocuments({ assignedTo: staff._id, status: { $in: ['assigned', 'in_progress', 'reopened'] } });
        const resolved = await Complaint.countDocuments({ assignedTo: staff._id, status: { $in: ['resolved', 'closed'] } });
        const overdue = await Complaint.countDocuments({ assignedTo: staff._id, isOverdue: true, status: { $nin: ['resolved', 'closed'] } });

        return {
          id: staff._id,
          name: staff.name,
          email: staff.email,
          department: staff.department,
          totalAssigned,
          inProgress,
          resolved,
          overdue,
        };
      })
    );

    return res.json({ success: true, staffWorkload: workloadList });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
