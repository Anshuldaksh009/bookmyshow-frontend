import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  // 1. If not logged in, boot to login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. If logged in but doesn't have the right role clearance, boot to home page
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  // 3. If passed checks, render the nested page view
  return <Outlet />;
};

export default ProtectedRoute;