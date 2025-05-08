import React, { useState } from 'react';
import { MdCalendarMonth, MdDownload } from 'react-icons/md';

export default function EmployeeReport() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const attendanceData = [
    { date: '2024-03-01', status: 'Present', checkIn: '9:00 AM', checkOut: '6:00 PM' },
    { date: '2024-03-02', status: 'Present', checkIn: '9:15 AM', checkOut: '6:00 PM' },
    { date: '2024-03-03', status: 'Weekend', checkIn: '-', checkOut: '-' },
    { date: '2024-03-04', status: 'Present', checkIn: '9:00 AM', checkOut: '6:00 PM' },
    { date: '2024-03-05', status: 'Leave', checkIn: '-', checkOut: '-' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present':
        return 'text-green-500';
      case 'Absent':
        return 'text-red-500';
      case 'Leave':
        return 'text-yellow-500';
      case 'Weekend':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Attendance Report</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <MdCalendarMonth className="text-gray-600" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
            <MdDownload />
            Download Report
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {attendanceData.map((record, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(record.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-medium ${getStatusColor(record.status)}`}>
                    {record.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.checkIn}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.checkOut}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Summary</h3>
          <div className="space-y-2">
            <p className="text-gray-600">Total Working Days: <span className="font-medium">22</span></p>
            <p className="text-gray-600">Present Days: <span className="font-medium text-green-500">18</span></p>
            <p className="text-gray-600">Absent Days: <span className="font-medium text-red-500">1</span></p>
            <p className="text-gray-600">Leave Days: <span className="font-medium text-yellow-500">3</span></p>
          </div>
        </div>
      </div>
    </div>
  );
} 