import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BuildingIcon, Home, Calendar, FileText, LogOut } from 'lucide-react';
import { logout } from '../../services/api';
import '../landlord.css';

const LandlordSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="landlord-sidebar">
      <div className="sidebar-top">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <BuildingIcon size={16} />
          </div>
          <div>
            <div className="sidebar-logo-text">RentVibe</div>
            <div className="sidebar-logo-sub">LANDLORD PORTAL</div>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink 
            to="/landlord/properties" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Home size={18} />
            <span>My Properties</span>
          </NavLink>
          
          <NavLink 
            to="/landlord/visits" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Calendar size={18} />
            <span>Visit Requests</span>
          </NavLink>

          <NavLink 
            to="/landlord/applications" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <FileText size={18} />
            <span>Rental Applications</span>
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

export default LandlordSidebar;
