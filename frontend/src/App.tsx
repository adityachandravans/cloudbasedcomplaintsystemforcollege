import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AuthLayout } from './layouts/AuthLayout';
import { MainLayout } from './layouts/MainLayout';

import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ProfilePage } from './pages/ProfilePage';
import { StudentDashboard } from './pages/StudentDashboard';
import { StaffDashboard } from './pages/StaffDashboard';
import { HodDashboard } from './pages/HodDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ComplaintsListPage } from './pages/ComplaintsListPage';
import { CreateComplaintPage } from './pages/CreateComplaintPage';
import { ComplaintDetailPage } from './pages/ComplaintDetailPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { DepartmentManagementPage } from './pages/DepartmentManagementPage';
import { CategoryManagementPage } from './pages/CategoryManagementPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SystemArchitecturePage } from './pages/SystemArchitecturePage';

const RootRedirect: React.FC = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'admin') return <Navigate to="/admin-dashboard" replace />;
  if (user.role === 'hod') return <Navigate to="/hod-dashboard" replace />;
  if (user.role === 'staff') return <Navigate to="/staff-dashboard" replace />;
  return <Navigate to="/student-dashboard" replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            {/* Public Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            </Route>

            {/* Main App Protected Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<RootRedirect />} />
              <Route path="/student-dashboard" element={<StudentDashboard />} />
              <Route path="/staff-dashboard" element={<StaffDashboard />} />
              <Route path="/hod-dashboard" element={<HodDashboard />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />

              <Route path="/complaints" element={<ComplaintsListPage />} />
              <Route path="/complaints/new" element={<CreateComplaintPage />} />
              <Route path="/complaints/:id" element={<ComplaintDetailPage />} />

              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/architecture" element={<SystemArchitecturePage />} />

              {/* Admin & Management Routes */}
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'hod']}>
                    <UserManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/departments"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DepartmentManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/categories"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <CategoryManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'hod']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/audit-logs"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AuditLogsPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Fallback wildcard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
