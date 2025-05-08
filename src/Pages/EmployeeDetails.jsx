import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaVenusMars, FaBirthdayCake, FaBuilding, FaBriefcase, FaCalendarAlt, FaTint } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [employeeData, setEmployeeData] = useState(null);
  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        const response = await axios.get(`${baseUrl}/employee/get/${id}`, {
          withCredentials: true,
        });
        
        if (response.data.code === 200) {
          setEmployeeData(response.data.data);
        } else {
          toast.error(response.data.message || "Failed to fetch employee details");
        }
      } catch (error) {
        console.error('Error fetching employee data:', error);
        toast.error(error.response?.data?.message || "Failed to fetch employee details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEmployeeDetails();
    } else {
      setLoading(false);
      toast.error("Employee ID is missing");
    }
  }, [id, baseUrl]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!employeeData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800">No Employee Data Found</h2>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
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
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-800 ml-4">Employee Details</h1>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-8">
            {/* Basic Information */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start">
                  <FaUser className="text-blue-600 mt-1 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Full Name</div>
                    <div className="font-medium">{employeeData.fullName || '-'}</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <FaEnvelope className="text-blue-600 mt-1 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-medium">{employeeData.email || '-'}</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <FaPhone className="text-blue-600 mt-1 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Phone Number</div>
                    <div className="font-medium">{employeeData.phoneNumber || '-'}</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <FaMapMarkerAlt className="text-blue-600 mt-1 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Address</div>
                    <div className="font-medium">{employeeData.address || '-'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start">
                  <FaVenusMars className="text-blue-600 mt-1 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Gender</div>
                    <div className="font-medium">{employeeData.gender || '-'}</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <FaBirthdayCake className="text-blue-600 mt-1 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Date of Birth</div>
                    <div className="font-medium">{formatDate(employeeData.dob)}</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <FaTint className="text-blue-600 mt-1 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Blood Group</div>
                    <div className="font-medium">{employeeData.bloodGroup || '-'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Professional Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start">
                  <FaBuilding className="text-blue-600 mt-1 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Department</div>
                    <div className="font-medium">{employeeData.department || '-'}</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <FaBriefcase className="text-blue-600 mt-1 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Position</div>
                    <div className="font-medium">{employeeData.position || '-'}</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <FaCalendarAlt className="text-blue-600 mt-1 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Date of Joining</div>
                    <div className="font-medium">{formatDate(employeeData.dateOfJoining)}</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <FaUser className="text-blue-600 mt-1 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Status</div>
                    <div className="font-medium">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        employeeData.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {employeeData.status || '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails; 