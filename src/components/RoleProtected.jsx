import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function RoleProtected({ children, allowedRoles }) {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkRole = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/v1/user/role", {
          withCredentials: true
        });
        
        if (response.data.httpStatus === "OK") {
          setUserRole(response.data.data.role);
        }
      } catch (error) {
        console.error("Error checking role:", error);
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on role
    const redirectPath = userRole === "ADMIN" ? "/admin/dashboard" : "/employee/dashboard";
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return children;
} 