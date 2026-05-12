import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Settings, LogOut } from 'lucide-react';
import { logout } from '../../services/api';
import { socketService } from '../../services/socketService';
import '../admin.css';

const AdminHeader = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
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
  }, []);

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

  return (
    <header className="admin-header">
      <div className="header-search">
        <Search className="search-icon" size={18} />
        <input type="text" placeholder="Search properties or landlords..." />
      </div>
      
      <div className="header-actions">
        <div className="relative">
          <button className="icon-btn" onClick={toggleNotifications} aria-label="Notifications">
            <Bell size={20} />
          </button>
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-72 rounded-xl border border-slate-200 bg-white shadow-lg">
              <div className="border-b border-slate-100 px-4 py-3 font-semibold text-slate-800">
                Notifications
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-4 text-center text-sm text-slate-500">No new notifications</div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`border-b border-slate-50 px-4 py-3 text-sm ${item.read ? '' : 'bg-blue-50/50'}`}
                    >
                      {item.message}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        <button className="icon-btn">
          <Settings size={20} />
        </button>
        <button className="admin-logout" onClick={handleLogout}>
          <LogOut size={16} />
          Logout
        </button>
        
        <div className="admin-profile">
          <div className="admin-profile-info">
            <div className="admin-name">Admin User</div>
            <div className="admin-role">System Manager</div>
          </div>
          <div className="admin-avatar">
            {}
            <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Admin Default avatar" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
