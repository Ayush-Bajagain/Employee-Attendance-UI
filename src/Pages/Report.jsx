import React, { useState, useEffect } from 'react';
import { MdDownload, MdCalendarToday, MdPerson, MdAccessTime, MdEventBusy, MdTrendingUp, MdTrendingDown, MdWarning } from 'react-icons/md';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Report() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalPresent: 0,
    totalAbsent: 0,
    lateArrivals: 0,
    onLeave: 0,
    averageWorkHours: 0,
    attendanceRate: 0,
    lateArrivalRate: 0,
    leaveRate: 0,
    departmentStats: []
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const url = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    fetchReportData();
  }, [selectedDate]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${url}/attendance/get-report-data?date=${selectedDate}`, {
        withCredentials: true
      });
      
      if (response.data.code === 200) {
        setStats(response.data.data);
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
      const response = await axios.post(
        `${url}/attendance/export-report`,
        { date: selectedDate },
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
          <h1 className="text-2xl font-bold text-gray-800">Administrative Reports</h1>
          <p className="text-gray-600 mt-1">Comprehensive attendance analytics and insights</p>
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
              <MdTrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Attendance Rate</h3>
              <p className="text-2xl font-bold text-gray-800">{stats.attendanceRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <MdWarning className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Late Arrival Rate</h3>
              <p className="text-2xl font-bold text-gray-800">{stats.lateArrivalRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <MdTrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Absenteeism Rate</h3>
              <p className="text-2xl font-bold text-gray-800">{stats.leaveRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MdAccessTime className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Avg. Work Hours</h3>
              <p className="text-2xl font-bold text-gray-800">{stats.averageWorkHours}h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Reports Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Analytics */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Attendance Analytics</h2>
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
                <span className="font-semibold text-gray-800">{stats.totalPresent}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Absent Today</span>
                <span className="font-semibold text-gray-800">{stats.totalAbsent}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">On Leave</span>
                <span className="font-semibold text-gray-800">{stats.onLeave}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Late Arrivals</span>
                <span className="font-semibold text-gray-800">{stats.lateArrivals}</span>
              </div>
            </div>
          )}
        </div>

        {/* Department Performance */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Department Performance</h2>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.departmentStats.map((dept) => (
                <div key={dept.id} className="border-b pb-3 last:border-b-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-800">{dept.name}</span>
                    <span className="text-sm text-gray-600">{dept.attendanceRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${dept.attendanceRate}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
