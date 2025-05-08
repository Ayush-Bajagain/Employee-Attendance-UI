import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaUserPlus, FaEllipsisV } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";

const Employee = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
    gender: {
      genderName: ""
    },
    dob: "",
    department: {
      departmentName: ""
    },
    position: {
      positionName: ""
    },
    dateOfJoining: "",
    bloodGroupName: {
      bloodGroupName: ""
    }
  });

  // States for dropdown options
  const [genders, setGenders] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [bloodGroups, setBloodGroups] = useState([]);
  const [statusList, setStatusList] = useState([]);

  const [showActionMenu, setShowActionMenu] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0, width: '12rem' });
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [statusMenuPosition, setStatusMenuPosition] = useState({ left: '100%', top: 0 });

  const url = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();

  // Fetch dropdown options
  const fetchDropdownOptions = async () => {
    try {
      const [genderRes, departmentRes, positionRes, bloodGroupRes, statusRes] = await Promise.all([
        axios.get(`${url}/system-config/getGenders`, { withCredentials: true }),
        axios.get(`${url}/system-config/getDepartments`, { withCredentials: true }),
        axios.get(`${url}/system-config/getPositions`, { withCredentials: true }),
        axios.get(`${url}/system-config/getBloodGroup`, { withCredentials: true }),
        axios.get(`${url}/system-config/getStatus`, { withCredentials: true })
      ]);

      if (genderRes.data.code === 200) setGenders(genderRes.data.data);
      if (departmentRes.data.code === 200) setDepartments(departmentRes.data.data);
      if (positionRes.data.code === 200) setPositions(positionRes.data.data);
      if (bloodGroupRes.data.code === 200) setBloodGroups(bloodGroupRes.data.data);
      if (statusRes.data.code === 200) setStatusList(statusRes.data.data);
    } catch (error) {
      toast.error("Failed to fetch dropdown options");
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${url}/employee/getAll`, {
        withCredentials: true,
      });
      if (response.data.code === 200) {
        console.log('Employee data:', response.data.data); // For debugging
        setEmployees(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error); // For debugging
      toast.error("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchDropdownOptions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post(`${url}/employee/register`, formData, {
        withCredentials: true,
      });
      if (response.data.code === 201) {
        toast.success(response.data.message);
        setShowModal(false);
        setFormData({
          fullName: "",
          email: "",
          phoneNumber: "",
          address: "",
          gender: { genderName: "" },
          dob: "",
          department: { departmentName: "" },
          position: { positionName: "" },
          dateOfJoining: "",
          bloodGroupName: { bloodGroupName: "" }
        });
        fetchEmployees();
      } else {
        toast.error(response.data.message || "Failed to add employee");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      fullName: "",
      email: "",
      phoneNumber: "",
      address: "",
      gender: { genderName: "" },
      dob: "",
      department: { departmentName: "" },
      position: { positionName: "" },
      dateOfJoining: "",
      bloodGroupName: { bloodGroupName: "" }
    });
  };

  // Function to handle action menu toggle
  const toggleActionMenu = (employeeId, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      
      const buttonRect = event.currentTarget.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const dropdownWidth = 192; // 12rem = 192px
      
      // Calculate available space
      const spaceRight = windowWidth - buttonRect.right;
      const spaceLeft = buttonRect.left;
      const spaceBottom = windowHeight - buttonRect.bottom;
      
      // Determine if dropdown should be positioned to the left or right
      const positionRight = spaceRight >= dropdownWidth || spaceRight > spaceLeft;
      
      // Calculate horizontal position
      const right = positionRight 
        ? windowWidth - buttonRect.right
        : windowWidth - buttonRect.left;
      
      // Calculate vertical position
      const top = spaceBottom >= 200 // Approximate height of dropdown
        ? buttonRect.bottom + window.scrollY + 5
        : buttonRect.top + window.scrollY - 205; // Position above if not enough space below
      
      setDropdownPosition({
        top,
        right,
        width: '12rem'
      });
    }
    setShowActionMenu(showActionMenu === employeeId ? null : employeeId);
    setShowStatusMenu(false);
  };

  // Function to handle status menu toggle
  const toggleStatusMenu = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!showStatusMenu) {
      const buttonRect = event.currentTarget.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const spaceRight = windowWidth - buttonRect.right;
      const spaceLeft = buttonRect.left;
      const statusMenuWidth = 192; // 12rem = 192px
      const isMobile = windowWidth < 640; // sm breakpoint

      if (isMobile) {
        // On mobile, position below the main dropdown
        setStatusMenuPosition({
          left: '0',
          right: 'auto',
          top: '100%',
          width: '100%'
        });
      } else {
        // On desktop, check available space
        if (spaceRight < statusMenuWidth && spaceLeft > statusMenuWidth) {
          setStatusMenuPosition({
            left: 'auto',
            right: '100%',
            top: 0,
            width: '12rem'
          });
        } else {
          setStatusMenuPosition({
            left: '100%',
            right: 'auto',
            top: 0,
            width: '12rem'
          });
        }
      }
    }

    setShowStatusMenu(!showStatusMenu);
  };

  // Add click outside handler for both menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showActionMenu && !event.target.closest('.action-menu-button')) {
        setShowActionMenu(null);
        setShowStatusMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showActionMenu]);

  // Function to handle view employee
  const handleView = (employee) => {
    try {
      if (!employee.id) {
        toast.error("Employee ID is missing");
        return;
      }
      console.log("Navigating to employee details with ID:", employee.id);
      // Navigate to employee details page with admin path
      navigate(`/admin/employees/${employee.id}`);
    } catch (error) {
      console.error('Error navigating to employee details:', error);
      toast.error("Failed to view employee details");
    }
    setShowActionMenu(null);
  };

  // Function to handle edit employee
  const handleEdit = (employee) => {
    // TODO: Implement edit functionality
    console.log('Edit employee:', employee);
    setShowActionMenu(null);
  };

  // Function to handle delete employee
  const handleDelete = async (employee) => {
    try {
      const response = await axios.delete(`${url}/employee/delete/${employee.id}`, {
        withCredentials: true,
      });
      if (response.data.code === 200) {
        toast.success('Employee deleted successfully');
        fetchEmployees(); // Refresh the list
      } else {
        toast.error(response.data.message || 'Failed to delete employee');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete employee');
    }
    setShowActionMenu(null);
  };

  // Function to handle status change
  const handleStatusChange = async (employee, status) => {
    try {
      const response = await axios.put(`${url}/employee/changeStatus/${employee.id}`, {
        status: status
      }, {
        withCredentials: true,
      });
      if (response.data.code === 200) {
        toast.success('Status updated successfully');
        fetchEmployees(); // Refresh the list
      } else {
        toast.error(response.data.message || 'Failed to update status');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
    setShowActionMenu(null);
  };

  // Update the status dropdown section
  const getStatusColor = (statusName) => {
    switch (statusName) {
      case 'ACTIVE':
        return 'bg-green-500';
      case 'INACTIVE':
        return 'bg-red-500';
      case 'PENDING':
        return 'bg-yellow-500';
      case 'ON_LEAVE':
        return 'bg-blue-500';
      case 'SUSPENDED':
        return 'bg-orange-500';
      case 'RESIGNED':
        return 'bg-purple-500';
      case 'DELETED':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
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

      <div className="w-full">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-4 lg:p-6 mb-4 lg:mb-8 transform hover:scale-[1.01] transition-transform duration-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Employee Management</h1>
              <p className="text-gray-600">Manage your employee information</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 md:mt-0 flex items-center bg-blue-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 transform hover:scale-[1.02] font-medium text-base lg:text-lg shadow-md hover:shadow-lg"
            >
              <FaUserPlus className="mr-2" />
              Add Employee
            </button>
          </div>
        </div>

        {/* Employee Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-visible">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg">No employees found</div>
              <p className="text-gray-500 mt-2">Add new employees to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Full Name
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50 transition-colors duration-150 relative">
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {employee.fullName || '-'}
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.email || '-'}
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.phoneNumber || '-'}
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.department || '-'}
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.position || '-'}
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.status || '-'}
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-right text-sm font-medium relative">
                        <button
                          onClick={(event) => toggleActionMenu(employee.id, event)}
                          className="text-gray-400 hover:text-gray-600 focus:outline-none action-menu-button"
                        >
                          <FaEllipsisV className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-2xl bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Employee</h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="shadow appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="shadow appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, phoneNumber: e.target.value })
                    }
                    className="shadow appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="shadow appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Gender
                  </label>
                  <select
                    value={formData.gender.genderName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        gender: { genderName: e.target.value },
                      })
                    }
                    className="shadow appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Gender</option>
                    {genders.map((gender) => (
                      <option key={gender.id} value={gender.genderName}>
                        {gender.genderName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dob.split('T')[0]}
                    onChange={(e) =>
                      setFormData({ ...formData, dob: e.target.value })
                    }
                    className="shadow appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Department
                  </label>
                  <select
                    value={formData.department.departmentName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        department: { departmentName: e.target.value },
                      })
                    }
                    className="shadow appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.departmentName}>
                        {dept.departmentName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Position
                  </label>
                  <select
                    value={formData.position.positionName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        position: { positionName: e.target.value },
                      })
                    }
                    className="shadow appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Position</option>
                    {positions.map((pos) => (
                      <option key={pos.id} value={pos.positionName}>
                        {pos.positionName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Date of Joining
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfJoining.split('T')[0]}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfJoining: e.target.value })
                    }
                    className="shadow appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Blood Group
                  </label>
                  <select
                    value={formData.bloodGroupName.bloodGroupName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bloodGroupName: { bloodGroupName: e.target.value },
                      })
                    }
                    className="shadow appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Blood Group</option>
                    {bloodGroups.map((bg) => (
                      <option key={bg.id} value={bg.bloodGroupName}>
                        {bg.bloodGroupName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2 flex justify-end space-x-2 mt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding...
                      </>
                    ) : (
                      'Add'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Render dropdown in portal */}
      {showActionMenu && createPortal(
        <div 
          className="fixed z-[99999] rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
          style={{
            top: `${dropdownPosition.top}px`,
            right: `${dropdownPosition.right}px`,
            width: dropdownPosition.width
          }}
        >
          <div className="py-1" role="menu" aria-orientation="vertical">
            <button
              onClick={(event) => {
                event.preventDefault();
                handleView(employees.find(emp => emp.id === showActionMenu));
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center whitespace-nowrap"
              role="menuitem"
            >
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="truncate">View Details</span>
            </button>
            <button
              onClick={(event) => {
                event.preventDefault();
                handleEdit(employees.find(emp => emp.id === showActionMenu));
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center whitespace-nowrap"
              role="menuitem"
            >
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="truncate">Edit</span>
            </button>
            <div className="relative">
              <button
                onClick={toggleStatusMenu}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between whitespace-nowrap"
                role="menuitem"
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate text-xs sm:text-sm">Status</span>
                </div>
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              {showStatusMenu && (
                <div 
                  className="absolute rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                  style={{
                    ...statusMenuPosition,
                    marginTop: statusMenuPosition.top === '100%' ? '0.5rem' : '0',
                    marginLeft: statusMenuPosition.left === '100%' ? '0.5rem' : '0',
                    marginRight: statusMenuPosition.right === '100%' ? '0.5rem' : '0',
                    zIndex: 100000,
                    maxHeight: statusMenuPosition.top === '100%' ? '200px' : 'none',
                    overflowY: statusMenuPosition.top === '100%' ? 'auto' : 'visible'
                  }}
                >
                  <div className="py-1">
                    {statusList.map((status) => (
                      <button
                        key={status.id}
                        onClick={(event) => {
                          event.preventDefault();
                          handleStatusChange(employees.find(emp => emp.id === showActionMenu), status.statusName);
                          setShowStatusMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 flex items-center whitespace-nowrap"
                      >
                        <span className={`w-2 h-2 ${getStatusColor(status.statusName)} rounded-full mr-2 flex-shrink-0`}></span>
                        <span className="truncate">{status.statusName}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="border-t border-gray-100"></div>
            <button
              onClick={(event) => {
                event.preventDefault();
                handleDelete(employees.find(emp => emp.id === showActionMenu));
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center whitespace-nowrap"
              role="menuitem"
            >
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="truncate">Delete</span>
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Employee;
