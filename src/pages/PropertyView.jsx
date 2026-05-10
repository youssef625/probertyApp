// src/pages/PropertyView.jsx

import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  FiAlertTriangle,
  FiArrowLeft,
  FiArrowUp,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiEye,
  FiFileText,
  FiHeart,
  FiHome,
  FiMapPin,
  FiPhone,
  FiStar,
  FiTruck,
  FiUser,
  FiX,
  FiXCircle,
} from 'react-icons/fi';
import { addToFavorites, removeFromFavorites, scheduleVisit, getFavorites, getMyVisits, hasUserSession, getPropertyReviews, createReview, resolveMediaUrl } from '../services/api';
import { getPropertyByIdGql } from '../services/graphqlApi';
import { getApiErrorMessages } from '../utils/apiClient';

const PropertyView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [hasVisitRequest, setHasVisitRequest] = useState(false);
  const [userMetaLoading, setUserMetaLoading] = useState(false);

  // Fetch property details when component mounts or ID changes
  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPropertyByIdGql(id);
        setProperty(data);
      } catch (err) {
        setError('Unable to load property details. This property may not exist.');
        console.error('Error fetching property details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPropertyDetails();
  }, [id]);

  useEffect(() => {
    if (!id || !hasUserSession()) {
      setIsFavorite(false);
      setHasVisitRequest(false);
      return;
    }

    let isActive = true;
    const propertyId = Number(id);

    const fetchUserMeta = async () => {
      setUserMetaLoading(true);
      try {
        const [favorites, visits] = await Promise.all([getFavorites(), getMyVisits()]);

        if (!isActive) return;

        const favoriteList = Array.isArray(favorites) ? favorites : [];
        const favoriteMatch = favoriteList.some((fav) => {
          const favId = fav?.propertyId ?? fav?.property?.id ?? fav?.PropertyId;
          return Number(favId) === propertyId;
        });

        const visitList = Array.isArray(visits) ? visits : [];
        const visitMatch = visitList.some((visit) => {
          const visitPropertyId = Number(visit?.propertyId ?? visit?.PropertyId);
          const statusValue = (visit?.status ?? visit?.Status ?? '').toString().toLowerCase();
          return visitPropertyId === propertyId && statusValue === 'pending';
        });

        setIsFavorite(favoriteMatch);
        setHasVisitRequest(visitMatch);
      } catch (err) {
        console.error('❌ Error fetching user meta:', err);
      } finally {
        if (isActive) {
          setUserMetaLoading(false);
        }
      }
    };

    fetchUserMeta();

    return () => {
      isActive = false;
    };
  }, [id]);

  // Handle favorite toggle action
  const handleFavoriteToggle = async () => {
    if (!hasUserSession()) {
      setActionMessage({ type: 'warning', text: 'Please sign in to add to favorites' });
      setTimeout(() => setActionMessage(null), 3000);
      return;
    }

    try {
      if (isFavorite) {
        await removeFromFavorites(id);
        setIsFavorite(false);
        setActionMessage({ type: 'success', text: 'Removed from favorites' });
      } else {
        await addToFavorites(id);
        setIsFavorite(true);
        setActionMessage({ type: 'success', text: 'Added to favorites successfully' });
      }
    } catch (err) {
      const [message] = getApiErrorMessages(err);
      setActionMessage({ type: 'error', text: message || 'Failed to update favorites' });
    }
    setTimeout(() => setActionMessage(null), 3000);
  };

  // Handle visit scheduling
  const handleScheduleVisit = async () => {
    if (!hasUserSession()) {
      setActionMessage({ type: 'warning', text: 'Please sign in to schedule a visit' });
      setTimeout(() => setActionMessage(null), 3000);
      return;
    }

    if (hasVisitRequest) {
      setActionMessage({ type: 'warning', text: 'You already have a pending visit request for this property' });
      setTimeout(() => setActionMessage(null), 3000);
      return;
    }

    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);

      await scheduleVisit(id, futureDate.toISOString(), 'I would like to schedule a property viewing');
      setHasVisitRequest(true);
      setActionMessage({ type: 'success', text: 'Visit request sent successfully' });
    } catch (err) {
      const [message] = getApiErrorMessages(err);
      setActionMessage({ type: 'error', text: message || 'Failed to schedule visit' });
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
          <div className="flex items-start gap-3">
            <span className="inline-flex items-center justify-center rounded-full bg-error/10 text-error p-2">
              <FiAlertTriangle className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <span className="font-bold">Sorry!</span>
              <span className="block">{error || 'Property not found'}</span>
            </div>
          </div>
        </div>
        <button className="btn btn-outline" onClick={() => navigate('/')}>
          <FiArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Home
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
        <div
          className={`alert shadow-lg fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md ${actionMessage.type === 'success' ? 'alert-success' :
            actionMessage.type === 'error' ? 'alert-error' : 'alert-warning'
            }`}
        >
          <span className="inline-flex items-center justify-center rounded-full bg-base-100/60 p-2">
            {actionMessage.type === 'success' ? (
              <FiCheckCircle className="h-5 w-5" aria-hidden="true" />
            ) : actionMessage.type === 'error' ? (
              <FiXCircle className="h-5 w-5" aria-hidden="true" />
            ) : (
              <FiAlertTriangle className="h-5 w-5" aria-hidden="true" />
            )}
          </span>
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
        <div className="mb-6">
          <button className="btn btn-outline gap-2" onClick={() => navigate('/')}
          >
            <FiArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Home
          </button>
        </div>
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
                <FiMapPin className="h-5 w-5 text-primary" aria-hidden="true" />
                {property.location}
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
              <h2 className="text-2xl md:text-3xl font-semibold mb-4 flex items-center gap-2">
                <FiFileText className="h-6 w-6 text-primary" aria-hidden="true" />
                Property Description
              </h2>
              <p className="text-lg leading-relaxed whitespace-pre-line text-base-content/90">
                {property.description || 'No description available for this property.'}
              </p>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-semibold mb-4 flex items-center gap-2">
                <FiStar className="h-6 w-6 text-primary" aria-hidden="true" />
                Amenities
              </h2>
              <div className="flex flex-wrap gap-3">
                {property.hasParking && (
                  <div className="badge badge-outline text-base px-5 py-3 flex items-center gap-2">
                    <FiTruck className="h-4 w-4" aria-hidden="true" />
                    Parking
                  </div>
                )}
                {property.hasElevator && (
                  <div className="badge badge-outline text-base px-5 py-3 flex items-center gap-2">
                    <FiArrowUp className="h-4 w-4" aria-hidden="true" />
                    Elevator
                  </div>
                )}
                {property.isFurnished && (
                  <div className="badge badge-outline text-base px-5 py-3 flex items-center gap-2">
                    <FiHome className="h-4 w-4" aria-hidden="true" />
                    Furnished
                  </div>
                )}

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
                <h2 className="card-title text-2xl mb-2 flex items-center gap-2">
                  <FiUser className="h-5 w-5 text-primary" aria-hidden="true" />
                  Landlord Information
                </h2>

                {property.landlord ? (
                  <>
                    <p className="text-xl font-medium">{property.landlord.name || property.landlord}</p>
                    {property.landlord.phone && (
                      <p className="text-base text-base-content/70 flex items-center gap-2">
                        <FiPhone className="h-4 w-4" aria-hidden="true" />
                        {property.landlord.phone}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-base-content/70">Landlord information not available</p>
                )}

                <div className="card-actions flex flex-col gap-3 mt-6">
                  <button
                    className="btn btn-primary btn-lg w-full"
                    onClick={handleScheduleVisit}
                    disabled={hasVisitRequest || userMetaLoading}
                  >
                    {hasVisitRequest ? (
                      <>
                        <FiClock className="h-5 w-5" aria-hidden="true" />
                        Pending Visit Request
                      </>
                    ) : (
                      <>
                        <FiCalendar className="h-5 w-5" aria-hidden="true" />
                        Schedule Visit
                      </>
                    )}
                  </button>
                  <button
                    className="btn btn-outline btn-lg w-full"
                    onClick={handleFavoriteToggle}
                    disabled={userMetaLoading}
                  >
                    {isFavorite ? (
                      <>
                        <FiX className="h-5 w-5" aria-hidden="true" />
                        Remove from Favorites
                      </>
                    ) : (
                      <>
                        <FiHeart className="h-5 w-5" aria-hidden="true" />
                        Add to Favorites
                      </>
                    )}
                  </button>
                </div>

                <div className="divider"></div>
                <div className="text-sm text-base-content/70 space-y-2">
                  {property.postedAt && (
                    <p className="flex items-center gap-2">
                      <FiCalendar className="h-4 w-4" aria-hidden="true" />
                      Posted: {property.postedAt}
                    </p>
                  )}
                  {property.views && (
                    <p className="flex items-center gap-2">
                      <FiEye className="h-4 w-4" aria-hidden="true" />
                      Views: {property.views}
                    </p>
                  )}
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