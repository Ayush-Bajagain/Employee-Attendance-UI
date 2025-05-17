import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaCalendarAlt, FaSignInAlt, FaSignOutAlt, FaClock, FaCheckCircle } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AttendanceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState(null);
  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchAttendanceDetails = async () => {
      try {
        const response = await axios.get(`${baseUrl}/attendance/get/${id}`, {
          withCredentials: true,
        });
        
        if (response.data.code === 200) {
          setAttendanceData(response.data.data);
        } else {
          toast.error(response.data.message || "Failed to fetch attendance details");
        }
      } catch (error) {
        console.error('Error fetching attendance data:', error);
        toast.error(error.response?.data?.message || "Failed to fetch attendance details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAttendanceDetails();
    } else {
      setLoading(false);
      toast.error("Attendance ID is missing");
    }
  }, [id, baseUrl]);

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!attendanceData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800">No Attendance Data Found</h2>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
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
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-800 ml-4">Attendance Details</h1>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Basic Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Basic Information</h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <FaCalendarAlt className="text-blue-600 mt-1 mr-3" />
                    <div>
                      <div className="text-sm text-gray-500">Attendance Date</div>
                      <div className="font-medium">{formatDateTime(attendanceData.attendanceDate)}</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FaCheckCircle className="text-blue-600 mt-1 mr-3" />
                    <div>
                      <div className="text-sm text-gray-500">Status</div>
                      <div className="font-medium">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          attendanceData.status === 'Present' 
                            ? 'bg-green-100 text-green-800'
                            : attendanceData.status === 'Absent'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {attendanceData.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Time Information */}
              
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Time Information</h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <FaSignInAlt className="text-green-600 mt-1 mr-3" />
                    <div>
                      <div className="text-sm text-gray-500">Check In Time</div>
                      <div className="font-medium">{formatDateTime(attendanceData.checkInTime)}</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FaSignOutAlt className="text-red-600 mt-1 mr-3" />
                    <div>
                      <div className="text-sm text-gray-500">Check Out Time</div>
                      <div className="font-medium">{formatDateTime(attendanceData.checkOutTime)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Additional Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex items-start">
                  <FaClock className="text-blue-600 mt-1 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Created At</div>
                    <div className="font-medium">{formatDateTime(attendanceData.createdAt)}</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <FaClock className="text-blue-600 mt-1 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Last Updated</div>
                    <div className="font-medium">{formatDateTime(attendanceData.updatedAt)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceDetails; 