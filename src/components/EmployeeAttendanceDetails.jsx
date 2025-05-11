import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MdArrowBack, MdCalendarToday, MdAccessTime } from 'react-icons/md';

export default function EmployeeAttendanceDetails() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const url = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    fetchAttendanceData();
  }, [employeeId]);

  const fetchAttendanceData = async () => {
    try {
      const response = await axios.post(
        `${url}/attendance/getEmployeeAttendance/${employeeId}`,
        {},
        { withCredentials: true }
      );

      if (response.data.code === 200) {
        setAttendanceData(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch attendance data');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '-';
    const date = new Date(dateTimeString);
    return date.toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-800';
      case 'Absent':
        return 'bg-red-100 text-red-800';
      case 'Late':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 mt-4 lg:mt-0">
      <ToastContainer />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <MdArrowBack className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Attendance Details</h1>
            <p className="text-gray-600">Employee ID: {employeeId}</p>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Working Hours</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : attendanceData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No attendance records found
                  </td>
                </tr>
              ) : (
                attendanceData.map((record) => {
                  const checkIn = record.checkInTime ? new Date(record.checkInTime) : null;
                  const checkOut = record.checkOutTime ? new Date(record.checkOutTime) : null;
                  const workingHours = checkIn && checkOut
                    ? ((checkOut - checkIn) / (1000 * 60 * 60)).toFixed(2)
                    : '-';

                  return (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <MdCalendarToday className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {new Date(record.attendanceDate).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <MdAccessTime className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {formatDateTime(record.checkInTime)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <MdAccessTime className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {formatDateTime(record.checkOutTime)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {workingHours === '-' ? '-' : `${workingHours} hours`}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Present</h3>
          <p className="text-2xl font-bold text-green-600">
            {attendanceData.filter(record => record.status === 'Present').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Absent</h3>
          <p className="text-2xl font-bold text-red-600">
            {attendanceData.filter(record => record.status === 'Absent').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Leave</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {attendanceData.filter(record => record.status === 'Leave').length}
          </p>
        </div>
      </div>
    </div>
  );
} 