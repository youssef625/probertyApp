import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, LogOut } from 'lucide-react';
import { hasUserSession, logout } from '../services/api';
import { socketService } from '../services/socketService';

const TenantNavbar = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const isLoggedIn = hasUserSession();

  useEffect(() => {
    if (!isLoggedIn) return;

    socketService.connect();

    const handleNewNotification = (data) => {
      const text = typeof data === 'string'
        ? data
        : (data?.Message || data?.message || JSON.stringify(data));

      setNotifications((prev) => [
        { id: data?.Id || Date.now(), message: text, read: false },
        ...prev
      ].slice(0, 5));
    };

    socketService.on('ReceiveNotification', handleNewNotification);

    return () => {
      socketService.off('ReceiveNotification', handleNewNotification);
      socketService.disconnect();
    };
  }, [isLoggedIn]);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
    if (!showNotifications && unreadCount > 0) {
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (!isLoggedIn) return null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-base-200 bg-base-100/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-xl font-semibold text-base-content">
          RentVibe
        </Link>
        <nav className="hidden md:flex items-center gap-4">
          <Link to="/my-applications" className="btn btn-ghost btn-sm">
            My Applications
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              type="button"
              className="btn btn-ghost btn-circle"
              onClick={toggleNotifications}
              aria-label="Notifications"
            >
              <Bell size={20} />
            </button>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-base-100 bg-red-500 text-xs font-bold text-white">
                {unreadCount}
              </span>
            )}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-72 rounded-xl border border-base-200 bg-base-100 shadow-lg">
                <div className="border-b border-base-200 px-4 py-3 font-semibold text-base-content">
                  Notifications
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-4 text-center text-sm text-base-content/60">
                      No new notifications
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        className={`border-b border-base-200 px-4 py-3 text-sm ${item.read ? '' : 'bg-primary/10'}`}
                      >
                        {item.message}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <button type="button" className="btn btn-outline btn-sm gap-2" onClick={handleLogout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default TenantNavbar;
