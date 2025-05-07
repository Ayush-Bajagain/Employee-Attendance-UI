import React from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";


export default function Navbar() {

  const navigate = useNavigate();

  const handleLogout = async () => {
    try{
      await axios.post("http://localhost:8080/api/v1/auth/logout", {}, {
        withCredentials:true,
      });

      sessionStorage.clear();
      navigate("/login")


    } catch(error) {
        console.error("Failed to logout....", error);
    }   
  }

  return (
    <>
    
    <nav className="bg-[#2c2c2c] w-[250px] h-dvh p-6 flex flex-col items-center shadow-md">
      <div className="logo mb-10">
        <h2 className="text-[#ddd] font-semibold text-2xl text-center">
          Employee Attendance
        </h2>
      </div>

      <ul className="text-[#ddd] text-lg w-full flex flex-col gap-6">
        <li>
          <Link
            to="/"
            className="hover:text-white transition-colors duration-200"
          >
            Dashboard
          </Link>
        </li>  
        <li>
          <Link
            to="/employee"
            className="hover:text-white transition-colors duration-200"
          >
            Employee
          </Link>
        </li>
        <li>
          <Link
            to="/attendance"
            className="hover:text-white transition-colors duration-200"
          >
            Attendance
          </Link>
        </li>
        <li>
          <Link
            to="/report"
            className="hover:text-white transition-colors duration-200"
          >
            Report
          </Link>
        </li>
        <li>
          <button
            onClick={handleLogout}
            className="hover:text-red-400 transition-colors duration-200"
          >
            Logout
          </button>
        </li>
      </ul>
    </nav>
    </>
  );
}
