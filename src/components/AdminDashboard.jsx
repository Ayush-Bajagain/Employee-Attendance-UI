import React from 'react';
import { MdPeople, MdAccessTime, MdAssessment, MdNotifications, MdEvent, MdPerson } from 'react-icons/md';

export default function AdminDashboard() {
  // Sample data for demonstration
  const stats = [
    { title: 'Total Employees', value: '150', icon: <MdPeople size={24} />, color: 'bg-blue-500' },
    { title: 'Present Today', value: '142', icon: <MdAccessTime size={24} />, color: 'bg-green-500' },
    { title: 'On Leave', value: '5', icon: <MdEvent size={24} />, color: 'bg-yellow-500' },
    { title: 'Absent', value: '3', icon: <MdPerson size={24} />, color: 'bg-red-500' },
  ];

  const recentActivities = [
    { id: 1, employee: 'John Doe', action: 'Checked in', time: '9:00 AM', status: 'On time' },
    { id: 2, employee: 'Jane Smith', action: 'Checked in', time: '9:15 AM', status: 'Late' },
    { id: 3, employee: 'Mike Johnson', action: 'Applied for leave', time: '10:30 AM', status: 'Pending' },
    { id: 4, employee: 'Sarah Wilson', action: 'Checked out', time: '6:00 PM', status: 'On time' },
  ];

  const quickActions = [
    { title: 'Add New Employee', description: 'Register a new employee in the system' },
    { title: 'Generate Reports', description: 'Create attendance and performance reports' },
    { title: 'Manage Leaves', description: 'View and approve leave requests' },
    { title: 'Send Notifications', description: 'Send announcements to all employees' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Admin Dashboard</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <p className="text-2xl font-semibold text-gray-800 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-full text-white`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent Activities</h2>
            <button className="text-blue-500 hover:text-blue-600">View All</button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <MdNotifications className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{activity.employee}</p>
                    <p className="text-xs text-gray-500">{activity.action}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{activity.time}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    activity.status === 'On time' ? 'bg-green-100 text-green-800' :
                    activity.status === 'Late' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="p-4 border rounded-lg hover:bg-gray-50 text-left transition-colors"
              >
                <h3 className="font-medium text-gray-800">{action.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{action.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 