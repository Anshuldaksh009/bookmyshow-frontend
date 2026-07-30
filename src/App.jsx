import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // 👈 You are likely missing this line!
// 🎯 Matched exact casing from your GitHub repository:
import Login from './pages/login.jsx';
import Home from './pages/home.jsx';
import Shows from './pages/show.jsx';
import Admin from './pages/Admin.jsx';
import SeatSelect from './pages/SeatSelect.jsx';
import Signup from './pages/Signup.jsx';
import MyBookings from './pages/MyBookings.jsx';

function App() {
  return (
    <Router>
      <Routes>
        {/* 🌍 1. PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/shows/:movieId" element={<Shows />} />
        <Route path="/book-seats/:showId" element={<SeatSelect />} />

        {/* 🔒 2. PROTECTED USER ROUTES */}
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
