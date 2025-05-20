import React, { useState, useEffect } from 'react';
import { MdCalendarMonth, MdDownload } from 'react-icons/md';
import axios from 'axios';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

export default function EmployeeReport() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    totalWorkingDays: 0,
    presentDays: 0,
    absentDays: 0,
    leaveDays: 0
  });

  const url = import.meta.env.VITE_BASE_URL;

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const [year, month] = selectedMonth.split('-').map(Number);
      
      const response = await axios.post(
        `${url}/attendance/getMonthlyRecord`,
        {
          year,
          month
        },
        { withCredentials: true }
      );

      if (response.data.code === 200) {
        setAttendanceData(response.data.data);
        calculateSummary(response.data.data);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.data.message || 'Failed to fetch attendance data',
          confirmButtonColor: '#3085d6'
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to fetch attendance data',
        confirmButtonColor: '#3085d6'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (data) => {
    const statusCounts = {
      totalWorkingDays: data.length,
      presentDays: 0,
      absentDays: 0,
      leaveDays: 0,
      weekendDays: 0,
      lateDays: 0,
      earlyLeaveDays: 0
    };

    data.forEach(record => {
      switch (record.status?.toUpperCase()) {
        case 'PRESENT':
          statusCounts.presentDays++;
          // Check for late check-in
          if (record.checkInTime) {
            const checkInTime = new Date(record.checkInTime);
            const startTime = new Date(record.attendanceDate);
            startTime.setHours(9, 0, 0); // Assuming 9 AM is the start time
            if (checkInTime > startTime) {
              statusCounts.lateDays++;
            }
          }
          // Check for early leave
          if (record.checkOutTime) {
            const checkOutTime = new Date(record.checkOutTime);
            const endTime = new Date(record.attendanceDate);
            endTime.setHours(17, 0, 0); // Assuming 5 PM is the end time
            if (checkOutTime < endTime) {
              statusCounts.earlyLeaveDays++;
            }
          }
          break;
        case 'ABSENT':
          statusCounts.absentDays++;
          break;
        case 'LEAVE':
          statusCounts.leaveDays++;
          break;
        case 'WEEKEND':
          statusCounts.weekendDays++;
          break;
        default:
          // Handle any other status types
          if (record.status) {
            statusCounts[record.status.toLowerCase() + 'Days'] = 
              (statusCounts[record.status.toLowerCase() + 'Days'] || 0) + 1;
          }
      }
    });

    setSummary(statusCounts);
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedMonth]);

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

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '-';
    const date = new Date(dateTimeStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateTimeStr) => {
    if (!dateTimeStr) return '-';
    const date = new Date(dateTimeStr);
    return date.toLocaleDateString();
  };

  const handleDownloadReport = async () => {
    try {
      // Show loading state
      Swal.fire({
        title: 'Preparing Download',
        text: 'Please wait while we prepare your report...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Prepare data for Excel
      const dataToExport = attendanceData.map(record => ({
        'Date': formatDate(record.attendanceDate),
        'Status': record.status,
        'Check In': formatDateTime(record.checkInTime),
        'Check Out': formatDateTime(record.checkOutTime)
      }));

      // Add summary data
      const summaryData = [
        { '': 'Summary' },
        { 'Total Working Days': summary.totalWorkingDays },
        { 'Present Days': summary.presentDays },
        { 'Absent Days': summary.absentDays },
        { 'Leave Days': summary.leaveDays }
      ];

      // Create worksheets
      const attendanceSheet = XLSX.utils.json_to_sheet(dataToExport);
      const summarySheet = XLSX.utils.json_to_sheet(summaryData);

      // Set column widths
      const columnWidths = [
        { wch: 15 }, // Date
        { wch: 12 }, // Status
        { wch: 12 }, // Check In
        { wch: 12 }  // Check Out
      ];
      attendanceSheet['!cols'] = columnWidths;

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, attendanceSheet, 'Attendance');
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_report_${selectedMonth}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      // Show success message
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Report downloaded successfully',
        confirmButtonColor: '#3085d6',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to download report',
        confirmButtonColor: '#3085d6'
      });
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
          <button 
            onClick={handleDownloadReport}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            <MdDownload />
            Download Report
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : attendanceData.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">No attendance records found</div>
            <p className="text-gray-500 mt-2">Select a different month to view attendance records</p>
          </div>
        ) : (
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
              {attendanceData.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(record.attendanceDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateTime(record.checkInTime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateTime(record.checkOutTime)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Summary</h3>
          <div className="space-y-2">
            <p className="text-gray-600">Total Working Days: <span className="font-medium">{summary.totalWorkingDays}</span></p>
            <p className="text-gray-600">Present Days: <span className="font-medium text-green-500">{summary.presentDays}</span></p>
            <p className="text-gray-600">Absent Days: <span className="font-medium text-red-500">{summary.absentDays}</span></p>
            <p className="text-gray-600">Leave Days: <span className="font-medium text-yellow-500">{summary.leaveDays}</span></p>
            {summary.weekendDays > 0 && (
              <p className="text-gray-600">Weekend Days: <span className="font-medium text-gray-500">{summary.weekendDays}</span></p>
            )}
            {summary.lateDays > 0 && (
              <p className="text-gray-600">Late Days: <span className="font-medium text-orange-500">{summary.lateDays}</span></p>
            )}
            {summary.earlyLeaveDays > 0 && (
              <p className="text-gray-600">Early Leave Days: <span className="font-medium text-orange-500">{summary.earlyLeaveDays}</span></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 