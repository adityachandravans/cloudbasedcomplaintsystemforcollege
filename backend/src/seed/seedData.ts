import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB, closeDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Department } from '../models/Department.js';
import { Category } from '../models/Category.js';
import { Complaint } from '../models/Complaint.js';
import { Comment } from '../models/Comment.js';
import { Feedback } from '../models/Feedback.js';
import { Notification } from '../models/Notification.js';
import { AuditLog } from '../models/AuditLog.js';
import { calculateDueDate } from '../services/slaService.js';

dotenv.config();

export const seedDatabase = async () => {
  console.log('🌱 Starting Database Seeding Process...');

  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }

  // Clear existing data
  await User.deleteMany({});
  await Department.deleteMany({});
  await Category.deleteMany({});
  await Complaint.deleteMany({});
  await Comment.deleteMany({});
  await Feedback.deleteMany({});
  await Notification.deleteMany({});
  await AuditLog.deleteMany({});

  console.log('Cleared existing data.');

  // Default Password Hash for all demo accounts: "Password@123"
  const defaultSalt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash('Password@123', defaultSalt);

  // 1. Create Departments
  const departmentsData = [
    { name: 'Computer Science & IT', code: 'CSIT', description: 'Department of Computer Science & IT Services' },
    { name: 'Electrical & Electronics', code: 'EEE', description: 'Electrical Maintenance & Energy Management' },
    { name: 'Civil & Infrastructure', code: 'CIVIL', description: 'Campus Building & Infrastructure Maintenance' },
    { name: 'Hostel & Residential', code: 'HOSTEL', description: 'Student Accommodation & Hostel Facilities' },
    { name: 'Administration & Academic', code: 'ADMIN', description: 'Academic Affairs & Campus Security Services' },
  ];

  const createdDepartments = await Department.insertMany(departmentsData);
  console.log(`Created ${createdDepartments.length} Departments.`);

  // 2. Create Categories
  const categoriesData = [
    { name: 'Internet/Wi-Fi', description: 'Campus Wi-Fi, Ethernet, and Network connectivity issues', department: 'Computer Science & IT' },
    { name: 'Electrical', description: 'Power cuts, fans, lights, socket failures', department: 'Electrical & Electronics' },
    { name: 'Laboratory', description: 'Lab PCs, projectors, software installation, lab equipment', department: 'Computer Science & IT' },
    { name: 'Infrastructure', description: 'Desks, doors, whiteboards, windows, structural repairs', department: 'Civil & Infrastructure' },
    { name: 'Plumbing', description: 'Water supply, washroom leaks, taps, drainage', department: 'Civil & Infrastructure' },
    { name: 'Cleanliness', description: 'Classroom, hallway, lab or washroom hygiene', department: 'Civil & Infrastructure' },
    { name: 'Hostel', description: 'Hostel room amenities, mess food, hot water, room locks', department: 'Hostel & Residential' },
    { name: 'Library', description: 'Library digital catalogue, quiet zones, AC in reading rooms', department: 'Administration & Academic' },
    { name: 'Transportation', description: 'College bus timing, route issues, transport passes', department: 'Administration & Academic' },
    { name: 'Security', description: 'Gate access, parking, lost & found, campus safety', department: 'Administration & Academic' },
    { name: 'Academic', description: 'Marks portal, timetable clashes, syllabus materials', department: 'Administration & Academic' },
    { name: 'Administrative', description: 'ID card issuance, fee receipts, certificate requests', department: 'Administration & Academic' },
    { name: 'Other', description: 'General complaints not listed above', department: 'Administration & Academic' },
  ];

  await Category.insertMany(categoriesData);
  console.log('Created Categories.');

  // 3. Create Key Demo Users
  const admin = await User.create({
    name: 'Dr. Robert Vance',
    email: 'admin@college.edu',
    passwordHash: defaultPasswordHash,
    role: 'admin',
    employeeId: 'ADM-001',
    department: 'Administration & Academic',
    phone: '+1 555-0100',
    isActive: true,
  });

  const hodCS = await User.create({
    name: 'Prof. Alan Turing',
    email: 'hod@college.edu',
    passwordHash: defaultPasswordHash,
    role: 'hod',
    employeeId: 'HOD-CS-01',
    department: 'Computer Science & IT',
    phone: '+1 555-0101',
    isActive: true,
  });

  const hodEEE = await User.create({
    name: 'Prof. Nikola Tesla',
    email: 'hod.ee@college.edu',
    passwordHash: defaultPasswordHash,
    role: 'hod',
    employeeId: 'HOD-EE-01',
    department: 'Electrical & Electronics',
    phone: '+1 555-0102',
    isActive: true,
  });

  // Link HODs to department head fields
  await Department.updateOne({ code: 'CSIT' }, { head: hodCS._id });
  await Department.updateOne({ code: 'EEE' }, { head: hodEEE._id });

  // Create Staff Members
  const staffIT = await User.create({
    name: 'John Miller (IT Tech)',
    email: 'staff@college.edu',
    passwordHash: defaultPasswordHash,
    role: 'staff',
    employeeId: 'STF-IT-01',
    department: 'Computer Science & IT',
    phone: '+1 555-0201',
    isActive: true,
  });

  const staffElec = await User.create({
    name: 'Sarah Connor (Electrician)',
    email: 'staff.ee@college.edu',
    passwordHash: defaultPasswordHash,
    role: 'staff',
    employeeId: 'STF-EE-01',
    department: 'Electrical & Electronics',
    phone: '+1 555-0202',
    isActive: true,
  });

  const staffCivil = await User.create({
    name: 'David Maintenance',
    email: 'staff.civil@college.edu',
    passwordHash: defaultPasswordHash,
    role: 'staff',
    employeeId: 'STF-CIV-01',
    department: 'Civil & Infrastructure',
    phone: '+1 555-0203',
    isActive: true,
  });

  const staffHostel = await User.create({
    name: 'Warden Mary Johnson',
    email: 'staff.hostel@college.edu',
    passwordHash: defaultPasswordHash,
    role: 'staff',
    employeeId: 'STF-HST-01',
    department: 'Hostel & Residential',
    phone: '+1 555-0204',
    isActive: true,
  });

  const staffAdmin = await User.create({
    name: 'Officer Michael Scott',
    email: 'staff.admin@college.edu',
    passwordHash: defaultPasswordHash,
    role: 'staff',
    employeeId: 'STF-ADM-01',
    department: 'Administration & Academic',
    phone: '+1 555-0205',
    isActive: true,
  });

  console.log('Created Demo Admin, HODs, and Staff.');

  // Create 20 Students
  const students = [];
  const primaryStudent = await User.create({
    name: 'Alex Mercer (Demo Student)',
    email: 'student@college.edu',
    passwordHash: defaultPasswordHash,
    role: 'student',
    studentId: 'STU-2026-001',
    department: 'Computer Science & IT',
    phone: '+1 555-0301',
    isActive: true,
  });
  students.push(primaryStudent);

  for (let i = 2; i <= 20; i++) {
    const s = await User.create({
      name: `Student User ${i}`,
      email: `student${i}@college.edu`,
      passwordHash: defaultPasswordHash,
      role: 'student',
      studentId: `STU-2026-${i.toString().padStart(3, '0')}`,
      department: i % 2 === 0 ? 'Computer Science & IT' : 'Electrical & Electronics',
      phone: `+1 555-03${i.toString().padStart(2, '0')}`,
      isActive: true,
    });
    students.push(s);
  }
  console.log(`Created ${students.length} Student accounts.`);

  // 4. Create 32 Realistic Complaints
  const complaintTemplates = [
    {
      title: 'Wi-Fi not working in Computer Lab 2',
      category: 'Internet/Wi-Fi',
      department: 'Computer Science & IT',
      location: 'Lab 2, 2nd Floor, IT Block',
      priority: 'high',
      status: 'assigned',
      desc: 'The campus Wi-Fi access point in Computer Lab 2 is completely unreachable. Students are unable to conduct practical programming sessions.',
      assignedTo: staffIT,
    },
    {
      title: 'Projector display flickering in Seminar Hall B',
      category: 'Laboratory',
      department: 'Computer Science & IT',
      location: 'Seminar Hall B, Academic Block',
      priority: 'medium',
      status: 'in_progress',
      desc: 'The HDMI connection to the projector flickers continuously and turns off every 5 minutes during lectures.',
      assignedTo: staffIT,
    },
    {
      title: 'Main overhead lights flickering in Room 304',
      category: 'Electrical',
      department: 'Electrical & Electronics',
      location: 'Classroom 304, Science Block',
      priority: 'medium',
      status: 'resolved',
      desc: 'Three LED tube lights on the ceiling are buzzing loudly and flickering, causing eye strain during lectures.',
      assignedTo: staffElec,
      resNotes: 'Replaced faulty ballast and installed 3 new 24W LED tubes.',
    },
    {
      title: 'Water leakage from washroom ceiling in Block C 1st Floor',
      category: 'Plumbing',
      department: 'Civil & Infrastructure',
      location: 'Boys Washroom, 1st Floor Block C',
      priority: 'critical',
      status: 'escalated',
      desc: 'Severe water leak coming down from the 2nd floor piping directly onto the main entrance area of the washroom. Requires urgent attention.',
      assignedTo: staffCivil,
      escalatedReason: 'SLA target exceeded without plumber arrival.',
    },
    {
      title: 'Hostel Block A 3rd Floor Hot Water Geyser Not Working',
      category: 'Hostel',
      department: 'Hostel & Residential',
      location: 'Hostel Block A, Washroom 3B',
      priority: 'high',
      status: 'in_progress',
      desc: 'Hot water supply is cut off in the morning hours. Geyser circuit breaker keeps tripping.',
      assignedTo: staffHostel,
    },
    {
      title: 'Broken desk benches in Lecture Room 102',
      category: 'Infrastructure',
      department: 'Civil & Infrastructure',
      location: 'Lecture Hall 102',
      priority: 'low',
      status: 'submitted',
      desc: 'Two double-seated wooden benches are wobbly and have sharp metallic edges exposed.',
    },
    {
      title: 'High latency and packet loss on Hostel Ethernet',
      category: 'Internet/Wi-Fi',
      department: 'Computer Science & IT',
      location: 'Hostel Block B Rooms 201-215',
      priority: 'high',
      status: 'reopened',
      desc: 'Packet loss exceeds 40% when accessing academic research portals and library databases.',
      assignedTo: staffIT,
      reopenedReason: 'Issue was marked resolved yesterday but speed is still under 50kbps.',
    },
    {
      title: 'Library quiet reading area AC compressor noise',
      category: 'Library',
      department: 'Administration & Academic',
      location: 'Central Library 2nd Floor',
      priority: 'medium',
      status: 'closed',
      desc: 'Air conditioner unit #4 makes a loud rattling sound every 10 minutes.',
      assignedTo: staffAdmin,
      resNotes: 'Maintenance team serviced compressor fan belts and tightened mounting brackets.',
    },
    {
      title: 'College Bus Route #4 running 30 mins late repeatedly',
      category: 'Transportation',
      department: 'Administration & Academic',
      location: 'North Campus Bus Stop',
      priority: 'medium',
      status: 'under_review',
      desc: 'Bus #4 arrives late at North Gate stop, causing students to miss 1st period lectures.',
    },
    {
      title: 'Campus Main Gate barrier sensor malfunctioning',
      category: 'Security',
      department: 'Administration & Academic',
      location: 'Main Gate Entrance',
      priority: 'critical',
      status: 'resolved',
      desc: 'Automatic RFID gate arm drops unexpectedly on passing vehicles.',
      assignedTo: staffAdmin,
      resNotes: 'Recalibrated infrared proximity sensors and replaced gate arm motor controller.',
    },
    {
      title: 'Student Portal Grade Sheet Printing Alignment Issue',
      category: 'Administrative',
      department: 'Administration & Academic',
      location: 'Online ERP Portal',
      priority: 'low',
      status: 'submitted',
      desc: 'PDF export of provisional transcript cuts off the bottom row signature box.',
    },
    {
      title: 'Chemical smell coming from Chemistry Lab Sink',
      category: 'Cleanliness',
      department: 'Civil & Infrastructure',
      location: 'Chemistry Lab 101',
      priority: 'high',
      status: 'resolved',
      desc: 'Drain trap appears dry, allowing foul odours from sewer system into lab environment.',
      assignedTo: staffCivil,
      resNotes: 'Flushed U-trap with disinfectant and installed non-return valve.',
    },
  ];

  let complaintCounter = 1;

  for (let i = 0; i < 30; i++) {
    const template = complaintTemplates[i % complaintTemplates.length];
    const student = students[i % students.length];

    const year = 2026;
    const cmpId = `CMP-${year}-${complaintCounter.toString().padStart(5, '0')}`;
    complaintCounter++;

    const priority = (template.priority || 'medium') as any;
    const createdAt = new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000);
    const dueDate = calculateDueDate(priority, createdAt);
    const isOverdue = dueDate < new Date() && !['resolved', 'closed', 'rejected'].includes(template.status);

    const complaint = await Complaint.create({
      complaintId: cmpId,
      title: `${template.title} #${i + 1}`,
      description: template.desc,
      category: template.category,
      department: template.department,
      location: template.location,
      priority,
      status: template.status as any,
      createdBy: student._id,
      assignedTo: template.assignedTo ? template.assignedTo._id : undefined,
      dueDate,
      isOverdue,
      escalatedAt: template.status === 'escalated' ? new Date() : undefined,
      escalatedReason: template.escalatedReason || '',
      resolvedAt: ['resolved', 'closed'].includes(template.status) ? new Date(createdAt.getTime() + 18 * 3600 * 1000) : undefined,
      resolutionNotes: template.resNotes || '',
      reopenedCount: template.status === 'reopened' ? 1 : 0,
      reopenedReason: template.reopenedReason || '',
      history: [
        {
          status: 'submitted',
          updatedBy: student._id,
          updatedByName: student.name,
          updatedByRole: 'student',
          comment: 'Submitted complaint via portal',
          timestamp: createdAt,
        },
        ...(template.assignedTo
          ? [
              {
                status: 'assigned' as any,
                updatedBy: hodCS._id,
                updatedByName: hodCS.name,
                updatedByRole: 'hod',
                comment: `Assigned to ${template.assignedTo.name}`,
                timestamp: new Date(createdAt.getTime() + 2 * 3600 * 1000),
              },
            ]
          : []),
        ...(['in_progress', 'resolved', 'closed', 'escalated'].includes(template.status) && template.assignedTo
          ? [
              {
                status: 'in_progress' as any,
                updatedBy: template.assignedTo._id,
                updatedByName: template.assignedTo.name,
                updatedByRole: 'staff',
                comment: 'Technician assigned and working on site.',
                timestamp: new Date(createdAt.getTime() + 5 * 3600 * 1000),
              },
            ]
          : []),
        ...(['resolved', 'closed'].includes(template.status) && template.assignedTo
          ? [
              {
                status: 'resolved' as any,
                updatedBy: template.assignedTo._id,
                updatedByName: template.assignedTo.name,
                updatedByRole: 'staff',
                comment: template.resNotes || 'Issue verified and fixed.',
                timestamp: new Date(createdAt.getTime() + 18 * 3600 * 1000),
              },
            ]
          : []),
      ],
      createdAt,
    });

    // Add comments for resolved or assigned complaints
    if (['in_progress', 'resolved', 'closed'].includes(template.status)) {
      await Comment.create({
        complaintId: complaint._id,
        userId: template.assignedTo ? template.assignedTo._id : staffIT._id,
        message: 'Initial inspection complete. Ordering replacement parts.',
        isInternal: false,
        createdAt: new Date(createdAt.getTime() + 6 * 3600 * 1000),
      });

      await Comment.create({
        complaintId: complaint._id,
        userId: student._id,
        message: 'Thank you for the update! Please let us know when it will be finished.',
        isInternal: false,
        createdAt: new Date(createdAt.getTime() + 7 * 3600 * 1000),
      });
    }

    // Add Feedback for resolved complaints
    if (['resolved', 'closed'].includes(template.status)) {
      await Feedback.create({
        complaintId: complaint._id,
        studentId: student._id,
        rating: (i % 2 === 0) ? 5 : 4,
        comment: 'Great support! The issue was handled quickly and professionally.',
        createdAt: new Date(createdAt.getTime() + 20 * 3600 * 1000),
      });
    }

    // Add notification
    await Notification.create({
      userId: student._id,
      title: `Complaint Status: ${complaint.complaintId}`,
      message: `Your complaint is currently ${complaint.status.replace('_', ' ').toUpperCase()}`,
      type: 'status_change',
      isRead: i > 5,
      relatedComplaint: complaint._id,
      createdAt: complaint.createdAt,
    });
  }

  console.log(`Created 30 Realistic Complaints with comments, notifications & feedback.`);

  // Create initial audit log entry
  await AuditLog.create({
    userName: admin.name,
    userRole: 'admin',
    action: 'SYSTEM_SEED_INITIALIZED',
    entity: 'System',
    entityId: 'SEED-2026',
    timestamp: new Date(),
  });

  console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
};

// Allow direct CLI invocation: `npm run seed`
if (process.argv[1].endsWith('seedData.ts') || process.argv[1].endsWith('seedData.js')) {
  seedDatabase()
    .then(async () => {
      await closeDB();
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeding error:', err);
      process.exit(1);
    });
}
