import React, { useState, useEffect } from 'react';
import { MdDownload, MdCalendarToday, MdPerson, MdAccessTime, MdEventBusy } from 'react-icons/md';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

export default function Report() {
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
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
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [showMonthFilter, setShowMonthFilter] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filterType, setFilterType] = useState('all');
  const url = import.meta.env.VITE_BASE_URL;
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchReportData();
    fetchAttendanceRecords();
  }, [selectedDate]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const date = new Date(selectedDate);
      const requestData = {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
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
      setExportLoading(true);
      
      // Show loading state
      Swal.fire({
        title: 'Preparing Report',
        text: 'Please wait while we prepare your report...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Prepare request data based on filter type
      let requestData = {};
      if (filterType === 'monthly') {
        requestData = {
          year: selectedYear,
          month: selectedMonth
        };
      } else if (filterType === 'today') {
        const today = new Date();
        requestData = {
          year: today.getFullYear(),
          month: today.getMonth() + 1,
          day: today.getDate()
        };
      } else {
        const date = new Date(selectedDate);
        requestData = {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate()
        };
      }

      const response = await axios.post(
        `${url}/attendance/get-all-attendance`,
        requestData,
        {
          withCredentials: true
        }
      );

      if (response.data.code === 200) {
        const records = response.data.data;

        // Format the data for Excel
        const excelData = records.map(record => ({
          'Employee Name': record.employee?.fullName || 'N/A',
          'Employee ID': record.employee?.employeeId || 'N/A',
          'Department': record.employee?.department || 'N/A',
          'Date': formatDate(record.attendanceDate),
          'Status': record.status || 'N/A',
          'Check In': formatTime(record.checkInTime),
          'Check Out': formatTime(record.checkOutTime),
          'Duration': record.checkInTime && record.checkOutTime 
            ? `${Math.floor((new Date(record.checkOutTime) - new Date(record.checkInTime)) / (1000 * 60 * 60))}h ${Math.floor(((new Date(record.checkOutTime) - new Date(record.checkInTime)) % (1000 * 60 * 60)) / (1000 * 60))}m`
            : 'N/A'
        }));

        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(excelData);

        // Create workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Records');

        // Generate filename based on filter type
        let filename = 'attendance_records';
        if (filterType === 'monthly') {
          filename = `attendance_records_${selectedYear}_${selectedMonth}`;
        } else if (filterType === 'today') {
          filename = `attendance_records_${new Date().toISOString().split('T')[0]}`;
        } else {
          filename = `attendance_records_${selectedDate}`;
        }

        // Write file
        XLSX.writeFile(workbook, `${filename}.xlsx`);

        // Show success message
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Attendance records exported successfully',
          confirmButtonColor: '#3085d6'
        });
      } else {
        throw new Error(response.data.message || 'Failed to fetch attendance records');
      }
    } catch (error) {
      console.error('Error exporting attendance records:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to export attendance records',
        confirmButtonColor: '#3085d6'
      });
    } finally {
      setExportLoading(false);
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      setAttendanceLoading(true);
      const response = await axios.post(`${url}/attendance/get-all-attendance`, {}, {
        withCredentials: true
      });
      
      if (response.data.code === 200) {
        setAttendanceRecords(response.data.data);
      } else {
        toast.error(response.data.message || 'Failed to fetch attendance records');
      }
    } catch (error) {
      toast.error('Failed to fetch attendance records');
      console.error('Error fetching attendance records:', error);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
    setCurrentPage(1);
    
    if (type === 'monthly') {
      setShowMonthFilter(true);
      // Fetch monthly records with current selected month and year
      fetchMonthlyRecords(selectedYear, selectedMonth);
    } else if (type === 'today') {
      setShowMonthFilter(false);
      const today = new Date();
      const filteredRecords = attendanceRecords.filter(record => {
        const recordDate = new Date(record.attendanceDate);
        return recordDate.toDateString() === today.toDateString();
      });
      setAttendanceRecords(filteredRecords);
    } else {
      setShowMonthFilter(false);
      fetchAttendanceRecords();
    }
  };

  const handleMonthYearChange = (e) => {
    const { name, value } = e.target;
    const newValue = parseInt(value);
    
    if (name === 'month') {
      setSelectedMonth(newValue);
      fetchMonthlyRecords(selectedYear, newValue);
    } else {
      setSelectedYear(newValue);
      fetchMonthlyRecords(newValue, selectedMonth);
    }
  };

  // Add useEffect to fetch monthly records when component mounts if monthly filter is active
  useEffect(() => {
    if (filterType === 'monthly') {
      fetchMonthlyRecords(selectedYear, selectedMonth);
    }
  }, [filterType]);

  const fetchMonthlyRecords = async (year, month) => {
    try {
      setAttendanceLoading(true);
      const response = await axios.post(
        `${url}/attendance/get-monthly-records-of-all-employee`,
        {
          year: year,
          month: month
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.code === 200) {
        setAttendanceRecords(response.data.data);
      } else {
        toast.error(response.data.message || 'Failed to fetch monthly records');
      }
    } catch (error) {
      toast.error('Failed to fetch monthly records');
      console.error('Error fetching monthly records:', error);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PRESENT':
        return 'bg-green-100 text-green-800';
      case 'ABSENT':
        return 'bg-red-100 text-red-800';
      case 'LEAVE':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Pagination calculations
  const totalPagesAttendance = Math.ceil(attendanceRecords.length / rowsPerPage);
  const startIndexAttendance = (currentPage - 1) * rowsPerPage;
  const endIndexAttendance = startIndexAttendance + rowsPerPage;
  const currentRecords = attendanceRecords.slice(startIndexAttendance, endIndexAttendance);

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

      {/* Export Report Button */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={handleExportReport}
          className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition-colors shadow-sm"
        >
          <MdDownload className="w-5 h-5" />
          Export Report
        </button>
      </div>

      {/* Attendance Records Table */}
      <div className="mt-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-blue-500 rounded-full"></div>
            <h2 className="text-3xl font-bold text-gray-800">Attendance Records</h2>
          </div>

          {/* Filter Controls */}
          <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Records
            </button>
            <button
              onClick={() => handleFilterChange('today')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filterType === 'today'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => handleFilterChange('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filterType === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Monthly Filter Controls */}
        {showMonthFilter && (
          <div className="mb-4 p-4 bg-white rounded-lg shadow-sm">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Month:</label>
                <select
                  name="month"
                  value={selectedMonth}
                  onChange={handleMonthYearChange}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <option key={month} value={month}>
                      {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Year:</label>
                <select
                  name="year"
                  value={selectedYear}
                  onChange={handleMonthYearChange}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceLoading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : currentRecords.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      No attendance records found
                    </td>
                  </tr>
                ) : (
                  currentRecords.map((record) => {
                    const checkIn = record.checkInTime ? new Date(record.checkInTime) : null;
                    const checkOut = record.checkOutTime ? new Date(record.checkOutTime) : null;
                    const duration = checkIn && checkOut ? checkOut - checkIn : 0;
                    const hours = Math.floor(duration / (1000 * 60 * 60));
                    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

                    return (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <MdPerson className="text-gray-500" size={24} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{record.employee?.fullName || 'N/A'}</div>
                              <div className="text-sm text-gray-500">{record.employee?.email || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(record.attendanceDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)}`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatTime(record.checkInTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatTime(record.checkOutTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {checkIn && checkOut ? `${hours}h ${minutes}m` : 'N/A'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {!attendanceLoading && attendanceRecords.length > 0 && (
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
                  disabled={currentPage === totalPagesAttendance}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{startIndexAttendance + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(endIndexAttendance, attendanceRecords.length)}
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
                      Previous
                    </button>
                    {[...Array(totalPagesAttendance)].map((_, index) => (
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
                      disabled={currentPage === totalPagesAttendance}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
