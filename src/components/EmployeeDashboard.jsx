import React, { useState, useEffect } from 'react';
import { MdAccessTime, MdPerson, MdWork, MdEventNote, MdCalendarToday } from 'react-icons/md';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function EmployeeDashboard() {
  const [employeeData, setEmployeeData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);

  const url = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch employee data
        const employeeResponse = await axios.get(`${url}/employee/getAuthenticatedEmployee`, {
          withCredentials: true
        });
        if (employeeResponse.data.code === 200) {
          setEmployeeData(employeeResponse.data.data);
        }

        // Fetch attendance data
        const attendanceResponse = await axios.get(`${url}/attendance/getTodayStatus`, {
          withCredentials: true
        });
        if (attendanceResponse.data.code === 200) {
          setAttendanceData(attendanceResponse.data.data);
        }

        // Fetch leave requests
        const leaveResponse = await axios.post(`${url}/leave-request/get-own`, {}, {
          withCredentials: true
        });
        if (leaveResponse.data.code === 200) {
          setLeaveRequests(leaveResponse.data.data);
        }
      } catch (err) {
        setError('Failed to fetch data');
        console.error('Error fetching data:', err);
        await Swal.fire({
          title: "Error!",
          text: 'Failed to fetch data',
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#4F46E5",
          position: "center",
          customClass: {
            popup: 'animated fadeInDown'
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  // Format time function
  const formatTime = (timeString) => {
    if (!timeString) return '-';
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true  
    });
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'text-yellow-600';
      case 'APPROVED':
        return 'text-green-600';
      case 'REJECTED':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Welcome back, {employeeData?.fullName}
        </h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Today's Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Today's Status</h2>
            <MdAccessTime className="text-blue-500 text-2xl" />
          </div>
          <div className="space-y-2">
            <p className="text-gray-600">Status: <span className={`font-medium ${attendanceData?.status === 'Present' ? 'text-green-500' : 'text-red-500'}`}>{attendanceData?.status || 'Not Marked'}</span></p>
            <p className="text-gray-600">Check-in: <span className="font-medium">{formatTime(attendanceData?.checkInTime)}</span></p>
            <p className="text-gray-600">Check-out: <span className="font-medium">{formatTime(attendanceData?.checkOutTime)}</span></p>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Profile Information</h2>
            <MdPerson className="text-green-500 text-2xl" />
          </div>
          <div className="space-y-2">
            <p className="text-gray-600">Department: <span className="font-medium">{employeeData?.department}</span></p>
            <p className="text-gray-600">Position: <span className="font-medium">{employeeData?.position}</span></p>
            <p className="text-gray-600">Employee ID: <span className="font-medium">{employeeData?.id}</span></p>
            <p className="text-gray-600">Email: <span className="font-medium">{employeeData?.email}</span></p>
          </div>
        </div>
      </div>

      {/* Recent Leave Requests */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Recent Leave Requests</h2>
          <MdEventNote className="text-orange-500 text-2xl" />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested On</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaveRequests.slice(0, 5).map((request, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.leavePolicy.leaveType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(request.startDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(request.endDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-medium ${getStatusColor(request.status.status)}`}>
                      {request.status.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(request.createdAt)}
                  </td>
                </tr>
              ))}
              {leaveRequests.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No leave requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 