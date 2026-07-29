import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import Navbar from '../components/Navbar';

const SeatSelect = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Payment Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  useEffect(() => {
    fetchShowDetails();
  }, [showId]);

  // 1. Fetch Show Details (Including Booked Seats from Mongo)
  const fetchShowDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axiosClient.get(`/shows/get-show-by-id/${showId}`);
      if (res.data?.success) {
        setShow(res.data.data);
      } else {
        setError('Failed to fetch show details.');
      }
    } catch (err) {
      console.error('Error fetching show details:', err);
      setError(err.response?.data?.message || 'Error loading show details.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Local Seat Selection Toggle Handler
  const handleSeatClick = (seatId) => {
    if (show?.bookedSeats?.includes(seatId)) return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatId));
    } else {
      if (selectedSeats.length >= 10) {
        alert('You can select a maximum of 10 seats per booking.');
        return;
      }
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const totalAmount = selectedSeats.length * (show?.ticketPrice || 0);
// 3. Trigger Payment Modal or Redirect to Login if guest user
const handleProceedToPay = () => {
  const token = localStorage.getItem('token');
  
  // Check if user is logged in
  if (!token) {
    alert('Please log in to complete your ticket booking.');
    
    // 👈 This line executes as soon as the user clicks "OK" on the alert
    navigate('/login', { state: { from: location } });
    return;
  }

  setShowPaymentModal(true);
};

  // 4. Confirm Payment & Complete Booking Request
  const handleConfirmPayment = async () => {
    if (selectedSeats.length === 0) return;

    try {
      setPaymentProcessing(true);

      const payload = {
        showId: show._id,
        seats: selectedSeats,
        totalAmount,
        transactionId: `PAY_${Math.floor(100000 + Math.random() * 900000)}`,
      };

      const res = await axiosClient.post('/bookings/make-booking', payload);

      if (res.data?.success) {
        setSelectedSeats([]);
        await fetchShowDetails();
        setShowPaymentModal(false);
        navigate('/my-bookings');
      } else {
        alert(res.data?.message || 'Booking failed.');
      }
    } catch (err) {
      console.error('Payment Error:', err);
      alert(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const seatsPerRow = 10;

  if (loading) {
    return (
      <div className="bg-light min-vh-100">
        <Navbar />
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status"></div>
          <p className="mt-2 text-muted small">Loading seating layout...</p>
        </div>
      </div>
    );
  }

  if (error || !show) {
    return (
      <div className="bg-light min-vh-100">
        <Navbar />
        <div className="container py-5 text-center">
          <div className="alert alert-danger shadow-sm">{error || 'Show details not found.'}</div>
          <button className="btn btn-outline-danger fw-bold" onClick={() => navigate(-1)}>
            👈 Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 pb-5">
      <Navbar />

      {/* 🎬 SHOW HEADER BANNER */}
      <div className="bg-dark text-white py-3 shadow-sm mb-4">
        <div className="container d-flex flex-column flex-md-row justify-content-between align-items-md-center">
          <div>
            <h4 className="fw-bold text-capitalize m-0">{show.movie?.title}</h4>
            <p className="small text-white-50 m-0 mt-1">
              🏛️ {show.theater?.name} ({show.theater?.city}) | 📅{' '}
              {new Date(show.date).toLocaleDateString()} | ⏰ {show.time}
            </p>
          </div>
          <div className="mt-2 mt-md-0">
            <span className="badge bg-danger fs-6">
              Price: ₹{show.ticketPrice} <small className="fw-normal">/ seat</small>
            </span>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="card border-0 shadow-sm p-4 rounded-3 text-center mb-5">
          {/* 🍿 CINEMA SCREEN HEADER */}
          <div className="mb-4">
            <div
              className="mx-auto border-top border-3 border-danger rounded-top shadow-sm mb-2"
              style={{
                height: '14px',
                width: '75%',
                background: 'linear-gradient(to bottom, rgba(220, 53, 69, 0.15), transparent)',
              }}
            ></div>
            <small className="text-muted text-uppercase tracking-wide">
              SCREEN THIS WAY 🍿
            </small>
          </div>

          {/* 🏷️ LEGEND BAR */}
          <div className="d-flex justify-content-center gap-4 mb-4 flex-wrap">
            <div className="d-flex align-items-center gap-2">
              <div
                className="border rounded bg-white"
                style={{ width: '22px', height: '22px' }}
              ></div>
              <span className="small text-muted fw-semibold">Available</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded bg-success"
                style={{ width: '22px', height: '22px' }}
              ></div>
              <span className="small text-muted fw-semibold">Selected</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded bg-secondary opacity-50"
                style={{ width: '22px', height: '22px' }}
              ></div>
              <span className="small text-muted fw-semibold">Sold Out</span>
            </div>
          </div>

          {/* 🪑 SEAT MATRIX GRID */}
          <div className="d-inline-block mx-auto overflow-x-auto pb-2">
            {rows.map((row) => (
              <div key={row} className="d-flex align-items-center justify-content-center gap-2 mb-2">
                <span className="fw-bold text-muted me-2" style={{ width: '20px' }}>
                  {row}
                </span>
                <div className="d-flex gap-2">
                  {Array.from({ length: seatsPerRow }, (_, i) => i + 1).map((col) => {
                    const seatId = `${row}${col}`;
                    const isBooked = show.bookedSeats?.includes(seatId);
                    const isSelected = selectedSeats.includes(seatId);

                    let btnStyle = 'btn-outline-secondary bg-white text-dark';
                    if (isBooked) btnStyle = 'btn-secondary opacity-50 text-white cursor-not-allowed';
                    else if (isSelected) btnStyle = 'btn-success text-white shadow-sm fw-bold';

                    return (
                      <button
                        key={seatId}
                        disabled={isBooked}
                        onClick={() => handleSeatClick(seatId)}
                        className={`btn btn-sm rounded-2 transition-all ${btnStyle}`}
                        style={{
                          width: '36px',
                          height: '36px',
                          fontSize: '0.75rem',
                          border: isBooked || isSelected ? 'none' : '1px solid #ced4da',
                        }}
                      >
                        {col}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 💳 FLOATING BOTTOM CHECKOUT BAR */}
      {selectedSeats.length > 0 && (
        <div className="fixed-bottom bg-white border-top shadow-lg py-3">
          <div className="container d-flex align-items-center justify-content-between">
            <div>
              <div className="small text-muted">Selected Seats:</div>
              <div className="fw-bold text-danger">{selectedSeats.join(', ')}</div>
            </div>

            <div className="d-flex align-items-center gap-3">
              <div className="text-end">
                <div className="small text-muted">Total Price</div>
                <div className="fs-5 fw-bold text-dark">₹{totalAmount}</div>
              </div>

              <button
                className="btn btn-danger btn-lg px-4 fw-bold shadow-sm"
                onClick={handleProceedToPay}
              >
                Pay ₹{totalAmount}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 💳 DUMMY PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title fw-bold">💳 Payment Checkout</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowPaymentModal(false)}
                ></button>
              </div>

              <div className="modal-body p-4 text-start">
                <div className="bg-light p-3 rounded mb-3 border">
                  <div><strong>Movie:</strong> {show.movie?.title}</div>
                  <div><strong>Theater:</strong> {show.theater?.name} ({show.theater?.city})</div>
                  <div><strong>Show Time:</strong> {show.time}</div>
                  <div><strong>Seats:</strong> {selectedSeats.join(', ')} ({selectedSeats.length} seats)</div>
                  <div className="fs-5 fw-bold text-danger mt-2">Total Amount: ₹{totalAmount}</div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold">Card Number</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="4111 2222 3333 4444"
                    defaultValue="4111222233334444"
                  />
                </div>

                <div className="row g-2">
                  <div className="col-6">
                    <label className="form-label small fw-bold">Expiry</label>
                    <input type="text" className="form-control" defaultValue="12/28" />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold">CVV</label>
                    <input type="password" className="form-control" defaultValue="123" />
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-light">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowPaymentModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger fw-bold px-4"
                  disabled={paymentProcessing}
                  onClick={handleConfirmPayment}
                >
                  {paymentProcessing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Processing...
                    </>
                  ) : (
                    `Confirm & Pay ₹${totalAmount}`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatSelect;