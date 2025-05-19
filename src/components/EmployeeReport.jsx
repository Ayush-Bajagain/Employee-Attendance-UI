import React, { useState, useEffect } from 'react';
import { MdCalendarMonth, MdDownload } from 'react-icons/md';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function EmployeeReport() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    totalWorkingDays: 0,
    presentDays: 0,
    absentDays: 0,
    leaveDays: 0
  });

  const url = import.meta.env.VITE_BASE_URL;

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const [year, month] = selectedMonth.split('-').map(Number);
      
      const response = await axios.post(
        `${url}/attendance/getMonthlyRecord`,
        {
          year,
          month
        },
        { withCredentials: true }
      );

      if (response.data.code === 200) {
        setAttendanceData(response.data.data);
        calculateSummary(response.data.data);
      } else {
        toast.error(response.data.message || 'Failed to fetch attendance data');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch attendance data');
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (data) => {
    const summary = {
      totalWorkingDays: data.length,
      presentDays: data.filter(record => record.status === 'Present').length,
      absentDays: data.filter(record => record.status === 'Absent').length,
      leaveDays: data.filter(record => record.status === 'Leave').length
    };
    setSummary(summary);
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedMonth]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present':
        return 'text-green-500';
      case 'Absent':
        return 'text-red-500';
      case 'Leave':
        return 'text-yellow-500';
      case 'Weekend':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '-';
    const date = new Date(dateTimeStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateTimeStr) => {
    if (!dateTimeStr) return '-';
    const date = new Date(dateTimeStr);
    return date.toLocaleDateString();
  };

  return (
    <div className="p-6">
      <ToastContainer />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Attendance Report</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <MdCalendarMonth className="text-gray-600" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
            <MdDownload />
            Download Report
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : attendanceData.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">No attendance records found</div>
            <p className="text-gray-500 mt-2">Select a different month to view attendance records</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceData.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(record.attendanceDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateTime(record.checkInTime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateTime(record.checkOutTime)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Summary</h3>
          <div className="space-y-2">
            <p className="text-gray-600">Total Working Days: <span className="font-medium">{summary.totalWorkingDays}</span></p>
            <p className="text-gray-600">Present Days: <span className="font-medium text-green-500">{summary.presentDays}</span></p>
            <p className="text-gray-600">Absent Days: <span className="font-medium text-red-500">{summary.absentDays}</span></p>
            <p className="text-gray-600">Leave Days: <span className="font-medium text-yellow-500">{summary.leaveDays}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
} 