import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { MdAdd, MdClose } from 'react-icons/md';

const LeaveRequest = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leavePolicies, setLeavePolicies] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    leaveType: '',
    reason: ''
  });

  const url = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    fetchLeavePolicies();
    fetchLeaveRequests();
  }, [url]);

  const fetchLeavePolicies = async () => {
    try {
      const response = await axios.post(`${url}/leave-policy/get`, {}, {
        withCredentials: true
      });

      if (response.data.code === 200) {
        setLeavePolicies(response.data.data);
      } else {
        toast.error(response.data.message || "Failed to fetch leave policies");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch leave policies");
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      const response = await axios.post(`${url}/leave-request/get-own`, {}, {
        withCredentials: true
      });

      if (response.data.code === 200) {
        setLeaveRequests(response.data.data);
      } else {
        toast.error(response.data.message || "Failed to fetch leave requests");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch leave requests");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post(`${url}/leave-request/create`, {
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
        leaveType: formData.leaveType
      }, {
        withCredentials: true
      });

      if (response.data.code === 201) {
        await Swal.fire({
          title: "Success!",
          text: response.data.message || "Leave request submitted successfully!",
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
        setFormData({
          startDate: '',
          endDate: '',
          leaveType: '',
          reason: ''
        });
        setShowForm(false);
        fetchLeaveRequests(); // Refresh the list
      } else {
        await Swal.fire({
          title: "Error!",
          text: response.data.message || "Failed to submit leave request",
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
      const errorMessage = error.response?.data?.message || "Failed to submit leave request";
      await Swal.fire({
        title: "Error!",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#4F46E5",
        position: "center",
        customClass: {
          popup: 'animated fadeInDown'
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Leave Requests</h1>
                <p className="text-gray-600">View and manage your leave requests</p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 md:mt-0 bg-purple-600 text-white px-6 py-2 rounded-xl hover:bg-purple-700 transition-all duration-200 flex items-center gap-2"
              >
                <MdAdd size={20} />
                New Leave Request
              </button>
            </div>
          </div>

          {/* Leave Requests Table */}
          <div className="bg-white rounded-2xl shadow-lg p-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested On</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaveRequests.map((request, index) => (
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
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {request.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status.status)}`}>
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
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      No leave requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Leave Request Form Modal */}
      {showForm && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowForm(false);
            }
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">New Leave Request</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <MdClose size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="shadow-sm appearance-none border border-gray-300 rounded-xl w-full py-2.5 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="shadow-sm appearance-none border border-gray-300 rounded-xl w-full py-2.5 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Leave Type
                </label>
                <select
                  name="leaveType"
                  value={formData.leaveType}
                  onChange={handleChange}
                  className="shadow-sm appearance-none border border-gray-300 rounded-xl w-full py-2.5 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  required
                >
                  <option value="">Select Leave Type</option>
                  {leavePolicies.map((policy) => (
                    <option key={policy.id} value={policy.leaveType}>
                      {policy.leaveType}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Reason
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  className="shadow-sm appearance-none border border-gray-300 rounded-xl w-full py-2.5 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 min-h-[100px]"
                  placeholder="Describe the reason for your leave"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequest; 