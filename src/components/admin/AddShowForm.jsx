import React, { useState } from 'react';
import axiosClient from '../../api/axiosClient';

const AddShowForm = ({ movies, theaters, setMessage }) => {
  // 🎯 FIX: Get LOCAL date string (YYYY-MM-DD) so it doesn't fall behind in IST mornings
  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const localTodayStr = getLocalDateString();

  const [showForm, setShowForm] = useState({
    name: '',
    movie: '',
    theater: '',
    time: '01:30 PM (Matinee)',
    ticketPrice: 200,
    totalSeats: 80,
    date: localTodayStr,
    endDate: localTodayStr // 👈 Now this will correctly default to July 30!
  });

  const [loading, setLoading] = useState(false);

  const handleAddShow = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    if (Number(showForm.ticketPrice) < 10) {
      setLoading(false);
      return setMessage({ type: 'danger', text: 'Ticket price must be at least ₹10.' });
    }

    if (new Date(showForm.endDate) < new Date(showForm.date)) {
      setLoading(false);
      return setMessage({ type: 'danger', text: 'End date cannot be earlier than start date.' });
    }

    try {
      const selectedMovieObj = movies.find((m) => m._id === showForm.movie);
      const selectedTheaterObj = theaters.find((t) => t._id === showForm.theater);

      const payload = {
        ...showForm,
        name: showForm.name || `${selectedMovieObj?.title || 'Movie'} - ${showForm.time}`,
        totalSeats: showForm.totalSeats || selectedTheaterObj?.totalSeats || 80
      };

      // Ensure this endpoint matches your backend setup!
      const res = await axiosClient.post('/shows/add-show', payload);

      if (res.data?.success) {
        setMessage({ type: 'success', text: '🎟️ Showtime scheduled successfully!' });
        setShowForm({
          name: '',
          movie: '',
          theater: '',
          time: '01:30 PM (Matinee)',
          ticketPrice: 200,
          totalSeats: 80,
          date: localTodayStr,
          endDate: localTodayStr
        });
      } else {
        setMessage({ type: 'danger', text: res.data?.message || 'Failed to schedule show.' });
      }
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Error scheduling show.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card border-0 shadow-sm p-4 rounded-3">
      <h4 className="fw-bold mb-3">Schedule a Show Slot</h4>
      <form onSubmit={handleAddShow}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label fw-semibold">Select Movie</label>
            <select
              className="form-select"
              required
              value={showForm.movie}
              onChange={(e) => setShowForm({ ...showForm, movie: e.target.value })}
            >
              <option value="">-- Choose Movie --</option>
              {movies.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.title} ({m.language})
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label fw-semibold">Select Theater</label>
            <select
              className="form-select"
              required
              value={showForm.theater}
              onChange={(e) => {
                const selTh = theaters.find((t) => t._id === e.target.value);
                setShowForm({
                  ...showForm,
                  theater: e.target.value,
                  totalSeats: selTh?.totalSeats || 80
                });
              }}
            >
              <option value="">-- Choose Theater --</option>
              {theaters.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} - {t.city}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label fw-semibold">Show Time</label>
            <select
              className="form-select"
              value={showForm.time}
              onChange={(e) => setShowForm({ ...showForm, time: e.target.value })}
            >
              <option value="10:00 AM (Morning)">10:00 AM (Morning)</option>
              <option value="01:30 PM (Matinee)">01:30 PM (Matinee)</option>
              <option value="05:00 PM (Evening)">05:00 PM (Evening)</option>
              <option value="07:00 PM (Prime)">07:00 PM (Prime)</option>
              <option value="10:15 PM (Night)">10:15 PM (Night)</option>
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label fw-semibold">Ticket Price (Min ₹10)</label>
            <input
              type="number"
              className="form-control"
              required
              min="10"
              value={showForm.ticketPrice}
              onChange={(e) => setShowForm({ ...showForm, ticketPrice: Number(e.target.value) })}
            />
          </div>

          <div className="col-md-3">
            <label className="form-label fw-semibold">Start Date</label>
            <input
              type="date"
              className="form-control"
              required
              min={localTodayStr}
              value={showForm.date}
              onChange={(e) => setShowForm({ ...showForm, date: e.target.value })}
            />
          </div>

          <div className="col-md-3">
            <label className="form-label fw-semibold">End Date (Required)</label>
            <input
              type="date"
              className="form-control"
              required
              min={showForm.date || localTodayStr}
              value={showForm.endDate}
              onChange={(e) => setShowForm({ ...showForm, endDate: e.target.value })}
            />
          </div>

          <div className="col-12 mt-3">
            <button type="submit" className="btn btn-danger fw-bold px-4" disabled={loading}>
              {loading ? 'Creating Shows...' : 'Create Showtime Slot'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddShowForm;