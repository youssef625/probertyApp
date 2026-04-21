import React, { useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { BuildingIcon, UserPlus, CheckSquare, HelpCircle, LogOut, Home, Calendar, FileText } from 'lucide-react';
import { adminService } from '../services/adminService';
import { adminPropertyService } from '../services/adminPropertyService';

// Map of routes to their prefetch functions
const prefetchMap = {
  '/admin/landlord-requests': (qc) => qc.prefetchQuery({
    queryKey: ['pendingLandlords'],
    queryFn: async () => {
      const data = await adminService.getPendingLandlords();
      return Array.isArray(data) ? data : (data?.data || data?.items || []);
    },
  }),
  '/admin/property-approvals': (qc) => qc.prefetchQuery({
    queryKey: ['pendingProperties'],
    queryFn: async () => {
      const data = await adminService.getPendingProperties();
      const rawArray = Array.isArray(data) ? data : (data?.data || data?.items || []);
      return rawArray.map(item => ({
        id: item.id,
        title: item.title,
        location: item.location,
        price: item.price ? `$${item.price.toLocaleString()}/mo` : '$0/mo',
        image: item.imageUrls && item.imageUrls.length > 0
          ? `https://app-260407103838.azurewebsites.net${item.imageUrls[0]}`
          : 'https://via.placeholder.com/400x300?text=No+Image',
        status: item.approvalStatus === 'Pending' ? 'NEW SUBMISSION' : (item.approvalStatus || 'NEW SUBMISSION'),
        landlord: {
          name: item.landlordName || 'Unknown Landlord',
          verified: true
        }
      }));
    },
  }),

  '/admin/visit-requests': (qc) => qc.prefetchQuery({
    queryKey: ['visitRequests'],
    queryFn: () => adminPropertyService.getVisitRequests(),
  }),
  '/admin/rental-applications': (qc) => qc.prefetchQuery({
    queryKey: ['rentalApplications'],
    queryFn: () => adminPropertyService.getApplications(),
  }),
};

const Sidebar = () => {
  const queryClient = useQueryClient();

  // Prefetch data when user hovers over a nav link
  const handleMouseEnter = useCallback((path) => {
    const prefetchFn = prefetchMap[path];
    if (prefetchFn) {
      prefetchFn(queryClient);
    }
  }, [queryClient]);

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
            onMouseEnter={() => handleMouseEnter('/admin/landlord-requests')}
          >
            <UserPlus size={18} />
            <span>Landlord Requests</span>
          </NavLink>
          
          <NavLink 
            to="/admin/property-approvals" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onMouseEnter={() => handleMouseEnter('/admin/property-approvals')}
          >
            <CheckSquare size={18} />
            <span>Property Approvals</span>
          </NavLink>



          <NavLink 
            to="/admin/visit-requests" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onMouseEnter={() => handleMouseEnter('/admin/visit-requests')}
          >
            <Calendar size={18} />
            <span>Visit Requests</span>
          </NavLink>

          <NavLink 
            to="/admin/rental-applications" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onMouseEnter={() => handleMouseEnter('/admin/rental-applications')}
          >
            <FileText size={18} />
            <span>Rental Applications</span>
          </NavLink>
        </nav>
      </div>
      
      <div className="sidebar-bottom sidebar-nav">

        <button className="nav-item mt-auto" onClick={() => console.log('logout')}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
