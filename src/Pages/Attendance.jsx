import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaClock, FaSignInAlt, FaSignOutAlt, FaCalendarAlt, FaUserClock, FaEllipsisV, FaCalendarPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

const Attendance = () => {
  const url = import.meta.env.VITE_BASE_URL;
  
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkOutLoading, setCheckOutLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestFormData, setRequestFormData] = useState({
    type: "check-in", // Default to check-in
    arrivalTime: "",
    comment: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
    event.stopPropagation();
    if (openDropdownId === id) {
      setOpenDropdownId(null);
    } else {
      const buttonRect = event.currentTarget.getBoundingClientRect();
      const dropdownWidth = 280;
      const spaceOnRight = window.innerWidth - buttonRect.right;
      
      // Calculate position to ensure dropdown stays within viewport
      let left = buttonRect.left;
      if (spaceOnRight < dropdownWidth) {
        left = Math.max(10, buttonRect.left - dropdownWidth + buttonRect.width);
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
      }
    } catch (error) {
      // Don't show error alert during loading
      console.error('Error fetching attendance records:', error);
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleCheckIn = async () => {
    setCheckInLoading(true);

    try {
      const response = await axios.post(`${url}/attendance/check-in`, {}, {
        withCredentials: true,
      });

      if (response.data.code === 200) {
        await Swal.fire({
          title: "Success!",
          text: response.data.message || "Check-in successful",
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#4F46E5",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
          position: "center",
          customClass: {
            popup: 'animated fadeInDown'
          }
        });
        fetchAttendanceRecords();
      } else {
        await Swal.fire({
          title: "Error!",
          text: response.data.message || "Check-in failed",
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#4F46E5",
          position: "center",
          customClass: {
            popup: 'animated fadeInDown'
          }
        });
      }
    } catch (error) {
      await Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Check-in failed. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#4F46E5",
        position: "center",
        customClass: {
          popup: 'animated fadeInDown'
        }
      });
    } finally {
      setCheckInLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckOutLoading(true);

    try {
      const response = await axios.post(`${url}/attendance/checkout`, {}, {
        withCredentials: true,
      });

      if (response.data.code === 200) {
        await Swal.fire({
          title: "Success!",
          text: response.data.message || "Check-out successful",
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#4F46E5",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
          position: "center",
          customClass: {
            popup: 'animated fadeInDown'
          }
        });
        fetchAttendanceRecords();
      } else {
        await Swal.fire({
          title: "Error!",
          text: response.data.message || "Check-out failed",
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#4F46E5",
          position: "center",
          customClass: {
            popup: 'animated fadeInDown'
          }
        });
      }
    } catch (error) {
      await Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Check-out failed. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#4F46E5",
        position: "center",
        customClass: {
          popup: 'animated fadeInDown'
        }
      });
    } finally {
      setCheckOutLoading(false);
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

  const handleViewAllDetails = async (record, event) => {
    event.stopPropagation();
    try {
      if (!record.id) {
        toast.error("Attendance ID is missing");
        return;
      }
      setOpenDropdownId(null);
      // Get the current path to determine if we're in admin or employee section
      const isAdmin = window.location.pathname.includes('/admin/');
      const basePath = isAdmin ? '/admin' : '/employee';
      navigate(`${basePath}/attendance/${record.id}`);
    } catch (error) {
      console.error('Error navigating to attendance details:', error);
      toast.error("Failed to view attendance details");
    }
  };

  const handleRequestAttendance = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `${url}/attendance-request/create`,
        {
          requestedType: requestFormData.type.toUpperCase(),
          requestedTime: requestFormData.arrivalTime,
          reason: requestFormData.comment
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.code === 201) {
        await Swal.fire({
          title: "Success!",
          text: response.data.message || "Attendance request submitted successfully!",
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#4F46E5",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
          position: "center",
          customClass: {
            popup: 'animated fadeInDown'
          }
        });
        setShowRequestForm(false);
        setRequestFormData({ type: "check-in", arrivalTime: "", comment: "" });
        fetchAttendanceRecords();
      } else {
        await Swal.fire({
          title: "Error!",
          text: response.data.message || "Failed to submit attendance request",
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#4F46E5",
          position: "center",
          customClass: {
            popup: 'animated fadeInDown'
          }
        });
      }
    } catch (error) {
      await Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to submit attendance request",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#4F46E5",
        position: "center",
        customClass: {
          popup: 'animated fadeInDown'
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(attendanceRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRecords = attendanceRecords.slice(startIndex, endIndex);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
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
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
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
            <div className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-blue-500">
              <div className="flex items-center mb-6">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <FaSignInAlt className="text-blue-600 text-2xl" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800">Check In</h2>
              </div>
              <button
                onClick={handleCheckIn}
                disabled={checkInLoading || checkOutLoading}
                className="w-full bg-blue-600 text-white px-6 py-4 rounded-xl hover:bg-blue-700 disabled:bg-blue-400 transition-all duration-200 transform hover:scale-[1.02] font-medium text-lg shadow-md hover:shadow-lg"
              >
                {checkInLoading ? (
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
            <div className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-green-500">
              <div className="flex items-center mb-6">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <FaSignOutAlt className="text-green-600 text-2xl" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800">Check Out</h2>
              </div>
              <button
                onClick={handleCheckOut}
                disabled={checkInLoading || checkOutLoading}
                className="w-full bg-green-600 text-white px-6 py-4 rounded-xl hover:bg-green-700 disabled:bg-green-400 transition-all duration-200 transform hover:scale-[1.02] font-medium text-lg shadow-md hover:shadow-lg"
              >
                {checkOutLoading ? (
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

          {/* Request Attendance Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border-t-4 border-purple-500">
            <div className="flex items-center mb-6">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <FaCalendarPlus className="text-purple-600 text-2xl" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">Request Attendance</h2>
            </div>
            <button
              onClick={() => setShowRequestForm(true)}
              className="w-full bg-purple-600 text-white px-6 py-4 rounded-xl hover:bg-purple-700 transition-all duration-200 transform hover:scale-[1.02] font-medium text-lg shadow-md hover:shadow-lg"
            >
              Request Attendance
            </button>
          </div>

          {/* Request Attendance Form Modal */}
          {showRequestForm && (
            <div className="fixed inset-0 bg-white/30 backdrop-blur-[2px] overflow-y-auto h-full w-full z-50">
              <div className="relative top-4 sm:top-10 mx-auto p-4 sm:p-6 border w-[95%] sm:w-[90%] md:w-[80%] lg:w-[500px] shadow-2xl rounded-2xl bg-white/95 backdrop-blur-md">
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                      Request Attendance
                    </h3>
                    <button
                      onClick={() => setShowRequestForm(false)}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors duration-200"
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <form onSubmit={handleRequestAttendance} className="space-y-6">
                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-3">
                        Request Type
                      </label>
                      <div className="flex space-x-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="type"
                            value="check-in"
                            checked={requestFormData.type === "check-in"}
                            onChange={(e) =>
                              setRequestFormData({ ...requestFormData, type: e.target.value })
                            }
                            className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                          />
                          <span className="text-gray-700">Check In</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="type"
                            value="check-out"
                            checked={requestFormData.type === "check-out"}
                            onChange={(e) =>
                              setRequestFormData({ ...requestFormData, type: e.target.value })
                            }
                            className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                          />
                          <span className="text-gray-700">Check Out</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-2">
                        Time
                      </label>
                      <input
                        type="time"
                        value={requestFormData.arrivalTime}
                        onChange={(e) =>
                          setRequestFormData({ ...requestFormData, arrivalTime: e.target.value })
                        }
                        className="shadow-sm appearance-none border border-gray-300 rounded-xl w-full py-2.5 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-2">
                        Comment
                      </label>
                      <textarea
                        value={requestFormData.comment}
                        onChange={(e) =>
                          setRequestFormData({ ...requestFormData, comment: e.target.value })
                        }
                        className="shadow-sm appearance-none border border-gray-300 rounded-xl w-full py-2.5 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 min-h-[100px]"
                        placeholder="Describe the causes"
                        required
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowRequestForm(false)}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto bg-gray-100 text-gray-700 px-6 py-2.5 rounded-xl hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto bg-purple-600 text-white px-6 py-2.5 rounded-xl hover:bg-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Submitting...
                          </>
                        ) : (
                          "Submit Request"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Attendance Records Table */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-800">Attendance Records</h2>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Rows per page:</label>
                  <select
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
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
                    {currentRecords.map((record) => (
                      <tr key={record.id} className="relative">
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
                              className="fixed z-[100] w-[280px] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] bg-white"
                              style={{
                                top: `${dropdownPosition.top}px`,
                                left: `${dropdownPosition.left}px`
                              }}
                            >
                              <div className="py-2" role="menu" aria-orientation="vertical">
                                <button
                                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 flex items-center group transition-colors duration-150"
                                  onClick={(e) => handleViewAllDetails(record, e)}
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

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                          <span className="font-medium">
                            {Math.min(endIndex, attendanceRecords.length)}
                          </span>{' '}
                          of <span className="font-medium">{attendanceRecords.length}</span> results
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="sr-only">Previous</span>
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                          {[...Array(totalPages)].map((_, index) => (
                            <button
                              key={index + 1}
                              onClick={() => handlePageChange(index + 1)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === index + 1
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {index + 1}
                            </button>
                          ))}
                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="sr-only">Next</span>
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
