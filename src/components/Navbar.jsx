import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { 
  MdDashboard, 
  MdPeople, 
  MdAccessTime, 
  MdAssessment,
  MdLogout,
  MdMenu,
  MdClose,
  MdPerson,
  MdEventNote
} from "react-icons/md";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/v1/user/role", {
          withCredentials: true
        });
        
        if (response.data.httpStatus === "OK") {
          setUserRole(response.data.data.role);
          setUserEmail(response.data.data.email);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    fetchUserRole();
  }, []);

  // Add click outside handler for profile menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.profile-menu-button') && !event.target.closest('.profile-menu')) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:8080/api/v1/auth/logout", {}, {
        withCredentials: true,
      });
      sessionStorage.clear();
      navigate("/login");
    } catch (error) {
      console.error("Failed to logout....", error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getNavItems = () => {
    if (userRole === "ADMIN") {
      return [
        { path: "/admin/dashboard", icon: <MdDashboard size={24} />, label: "Dashboard" },
        { path: "/admin/employees", icon: <MdPeople size={24} />, label: "Employees" },
        { path: "/admin/attendance", icon: <MdAccessTime size={24} />, label: "Attendance" },
        { path: "/admin/leave-requests", icon: <MdEventNote size={24} />, label: "Leave Requests" },
        { path: "/admin/reports", icon: <MdAssessment size={24} />, label: "Reports" },
      ];
    } else if (userRole === "EMPLOYEE") {
      return [
        { path: "/employee/dashboard", icon: <MdDashboard size={24} />, label: "Dashboard" },
        { path: "/employee/attendance", icon: <MdAccessTime size={24} />, label: "Attendance" },
        { path: "/employee/leave-request", icon: <MdEventNote size={24} />, label: "Leave Request" },
        { path: "/employee/reports", icon: <MdAssessment size={24} />, label: "Reports" },
        { path: "/employee/profile", icon: <MdPerson size={24} />, label: "Profile" },
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-b from-slate-800 to-slate-900 shadow-sm z-50 lg:hidden">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <button
            onClick={toggleMenu}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-slate-800"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
          </button>
          <h1 className="text-xl font-semibold text-white">Employee Attendance</h1>
          <div className="w-10"></div> {/* Spacer for balance */}
        </div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 h-full bg-gradient-to-b from-slate-800 to-slate-900 w-[250px] p-6 flex flex-col items-center shadow-lg transition-transform duration-300 ease-in-out z-40
        ${isMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isMenuOpen ? 'top-16' : 'top-0 lg:top-0'}`}>
        <div className="logo mb-6">
          <h2 className="text-slate-100 font-semibold text-2xl text-center">
            Employee Attendance
          </h2>
        </div>

        <ul className="text-slate-300 text-lg w-full flex flex-col gap-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? "bg-indigo-500/80 text-white shadow-md"
                    : "hover:bg-slate-700/50 hover:text-white"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
          {/* Logout Button as part of the main navigation */}
          <li>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2 rounded-lg w-full text-rose-300 hover:bg-rose-500/20 hover:text-rose-200 transition-all duration-200"
            >
              <MdLogout size={24} />
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Overlay for mobile */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" 
          style={{ top: '4rem' }}
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Main Content Wrapper */}
      <div className={`lg:ml-[250px] transition-all duration-300 ${isMenuOpen ? 'ml-[250px]' : 'ml-0'}`}>
        
      </div>
    </>
  );
}
