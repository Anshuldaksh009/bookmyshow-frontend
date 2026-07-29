import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';

const ManageShows = ({ setMessage }) => {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedShowToDelete, setSelectedShowToDelete] = useState(null);

  // 🔍 Filter States
  const [selectedMovieFilter, setSelectedMovieFilter] = useState('');
  const [selectedCityFilter, setSelectedCityFilter] = useState('');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('');

  useEffect(() => {
    fetchShows();
  }, []);

  const fetchShows = async () => {
    try {
      setLoading(true);
      let res;
      try {
        res = await axiosClient.get('/shows/get-all-shows');
      } catch (e) {
        res = await axiosClient.get('/shows/get-all');
      }

      if (res.data?.success) {
        setShows(res.data.data);
      } else if (Array.isArray(res.data)) {
        setShows(res.data);
      }
    } catch (err) {
      console.error('Error fetching shows:', err);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteShow = async () => {
    const showId = selectedShowToDelete?._id || selectedShowToDelete?.id;

    if (!showId) {
      setMessage({ type: 'danger', text: 'Invalid show selected for deletion.' });
      return;
    }

    try {
      const res = await axiosClient.delete(`/shows/delete-show/${showId}`);

      if (res.data?.success) {
        setMessage({
          type: 'success',
          text: `🗑️ Showtime for "${selectedShowToDelete.movie?.title || 'Show'}" deleted successfully!`
        });
        setSelectedShowToDelete(null); // Close modal
        fetchShows(); // Refresh list
      } else {
        setMessage({ type: 'danger', text: res.data?.message || 'Failed to delete show.' });
      }
    } catch (err) {
      console.error("Delete error:", err);
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Error deleting show.'
      });
    }
  };

  // 🎯 Extract Unique Dropdown Options
  const uniqueMovies = Array.from(
    new Set(shows.map((s) => s.movie?.title).filter(Boolean))
  );
  const uniqueCities = Array.from(
    new Set(shows.map((s) => s.theater?.city).filter(Boolean))
  );
  const uniqueTimes = Array.from(
    new Set(shows.map((s) => s.time).filter(Boolean))
  );

  // ⚡ Filtered Shows Logic
  const filteredShows = shows.filter((s) => {
    const matchesMovie = selectedMovieFilter
      ? s.movie?.title?.toLowerCase() === selectedMovieFilter.toLowerCase()
      : true;

    const matchesCity = selectedCityFilter
      ? s.theater?.city?.toLowerCase() === selectedCityFilter.toLowerCase()
      : true;

    const matchesTime = selectedTimeFilter
      ? s.time?.toLowerCase() === selectedTimeFilter.toLowerCase()
      : true;

    return matchesMovie && matchesCity && matchesTime;
  });

  return (
    <div className="card border-0 shadow-sm p-4 rounded-3">
      <h4 className="fw-bold mb-3">Manage & Delete Show Slots</h4>

      {/* 🔍 FILTER BAR */}
      <div className="bg-light p-3 rounded-3 mb-4 border">
        <div className="row g-3">
          {/* Movie Filter */}
          <div className="col-md-4">
            <label className="form-label small fw-bold text-muted">Filter by Movie</label>
            <select
              className="form-select form-select-sm"
              value={selectedMovieFilter}
              onChange={(e) => setSelectedMovieFilter(e.target.value)}
            >
              <option value="">All Movies ({uniqueMovies.length})</option>
              {uniqueMovies.map((title) => (
                <option key={title} value={title}>
                  {title}
                </option>
              ))}
            </select>
          </div>

          {/* City Filter */}
          <div className="col-md-4">
            <label className="form-label small fw-bold text-muted">Filter by City</label>
            <select
              className="form-select form-select-sm"
              value={selectedCityFilter}
              onChange={(e) => setSelectedCityFilter(e.target.value)}
            >
              <option value="">All Cities ({uniqueCities.length})</option>
              {uniqueCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Time Filter */}
          <div className="col-md-4">
            <label className="form-label small fw-bold text-muted">Filter by Show Time</label>
            <select
              className="form-select form-select-sm"
              value={selectedTimeFilter}
              onChange={(e) => setSelectedTimeFilter(e.target.value)}
            >
              <option value="">All Time Slots</option>
              {uniqueTimes.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(selectedMovieFilter || selectedCityFilter || selectedTimeFilter) && (
          <div className="mt-2 text-end">
            <button
              className="btn btn-link btn-sm text-danger text-decoration-none p-0 fw-semibold"
              onClick={() => {
                setSelectedMovieFilter('');
                setSelectedCityFilter('');
                setSelectedTimeFilter('');
              }}
            >
              🔄 Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* TABLE DISPLAY */}
      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-danger" role="status"></div>
        </div>
      ) : filteredShows.length === 0 ? (
        <div className="alert alert-warning text-center py-3 m-0">
          No show slots match your selected filters.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-dark">
              <tr>
                <th>Movie</th>
                <th>Theater & City</th>
                <th>Date & Time</th>
                <th>Price</th>
                <th>Bookings</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredShows.map((show) => {
                const showDate = show.date ? new Date(show.date).toLocaleDateString() : 'N/A';
                const bookedCount = show.bookedSeats?.length || 0;

                return (
                  <tr key={show._id}>
                    <td className="fw-bold text-capitalize">{show.movie?.title || 'N/A'}</td>
                    <td>
                      <div>{show.theater?.name || 'N/A'}</div>
                      <small className="text-muted">{show.theater?.city}</small>
                    </td>
                    <td>
                      <div>📅 {showDate}</div>
                      <small className="text-danger fw-semibold">⏰ {show.time}</small>
                    </td>
                    <td>₹{show.ticketPrice}</td>
                    <td>
                      <span className={`badge ${bookedCount > 0 ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                        {bookedCount} / {show.totalSeats || 80}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-outline-danger btn-sm fw-bold"
                        onClick={() => setSelectedShowToDelete(show)}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 🛑 CONFIRMATION MODAL */}
      {selectedShowToDelete && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title fw-bold">⚠️ Confirm Show Deletion</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedShowToDelete(null)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <p className="fw-semibold">Are you sure you want to delete this show slot?</p>
                <div className="bg-light p-3 rounded border">
                  <div className="mb-1"><strong>🎬 Movie:</strong> {selectedShowToDelete.movie?.title}</div>
                  <div className="mb-1"><strong>🏛️ Theater:</strong> {selectedShowToDelete.theater?.name} ({selectedShowToDelete.theater?.city})</div>
                  <div className="mb-1"><strong>📅 Date:</strong> {new Date(selectedShowToDelete.date).toLocaleDateString()}</div>
                  <div className="mb-1"><strong>⏰ Time:</strong> {selectedShowToDelete.time}</div>
                  <div><strong>🎟️ Price:</strong> ₹{selectedShowToDelete.ticketPrice}</div>
                </div>
              </div>
              <div className="modal-footer bg-light">
                <button
                  type="button"
                  className="btn btn-secondary fw-semibold"
                  onClick={() => setSelectedShowToDelete(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger fw-bold"
                  onClick={confirmDeleteShow}
                >
                  Yes, Delete Show
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageShows;