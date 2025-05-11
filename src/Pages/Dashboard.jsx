import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdPeople, MdAccessTime, MdEventNote, MdPerson } from 'react-icons/md';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    onLeave: 0,
    absent: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const url = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch total employees
      const totalEmployeesResponse = await axios.get(`${url}/employee/get-total-employee`, {
        withCredentials: true
      });

      // Fetch attendance status
      const attendanceResponse = await axios.get(`${url}/attendance/count-status-of-employee`, {
        withCredentials: true
      });

      if (totalEmployeesResponse.data.code === 200 && attendanceResponse.data.code === 200) {
        setStats({
          totalEmployees: totalEmployeesResponse.data.data || 0,
          presentToday: attendanceResponse.data.data.present || 0,
          onLeave: attendanceResponse.data.data.onLeave || 0,
          absent: attendanceResponse.data.data.absent || 0
        });
      }
    } catch (error) {
      toast.error('Failed to fetch dashboard statistics');
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
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

      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Employees Card */}
          <div className="bg-white rounded-xl shadow-md p-6 transform hover:scale-[1.02] transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalEmployees}</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-full">
                <MdPeople className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-600">
                <span className="text-green-500 mr-2">●</span>
                <span>Active employees in the system</span>
              </div>
            </div>
          </div>

          {/* Present Today Card */}
          <div className="bg-white rounded-xl shadow-md p-6 transform hover:scale-[1.02] transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Present Today</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.presentToday}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <MdAccessTime className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-600">
                <span className="text-green-500 mr-2">●</span>
                <span>Employees present today</span>
              </div>
            </div>
          </div>

          {/* On Leave Card */}
          <div className="bg-white rounded-xl shadow-md p-6 transform hover:scale-[1.02] transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">On Leave</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.onLeave}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <MdEventNote className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-600">
                <span className="text-yellow-500 mr-2">●</span>
                <span>Employees on leave</span>
              </div>
            </div>
          </div>

          {/* Absent Card */}
          <div className="bg-white rounded-xl shadow-md p-6 transform hover:scale-[1.02] transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Absent</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.absent}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <MdPerson className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-600">
                <span className="text-red-500 mr-2">●</span>
                <span>Employees absent today</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
