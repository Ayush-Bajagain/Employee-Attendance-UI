import React, { useState } from 'react';
import { MdDownload, MdFilterList, MdSearch, MdCalendarMonth, MdPerson } from 'react-icons/md';

export default function AdminReports() {
  const [selectedReport, setSelectedReport] = useState('attendance');
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // Sample data for demonstration
  const attendanceReport = [
    { id: 1, employee: 'John Doe', department: 'Engineering', present: 22, absent: 1, late: 2, leave: 0 },
    { id: 2, employee: 'Jane Smith', department: 'Marketing', present: 20, absent: 0, late: 1, leave: 2 },
    { id: 3, employee: 'Mike Johnson', department: 'HR', present: 21, absent: 1, late: 0, leave: 1 },
    { id: 4, employee: 'Sarah Wilson', department: 'Finance', present: 23, absent: 0, late: 0, leave: 0 },
  ];

  const leaveReport = [
    { id: 1, employee: 'John Doe', department: 'Engineering', type: 'Sick Leave', startDate: '2024-03-15', endDate: '2024-03-16', status: 'Approved' },
    { id: 2, employee: 'Jane Smith', department: 'Marketing', type: 'Annual Leave', startDate: '2024-03-20', endDate: '2024-03-22', status: 'Pending' },
    { id: 3, employee: 'Mike Johnson', department: 'HR', type: 'Personal Leave', startDate: '2024-03-18', endDate: '2024-03-18', status: 'Approved' },
    { id: 4, employee: 'Sarah Wilson', department: 'Finance', type: 'Sick Leave', startDate: '2024-03-19', endDate: '2024-03-20', status: 'Rejected' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Reports</h1>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
            <MdDownload />
            Export Report
          </button>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setSelectedReport('attendance')}
            className={`px-4 py-2 rounded-md transition-colors ${
              selectedReport === 'attendance'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Attendance Report
          </button>
          <button
            onClick={() => setSelectedReport('leave')}
            className={`px-4 py-2 rounded-md transition-colors ${
              selectedReport === 'leave'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Leave Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search employee..."
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <MdSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <button className="flex items-center gap-2 w-full px-4 py-2 border rounded-md hover:bg-gray-50">
              <MdFilterList />
              Filter by Department
            </button>
          </div>
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {selectedReport === 'attendance' ? (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Absent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Late</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave</th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {selectedReport === 'attendance' ? (
                attendanceReport.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <MdPerson className="text-gray-500" size={24} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{record.employee}</div>
                          <div className="text-sm text-gray-500">{record.department}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.present}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.absent}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.late}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.leave}</td>
                  </tr>
                ))
              ) : (
                leaveReport.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <MdPerson className="text-gray-500" size={24} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{record.employee}</div>
                          <div className="text-sm text-gray-500">{record.department}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.startDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.endDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 