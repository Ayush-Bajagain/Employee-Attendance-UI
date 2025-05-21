import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaUserPlus, FaEllipsisV } from "react-icons/fa";
import { MdSearch, MdFilterList } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import Swal from 'sweetalert2';

const Employee = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
    gender: "",
    dob: "",
    department: "",
    position: "",
    dateOfJoining: "",
    bloodGroup: ""
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

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
       
        setEmployees(response.data.data);
      }
    } catch (error) {
 
      toast.error("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchDropdownOptions();
  }, []);

  // Filter employees based on search, department and status
  const filteredEmployees = employees.filter(employee => {
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch = 
      employee.fullName?.toLowerCase().includes(searchLower) ||
      employee.email?.toLowerCase().includes(searchLower) ||
      employee.phoneNumber?.toLowerCase().includes(searchLower);
    
    const matchesDepartment = !departmentFilter || employee.department === departmentFilter;
    const matchesStatus = !statusFilter || employee.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, departmentFilter, statusFilter]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formattedData = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        gender: {
          genderName: formData.gender
        },
        dob: formData.dob ? `${formData.dob}T00:00:00.000Z` : null,
        department: {
          departmentName: formData.department
        },
        position: {
          positionName: formData.position
        },
        dateOfJoining: formData.dateOfJoining ? `${formData.dateOfJoining}T00:00:00.000Z` : null,
        bloodGroupName: {
          bloodGroupName: formData.bloodGroup
        }
      };

      const response = await axios.post(`${url}/employee/register`, formattedData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.code === 201) {
        await Swal.fire({
          title: "Success!",
          text: "Employee added successfully!",
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
        setShowModal(false);
        resetForm();
        await fetchEmployees();
      } else {
        await Swal.fire({
          title: "Error!",
          text: response.data.message || "Failed to add employee",
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
      console.error('Error adding employee:', error);
      await Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to add employee",
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

  const handleEditEmployee = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formattedData = {
        employeeId: parseInt(formData.employeeId),
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        department: formData.department,
        dateOfJoining: formData.dateOfJoining ? `${formData.dateOfJoining}T00:00:00.000+05:45` : null,
        email: formData.email,
        address: formData.address,
        dateOfBirth: formData.dob,
        position: formData.position
      };

      const response = await axios.post(`${url}/employee/update-employee`, formattedData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.code === 201) {
        await Swal.fire({
          title: "Success!",
          text: "Employee updated successfully!",
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
    setShowModal(false);
        resetForm();
        await fetchEmployees();
      } else {
        await Swal.fire({
          title: "Error!",
          text: response.data.message || "Failed to update employee",
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
      console.error('Error updating employee:', error);
      await Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to update employee",
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

  const resetForm = () => {
    setFormData({
      employeeId: "",
      fullName: "",
      email: "",
      phoneNumber: "",
      address: "",
      gender: "",
      dob: "",
      department: "",
      position: "",
      dateOfJoining: "",
      bloodGroup: ""
    });
    setIsEditMode(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
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
    setIsEditMode(true);
    setFormData({
      employeeId: employee.id,
      fullName: employee.fullName || "",
      email: employee.email || "",
      phoneNumber: employee.phoneNumber || "",
      address: employee.address || "",
      gender: employee.gender || "",
      dob: employee.dob ? employee.dob.split('T')[0] : "",
      department: employee.department || "",
      position: employee.position || "",
      dateOfJoining: employee.dateOfJoining ? employee.dateOfJoining.split('T')[0] : "",
      bloodGroup: employee.bloodGroup || ""
    });
    setShowModal(true);
    setShowActionMenu(null);
  };

  // Function to handle delete employee
  const handleDelete = async (employee) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete the employee ${employee.fullName}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4F46E5",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel"
    });

    if (result.isConfirmed) {
    try {
        const response = await axios.post(`${url}/employee/delete/${employee.id}`, {}, {
        withCredentials: true,
      });
        
        if (response.data.code === 201) {
          await Swal.fire({
            title: "Deleted!",
            text: response.data.message || 'Employee deleted successfully',
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
          fetchEmployees();
      } else {
          await Swal.fire({
            title: "Error!",
            text: response.data.message || 'Failed to delete employee',
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
          text: error.response?.data?.message || 'Failed to delete employee',
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#4F46E5",
          position: "center",
          customClass: {
            popup: 'animated fadeInDown'
          }
        });
      }
    }
    setShowActionMenu(null);
  };

  // Function to handle status change
  const handleStatusChange = async (employee, status) => {
    const result = await Swal.fire({
      title: "Change Status?",
      text: `Are you sure you want to change the status of ${employee.fullName} from ${employee.status || 'N/A'} to ${status}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4F46E5",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, change it!",
      cancelButtonText: "Cancel"
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.post(`${url}/employee/updateStatus`, {
          employeeId: employee.id,
        status: status
      }, {
        withCredentials: true,
      });
        
        if (response.data.code === 201) {
          await Swal.fire({
            title: "Updated!",
            text: response.data.message || 'Status updated successfully',
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
          fetchEmployees();
      } else {
          await Swal.fire({
            title: "Error!",
            text: response.data.message || 'Failed to update status',
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
          text: error.response?.data?.message || 'Failed to update status',
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#4F46E5",
          position: "center",
          customClass: {
            popup: 'animated fadeInDown'
          }
        });
      }
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

  // Add click outside handler for modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showModal && event.target.classList.contains('modal-backdrop')) {
        handleCloseModal();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showModal]);

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

          {/* Search and Filter Section - Only show if there are employees */}
          {!loading && employees.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <div className="relative flex-1 max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MdSearch className="text-gray-400" size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name, email, or phone..."
                    className="pl-9 pr-4 py-1.5 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    <MdFilterList size={18} />
                    <span>Filter</span>
                  </button>
                  {showFilters && (
                    <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <div className="p-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
                        <select
                          value={departmentFilter}
                          onChange={(e) => setDepartmentFilter(e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">All Departments</option>
                          {departments.map((dept) => (
                            <option key={dept.id} value={dept.departmentName}>
                              {dept.departmentName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="p-2 border-t border-gray-100">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">All Status</option>
                          {statusList.map((status) => (
                            <option key={status.id} value={status.statusName}>
                              <span className="inline-flex items-center">
                                {status.statusName}
                              </span>
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Employee Table */}
          <div className="bg-white rounded-2xl shadow-lg overflow-visible">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg">No employees found</div>
                <p className="text-gray-500 mt-2">
                  {searchTerm || departmentFilter ? 'Try adjusting your search or filters' : 'Add new employees to get started'}
                </p>
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
                    {currentItems.map((employee) => (
                      <tr key={employee.id} className="relative">
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
                          
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 px-4 py-3 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-700">Show</span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                      <span className="text-sm text-gray-700">entries</span>
                    </div>

                    <div className="flex items-center space-x-2">
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
                              ? 'bg-blue-600 text-white'
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

                    <div className="text-sm text-gray-700">
                      Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredEmployees.length)} of {filteredEmployees.length} entries
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-[2px] overflow-y-auto h-full w-full z-50 modal-backdrop">
          <div className="relative top-4 sm:top-10 mx-auto p-4 sm:p-6 border w-[95%] sm:w-[90%] md:w-[80%] lg:w-[700px] shadow-2xl rounded-2xl bg-white/95 backdrop-blur-md transform transition-all duration-300 ease-in-out">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                  {isEditMode ? 'Edit Employee' : 'Add New Employee'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors duration-200"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={isEditMode ? handleEditEmployee : handleAddEmployee} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="shadow-sm appearance-none border border-gray-300 rounded-xl w-full py-2.5 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="shadow-sm appearance-none border border-gray-300 rounded-xl w-full py-2.5 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, phoneNumber: e.target.value })
                    }
                    className="shadow-sm appearance-none border border-gray-300 rounded-xl w-full py-2.5 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="shadow-sm appearance-none border border-gray-300 rounded-xl w-full py-2.5 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                    className="shadow-sm appearance-none border border-gray-300 rounded-xl w-full py-2.5 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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

                <div className="col-span-1">
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) =>
                      setFormData({ ...formData, dob: e.target.value })
                    }
                    className="shadow-sm appearance-none border border-gray-300 rounded-xl w-full py-2.5 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    className="shadow-sm appearance-none border border-gray-300 rounded-xl w-full py-2.5 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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

                <div className="col-span-1">
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Position
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                    className="shadow-sm appearance-none border border-gray-300 rounded-xl w-full py-2.5 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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

                <div className="col-span-1">
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Date of Joining
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfJoining}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfJoining: e.target.value })
                    }
                    className="shadow-sm appearance-none border border-gray-300 rounded-xl w-full py-2.5 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Blood Group
                  </label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) =>
                      setFormData({ ...formData, bloodGroup: e.target.value })
                    }
                    className="shadow-sm appearance-none border border-gray-300 rounded-xl w-full py-2.5 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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

                <div className="col-span-1 sm:col-span-2 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-gray-100 text-gray-700 px-6 py-2.5 rounded-xl hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {isEditMode ? 'Updating...' : 'Adding...'}
                      </>
                    ) : (
                      isEditMode ? 'Update Employee' : 'Add Employee'
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
