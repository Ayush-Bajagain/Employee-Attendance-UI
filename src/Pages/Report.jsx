import React, { useState, useEffect } from 'react';
import { MdDownload, MdCalendarToday, MdPerson, MdAccessTime, MdEventBusy } from 'react-icons/md';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Report() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentCount: 0,
    absentCount: 0,
    leaveCount: 0,
    presentRate: 0,
    absentRate: 0,
    leaveRate: 0
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const url = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    fetchReportData();
  }, [selectedDate]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const date = new Date(selectedDate);
      const requestData = {
        year: date.getFullYear(),
        month: date.getMonth() + 1, // JavaScript months are 0-based
        day: date.getDate()
      };

      const response = await axios.post(
        `${url}/attendance/get-daily-report-of-employee-attendance`,
        requestData,
        { withCredentials: true }
      );
      
      if (response.data.code === 200) {
        setStats(response.data.data);
      } else {
        toast.error(response.data.message || 'Failed to fetch report data');
      }
    } catch (error) {
      toast.error('Failed to fetch report data');
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      const date = new Date(selectedDate);
      const requestData = {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate()
      };

      const response = await axios.post(
        `${url}/attendance/export-report`,
        requestData,
        {
          withCredentials: true,
          responseType: 'blob'
        }
      );

      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_report_${selectedDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    }
  };

  return (
    <div className="p-6">
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

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Daily Attendance Report</h1>
          <p className="text-gray-600 mt-1">Daily attendance overview and statistics</p>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleExportReport}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            <MdDownload />
            Export Report
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MdPerson className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Total Employees</h3>
              <p className="text-2xl font-bold text-gray-800">{stats.totalEmployees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <MdAccessTime className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Present</h3>
              <p className="text-2xl font-bold text-gray-800">{stats.presentCount}</p>
              <p className="text-sm text-gray-500">{stats.presentRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <MdEventBusy className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Absent</h3>
              <p className="text-2xl font-bold text-gray-800">{stats.absentCount}</p>
              <p className="text-sm text-gray-500">{stats.absentRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <MdCalendarToday className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">On Leave</h3>
              <p className="text-2xl font-bold text-gray-800">{stats.leaveCount}</p>
              <p className="text-sm text-gray-500">{stats.leaveRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Report Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Attendance Summary</h2>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Employees</span>
              <span className="font-semibold text-gray-800">{stats.totalEmployees}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Present Today</span>
              <div className="text-right">
                <span className="font-semibold text-gray-800">{stats.presentCount}</span>
                <span className="text-sm text-gray-500 ml-2">({stats.presentRate}%)</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Absent Today</span>
              <div className="text-right">
                <span className="font-semibold text-gray-800">{stats.absentCount}</span>
                <span className="text-sm text-gray-500 ml-2">({stats.absentRate}%)</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">On Leave</span>
              <div className="text-right">
                <span className="font-semibold text-gray-800">{stats.leaveCount}</span>
                <span className="text-sm text-gray-500 ml-2">({stats.leaveRate}%)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
