import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';

const LeaveRequest = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leavePolicies, setLeavePolicies] = useState([]);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    leaveType: '',
    reason: ''
  });

  const url = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
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

    fetchLeavePolicies();
  }, [url]);

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
        <div className="max-w-2xl mx-auto">
          {/* Header Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Leave Request</h1>
                <p className="text-gray-600">Submit your leave request</p>
              </div>
            </div>
          </div>

          {/* Leave Request Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
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
      </div>
    </div>
  );
};

export default LeaveRequest; 