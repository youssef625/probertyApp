import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, LogOut, BuildingIcon } from 'lucide-react';
import { authService } from '../../admin/services/authService';

const PropertySidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-top">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <BuildingIcon size={16} />
          </div>
          <div>
            <div className="sidebar-logo-text">RentVibe</div>
            <div className="sidebar-logo-sub" style={{ textTransform: 'uppercase' }}>LANDLORD CONSOLE</div>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/properties" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Home size={18} />
            <span>Properties</span>
          </NavLink>
        </nav>
      </div>
      
      <div className="sidebar-bottom">
        <button className="nav-item" onClick={handleLogout} style={{ backgroundColor: '#e2e8f0', color: '#4a5568', justifyContent: 'center' }}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default PropertySidebar;
