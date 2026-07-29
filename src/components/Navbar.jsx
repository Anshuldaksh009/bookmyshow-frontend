import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  // 1. Read token, userRole, and user object directly from localStorage
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole'); // 👈 Captures 'admin' from your storage
  
  let user = {};
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}');
  } catch (err) {
    console.error('Error parsing user object:', err);
  }

  // 2. Check if user is Admin
  const isAdmin = 
    userRole === 'admin' || 
    userRole === 'Admin' || 
    user?.role === 'admin' || 
    user?.isAdmin === true;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4 py-2 shadow-sm">
      <div className="container-fluid">
        {/* BRAND LOGO */}
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold text-danger fs-4" to="/">
          <i className="bi bi-film"></i> BookMyShow
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          {/* LEFT NAV LINKS */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 align-items-lg-center gap-2">
            <li className="nav-item">
              <Link className="nav-link fw-semibold text-white" to="/">
                Home
              </Link>
            </li>

            {/* 🎟️ MY BOOKINGS LINK */}
            {token && (
              <li className="nav-item">
                <Link className="nav-link fw-semibold text-white" to="/my-bookings">
                  🎟️ My Bookings
                </Link>
              </li>
            )}

            {/* 🛡️ ADMIN PANEL LINK */}
            {token && isAdmin && (
              <li className="nav-item">
                <Link className="nav-link fw-semibold text-warning" to="/admin">
                  🛡️ Admin Panel
                </Link>
              </li>
            )}
          </ul>

          {/* RIGHT ACCOUNT / LOGOUT BAR */}
          <div className="d-flex align-items-center gap-3 ms-auto">
            {token ? (
              <>
                <span className="text-light small">
                  👤 Logged in as:{' '}
                  <strong className="text-info text-capitalize">
                    {user?.name || (isAdmin ? 'Admin' : 'User')}
                  </strong>
                </span>

                <button
                  className="btn btn-outline-danger btn-sm fw-bold px-3"
                  onClick={handleLogout}
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-light btn-sm fw-semibold px-3">
                  Login
                </Link>
                <Link to="/signup" className="btn btn-danger btn-sm fw-bold px-3">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;