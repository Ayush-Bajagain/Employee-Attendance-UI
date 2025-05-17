import React, { useState, useEffect } from 'react';
import { MdSearch, MdDownload, MdPerson, MdChevronLeft, MdChevronRight, MdCalendarToday, MdFilterList, MdEventBusy } from 'react-icons/md';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { FaSignInAlt, FaSignOutAlt } from 'react-icons/fa';

export default function AdminAttendance() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const url = import.meta.env.VITE_BASE_URL;
  const [filterType, setFilterType] = useState('all'); // 'all', 'today', 'monthly'
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showMonthFilter, setShowMonthFilter] = useState(false);
  const [attendanceCounts, setAttendanceCounts] = useState({
    present: 0,
    absent: 0,
    onLeave: 0
  });
  const [attendanceRequests, setAttendanceRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [requestsPage, setRequestsPage] = useState(1);
  const [requestsPerPage, setRequestsPerPage] = useState(10);
  const [requestSearchQuery, setRequestSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchEmployees();
    fetchAttendanceRecords();
    fetchDepartments();
    fetchAttendanceCounts();
    fetchAttendanceRequests();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${url}/employee/getAll`, {
        withCredentials: true
      });
      
      if (response.data.code === 200) {
        setEmployees(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch employees');
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      const response = await axios.post(`${url}/attendance/get-all-attendance`, {}, {
        withCredentials: true
      });
      
      if (response.data.code === 200) {
        setAttendanceRecords(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch attendance records');
      console.error('Error fetching attendance records:', error);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const fetchMonthlyRecords = async (year, month) => {
    try {
      setAttendanceLoading(true);
      const response = await axios.post(`${url}/attendance/getMonthlyRecord`, {
        year: year,
        month: month
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.code === 200) {
        console.log('Monthly records:', response.data.data); // For debugging
        setAttendanceRecords(response.data.data);
      } else {
        toast.error(response.data.message || 'Failed to fetch monthly records');
      }
    } catch (error) {
      console.error('Error fetching monthly records:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch monthly records');
    } finally {
      setAttendanceLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${url}/system-config/getDepartments`, {
        withCredentials: true
      });
      
      if (response.data.code === 200) {
        setDepartments(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch departments');
      console.error('Error fetching departments:', error);
    }
  };

  const fetchAttendanceCounts = async () => {
    try {
      const response = await axios.get(`${url}/attendance/count-status-of-employee`, {
        withCredentials: true
      });
      
      if (response.data.code === 200) {
        setAttendanceCounts(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch attendance counts');
      console.error('Error fetching attendance counts:', error);
    }
  };

  const fetchAttendanceRequests = async () => {
    try {
      const response = await axios.post(
        `${url}/attendance-request/get-all`,
        {},
        {
          withCredentials: true,
        }
      );
      
      if (response.data.code === 200) {
        setAttendanceRequests(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch attendance requests');
      console.error('Error fetching attendance requests:', error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleViewDetails = (employeeId) => {
    navigate(`/admin/attendance/${employeeId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ON_LEAVE':
        return 'bg-blue-100 text-blue-800';
      case 'SUSPENDED':
        return 'bg-orange-100 text-orange-800';
      case 'RESIGNED':
        return 'bg-purple-100 text-purple-800';
      case 'DELETED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter employees based on search query and department
  const filteredEmployees = employees.filter(employee => {
    const searchLower = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      employee.fullName?.toLowerCase().includes(searchLower) ||
      employee.email?.toLowerCase().includes(searchLower) ||
      employee.employeeId?.toLowerCase().includes(searchLower);
    
    const matchesDepartment = !selectedDepartment || employee.department === selectedDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredEmployees.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentEmployees = filteredEmployees.slice(startIndex, endIndex);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Format date function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
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

  // Calculate pagination for attendance records
  const totalPagesAttendance = Math.ceil(attendanceRecords.length / rowsPerPage);
  const startIndexAttendance = (currentPage - 1) * rowsPerPage;
  const endIndexAttendance = startIndexAttendance + rowsPerPage;
  const currentRecords = attendanceRecords.slice(startIndexAttendance, endIndexAttendance);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing rows per page
  };

  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleExportReport = async () => {
    try {
      const response = await axios.post(
        `${url}/attendance/export-attendance`,
        {
          department: selectedDepartment || undefined,
          searchQuery: searchQuery || undefined
        },
        {
          withCredentials: true,
          responseType: 'blob' // Important for handling file download
        }
      );
      

      // Create a blob from the response data
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      
      // Set the file name
      const fileName = `attendance_report_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.setAttribute('download', fileName);
      
      // Append to body, click and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL
      window.URL.revokeObjectURL(url);
      
      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    }
  };

  const handleStatusUpdate = async (requestId, status) => {
    try {
      const response = await axios.post(
        `${url}/attendance-request/update-status`,
        {
          id: requestId,
          status: status
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.code === 201) {
        toast.success('Status updated successfully');
        fetchAttendanceRequests();
      }
    } catch (error) {
      toast.error('Failed to update status');
      console.error('Error updating status:', error);
    }
  };

  // Filter attendance requests based on search query and status
  const filteredRequests = attendanceRequests.filter(request => {
    const searchLower = requestSearchQuery.toLowerCase().trim();
    const matchesSearch = 
      !requestSearchQuery || 
      request.employee?.fullName?.toLowerCase().includes(searchLower) ||
      request.employee?.email?.toLowerCase().includes(searchLower);
    
    const matchesStatus = 
      statusFilter === 'ALL' || 
      request.status.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate pagination for filtered attendance requests
  const totalPagesRequests = Math.ceil(filteredRequests.length / requestsPerPage);
  const startIndexRequests = (requestsPage - 1) * requestsPerPage;
  const endIndexRequests = startIndexRequests + requestsPerPage;
  const currentRequests = filteredRequests.slice(startIndexRequests, endIndexRequests);

  // Reset to first page when search query or status filter changes
  useEffect(() => {
    setRequestsPage(1);
  }, [requestSearchQuery, statusFilter]);

  const handleRequestSearchChange = (e) => {
    setRequestSearchQuery(e.target.value);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
  };
  
  const handleRequestsPageChange = (pageNumber) => {
    setRequestsPage(pageNumber);
  };

  const handleRequestsPerPageChange = (e) => {
    setRequestsPerPage(Number(e.target.value));
    setRequestsPage(1); // Reset to first page when changing rows per page
  };

  return (
    <div className="p-6 mt-4 lg:mt-0">
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

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Employee Management</h1>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleExportReport}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            <MdDownload />
            Export Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <MdPerson className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Total Present</h3>
              <p className="text-2xl font-bold text-gray-800">{attendanceCounts.present}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <MdEventBusy className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Total Absent</h3>
              <p className="text-2xl font-bold text-gray-800">{attendanceCounts.absent}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MdCalendarToday className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">On Leave</h3>
              <p className="text-2xl font-bold text-gray-800">{attendanceCounts.onLeave}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="flex gap-4 mb-6">
        {/* Search */}
        <div className="bg-white rounded-lg shadow-md p-3 w-1/3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <MdSearch className="absolute left-2 top-2.5 text-gray-400" />
          </div>
        </div>

        {/* Department Filter */}
        <div className="bg-white rounded-lg shadow-md p-3">
          <div className="relative">
            <select
              value={selectedDepartment}
              onChange={handleDepartmentChange}
              className="w-48 pl-3 pr-8 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.departmentName}>
                  {dept.departmentName}
                </option>
              ))}
            </select>
            <div className="absolute right-2 top-2.5 pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : currentEmployees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    {searchQuery ? 'No employees found matching your search' : 'No employees found'}
                  </td>
                </tr>
              ) : (
                currentEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <MdPerson className="text-gray-500" size={24} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{employee.fullName}</div>
                          <div className="text-sm text-gray-500">{employee.employeeId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(employee.status)}`}>
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button 
                        onClick={() => handleViewDetails(employee.id)}
                        className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filteredEmployees.length > 0 && (
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
                    {Math.min(endIndex, filteredEmployees.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredEmployees.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MdChevronLeft className="h-5 w-5" />
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
                    <MdChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Separator with increased spacing */}
      <div className="my-12 flex items-center">
        <div className="flex-grow border-t border-gray-200"></div>
        <div className="mx-6 text-gray-500">
          <MdCalendarToday className="w-8 h-8" />
        </div>
        <div className="flex-grow border-t border-gray-200"></div>
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

          {/* Rows per page selector */}
          <div className="mt-4 sm:mt-0 flex items-center gap-2">
            <label className="text-sm text-gray-600">Rows per page:</label>
            <select
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
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
                    const checkIn = new Date(record.checkInTime);
                    const checkOut = new Date(record.checkOutTime);
                    const duration = checkOut - checkIn;
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
                              <div className="text-sm font-medium text-gray-900">{record.employee.fullName}</div>
                              <div className="text-sm text-gray-500">{record.employee.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(record.attendanceDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            record.status === 'Present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
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
                          {`${hours}h ${minutes}m`}
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
                      <MdChevronLeft className="h-5 w-5" />
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
                      <MdChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Separator with increased spacing */}
      <div className="my-12 flex items-center">
        <div className="flex-grow border-t border-gray-200"></div>
        <div className="mx-6 text-gray-500">
          <MdCalendarToday className="w-8 h-8" />
        </div>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>

      {/* Attendance Requests Section */}
      <div className="mt-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-purple-500 rounded-full"></div>
            <h2 className="text-3xl font-bold text-gray-800">Attendance Requests</h2>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Total Requests:</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                {attendanceRequests.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Rows per page:</label>
              <select
                value={requestsPerPage}
                onChange={handleRequestsPerPageChange}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search and Filter Section for Requests */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search Input - Made smaller */}
          <div className="bg-white rounded-lg shadow-md p-3 md:w-64">
            <div className="relative">
              <input
                type="text"
                placeholder="Search employee..."
                value={requestSearchQuery}
                onChange={handleRequestSearchChange}
                className="w-full pl-8 pr-3 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <MdSearch className="absolute left-2 top-2.5 text-gray-400" />
            </div>
          </div>

          {/* Status Filter Dropdown */}
          <div className="bg-white rounded-lg shadow-md p-3">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="w-48 pl-3 pr-8 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <div className="absolute right-2 top-2.5 pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request Type
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested Date
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested Time
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loadingRequests ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : attendanceRequests.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <svg className="w-12 h-12 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-lg font-medium">No attendance requests found</p>
                        <p className="text-sm mt-1">Attendance requests will appear here</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <MdPerson className="text-gray-500" size={24} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{request.employee?.fullName || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{request.employee?.email || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-full ${
                            request.requestedType.toLowerCase() === 'check in' 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'bg-green-100 text-green-600'
                          }`}>
                            {request.requestedType.toLowerCase() === 'check in' ? (
                              <FaSignInAlt className="h-4 w-4" />
                            ) : (
                              <FaSignOutAlt className="h-4 w-4" />
                            )}
                          </div>
                          <span className="ml-3 text-sm font-medium text-gray-900">
                            {request.requestedType}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(request.requestedDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.requestedTime}
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <div className="text-sm text-gray-900 truncate" title={request.reason}>
                            {request.reason}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          request.status.status === 'APPROVED' 
                            ? 'bg-green-100 text-green-800'
                            : request.status.status === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {request.status.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.createdAt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {request.status.status === 'PENDING' ? (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(request.id, 'APPROVED')}
                                className="inline-flex items-center justify-center p-2 bg-green-50 text-green-700 rounded-full hover:bg-green-100 transition-colors duration-150"
                                title="Approve"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(request.id, 'REJECTED')}
                                className="inline-flex items-center justify-center p-2 bg-red-50 text-red-700 rounded-full hover:bg-red-100 transition-colors duration-150"
                                title="Reject"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                              <button
                                className="inline-flex items-center justify-center p-2 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors duration-150"
                                title="View Details"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                            </>
                          ) : (
                            <button
                              className="inline-flex items-center justify-center p-2 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors duration-150"
                              title="View Details"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Show "No results found" message when filtered results are empty */}
          {!loadingRequests && filteredRequests.length === 0 && attendanceRequests.length > 0 && (
            <div className="px-6 py-8 text-center">
              <div className="flex flex-col items-center justify-center text-gray-500">
                <MdSearch className="w-12 h-12 mb-3 text-gray-400" />
                <p className="text-lg font-medium">No matching requests found</p>
                <p className="text-sm mt-1">Try adjusting your search or filter criteria</p>
              </div>
            </div>
          )}

          {/* Pagination for Requests */}
          {!loadingRequests && filteredRequests.length > 0 && (
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handleRequestsPageChange(requestsPage - 1)}
                  disabled={requestsPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handleRequestsPageChange(requestsPage + 1)}
                  disabled={requestsPage === totalPagesRequests}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{startIndexRequests + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(endIndexRequests, filteredRequests.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredRequests.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handleRequestsPageChange(requestsPage - 1)}
                      disabled={requestsPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MdChevronLeft className="h-5 w-5" />
                    </button>
                    {totalPagesRequests <= 5 ? (
                      [...Array(totalPagesRequests)].map((_, index) => (
                        <button
                          key={index + 1}
                          onClick={() => handleRequestsPageChange(index + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            requestsPage === index + 1
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))
                    ) : (
                      <>
                        {[...Array(Math.min(3, requestsPage))].map((_, index) => {
                          const pageNum = index + 1;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handleRequestsPageChange(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                requestsPage === pageNum
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        {requestsPage > 3 && (
                          <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                            ...
                          </span>
                        )}
                        {requestsPage < totalPagesRequests - 2 && (
                          <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                            ...
                          </span>
                        )}
                        {[...Array(Math.min(3, totalPagesRequests - requestsPage + 1))].map((_, index) => {
                          const pageNum = totalPagesRequests - index;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handleRequestsPageChange(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                requestsPage === pageNum
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }).reverse()}
                      </>
                    )}
                    <button
                      onClick={() => handleRequestsPageChange(requestsPage + 1)}
                      disabled={requestsPage === totalPagesRequests}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MdChevronRight className="h-5 w-5" />
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