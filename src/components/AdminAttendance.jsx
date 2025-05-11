import React, { useState, useEffect } from 'react';
import { MdSearch, MdFilterList, MdDownload, MdPerson } from 'react-icons/md';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

export default function AdminAttendance() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const url = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    fetchEmployees();
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

  // Filter employees based on search query
  const filteredEmployees = employees.filter(employee => 
    employee.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.position?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <button className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
            <MdDownload />
            Export Report
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search employee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <MdSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          <div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <button className="flex items-center gap-2 w-full px-4 py-2 border rounded-md hover:bg-gray-50">
              <MdFilterList />
              Filter by Department
            </button>
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
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No employees found
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => (
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
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Present</h3>
          <p className="text-2xl font-bold text-green-600">45</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Absent</h3>
          <p className="text-2xl font-bold text-red-600">5</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Late Arrivals</h3>
          <p className="text-2xl font-bold text-yellow-600">3</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">On Leave</h3>
          <p className="text-2xl font-bold text-blue-600">2</p>
        </div>
      </div>
    </div>
  );
} 