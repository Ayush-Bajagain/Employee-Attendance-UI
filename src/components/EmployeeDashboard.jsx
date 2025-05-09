import React, { useState, useEffect } from 'react';
import { MdAccessTime, MdCalendarToday, MdEventNote, MdPerson, MdWork, MdNotifications } from 'react-icons/md';
import axios from 'axios';

export default function EmployeeDashboard() {
  const [employeeData, setEmployeeData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const url = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch employee data
        const employeeResponse = await axios.get(`${url}/employee/getAuthenticatedEmployee`, {
          withCredentials: true
        });
        if (employeeResponse.data.code === 200) {
          setEmployeeData(employeeResponse.data.data);
        }

        // Fetch attendance data
        const attendanceResponse = await axios.get(`${url}/attendance/getTodayStatus`, {
          withCredentials: true
        });
        if (attendanceResponse.data.code === 200) {
          setAttendanceData(attendanceResponse.data.data);
        }
      } catch (err) {
        setError('Failed to fetch data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  // Format time function
  const formatTime = (timeString) => {
    if (!timeString) return '-';
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true  
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Welcome back, {employeeData?.fullName}
        </h1>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors">
            <MdNotifications size={20} />
            <span>Mark Attendance</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Today's Status</h2>
            <MdAccessTime className="text-blue-500 text-2xl" />
          </div>
          <div className="space-y-2">
            <p className="text-gray-600">Status: <span className={`font-medium ${attendanceData?.status === 'Present' ? 'text-green-500' : 'text-red-500'}`}>{attendanceData?.status || 'Not Marked'}</span></p>
            <p className="text-gray-600">Check-in: <span className="font-medium">{formatTime(attendanceData?.checkInTime)}</span></p>
            <p className="text-gray-600">Check-out: <span className="font-medium">{formatTime(attendanceData?.checkOutTime)}</span></p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">This Month</h2>
            <MdCalendarToday className="text-purple-500 text-2xl" />
          </div>
          <div className="space-y-2">
            <p className="text-gray-600">Present Days: <span className="font-medium">20</span></p>
            <p className="text-gray-600">Absent Days: <span className="font-medium">1</span></p>
            <p className="text-gray-600">Leave Days: <span className="font-medium">2</span></p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Leave Balance</h2>
            <MdWork className="text-orange-500 text-2xl" />
          </div>
          <div className="space-y-2">
            <p className="text-gray-600">Annual Leave: <span className="font-medium">12 days</span></p>
            <p className="text-gray-600">Sick Leave: <span className="font-medium">5 days</span></p>
            <p className="text-gray-600">Casual Leave: <span className="font-medium">3 days</span></p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Profile Status</h2>
            <MdPerson className="text-green-500 text-2xl" />
          </div>
          <div className="space-y-2">
            <p className="text-gray-600">Department: <span className="font-medium">{employeeData?.department}</span></p>
            <p className="text-gray-600">Position: <span className="font-medium">{employeeData?.position}</span></p>
            <p className="text-gray-600">Employee ID: <span className="font-medium">{employeeData?.id}</span></p>
          </div>
        </div>
      </div>

      {/* Recent Activities and Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Recent Activities</h2>
            <MdEventNote className="text-orange-500 text-2xl" />
          </div>
          <div className="space-y-4">
            <div className="border-l-2 border-green-500 pl-3">
              <p className="text-sm text-gray-600">Check-in at 9:00 AM</p>
              <p className="text-xs text-gray-500">Today, 9:00 AM</p>
            </div>
            <div className="border-l-2 border-red-500 pl-3">
              <p className="text-sm text-gray-600">Leave Request Approved</p>
              <p className="text-xs text-gray-500">Yesterday, 2:30 PM</p>
            </div>
            <div className="border-l-2 border-blue-500 pl-3">
              <p className="text-sm text-gray-600">Check-out at 6:00 PM</p>
              <p className="text-xs text-gray-500">Yesterday, 6:00 PM</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Upcoming Events</h2>
            <MdCalendarToday className="text-purple-500 text-2xl" />
          </div>
          <div className="space-y-4">
            <div className="border-l-2 border-purple-500 pl-3">
              <p className="text-sm text-gray-600">Team Meeting</p>
              <p className="text-xs text-gray-500">Tomorrow, 10:00 AM</p>
            </div>
            <div className="border-l-2 border-blue-500 pl-3">
              <p className="text-sm text-gray-600">Project Deadline</p>
              <p className="text-xs text-gray-500">Next Monday</p>
            </div>
            <div className="border-l-2 border-green-500 pl-3">
              <p className="text-sm text-gray-600">Performance Review</p>
              <p className="text-xs text-gray-500">Next Friday</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 