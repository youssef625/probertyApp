import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import LandlordSidebar from './LandlordSidebar';
import { socketService } from '../../services/socketService';
import '../landlord.css';

const LandlordLayout = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    // Connect to SignalR socket on mount
    socketService.connect();

    const handleNewNotification = (message) => {
      setNotifications(prev => [{ id: Date.now(), message, read: false }, ...prev].slice(0, 5)); // Keep last 5
    };

    // Listen to standard events we expect the backend to emit
    socketService.on('ReceiveNotification', handleNewNotification);
    socketService.on('VisitRequested', (msg) => handleNewNotification(`Visit request: ${msg}`));
    socketService.on('ApplicationReceived', (msg) => handleNewNotification(`New application: ${msg}`));

    return () => {
      socketService.off('ReceiveNotification', handleNewNotification);
      socketService.off('VisitRequested', handleNewNotification);
      socketService.off('ApplicationReceived', handleNewNotification);
      socketService.disconnect();
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && unreadCount > 0) {
      // Mark all as read when opening dropdown
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };
  return (
    <div className="landlord-layout">
      <LandlordSidebar />
      <main className="landlord-main">
        {/* Simple Header */}
        <header className="landlord-header">
          <div className="header-actions">
            <div className="header-icon">
              <Search size={20} />
            </div>
            <div className="header-icon relative" onClick={toggleNotifications}>
              <Bell size={20} />
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              
              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-4 w-72 bg-white rounded-xl shadow-lg border border-slate-200 z-50">
                  <div className="p-4 border-b border-slate-100 font-semibold text-slate-800">
                    Notifications
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-slate-500">No new notifications</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`p-4 text-sm border-b border-slate-50 hover:bg-slate-50 ${!n.read ? 'bg-blue-50/50' : ''}`}>
                          {n.message}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="user-profile ml-4 border-l pl-6 border-slate-200">
              <div className="user-avatar text-indigo-700 bg-indigo-100">L</div>
              <div className="user-info">
                <span className="user-name">Landlord</span>
                <span className="user-role">Host Portal</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="landlord-content bg-slate-50 min-h-screen">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default LandlordLayout;
