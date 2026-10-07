import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Clock } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { formatShortDate } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';

export const NotificationDropdown: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    if (notification.relatedComplaint) {
      navigate(`/complaints/${notification.relatedComplaint}`);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-hidden transition-colors cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white py-2 shadow-xl ring-1 ring-black/5 z-50 divide-y divide-gray-100">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
            <h4 className="text-sm font-semibold text-gray-900">Notifications</h4>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center text-xs font-medium text-brand-600 hover:text-brand-800 cursor-pointer"
              >
                <CheckCheck className="mr-1 h-3.5 w-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-500">No notifications yet</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3.5 text-left transition-colors cursor-pointer hover:bg-gray-50 flex items-start space-x-3 ${
                    !n.isRead ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold ${!n.isRead ? 'text-brand-900' : 'text-gray-800'}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{n.message}</p>
                    <span className="mt-1 flex items-center text-[10px] text-gray-400">
                      <Clock className="mr-1 h-3 w-3" />
                      {formatShortDate(n.createdAt)}
                    </span>
                  </div>
                  {!n.isRead && <span className="h-2 w-2 rounded-full bg-brand-600 flex-shrink-0 mt-1"></span>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
