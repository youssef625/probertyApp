import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiDollarSign,
  FiHeart,
  FiHome,
  FiMapPin,
  FiSearch,
  FiX,
} from 'react-icons/fi';
import { logout, hasUserSession, resolveMediaUrl } from '../services/api';
import { getPropertiesGql } from '../services/graphqlApi';

const Home = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const isLoggedIn = hasUserSession();

  // Search/filter state
  const [searchLocation, setSearchLocation] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [propertyType, setPropertyType] = useState('');

  const fetchProperties = async (filters = {}) => {
    try {
      setLoading(true);
      const data = await getPropertiesGql(filters);
      setProperties(data || []);
      setError(null);
    } catch (err) {
      console.error('GraphQL Error:', err);
      setProperties([]);
      setError('Failed to load properties. The API is currently unavailable. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const filters = {};
    if (searchLocation.trim()) filters.location = searchLocation.trim();
    if (priceRange) {
      const [min, max] = priceRange.split('-');
      if (min) filters.minPrice = min;
      if (max) filters.maxPrice = max;
    }
    if (propertyType) filters.propertyType = propertyType;
    fetchProperties(filters);
  };

  const handleClearFilters = () => {
    setSearchLocation('');
    setPriceRange('');
    setPropertyType('');
    fetchProperties();
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold flex items-center gap-3">
            <span className="inline-flex items-center justify-center rounded-full bg-primary/10 text-primary p-2">
              <FiHome className="h-6 w-6" aria-hidden="true" />
            </span>
            Available Properties
          </h1>
          <div className="flex gap-3">
            {isLoggedIn ? (
              <>
                <Link to="/favorites" className="btn btn-outline btn-primary gap-2">
                  <FiHeart className="h-4 w-4" aria-hidden="true" />
                  Favorites
                </Link>
                <button onClick={handleLogout} className="btn btn-outline">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-primary">Sign in</Link>
                <Link to="/register" className="btn btn-outline">Create account</Link>
              </>
            )}
          </div>
        </div>

        {/* Search & Filter */}
        <form onSubmit={handleSearch} className="card bg-base-100 shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="label text-sm flex items-center gap-2">
                <FiMapPin className="h-4 w-4 text-primary" aria-hidden="true" />
                Location
              </label>
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="input input-bordered w-full"
                placeholder="e.g. Downtown, New Cairo..."
              />
            </div>
            <div>
              <label className="label text-sm flex items-center gap-2">
                <FiDollarSign className="h-4 w-4 text-primary" aria-hidden="true" />
                Price range
              </label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="select select-bordered w-full"
              >
                <option value="">All</option>
                <option value="0-5000">Below 5,000 EGP</option>
                <option value="5000-10000">5,000 - 10,000 EGP</option>
                <option value="10000-20000">10,000 - 20,000 EGP</option>
                <option value="20000-50000">20,000 - 50,000 EGP</option>
                <option value="50000-">Above 50,000 EGP</option>
              </select>
            </div>
            <div>
              <label className="label text-sm flex items-center gap-2">
                <FiHome className="h-4 w-4 text-primary" aria-hidden="true" />
                Property type
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="select select-bordered w-full"
              >
                <option value="">All</option>
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="Studio">Studio</option>
                <option value="Duplex">Duplex</option>
                <option value="Penthouse">Penthouse</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" className="btn btn-primary flex-1 gap-2">
                <FiSearch className="h-4 w-4" aria-hidden="true" />
                Search
              </button>
              <button
                type="button"
                onClick={handleClearFilters}
                className="btn btn-ghost"
                aria-label="Clear filters"
              >
                <FiX className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </form>

        {error && <div className="alert alert-warning mb-6">{error}</div>}

        {/* Property Grid */}
        {properties.length === 0 && !error ? (
          <div className="text-center py-20 text-xl text-base-content/60">
            No properties match your search
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((prop) => (
              <Link
                key={prop.id}
                to={`/property/${prop.id}`}
                className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all"
              >
                <figure className="h-56">
                  <img 
                    src={resolveMediaUrl(prop.images?.[0] || prop.imageUrls?.[0]) || 'https://via.placeholder.com/600x400?text=Apartment'} 
                    alt={prop.title}
                    className="w-full h-full object-cover"
                  />
                </figure>
                <div className="card-body">
                  <h2 className="card-title">{prop.title}</h2>
                  <p className="text-3xl font-bold text-purple-600">
                    {prop.price?.toLocaleString()} EGP <span className="text-base">monthly</span>
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <FiMapPin className="h-4 w-4" aria-hidden="true" />
                    {prop.location}
                  </p>
                  <div className="flex gap-2 mt-2">
                    {prop.propertyType && (
                      <span className="badge badge-outline">{prop.propertyType}</span>
                    )}
                    {prop.rentalStatus && (
                      <span className={`badge ${prop.rentalStatus === 'Available' ? 'badge-success' : 'badge-warning'}`}>
                        {prop.rentalStatus}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;