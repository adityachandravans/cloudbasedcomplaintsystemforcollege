# Cloud-Based College Complaint Management System 🎓☁️

A complete, production-ready, full-stack Cloud Computing web application designed for centralizing college complaint submission, automated SLA tracking, staff assignment, multi-tier role authorization, and real-time analytical reporting.

---

## 🚀 Technology Stack

### **Frontend**
- **Framework**: React.js (v18) + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM (v6)
- **Icons**: Lucide React
- **Analytics & Charts**: Recharts
- **HTTP Client**: Axios with JWT Interceptors

### **Backend**
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose ORM) with automatic embedded MongoMemoryServer fallback for zero-config demonstration
- **Authentication**: JWT (JSON Web Tokens) & Password Hashing (bcryptjs)
- **File Uploads**: Multer (Local & Cloud-ready storage interface)
- **Audit & Logging**: Morgan + Custom Audit Trail Logger

---

## 🔑 Demo Account Credentials

All demo accounts pre-seeded in the system share the default password: **`Password@123`**

| Role | Name | Email | Default Password | Access Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | Dr. Robert Vance | `admin@college.edu` | `Password@123` | Full System Control, Analytics, User Management, Audit Logs, Export |
| **Department Head (HOD)** | Prof. Alan Turing | `hod@college.edu` | `Password@123` | CS/IT Department Complaints, Staff Workload, Assignment & Escalation |
| **Department Head (EEE)** | Prof. Nikola Tesla | `hod.ee@college.edu` | `Password@123` | Electrical Dept Complaints, Workload & Staff Assignment |
| **Staff Member (IT)** | John Miller | `staff@college.edu` | `Password@123` | Assigned Complaints, Resolution Proof Uploads, Status Updates |
| **Student** | Alex Mercer | `student@college.edu` | `Password@123` | Submit Complaints, Reopen Complaints, Give Feedback, Track SLA |

---

## ⚙️ How to Run Locally

### **Prerequisites**
- Node.js (v18+) & npm

### **1. Clone & Setup Backend**
```bash
cd backend
npm install
npm run dev
```
*Note: The backend automatically initializes embedded MongoDB and seeds 30+ realistic college complaints and demo accounts if no existing database is connected!*

### **2. Setup Frontend**
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📑 Core System Features

1. **Multi-Role Authorization**:
   - **Student**: Submit complaints, attach evidence files, view visual progress timeline, reopen resolved complaints, submit 1-5 star resolution feedback.
   - **Staff**: View assigned tasks, change status (In Progress, Resolved, Rejected), upload resolution proof images & notes.
   - **Department Head (HOD)**: View department complaints, assign/reassign staff members, monitor staff workload charts, escalate overdue issues.
   - **Administrator**: Comprehensive analytics dashboard, manage user accounts, manage departments & categories, inspect system audit logs, export CSV complaint reports.

2. **Automated SLA & Escalation System**:
   - **Critical Priority**: 24 Hours SLA
   - **High Priority**: 48 Hours SLA (2 Days)
   - **Medium Priority**: 72 Hours SLA (3 Days)
   - **Low Priority**: 120 Hours SLA (5 Days)
   - Auto-flagging for **OVERDUE** complaints with direct escalation alerts to HODs and Admins.

3. **Complaint Lifecycle**:
   `SUBMITTED` ➔ `UNDER REVIEW` ➔ `ASSIGNED` ➔ `IN PROGRESS` ➔ `RESOLVED` ➔ `CLOSED`
   *(Additional States: `REJECTED`, `REOPENED`, `ESCALATED`)*

4. **In-App Notification Bell**:
   Real-time unread alert count in navbar notifying users when complaints are assigned, updated, resolved, or escalated.

5. **Cloud Computing Architecture Documentation Page**:
   Dedicated `/architecture` route explaining IaaS, PaaS, SaaS, MongoDB Atlas, stateless REST APIs, and CDN deployments.

---

## 📡 Key REST API Endpoints

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current session profile
- `PUT /api/auth/profile` - Update user details

### **Complaints**
- `POST /api/complaints` - Create new complaint (with file attachments)
- `GET /api/complaints` - List complaints (filtered, searched, paginated)
- `GET /api/complaints/:id` - Get complaint details & timeline
- `PATCH /api/complaints/:id/status` - Update status & resolution proof
- `PATCH /api/complaints/:id/assign` - Assign staff (HOD/Admin)
- `PATCH /api/complaints/:id/escalate` - Escalate complaint (HOD/Admin)
- `POST /api/complaints/:id/reopen` - Reopen complaint (Student)
- `GET /api/complaints/export/csv` - Export CSV dataset (Admin/HOD)

### **Analytics & Admin**
- `GET /api/analytics/overview` - System stats & Recharts data
- `GET /api/analytics/staff-workload` - Department staff workload
- `GET /api/users` - Admin user management
- `GET /api/audit-logs` - System audit log trail

---

## 📊 Database Models

- **User**: Name, Email, PasswordHash, Role, StudentId, EmployeeId, Department, Phone, IsActive
- **Complaint**: ComplaintId (`CMP-2026-XXXXX`), Title, Description, Category, Department, Location, Priority, Status, CreatedBy, AssignedTo, Attachments, History, DueDate, IsOverdue, ResolutionProof, ResolutionNotes
- **Comment**: ComplaintId, UserId, Message, Attachments, IsInternal
- **Notification**: UserId, Title, Message, Type, IsRead, RelatedComplaint
- **Feedback**: ComplaintId, StudentId, Rating (1-5), Comment
- **Department**: Name, Code, Description, Head
- **Category**: Name, Description, Department
- **AuditLog**: UserName, UserRole, Action, Entity, EntityId, Timestamp

---

## 🧪 Testing Checklist

- [x] Backend TypeScript compilation (`npm run build` in `backend`)
- [x] Frontend TypeScript compilation & Vite bundle (`npm run build` in `frontend`)
- [x] Demo data auto-seeding (30 complaints, 20 students, 5 staff, 2 HODs, 1 Admin)
- [x] One-click quick login credentials fill for all 4 user roles
- [x] Role-based protected routes and menu navigation
- [x] Search, multi-filtering, sorting, and pagination
- [x] Complaint assignment, status updates, escalation, and reopening
- [x] Feedback rating & CSV export functionality
