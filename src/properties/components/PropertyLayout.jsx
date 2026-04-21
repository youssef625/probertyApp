import React from 'react';
import { Outlet } from 'react-router-dom';
import PropertySidebar from './PropertySidebar';
import { Search, Bell, Settings } from 'lucide-react';
import '../../admin/admin.css';
import '../properties.css';

const PropertyHeader = () => {
  return (
    <header className="admin-header">
      <div className="header-search">
        <Search className="search-icon" size={18} />
        <input type="text" placeholder="Search your properties..." />
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
            <div className="admin-name">Landlord User</div>
            <div className="admin-role">Property Owner</div>
          </div>
          <div className="admin-avatar">
            <img src="https://i.pravatar.cc/150?u=landlord1" alt="Landlord Default avatar" />
          </div>
        </div>
      </div>
    </header>
  );
};

const PropertyLayout = () => {
  return (
    <div className="admin-dashboard">
      <PropertySidebar />

      <main className="admin-main">
        <PropertyHeader />

        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default PropertyLayout;
