import React from 'react';
import { Search, Bell, Settings } from 'lucide-react';
import '../admin.css';

const AdminHeader = () => {
  return (
    <header className="admin-header">
      <div className="header-search">
        <Search className="search-icon" size={18} />
        <input type="text" placeholder="Search properties or landlords..." />
      </div>
      
      <div className="header-actions">
        <button className="icon-btn">
          <Bell size={20} />
        </button>
        <button className="icon-btn">
          <Settings size={20} />
        </button>
        
        <div className="admin-profile">
          <div className="admin-profile-info">
            <div className="admin-name">Admin User</div>
            <div className="admin-role">System Manager</div>
          </div>
          <div className="admin-avatar">
            {/* Using a placeholder avatar image from unavatar or div */}
            <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Admin Default avatar" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
