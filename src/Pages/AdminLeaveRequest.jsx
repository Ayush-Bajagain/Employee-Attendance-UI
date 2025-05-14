import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { MdCheck, MdClose, MdVisibility } from 'react-icons/md';

const AdminLeaveRequest = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const url = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
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
      const response = await axios.post(`${url}/leave-request/update-status`, {
        requestId,
        status
      }, {
        withCredentials: true
      });

      if (response.data.code === 200) {
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
        fetchLeaveRequests();
      } else {
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

          {/* Leave Requests Table */}
          <div className="bg-white rounded-2xl shadow-lg p-6 overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : (
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
                  {leaveRequests.map((request, index) => (
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
                          >
                            <MdVisibility size={20} />
                          </button>
                          {request.status.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(request.id, 'APPROVED')}
                                className="text-green-600 hover:text-green-900"
                                title="Approve"
                              >
                                <MdCheck size={20} />
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(request.id, 'REJECTED')}
                                className="text-red-600 hover:text-red-900"
                                title="Reject"
                              >
                                <MdClose size={20} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {leaveRequests.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                        No leave requests found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Leave Request Details</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <MdClose size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Employee</h3>
                <div className="mt-1">
                  <p className="text-sm text-gray-900 font-medium">{selectedRequest.employee?.fullName || 'N/A'}</p>
                  <p className="text-sm text-gray-500">{selectedRequest.employee?.email || 'N/A'}</p>
                  <p className="text-sm text-gray-500">{selectedRequest.employee?.phoneNumber || 'N/A'}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Leave Type</h3>
                <p className="mt-1 text-sm text-gray-900">{selectedRequest.leavePolicy.leaveType}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Start Date</h3>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(selectedRequest.startDate)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">End Date</h3>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(selectedRequest.endDate)}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Reason</h3>
                <p className="mt-1 text-sm text-gray-900">{selectedRequest.reason}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedRequest.status.status)}`}>
                  {selectedRequest.status.status}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Requested On</h3>
                <p className="mt-1 text-sm text-gray-900">{formatDate(selectedRequest.createdAt)}</p>
              </div>

              {selectedRequest.status.status === 'PENDING' && (
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedRequest.id, 'APPROVED');
                      setShowDetails(false);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedRequest.id, 'REJECTED');
                      setShowDetails(false);
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLeaveRequest; 