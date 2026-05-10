import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BuildingIcon, UserPlus, CheckSquare, LogOut } from 'lucide-react';
import { logout } from '../../services/api';
import '../admin.css';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
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
            <div className="sidebar-logo-sub">ADMIN CONSOLE</div>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink 
            to="/admin/landlord-requests" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <UserPlus size={18} />
            <span>Landlord Requests</span>
          </NavLink>
          
          <NavLink 
            to="/admin/property-approvals" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <CheckSquare size={18} />
            <span>Property Approvals</span>
          </NavLink>
        </nav>
      </div>
      
      <div className="sidebar-bottom sidebar-nav">

        <button className="nav-item mt-auto" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
