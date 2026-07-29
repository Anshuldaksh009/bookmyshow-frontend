import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import Navbar from '../components/Navbar';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    otp: ''
  });

  const [step, setStep] = useState(1); // 1 = Details Input, 2 = OTP Input
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 1. STEP 1: Request OTP from backend
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match.');
    }

    try {
      setLoading(true);
      const res = await axiosClient.post('/users/send-otp', {
        email: formData.email
      });

      if (res.data?.success) {
        setSuccess(`📩 Verification code sent to ${formData.email}`);
        setStep(2); // Switch to OTP view
      } else {
        setError(res.data?.message || 'Failed to send OTP.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 2. STEP 2: Verify OTP & Complete Registration
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.otp || formData.otp.length !== 6) {
      return setError('Please enter a valid 6-digit OTP.');
    }

    try {
      setLoading(true);
      const res = await axiosClient.post('/users/register-with-otp', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        otp: formData.otp
      });

      if (res.data?.success) {
        setSuccess('🎉 Account created successfully! Redirecting to login...');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setError(res.data?.message || 'OTP verification failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error verifying OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-light min-vh-100">
      <Navbar />

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 p-4">
              <h3 className="fw-bold text-center text-danger mb-3">Sign Up</h3>

              {error && <div className="alert alert-danger py-2 small">{error}</div>}
              {success && <div className="alert alert-success py-2 small">{success}</div>}

              {/* STEP 1: USER DETAILS FORM */}
              {step === 1 && (
                <form onSubmit={handleSendOtp}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      required
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Email</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      required
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Password</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      required
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="form-control"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label small fw-semibold">Account Role</label>
                    <select
                      name="role"
                      className="form-select"
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-danger w-100 fw-bold py-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>Sending OTP...
                      </>
                    ) : (
                      'Send Verification OTP ➔'
                    )}
                  </button>
                </form>
              )}

              {/* STEP 2: OTP VERIFICATION FORM */}
              {step === 2 && (
                <form onSubmit={handleVerifyAndRegister}>
                  <div className="mb-4 text-center">
                    <p className="small text-muted mb-2">
                      Enter the 6-digit verification code sent to <br />
                      <strong className="text-dark">{formData.email}</strong>
                    </p>

                    <input
                      type="text"
                      name="otp"
                      maxLength="6"
                      className="form-control form-control-lg text-center fw-bold fs-3 mt-2"
                      placeholder="000000"
                      style={{ letterSpacing: '8px' }}
                      required
                      value={formData.otp}
                      onChange={handleChange}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-success w-100 fw-bold py-2 mb-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>Verifying...
                      </>
                    ) : (
                      'Verify OTP & Complete Registration 🎉'
                    )}
                  </button>

                  <button
                    type="button"
                    className="btn btn-link w-100 text-secondary text-decoration-none small"
                    onClick={() => {
                      setStep(1);
                      setError('');
                      setSuccess('');
                    }}
                  >
                    ← Edit Registration Details
                  </button>
                </form>
              )}

              {/* 🔄 Switch to Login */}
              <div className="text-center mt-3 pt-3 border-top">
                <p className="text-muted small mb-0">
                  Already have an account?{' '}
                  <Link to="/login" className="text-danger fw-bold text-decoration-none">
                    Log In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;