import React, { useState } from 'react';
import axiosClient from '../../api/axiosClient';

const AddTheaterForm = ({ onTheaterAdded, setMessage }) => {
  const [theaterForm, setTheaterForm] = useState({
    name: '',
    address: '',
    city: 'Bhopal',
    phone: '',
    totalSeats: 80
  });

  const handleAddTheater = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      const res = await axiosClient.post('/theaters/add', theaterForm);
      if (res.data?.success) {
        setMessage({ type: 'success', text: '🏛️ Theater added successfully!' });
        setTheaterForm({ name: '', address: '', city: 'Bhopal', phone: '', totalSeats: 80 });
        if (onTheaterAdded) onTheaterAdded();
      } else {
        setMessage({ type: 'danger', text: res.data?.message || 'Failed to add theater.' });
      }
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Error adding theater.' });
    }
  };

  return (
    <div className="card border-0 shadow-sm p-4 rounded-3">
      <h4 className="fw-bold mb-3">Add Partner Cinema Theater</h4>
      <form onSubmit={handleAddTheater}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label fw-semibold">Theater Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. PVR Grand Mall"
              required
              value={theaterForm.name}
              onChange={(e) => setTheaterForm({ ...theaterForm, name: e.target.value })}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-semibold">City</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Bhopal, Panipat, Pune"
              required
              value={theaterForm.city}
              onChange={(e) => setTheaterForm({ ...theaterForm, city: e.target.value })}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-semibold">Address</label>
            <input
              type="text"
              className="form-control"
              placeholder="Street / Sector name"
              required
              value={theaterForm.address}
              onChange={(e) => setTheaterForm({ ...theaterForm, address: e.target.value })}
            />
          </div>

          <div className="col-md-3">
            <label className="form-label fw-semibold">Phone Number</label>
            <input
              type="number"
              className="form-control"
              placeholder="9876543210"
              required
              value={theaterForm.phone}
              onChange={(e) => setTheaterForm({ ...theaterForm, phone: e.target.value })}
            />
          </div>

          <div className="col-md-3">
            <label className="form-label fw-semibold">Total Seats</label>
            <input
              type="number"
              className="form-control"
              required
              value={theaterForm.totalSeats}
              onChange={(e) => setTheaterForm({ ...theaterForm, totalSeats: Number(e.target.value) })}
            />
          </div>

          <div className="col-12 mt-3">
            <button type="submit" className="btn btn-danger fw-bold px-4">
              Save Theater
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddTheaterForm;