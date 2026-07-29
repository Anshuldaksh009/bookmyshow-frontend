import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import axiosClient from '../api/axiosClient';
import Navbar from '../components/Navbar';

import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Preset cities
  const CITIES = ['Panipat','Pune', 'Noida','Bhopal', 'Delhi', 'Mumbai', 'Bengaluru', 'Kolkata', 'Hyderabad'];

  const getInitialCity = () => {
    const saved = localStorage.getItem('selectedCity');
    return CITIES.includes(saved) ? saved : 'Bhopal';
  };

  const [selectedCity, setSelectedCity] = useState(getInitialCity());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await axiosClient.get(`/movies/get-all?city=${selectedCity}`);
        
        let movieData = [];
        if (response.data?.success && Array.isArray(response.data.data)) {
          movieData = response.data.data;
        } else if (Array.isArray(response.data)) {
          movieData = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          movieData = response.data.data;
        }

        setMovies(movieData);
        setFilteredMovies(movieData);
      } catch (err) {
        console.error("Error fetching movies:", err);
        setError(err.response?.data?.message || 'Failed to fetch movies from server.');
        setMovies([]);
        setFilteredMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [selectedCity]);

  // Search filter
  useEffect(() => {
    const safeMovies = Array.isArray(movies) ? movies : [];
    if (!searchQuery.trim()) {
      setFilteredMovies(safeMovies);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = safeMovies.filter(
        (m) =>
          m.title?.toLowerCase().includes(query) ||
          m.genre?.toLowerCase().includes(query) ||
          m.language?.toLowerCase().includes(query)
      );
      setFilteredMovies(filtered);
    }
  }, [searchQuery, movies]);

  const handleCityChange = (city) => {
    setSelectedCity(city);
    localStorage.setItem('selectedCity', city);
  };

  // ✅ FIXED: Allow both guests & logged-in users to view shows freely
  const handleBookTickets = (movieId) => {
    navigate(`/shows/${movieId}?city=${selectedCity}`);
  };

  const safeList = Array.isArray(filteredMovies) ? filteredMovies : [];

  // Dynamic Slick Carousel settings based on movie count
  const sliderSettings = {
    dots: false,
    infinite: safeList.length > 4,
    speed: 500,
    slidesToShow: Math.min(4, Math.max(1, safeList.length)),
    slidesToScroll: 1,
    autoplay: safeList.length > 4,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: Math.min(3, safeList.length || 1) } },
      { breakpoint: 768, settings: { slidesToShow: Math.min(2, safeList.length || 1) } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ]
  };

  const handleImageError = (e) => {
    e.target.src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80";
  };

  return (
    <div className="bg-light min-vh-100">
      <Navbar />

      {/* 🏙️ CITY SELECTOR & SEARCH SUB-HEADER */}
      <div className="bg-dark text-white py-3 shadow-sm mb-4">
        <div className="container d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
          
          <div className="d-flex align-items-center">
            <i className="bi bi-geo-alt-fill text-danger fs-5 me-2"></i>
            <span className="me-2 fw-semibold">City:</span>
            <select 
              className="form-select form-select-sm bg-secondary text-white border-0 fw-bold"
              style={{ width: '150px', cursor: 'pointer' }}
              value={selectedCity}
              onChange={(e) => handleCityChange(e.target.value)}
            >
              {CITIES.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div className="w-100" style={{ maxWidth: '450px' }}>
            <div className="input-group">
              <span className="input-group-text bg-white border-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-0 shadow-none"
                placeholder="Search for Movies, Genres, Languages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container my-4">
        {loading && (
          <div className="text-center my-5 py-5">
            <div className="spinner-border text-danger" role="status"></div>
            <p className="mt-2 text-muted">Fetching latest movies in {selectedCity}...</p>
          </div>
        )}

        {error && <div className="alert alert-danger shadow-sm">{error}</div>}

        {!loading && !error && safeList.length === 0 && (
          <div className="alert alert-warning text-center py-4 rounded-3">
            <h5>No movies currently scheduled in {selectedCity}</h5>
            <p className="mb-0 text-muted">Try selecting another city or search for a different keyword.</p>
          </div>
        )}

        {/* 🎬 RECOMMENDED MOVIES DISPLAY */}
        {!loading && !error && safeList.length > 0 && (
          <div className="mb-5">
            <h3 className="fw-bold mb-3">🔥 Recommended Movies in {selectedCity}</h3>

            {safeList.length >= 4 ? (
              <Slider {...sliderSettings}>
                {safeList.map((movie) => (
                  <div key={movie._id} className="px-2">
                    <MovieCard movie={movie} handleImageError={handleImageError} handleBookTickets={handleBookTickets} />
                  </div>
                ))}
              </Slider>
            ) : (
              <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-4">
                {safeList.map((movie) => (
                  <div key={movie._id} className="col">
                    <MovieCard movie={movie} handleImageError={handleImageError} handleBookTickets={handleBookTickets} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

// Reusable Movie Card Component
const MovieCard = ({ movie, handleImageError, handleBookTickets }) => (
  <div className="card border-0 shadow-sm h-100 rounded-3 overflow-hidden">
    <img 
      src={movie.posterUrl} 
      onError={handleImageError}
      className="card-img-top" 
      alt={movie.title || 'Movie'}
      style={{ height: '360px', objectFit: 'cover' }}
    />
    <div className="card-body d-flex flex-column justify-content-between p-3">
      <div>
        <h6 className="fw-bold text-truncate mb-1">{movie.title}</h6>
        <div className="mb-2">
          <span className="badge bg-secondary me-1">{movie.genre || 'Action'}</span>
          <span className="badge bg-dark me-1">{movie.language || 'Hindi'}</span>
        </div>
        <p className="text-muted small text-truncate mb-0">{movie.description}</p>
      </div>
      
      <button 
        className="btn btn-danger btn-sm w-100 fw-semibold mt-3"
        onClick={() => handleBookTickets(movie._id)}
      >
        Book Tickets
      </button>
    </div>
  </div>
);

export default Home;