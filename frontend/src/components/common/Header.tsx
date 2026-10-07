import React from 'react';
import { Menu, LogOut, User as UserIcon, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';
import { RoleBadge } from './Badge';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 shadow-xs">
      <div className="flex items-center space-x-3">
        <button
          onClick={onMobileMenuToggle}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden cursor-pointer"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="flex items-center space-x-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white font-bold shadow-xs">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-none">CloudCampus</h1>
            <p className="text-[10px] text-gray-500 font-medium">Complaint Management System</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3 sm:space-x-4">
        {user && <NotificationDropdown />}

        {user && (
          <div className="flex items-center space-x-3 border-l pl-3 sm:pl-4 border-gray-200">
            <div
              onClick={() => navigate('/profile')}
              className="flex items-center space-x-2.5 cursor-pointer group"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold border border-brand-200 group-hover:border-brand-400 transition-colors">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-gray-900 group-hover:text-brand-600 transition-colors leading-tight">
                  {user.name}
                </p>
                <div className="mt-0.5">
                  <RoleBadge role={user.role} />
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="rounded-lg p-2 text-gray-500 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
