import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdDownload, MdSearch, MdFilterList } from 'react-icons/md';
import Swal from 'sweetalert2';

const AdminReports = () => {
  // ... existing states ...

  const fetchReports = async () => {
    try {
      const response = await axios.get(`${url}/reports/getAll`, {
        withCredentials: true,
      });
      if (response.data.code === 200) {
        setReports(response.data.data);
      }
    } catch (error) {
      // Don't show error alert during loading
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (reportId) => {
    try {
      const response = await axios.get(`${url}/reports/download/${reportId}`, {
        withCredentials: true,
        responseType: 'blob',
      });

      // Create a blob from the response data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      await Swal.fire({
        title: "Success!",
        text: "Report downloaded successfully",
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
    } catch (error) {
      await Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to download report",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#4F46E5",
        position: "center",
        customClass: {
          popup: 'animated fadeInDown'
        }
      });
    }
  };

  const handleGenerateReport = async () => {
    try {
      const response = await axios.post(
        `${url}/reports/generate`,
        {
          startDate: selectedDateRange.startDate,
          endDate: selectedDateRange.endDate,
          reportType: selectedReportType,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.code === 201) {
        await Swal.fire({
          title: "Success!",
          text: "Report generated successfully",
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
        fetchReports();
      } else {
        await Swal.fire({
          title: "Error!",
          text: response.data.message || "Failed to generate report",
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
        text: error.response?.data?.message || "Failed to generate report",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#4F46E5",
        position: "center",
        customClass: {
          popup: 'animated fadeInDown'
        }
      });
    }
  };

  // ... rest of the component code ...

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Reports</h1>
                <p className="text-gray-600">Generate and manage reports</p>
              </div>
            </div>
          </div>

          {/* Search and Filter Section - Only show if there are records */}
          {!loading && filteredReports.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
              {/* ... existing search and filter code ... */}
            </div>
          )}

          {/* Reports Table */}
          <div className="bg-white rounded-2xl shadow-lg p-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Range</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generated On</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4">
                      <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                      {filteredReports.length === 0 ? 'No reports found' : 'No matching records found'}
                    </td>
                  </tr>
                ) : (
                  currentItems.map((report, index) => (
                    // ... existing row code ...
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination - Only show if there are records */}
            {!loading && totalPages > 1 && (
              // ... existing pagination code ...
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports; 