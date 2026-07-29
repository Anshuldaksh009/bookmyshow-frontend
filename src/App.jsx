import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login'; 
import Home from './pages/Home'; 
import Shows from './pages/Show';
import Admin from './pages/Admin';
import SeatSelect from './pages/SeatSelect';
import Signup from './pages/Signup';
import MyBookings from './pages/MyBookings';

function App() {
  return (
    <Router>
      <Routes>
        {/* 🌍 1. PUBLIC ROUTES (Unprotected browsing for guests and logged-in users) */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/shows/:movieId" element={<Shows />} />
        <Route path="/book-seats/:showId" element={<SeatSelect />} />

        {/* 🔒 2. PROTECTED USER ROUTES (Login required) */}
        <Route element={<ProtectedRoute allowedRoles={['user', 'admin']} />}>
          <Route path="/my-bookings" element={<MyBookings />} />
        </Route>

        {/* 🛡️ 3. PROTECTED ADMIN ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;