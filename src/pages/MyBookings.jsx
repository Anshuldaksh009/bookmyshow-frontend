import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import Navbar from '../components/Navbar';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchBookings();
  }, []);
const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      let userId = null;

      // 1. Try to get it from local storage user object
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        userId = user._id || user.id;
      } catch (e) { console.warn("No user object in local storage"); }

      // 2. 🚀 BULLETPROOF FALLBACK: Decode the JWT Token to get the ID!
      if (!userId && token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.userId || payload.id || payload._id;
      }

      if (!userId || !token) {
        console.error("Missing User ID or Token");
        setLoading(false);
        return;
      }

      const endpoint = `/booking/get-user-booking/${userId}`;
      const res = await axiosClient.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data?.success) {
        setBookings(res.data.data || res.data.bookings || []);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this ticket? Seats will be released.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token'); // 👈 Grab token for cancellation too
      
      // 🎯 FIXED URL: Singular '/booking/'
      const res = await axiosClient.post('/booking/cancel-booking', {
        bookingId,
        userId: user._id || user.id,
      }, {
        headers: { Authorization: `Bearer ${token}` } // 🎯 FIXED HEADER
      });

      if (res.data?.success) {
        alert('🎟️ Ticket cancelled successfully!');
        fetchBookings(); // Refresh tickets list
      } else {
        alert(res.data?.message || 'Failed to cancel booking.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error cancelling booking.');
    }
  };

  return (
    <div className="bg-light min-vh-100">
      <Navbar />

      <div className="container py-4">
        <h3 className="fw-bold mb-4">🎟️ My Booked Tickets</h3>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="card border-0 shadow-sm p-5 text-center rounded-3">
            <h5 className="text-secondary fw-bold mb-2">No Bookings Found</h5>
            <p className="text-muted small">You haven't booked any movie tickets yet.</p>
          </div>
        ) : (
          <div className="row g-4">
            {bookings.map((b) => {
              const show = b.show;
              const movie = show?.movie;
              const theater = show?.theater;
              const status = b.status || 'BOOKED';
              const isCancelled = status === 'CANCELLED';

              // 🎯 Fixed Date Comparison: Create clean start-of-today object
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const showDate = show?.date ? new Date(show.date) : null;
              const isExpired = showDate ? showDate < today : false;

              return (
                <div key={b._id} className="col-md-6 col-lg-4">
                  <div className={`card border-0 shadow-sm rounded-3 overflow-hidden ${isCancelled ? 'opacity-75' : ''}`}>
                    <div className="bg-dark text-white p-3 d-flex justify-content-between align-items-center">
                      <span className="fw-bold text-capitalize text-truncate me-2" style={{ maxWidth: '180px' }}>
                        {movie?.title || 'Movie'}
                      </span>
                      <span className={`badge ${isCancelled ? 'bg-secondary' : 'bg-success'}`}>
                        {status}
                      </span>
                    </div>

                    <div className="card-body p-3">
                      <p className="small text-muted mb-1">
                        🏛️ <strong>Theater:</strong> {theater?.name || 'N/A'} {theater?.city ? `(${theater.city})` : ''}
                      </p>
                      <p className="small text-muted mb-1">
                        📅 <strong>Date:</strong> {showDate ? showDate.toLocaleDateString() : 'N/A'}
                      </p>
                      <p className="small text-muted mb-1">
                        ⏰ <strong>Time:</strong> {show?.time || 'N/A'}
                      </p>
                      <p className="small text-danger fw-bold mb-2">
                        🪑 <strong>Seats:</strong> {Array.isArray(b.seats) ? b.seats.join(', ') : 'N/A'}
                      </p>

                      <div className="d-flex justify-content-between align-items-center border-top pt-2">
                        <span className="fw-bold fs-6">₹{b.totalAmount || 0}</span>
                        <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                          Txn: {b.transactionId || b._id?.substring(0, 8)}
                        </small>
                      </div>
                    </div>

                    {!isCancelled && !isExpired && (
                      <div className="card-footer bg-white border-0 text-end pb-3 pt-0">
                        <button
                          className="btn btn-outline-danger btn-sm fw-semibold"
                          onClick={() => handleCancelBooking(b._id)}
                        >
                          Cancel Booking
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;