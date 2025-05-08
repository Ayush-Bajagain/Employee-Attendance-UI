import React from 'react';
import { MdAccessTime, MdCalendarToday, MdEventNote } from 'react-icons/md';

export default function EmployeeDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Employee Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Attendance Overview Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Today's Attendance</h2>
            <MdAccessTime className="text-blue-500 text-2xl" />
          </div>
          <div className="space-y-2">
            <p className="text-gray-600">Status: <span className="text-green-500 font-medium">Present</span></p>
            <p className="text-gray-600">Check-in: 9:00 AM</p>
            <p className="text-gray-600">Check-out: 6:00 PM</p>
          </div>
        </div>

        {/* Monthly Overview Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Monthly Overview</h2>
            <MdCalendarToday className="text-purple-500 text-2xl" />
          </div>
          <div className="space-y-2">
            <p className="text-gray-600">Present Days: <span className="font-medium">20</span></p>
            <p className="text-gray-600">Absent Days: <span className="font-medium">1</span></p>
            <p className="text-gray-600">Leave Days: <span className="font-medium">2</span></p>
          </div>
        </div>

        {/* Recent Activities Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Recent Activities</h2>
            <MdEventNote className="text-orange-500 text-2xl" />
          </div>
          <div className="space-y-3">
            <div className="border-l-2 border-green-500 pl-3">
              <p className="text-sm text-gray-600">Check-in at 9:00 AM</p>
              <p className="text-xs text-gray-500">Today</p>
            </div>
            <div className="border-l-2 border-red-500 pl-3">
              <p className="text-sm text-gray-600">Leave Request Approved</p>
              <p className="text-xs text-gray-500">Yesterday</p>
            </div>
            <div className="border-l-2 border-blue-500 pl-3">
              <p className="text-sm text-gray-600">Check-out at 6:00 PM</p>
              <p className="text-xs text-gray-500">Yesterday</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 