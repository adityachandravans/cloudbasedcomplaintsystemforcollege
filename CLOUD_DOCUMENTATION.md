# Cloud Computing Architecture & Documentation
## Project: Cloud-Based College Complaint Management System

---

## 1. Cloud Computing System Architecture

The system follows a multi-tier, micro-services ready cloud architecture separating the Presentation Layer (Frontend), Application Layer (Backend API), and Persistence Layer (Cloud Database & Cloud Object Storage).

```
   [ Students / Staff / HODs / Admins ]
                     │
                     ▼
          Web Browser (HTTPS)
                     │
                     ▼
       ┌───────────────────────────┐
       │   React 18 + Vite Frontend│ (Hosted on Vercel / Netlify CDN - PaaS)
       └─────────────┬─────────────┘
                     │ REST API (JSON)
                     ▼
       ┌───────────────────────────┐
       │  Node.js + Express API    │ (Hosted on Render / Railway / AWS EC2 - PaaS/IaaS)
       └──────┬─────────────┬──────┘
              │             │
              ▼             ▼
   ┌──────────────────┐  ┌───────────────────────────────┐
   │ MongoDB Atlas DB │  │ Cloud Object Storage          │
   │ (Managed Cloud)  │  │ (Cloudinary / AWS S3 Storage) │
   └──────────────────┘  └───────────────────────────────┘
```

---

## 2. Cloud Service Models (IaaS, PaaS, SaaS)

| Cloud Model | Implementation in Project | Description |
| :--- | :--- | :--- |
| **SaaS (Software as a Service)** | Full Web Portal Application | End-users access the complete complaint management portal via web browsers across desktop and mobile devices without local software installation. |
| **PaaS (Platform as a Service)** | Vercel / Netlify & Render | Automatic build deployments, SSL termination, domain routing, and node runtime managed by cloud providers without infrastructure maintenance. |
| **IaaS (Infrastructure as a Service)** | AWS EC2 / S3 Storage / MongoDB Atlas | Cloud virtual compute, managed MongoDB replica sets, cloud storage buckets, and security group firewall rules. |

---

## 3. Core Cloud Principles Demonstrated

1. **Stateless Backend API**: Node.js backend relies on JWT tokens sent in `Authorization: Bearer <token>` headers, enabling horizontal scaling across multiple cloud instances behind a load balancer.
2. **Decoupled Cloud File Storage**: Media attachments (images, PDFs, documents) are stored independently from MongoDB, eliminating database bloat and optimizing download bandwidth via CDN URLs.
3. **Managed Cloud Database**: Compatible with **MongoDB Atlas**, providing automatic multi-region replication, failover, auto-indexing, and automated continuous backups.
4. **Environment Variable Configuration**: Zero hardcoded credentials. All JWT secrets, port configurations, and cloud connection strings are injected dynamically via environment variables.
5. **Centralized Data Storage**: Single source of truth accessible remotely by authorized users based on role permissions (Student, Staff, HOD, Admin).
6. **Audit & Monitoring**: Built-in system audit log recording all administrative modifications, user state changes, and SLA escalations for compliance.

---

## 4. Cloud Deployment Step-by-Step Guide

### Step 1: Database Setup (MongoDB Atlas)
1. Register a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user and whitelist network access (`0.0.0.0/0`).
3. Copy your Connection String (`mongodb+srv://<user>:<password>@cluster.mongodb.net/complaint_db`).

### Step 2: Backend Deployment (Render / Railway)
1. Push project repository to GitHub.
2. Create a new Web Service on [Render](https://render.com).
3. Set Build Command: `npm install && npm run build` (inside `backend` directory).
4. Set Start Command: `npm start`.
5. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `MONGODB_URI`: `<Your MongoDB Atlas URI>`
   - `JWT_SECRET`: `<Secure Random String>`

### Step 3: Frontend Deployment (Vercel / Netlify)
1. Connect repository to [Vercel](https://vercel.com).
2. Set Root Directory to `frontend`.
3. Set Build Command: `npm run build`.
4. Deploy! Vercel handles HTTPS SSL certificates and global CDN distribution automatically.
