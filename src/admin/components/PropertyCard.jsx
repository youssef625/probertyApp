import React from 'react';
import { MapPin, CheckCircle, XCircle } from 'lucide-react';
import '../admin.css';

const PropertyCard = ({ property, onAccept, onReject }) => {
  return (
    <div className="property-card">
      <div className="property-image-wrapper">
        <img src={property?.image || 'https://via.placeholder.com/400x300?text=No+Image'} alt={property?.title || 'Property'} className="property-image" />
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
