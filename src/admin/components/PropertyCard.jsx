import React from 'react';
import { MapPin, CheckCircle, XCircle } from 'lucide-react';
import '../admin.css';

const PropertyCard = ({ property, onAccept, onReject }) => {
  return (
    <div className="property-card">
      <div className="property-image-wrapper">
        <img 
          src={property?.image || 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22300%22%20viewBox%3D%220%200%20400%20300%22%3E%3Crect%20fill%3D%22%23e2e8f0%22%20width%3D%22400%22%20height%3D%22300%22%2F%3E%3Ctext%20fill%3D%22%23718096%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E'} 
          alt={property?.title || 'Property'} 
          className="property-image"
          onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22300%22%20viewBox%3D%220%200%20400%20300%22%3E%3Crect%20fill%3D%22%23e2e8f0%22%20width%3D%22400%22%20height%3D%22300%22%2F%3E%3Ctext%20fill%3D%22%23718096%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E'; }}
        />
        <div className={`property-badge ${property?.status === 'URGENT REVIEW' ? 'urgent' : ''}`}>
          {property?.status || 'NEW SUBMISSION'}
        </div>
        <div className="property-price">{property?.price || '$0/mo'}</div>
      </div>
      
      <div className="property-details">
        <h3 className="property-title">{property?.title || 'Untitled Property'}</h3>
        <div className="property-location">
          <MapPin size={14} />
          <span>{property?.location || 'Unknown Location'}</span>
        </div>
        
        <div className="property-landlord">
          <div className="landlord-avatar">
            {/* Show initials or image */}
            {property?.landlord?.name ? property.landlord.name.split(' ').map(n => n[0]).join('') : 'U'}
          </div>
          <div className="landlord-info">
            <span className="landlord-label">LANDLORD</span>
            <span className="landlord-name">{property?.landlord?.name || 'Unknown Landlord'}</span>
          </div>
          {property?.landlord?.verified && (
            <CheckCircle className="verified-icon" size={18} fill="#def6e9" />
          )}
        </div>
        
        <div className="property-actions">
          <button className="btn-accept" onClick={() => onAccept(property?.id)}>
            <CheckCircle size={16} />
            ACCEPT
          </button>
          <button className="btn-reject" onClick={() => onReject(property?.id)}>
            <XCircle size={16} />
            REJECT
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
