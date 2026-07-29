import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import axiosClient from '../api/axiosClient';

import AddMovieForm from '../components/admin/AddMovieForm';
import AddTheaterForm from '../components/admin/AddTheaterForm';
import AddShowForm from '../components/admin/AddShowForm';
import ManageShows from '../components/admin/ManageShows'; // 👈 Check import

const Admin = () => {
  const [activeTab, setActiveTab] = useState('shows'); 
  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [movieRes, theaterRes] = await Promise.all([
        axiosClient.get('/movies/get-all'),
        axiosClient.get('/theaters/get-all')
      ]);

      if (movieRes.data?.data) setMovies(movieRes.data.data);
      else if (Array.isArray(movieRes.data)) setMovies(movieRes.data);

      if (theaterRes.data?.data) setTheaters(theaterRes.data.data);
      else if (Array.isArray(theaterRes.data)) setTheaters(theaterRes.data);
    } catch (err) {
      console.warn('Error fetching movies or theaters list:', err);
    }
  };

  return (
    <div className="bg-light min-vh-100">
      <Navbar />

      <div className="container my-4">
        <h2 className="fw-bold mb-4">🛠️ Admin Control Dashboard</h2>

        {/* Tab Selection Bar */}
        <ul className="nav nav-pills mb-4 bg-white p-2 rounded shadow-sm gap-2">
          <li className="nav-item">
            <button
              className={`nav-link fw-semibold ${activeTab === 'shows' ? 'active bg-danger' : 'text-dark'}`}
              onClick={() => { setActiveTab('shows'); setMessage({ type: '', text: '' }); }}
            >
              🎟️ Add Showtimes
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link fw-semibold ${activeTab === 'movies' ? 'active bg-danger' : 'text-dark'}`}
              onClick={() => { setActiveTab('movies'); setMessage({ type: '', text: '' }); }}
            >
              🎬 Add Movie
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link fw-semibold ${activeTab === 'theaters' ? 'active bg-danger' : 'text-dark'}`}
              onClick={() => { setActiveTab('theaters'); setMessage({ type: '', text: '' }); }}
            >
              🏛️ Add Theater
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link fw-semibold ${activeTab === 'manageShows' ? 'active bg-danger' : 'text-dark'}`}
              onClick={() => { setActiveTab('manageShows'); setMessage({ type: '', text: '' }); }}
            >
              📋 Manage / Delete Shows
            </button>
          </li>
        </ul>

        {/* Status Alerts */}
        {message.text && (
          <div className={`alert alert-${message.type} alert-dismissible fade show shadow-sm`} role="alert">
            {message.text}
            <button
              type="button"
              className="btn-close"
              onClick={() => setMessage({ type: '', text: '' })}
            ></button>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'shows' && (
          <AddShowForm movies={movies} theaters={theaters} setMessage={setMessage} />
        )}

        {activeTab === 'movies' && (
          <AddMovieForm onMovieAdded={fetchInitialData} setMessage={setMessage} />
        )}

        {activeTab === 'theaters' && (
          <AddTheaterForm onTheaterAdded={fetchInitialData} setMessage={setMessage} />
        )}

        {activeTab === 'manageShows' && (
          <ManageShows setMessage={setMessage} />
        )}

      </div>
    </div>
  );
};

export default Admin;