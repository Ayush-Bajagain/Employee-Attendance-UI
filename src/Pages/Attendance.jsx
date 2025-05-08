import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaClock, FaSignInAlt, FaSignOutAlt, FaCalendarAlt, FaUserClock, FaEllipsisV } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Attendance = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);
  const url = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    fetchAttendanceRecords();

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = (id, event) => {
    if (openDropdownId === id) {
      setOpenDropdownId(null);
    } else {
      const buttonRect = event.currentTarget.getBoundingClientRect();
      const dropdownWidth = 280; // Increased width for better text display
      const spaceOnRight = window.innerWidth - buttonRect.right;
      
      // Calculate position to ensure dropdown stays within viewport
      let left = buttonRect.left;
      if (spaceOnRight < dropdownWidth) {
        left = buttonRect.left - dropdownWidth + buttonRect.width;
      }
      
      setDropdownPosition({
        top: buttonRect.bottom + window.scrollY + 5,
        left: left
      });
      setOpenDropdownId(id);
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      const response = await axios.get(`${url}/attendance/getAll`, {
        withCredentials: true,
      });
      
      if (response.data.code === 200) {
        // Map only essential details from the response
        const formattedRecords = response.data.data.map(record => ({
          id: record.id,
          date: record.attendanceDate,
          checkIn: record.checkInTime,
          checkOut: record.checkOutTime,
          status: record.status
        }));
        setAttendanceRecords(formattedRecords);
      } else {
        toast.error(response.data.message || "Failed to fetch attendance records");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch attendance records";
      toast.error(errorMessage);
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);

    try {
      const response = await axios.post(`${url}/attendance/check-in`, {}, {
        withCredentials: true,
      });

      if (response.data.code === 200) {
        const responseMessage = response.data.message;
        toast.success(responseMessage);
        fetchAttendanceRecords();
      } else {
        const errorMessage = response.data.message || "Check-in failed";
        toast.error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Check-in failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);

    try {
      const response = await axios.post(`${url}/attendance/checkout`, {}, {
        withCredentials: true,
      });

      if (response.data.code === 200) {
        const responseMessage = response.data.message;
        toast.success(responseMessage);
        fetchAttendanceRecords();
      } else {
        const errorMessage = response.data.message || "Check-out failed";
        toast.error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Check-out failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatDateOnly = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric"
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleViewAllDetails = async (record) => {
    try {
      if (!record.id) {
        toast.error("Attendance ID is missing");
        return;
      }
      console.log("Navigating to attendance details with ID:", record.id);
      // Navigate to attendance details page
      navigate(`/attendance-details/${record.id}`);
    } catch (error) {
      console.error('Error navigating to attendance details:', error);
      toast.error("Failed to view attendance details");
    }
    setOpenDropdownId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 transform hover:scale-[1.01] transition-transform duration-200">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Attendance Management</h1>
                <p className="text-gray-600">Track your daily attendance with ease</p>
              </div>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <div className="flex items-center bg-blue-50 px-4 py-2 rounded-full">
                  <FaCalendarAlt className="text-blue-600 mr-2" />
                  <span className="text-blue-600 font-medium">
                    {currentTime.toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center bg-green-50 px-4 py-2 rounded-full">
                  <FaClock className="text-green-600 mr-2" />
                  <span className="text-green-600 font-medium">
                    {currentTime.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Check In/Out Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Check In Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 transform hover:scale-[1.02] transition-all duration-200 border-t-4 border-blue-500">
              <div className="flex items-center mb-6">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <FaSignInAlt className="text-blue-600 text-2xl" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800">Check In</h2>
              </div>
              <button
                onClick={handleCheckIn}
                disabled={loading}
                className="w-full bg-blue-600 text-white px-6 py-4 rounded-xl hover:bg-blue-700 disabled:bg-blue-400 transition-all duration-200 transform hover:scale-[1.02] font-medium text-lg shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Check In"
                )}
              </button>
            </div>

            {/* Check Out Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 transform hover:scale-[1.02] transition-all duration-200 border-t-4 border-green-500">
              <div className="flex items-center mb-6">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <FaSignOutAlt className="text-green-600 text-2xl" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800">Check Out</h2>
              </div>
              <button
                onClick={handleCheckOut}
                disabled={loading}
                className="w-full bg-green-600 text-white px-6 py-4 rounded-xl hover:bg-green-700 disabled:bg-green-400 transition-all duration-200 transform hover:scale-[1.02] font-medium text-lg shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Check Out"
                )}
              </button>
            </div>
          </div>

          {/* Attendance Records Table */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Attendance Records</h2>
            </div>
            {loadingRecords ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : attendanceRecords.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg">No attendance records found</div>
                <p className="text-gray-500 mt-2">Your attendance records will appear here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check In
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check Out
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendanceRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDateOnly(record.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.checkIn ? formatDate(record.checkIn) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.checkOut ? formatDate(record.checkOut) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            record.status === 'PRESENT' 
                              ? 'bg-green-100 text-green-800'
                              : record.status === 'ABSENT'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {record.status || 'PENDING'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                          <button
                            onClick={(e) => toggleDropdown(record.id, e)}
                            className="text-gray-400 hover:text-gray-600 focus:outline-none"
                          >
                            <FaEllipsisV className="h-5 w-5" />
                          </button>
                          
                          {openDropdownId === record.id && (
                            <div
                              ref={dropdownRef}
                              className="fixed z-50 w-[280px] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] bg-white"
                              style={{
                                top: `${dropdownPosition.top}px`,
                                left: `${dropdownPosition.left}px`
                              }}
                            >
                              <div className="py-2" role="menu" aria-orientation="vertical">
                                <button
                                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 flex items-center group transition-colors duration-150"
                                  onClick={() => handleViewAllDetails(record)}
                                >
                                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 group-hover:bg-blue-200 transition-colors duration-150 flex-shrink-0">
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="font-medium text-gray-900 truncate">View All Details</div>
                                    <div className="text-xs text-gray-500 truncate">See complete attendance information</div>
                                  </div>
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
