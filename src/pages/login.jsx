import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // 🎯 Determine where to redirect after successful login
  // If user came from SeatSelect (e.g., /book-seats/123), return them there. Otherwise go Home ('/').
  const fromState = location.state?.from;
  const redirectTo = fromState?.pathname ? `${fromState.pathname}${fromState.search || ''}` : '/';

  // Helper function to decode JWT payload safely
  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axiosClient.post('/users/login', { email, password });
      console.log("1. Full Backend Response:", response.data);

      if (response.data.success) {
        const token = response.data.data;
        localStorage.setItem('token', token);

        // Decode token payload
        const decodedToken = parseJwt(token);
        console.log("2. Decoded JWT Payload:", decodedToken);

        const actualRole = decodedToken?.role || response.data.user?.role || 'user';
        console.log("3. Extracted Role:", actualRole);

        localStorage.setItem('userRole', actualRole);

        // 🚀 Dynamic Redirect: Back to seat selection page or Home
        navigate(redirectTo, { replace: true });
      } else {
        setError(response.data?.message || 'Login failed.');
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.response?.data?.message || 'Invalid login credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow p-4" style={{ width: '400px' }}>
        <h3 className="text-center mb-4 text-danger fw-bold">🎬 BookMyShow Login</h3>

        {error && <div className="alert alert-danger py-2 small">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label fw-semibold small">Email Address</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold small">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-danger w-100 mt-2 fw-bold"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-3 pt-3 border-top">
          <p className="text-muted small mb-0">
            Don't have an account?{' '}
            <Link to="/signup" className="text-danger fw-bold text-decoration-none">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;