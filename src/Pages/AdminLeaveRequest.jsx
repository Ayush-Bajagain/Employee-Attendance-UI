import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { MdCheck, MdClose, MdVisibility, MdSearch, MdFilterList } from 'react-icons/md';

const AdminLeaveRequest = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState({});
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);

  const url = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  // Filter and search logic
  const filteredRequests = leaveRequests.filter(request => {
    const matchesSearch = 
      request.employee?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.employee?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || request.status.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const fetchLeaveRequests = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${url}/leave-request/get-all`, {}, {
        withCredentials: true
      });

      if (response.data.code === 200) {
        setLeaveRequests(response.data.data);
      } else {
        toast.error(response.data.message || "Failed to fetch leave requests");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch leave requests");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId, status) => {
    try {
      // Set loading state for specific request and action
      setUpdatingStatus(prev => ({ ...prev, [requestId]: status }));

      const response = await axios.post(`${url}/leave-request/update-status`, {
        id: requestId,
        status: status
      }, {
        withCredentials: true
      });

      if (response.data.code === 201) {
        setLeaveRequests(prevRequests => 
          prevRequests.map(request => 
            request.id === requestId 
              ? { ...request, status: { status } }
              : request
          )
        );

        await Swal.fire({
          title: "Success!",
          text: response.data.message || "Leave request status updated successfully!",
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

        await fetchLeaveRequests();
      } else {
        await fetchLeaveRequests();
        await Swal.fire({
          title: "Error!",
          text: response.data.message || "Failed to update leave request status",
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
      await fetchLeaveRequests();
      await Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to update leave request status",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#4F46E5",
        position: "center",
        customClass: {
          popup: 'animated fadeInDown'
        }
      });
    } finally {
      // Clear loading state for specific request and action
      setUpdatingStatus(prev => {
        const newState = { ...prev };
        delete newState[requestId];
        return newState;
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Leave Requests</h1>
                <p className="text-gray-600">Manage employee leave requests</p>
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdSearch className="text-gray-400" size={20} />
                </div>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <MdFilterList size={20} />
                  <span>Filter</span>
                </button>
                {showFilters && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <div className="p-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="ALL">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Leave Requests Table */}
          <div className="bg-white rounded-2xl shadow-lg p-6 overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested On</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.map((request, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div className="font-medium">{request.employee?.fullName || 'N/A'}</div>
                            <div className="text-gray-500 text-xs">{request.employee?.email || 'N/A'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {request.leavePolicy.leaveType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(request.startDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(request.endDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status.status)}`}>
                            {request.status.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(request.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowDetails(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Details"
                              disabled={updatingStatus[request.id]}
                            >
                              <MdVisibility size={20} />
                            </button>
                            {request.status.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(request.id, 'APPROVED')}
                                  className="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Approve"
                                  disabled={updatingStatus[request.id]}
                                >
                                  {updatingStatus[request.id] === 'APPROVED' ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                                  ) : (
                                    <MdCheck size={20} />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(request.id, 'REJECTED')}
                                  className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Reject"
                                  disabled={updatingStatus[request.id]}
                                >
                                  {updatingStatus[request.id] === 'REJECTED' ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                                  ) : (
                                    <MdClose size={20} />
                                  )}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {currentItems.length === 0 && (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                          No leave requests found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-6">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => handlePageChange(index + 1)}
                        className={`px-3 py-1 rounded-md ${
                          currentPage === index + 1
                            ? 'bg-indigo-600 text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Leave Request Details Modal */}
      {showDetails && selectedRequest && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDetails(false);
            }
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Leave Request Details</h2>
                <p className="text-sm text-gray-500 mt-1">Request ID: #{selectedRequest.id}</p>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <MdClose size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Employee Information */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Employee Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="text-base font-medium text-gray-900">{selectedRequest.employee?.fullName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-base text-gray-900">{selectedRequest.employee?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="text-base text-gray-900">{selectedRequest.employee?.phoneNumber || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Leave Information */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Leave Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Leave Type</p>
                    <p className="text-base font-medium text-gray-900">{selectedRequest.leavePolicy.leaveType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Maximum Days</p>
                    <p className="text-base text-gray-900">{selectedRequest.leavePolicy.maxDay} days</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`mt-1 px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(selectedRequest.status.status)}`}>
                      {selectedRequest.status.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Date Information */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Date Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="text-base font-medium text-gray-900">{formatDate(selectedRequest.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">End Date</p>
                    <p className="text-base text-gray-900">{formatDate(selectedRequest.endDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Requested On</p>
                    <p className="text-base text-gray-900">{formatDate(selectedRequest.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Reason</h3>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <p className="text-gray-900">{selectedRequest.reason}</p>
                </div>
              </div>
            </div>

            {selectedRequest.status.status === 'PENDING' && (
              <div className="mt-6 flex justify-end space-x-4 pt-4 border-t">
                <button
                  onClick={() => {
                    handleStatusUpdate(selectedRequest.id, 'APPROVED');
                    setShowDetails(false);
                  }}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
                >
                  <MdCheck size={20} />
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => {
                    handleStatusUpdate(selectedRequest.id, 'REJECTED');
                    setShowDetails(false);
                  }}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center space-x-2"
                >
                  <MdClose size={20} />
                  <span>Reject</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLeaveRequest; 