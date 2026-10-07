import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Users,
  Building2,
  Tags,
  BarChart3,
  History,
  Cloud,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onMobileClose }) => {
  const { user } = useAuth();
  if (!user) return null;

  const dashboardRoute =
    user.role === 'admin'
      ? '/admin-dashboard'
      : user.role === 'hod'
      ? '/hod-dashboard'
      : user.role === 'staff'
      ? '/staff-dashboard'
      : '/student-dashboard';

  const navItems = [
    { label: 'Dashboard', path: dashboardRoute, icon: LayoutDashboard },
    ...(user.role === 'student'
      ? [{ label: 'New Complaint', path: '/complaints/new', icon: PlusCircle }]
      : []),
    { label: 'Complaints List', path: '/complaints', icon: FileText },
    ...(user.role === 'admin'
      ? [
          { label: 'Manage Users', path: '/admin/users', icon: Users },
          { label: 'Departments', path: '/admin/departments', icon: Building2 },
          { label: 'Categories', path: '/admin/categories', icon: Tags },
          { label: 'System Analytics', path: '/admin/analytics', icon: BarChart3 },
          { label: 'Audit Logs', path: '/admin/audit-logs', icon: History },
        ]
      : []),
    ...(user.role === 'hod'
      ? [{ label: 'Department Analytics', path: '/admin/analytics', icon: BarChart3 }]
      : []),
    { label: 'Cloud Architecture', path: '/architecture', icon: Cloud },
    { label: 'My Profile', path: '/profile', icon: User },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-slate-900 text-white w-64 p-4 shadow-xl">
      <div>
        <div className="flex items-center justify-between px-2 py-3 border-b border-slate-800 mb-4">
          <div className="flex items-center space-x-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {user.role} Portal
            </span>
          </div>
          <button
            onClick={onMobileClose}
            className="lg:hidden rounded-lg p-1 text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onMobileClose}
                className={({ isActive }) =>
                  `flex items-center space-x-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-slate-800 pt-4 px-2">
        <div className="rounded-xl bg-slate-800/60 p-3 text-xs text-slate-400">
          <p className="font-semibold text-slate-200">Cloud Computing Project</p>
          <p className="text-[11px] mt-0.5">Vite + React + Node + Mongo</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block lg:flex-shrink-0 z-20 h-[calc(100vh-4rem)] sticky top-16">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs"
            onClick={onMobileClose}
          ></div>
          <div className="fixed inset-y-0 left-0 flex">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};
