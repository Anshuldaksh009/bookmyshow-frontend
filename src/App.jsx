import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
// If your files have .jsx extensions, make sure the path matches exact filename casing:
import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx';
import Shows from './pages/Show.jsx';
import Admin from './pages/Admin.jsx';
import SeatSelect from './pages/SeatSelect.jsx';
import Signup from './pages/Signup.jsx';
import MyBookings from './pages/MyBookings.jsx';

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