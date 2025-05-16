import { useState, useEffect } from 'react';
import axios from 'axios';

const Resources = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    file: null
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [resources, setResources] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const url = import.meta.env.VITE_BASE_URL;

  // Fetch resources on component mount
  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await axios.post(`${url}/resources/get-all`, {}, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });

      if (response.data && response.data.code === 200 && Array.isArray(response.data.date)) {
        setResources(response.data.date);
      } else {
        setResources([]);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
      setResources([]);
    } finally {
      setTableLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      const file = files[0];
      if (file && file.type === 'application/pdf') {
        setFormData({ ...formData, file });
      } else {
        setMessage({ type: 'error', text: 'Please upload a PDF file' });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Create FormData object
      const formDataToSend = new FormData();
      
      // Append each field individually
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('category', formData.category.trim());
      
      // Handle file upload
      if (formData.file) {
        // Ensure file is a PDF
        if (formData.file.type !== 'application/pdf') {
          setMessage({ type: 'error', text: 'Please upload a PDF file' });
          setLoading(false);
          return;
        }
        formDataToSend.append('file', formData.file);
      }

      // Log the data being sent (for debugging)
      console.log('Sending data:', {
        name: formData.name.trim(),
        category: formData.category.trim(),
        file: formData.file?.name
      });

      // Make the API request
      const response = await axios({
        method: 'post',
        url: `${url}/resources/add`,
        data: formDataToSend,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        },
        withCredentials: true
      });

      // Log the response (for debugging)
      console.log('API Response:', response.data);

      // Handle the response
      if (response.data.code === 201) {
        setMessage({ type: 'success', text: response.data.message });
        setFormData({ name: '', category: '', file: null });
        setShowForm(false);
      } else {
        setMessage({ type: 'error', text: response.data?.message || 'Failed to add resource' });
      }
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to add resource. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileClick = (filePath) => {
    // Construct the full URL for the PDF
    const fullUrl = `${url}/${filePath.replace(/\\/g, '/')}`;
    console.log('Opening PDF:', fullUrl); // For debugging
    window.open(fullUrl, '_blank');
  };

  const getFileName = (filePath) => {
    // Extract the file name from the path
    const parts = filePath.split(/[\\/]/);
    return parts[parts.length - 1];
  };

  return (
    <div className="p-6">
      {/* Navigation Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <span>Add Resource</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Resources Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Resources List</h2>
          {tableLoading ? (
            <div className="text-center py-4">
              <div className="text-gray-600">Loading resources...</div>
            </div>
          ) : resources.length === 0 ? (
            <div className="text-center py-4">
              <div className="text-gray-600">No resources found</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {resources.map((resource, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {resource.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {resource.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                        <button
                          onClick={() => handleFileClick(resource.filePath)}
                          className="flex items-center space-x-2 hover:text-blue-800"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                          <span>{getFileName(resource.filePath)}</span>
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

      {/* Add Resource Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add Resource</h2>
              <button
                onClick={() => { setShowForm(false); setFormData({ name: '', category: '', file: null }); }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter resource name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter category"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File (PDF only)</label>
                <input
                  type="file"
                  name="file"
                  accept=".pdf"
                  onChange={handleChange}
                  required
                  className="w-full"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setFormData({ name: '', category: '', file: null }); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resources; 