import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiHeart, FiMapPin, FiX } from 'react-icons/fi';
import { getFavorites, removeFromFavorites, hasUserSession, resolveMediaUrl } from '../services/api';
import ErrorBanner from '../components/ErrorBanner';
import { getApiErrorMessages } from '../utils/apiClient';
import TenantNavbar from '../components/TenantNavbar';
import notAvailableImage from '../assets/not-available.svg';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageErrors, setPageErrors] = useState([]);
  const [actionErrors, setActionErrors] = useState([]);
  const navigate = useNavigate();

  const isRentedProperty = (property) => {
    const statusValue = (property?.rentalStatus ?? property?.status ?? '').toString().toLowerCase();
    return statusValue === 'rented';
  };

  const visibleFavorites = favorites.filter((fav) => {
    const prop = fav.property || fav;
    return !isRentedProperty(prop);
  });

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const data = await getFavorites();
      setFavorites(data || []);
      setPageErrors([]);
    } catch (err) {
      console.error('API Error:', err);
      setFavorites([]);
      setPageErrors(getApiErrorMessages(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasUserSession()) {
      navigate('/login');
      return;
    }
    fetchFavorites();
  }, [navigate]);

  const handleRemove = async (e, propertyId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await removeFromFavorites(propertyId);
      // Remove from local state to avoid refetching everything
      setFavorites(prev => prev.filter(f => f.propertyId !== propertyId && f.id !== propertyId));
      setActionErrors([]);
    } catch (err) {
      console.error('Failed to remove from favorites', err);
      setActionErrors(getApiErrorMessages(err));
    }
  };

  if (loading) {
    return (
      <>
        <TenantNavbar />
        <div className="min-h-screen flex items-center justify-center bg-base-200">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <TenantNavbar />
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-primary flex items-center gap-3">
            <span className="inline-flex items-center justify-center rounded-full bg-primary/10 text-primary p-2">
              <FiHeart className="h-6 w-6" aria-hidden="true" />
            </span>
            Favorites
          </h1>
          <Link to="/" className="btn btn-outline gap-2">
            <FiArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Home
          </Link>
        </div>

        <ErrorBanner messages={pageErrors} className="mb-4" />
        <ErrorBanner messages={actionErrors} className="mb-6" />

        {/* Favorite Grid */}
        {visibleFavorites.length === 0 && pageErrors.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold mb-4 text-base-content/70">No properties in favorites</h2>
            <Link to="/" className="btn btn-primary">Browse properties</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleFavorites.map((fav) => {
              // Handle potential mismatches between favorites DTO and property model
              const propertyId = fav.propertyId || fav.id;
              const prop = fav.property || fav; 
              
              return (
              <Link
                key={propertyId}
                to={`/property/${propertyId}`}
                className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all relative group"
              >
                {/* Remove button (appears on hover) */}
                <button 
                  onClick={(e) => handleRemove(e, propertyId)}
                  className="btn btn-circle btn-sm btn-error absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove from favorites"
                  aria-label="Remove from favorites"
                >
                  <FiX className="h-4 w-4" aria-hidden="true" />
                </button>

                <figure className="h-56">
                  <img 
                    src={resolveMediaUrl(prop.images?.[0] || prop.imageUrls?.[0] || prop.imageUrl) || notAvailableImage}
                    alt={prop.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = notAvailableImage; }}
                  />
                </figure>
                <div className="card-body">
                  <h2 className="card-title truncate pr-8">{prop.title}</h2>
                  <p className="text-3xl font-bold text-purple-600">
                    {prop.price?.toLocaleString()} EGP <span className="text-base">monthly</span>
                  </p>
                  <p className="text-sm text-gray-500 truncate flex items-center gap-2">
                    <FiMapPin className="h-4 w-4" aria-hidden="true" />
                    {prop.location}
                  </p>
                </div>
              </Link>
            )})}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
