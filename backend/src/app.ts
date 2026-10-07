import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import auditLogRoutes from './routes/auditLogRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { StorageService } from './services/storageService.js';

dotenv.config();

const app: Express = express();

// Initialize upload directory
StorageService.init();

// Enable CORS
app.use(
  cors({
    origin: '*', // Allow all origins for dev/demo flexible deployment
    credentials: true,
  })
);

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Request Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Serve Uploaded Files statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health Check API Endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'UP',
    system: 'Cloud-Based College Complaint Management System API',
    timestamp: new Date().toISOString(),
    cloudReady: true,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/audit-logs', auditLogRoutes);

// Centralized Error Middleware
app.use(errorHandler);

export default app;
