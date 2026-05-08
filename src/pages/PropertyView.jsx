// src/pages/PropertyView.jsx

import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getPropertyById, addToFavorites, scheduleVisit, hasUserSession, getPropertyReviews, createReview, resolveMediaUrl } from '../services/api';
import { getApiErrorMessages } from '../utils/apiClient';

const PropertyView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  // Fetch property details when component mounts or ID changes
  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPropertyById(id);
        setProperty(data);
      } catch (err) {
        setError('Unable to load property details. This property may not exist.');
        console.error('❌ Error fetching property details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPropertyDetails();
  }, [id]);

  // Handle favorite toggle action
  const handleFavoriteToggle = async () => {
    if (!hasUserSession()) {
      setActionMessage({ type: 'warning', text: '⚠️ Please sign in to add to favorites' });
      setTimeout(() => setActionMessage(null), 3000);
      return;
    }

    try {
      await addToFavorites(id);
      setActionMessage({ type: 'success', text: '✅ Added to favorites successfully' });
    } catch (err) {
      const [message] = getApiErrorMessages(err);
      setActionMessage({ type: 'error', text: message || '❌ Failed to add to favorites' });
    }
    setTimeout(() => setActionMessage(null), 3000);
  };

  // Handle visit scheduling
  const handleScheduleVisit = async () => {
    if (!hasUserSession()) {
      setActionMessage({ type: 'warning', text: '⚠️ Please sign in to schedule a visit' });
      setTimeout(() => setActionMessage(null), 3000);
      return;
    }

    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);

      await scheduleVisit(id, futureDate.toISOString(), 'I would like to schedule a property viewing');
      setActionMessage({ type: 'success', text: '✅ Visit request sent successfully' });
    } catch (err) {
      const [message] = getApiErrorMessages(err);
      setActionMessage({ type: 'error', text: message || '❌ Failed to schedule visit' });
    }
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="ml-4 text-lg">Loading property details...</p>
      </div>
    );
  }

  // Error or property not found state
  if (error || !property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-200">
        <div className="alert alert-error shadow-lg max-w-md mb-6">
          <div>
            <span>⚠️</span>
            <span className="font-bold">Sorry!</span>
            <span className="block">{error || 'Property not found'}</span>
          </div>
        </div>
        <button className="btn btn-outline" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
      </div>
    );
  }

  // Render property details
  const imageList = property.images?.length > 0 ? property.images : (property.imageUrls || []);

  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      {/* Action feedback toast */}
      {actionMessage && (
        <div className={`alert shadow-lg fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md ${actionMessage.type === 'success' ? 'alert-success' :
          actionMessage.type === 'error' ? 'alert-error' : 'alert-warning'
          }`}>
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Image Carousel */}
      <div className="carousel w-full h-[400px] md:h-[550px] bg-base-300">
        {imageList.length > 0 ? (
          imageList.map((img, index) => (
            <div key={index} className="carousel-item w-full relative">
              <img
                src={resolveMediaUrl(img)}
                alt={`Property image ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/1200x600?text=Image+Not+Available';
                }}
              />
              {index === 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 md:p-10">
                  <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
                    {property.title}
                  </h1>
                  <p className="text-2xl md:text-4xl font-extrabold text-primary">
                    {property.price?.toLocaleString()} EGP
                    <span className="text-lg md:text-2xl font-normal text-white/90"> / month</span>
                  </p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="carousel-item w-full flex items-center justify-center">
            <p className="text-xl text-base-content/70">No images available for this property</p>
          </div>
        )}
      </div>

      {/* Main content section */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">

          <div className="lg:col-span-2 space-y-8 md:space-y-10">
            <div>
              <div className="flex flex-wrap gap-3 mb-4">
                <span className={`badge ${property.status === 'Available' ? 'badge-success' : 'badge-warning'} badge-lg text-lg`}>
                  {property.status || 'Available'}
                </span>
                {property.propertyType && (
                  <span className="badge badge-outline badge-lg text-lg">
                    {property.propertyType}
                  </span>
                )}
              </div>
              <p className="text-lg text-base-content/70 flex items-center gap-2">
                <span>📍</span> {property.location}
              </p>
            </div>

            <div className="stats stats-horizontal md:stats-vertical shadow bg-base-100 w-full">
              <div className="stat">
                <div className="stat-title">Area</div>
                <div className="stat-value text-3xl md:text-4xl">{property.areaSqFt || property.area} m²</div>
              </div>
              <div className="stat">
                <div className="stat-title">Bedrooms</div>
                <div className="stat-value text-3xl md:text-4xl">{property.bedrooms}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Bathrooms</div>
                <div className="stat-value text-3xl md:text-4xl">{property.bathrooms}</div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-semibold mb-4">📝 Property Description</h2>
              <p className="text-lg leading-relaxed whitespace-pre-line text-base-content/90">
                {property.description || 'No description available for this property.'}
              </p>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-semibold mb-4">✨ Amenities</h2>
              <div className="flex flex-wrap gap-3">
                {property.hasParking && <div className="badge badge-outline text-base px-5 py-3">🅿️ Parking</div>}
                {property.hasElevator && <div className="badge badge-outline text-base px-5 py-3">🛗 Elevator</div>}
                {property.isFurnished && <div className="badge badge-outline text-base px-5 py-3">🪑 Furnished</div>}

                {property.amenities?.map((item, idx) => (
                  <div key={idx} className="badge badge-outline text-base px-5 py-3">{item}</div>
                ))}

                {!property.hasParking && !property.hasElevator && !property.isFurnished && !property.amenities?.length && (
                  <p className="text-base-content/60">No amenities listed</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card bg-base-100 shadow-2xl sticky top-6">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-2">👤 Landlord Information</h2>

                {property.landlord ? (
                  <>
                    <p className="text-xl font-medium">{property.landlord.name || property.landlord}</p>
                    {property.landlord.phone && (
                      <p className="text-base text-base-content/70">📞 {property.landlord.phone}</p>
                    )}
                  </>
                ) : (
                  <p className="text-base-content/70">Landlord information not available</p>
                )}

                <div className="card-actions flex flex-col gap-3 mt-6">
                  <button className="btn btn-primary btn-lg w-full" onClick={handleScheduleVisit}>
                    📅 Schedule Visit
                  </button>
                  <button className="btn btn-outline btn-lg w-full" onClick={handleFavoriteToggle}>
                    ❤️ Add to Favorites
                  </button>
                  <a
                    href={`https://wa.me/?text=I'm interested in: ${property.title}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-success btn-lg w-full"
                  >
                    💬 Chat on WhatsApp
                  </a>
                </div>

                <div className="divider"></div>
                <div className="text-sm text-base-content/70 space-y-2">
                  {property.postedAt && <p>🗓️ Posted: {property.postedAt}</p>}
                  {property.views && <p>👁️ Views: {property.views}</p>}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PropertyView;