import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { 
  MdDashboard, 
  MdPeople, 
  MdAccessTime, 
  MdAssessment,
  MdLogout 
} from "react-icons/md";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/v1/user/role", {
          withCredentials: true
        });
        
        if (response.data.httpStatus === "OK") {
          setUserRole(response.data.data.role);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    fetchUserRole();
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
        { path: "/", icon: <MdDashboard size={24} />, label: "Dashboard" },
        { path: "/employee", icon: <MdPeople size={24} />, label: "Employee" },
        { path: "/report", icon: <MdAssessment size={24} />, label: "Report" },
      ];
    } else if (userRole === "EMPLOYEE") {
      return [
        { path: "/attendance", icon: <MdAccessTime size={24} />, label: "Attendance" },
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  return (
    <nav className="bg-gradient-to-b from-slate-800 to-slate-900 w-[250px] h-dvh p-6 flex flex-col items-center shadow-lg">
      <div className="logo mb-10">
        <h2 className="text-slate-100 font-semibold text-2xl text-center">
          Employee Attendance
        </h2>
      </div>

      <ul className="text-slate-300 text-lg w-full flex flex-col gap-4">
        {navItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
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
        <li className="mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-rose-300 hover:bg-rose-500/20 hover:text-rose-200 transition-all duration-200"
          >
            <MdLogout size={24} />
            <span>Logout</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
