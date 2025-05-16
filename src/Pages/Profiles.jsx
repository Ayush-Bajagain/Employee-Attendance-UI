import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profiles = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    memberNumber: '',
    address: '',
    category: '',
    position: '',
    priority: '',
    image: null
  });
  const [profiles, setProfiles] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageModal, setImageModal] = useState({ open: false, src: null });
  const [openDropdown, setOpenDropdown] = useState(null);

  const url = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${url}/profiles/getAll`, {}, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });
      if (response.data && response.data.code === 200 && Array.isArray(response.data.date)) {
        setProfiles(response.data.date);
      } else {
        setProfiles([]);
      }
    } catch (error) {
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData({ ...formData, image: files[0] });
      setImagePreview(files[0] ? URL.createObjectURL(files[0]) : null);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          data.append(key, value);
        }
      });
      const response = await axios.post(`${url}/profiles/add`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });
      if (response.data && (response.data.code === 201 || response.data.success)) {
        setShowForm(false);
        setFormData({
          fullName: '',
          email: '',
          phoneNumber: '',
          memberNumber: '',
          address: '',
          category: '',
          position: '',
          priority: '',
          image: null
        });
        setImagePreview(null);
        alert('Profile added successfully!');
        fetchProfiles();
      } else {
        alert(response.data?.message || 'Failed to add profile.');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest('.dropdown-action')) setOpenDropdown(null);
    };
    if (openDropdown !== null) {
      window.addEventListener('mousedown', handleClick);
      return () => window.removeEventListener('mousedown', handleClick);
    }
  }, [openDropdown]);

  // Delete profile handler
  const handleDeleteProfile = async (id) => {
    setOpenDropdown(null);
    if (!window.confirm('Are you sure you want to delete this profile?')) return;
    try {
      const response = await axios.post(`${url}/profiles/delete`, { id }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });
      if (response.data && response.data.code === 200) {
        alert('Profile deleted successfully!');
        fetchProfiles();
      } else {
        alert(response.data?.message || 'Failed to delete profile.');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete profile.');
    }
  };

  return (
    <div className="p-6">
      {/* Navigation Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Profiles</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <span>Add Profile</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Add Profile Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add Profile</h2>
              <button
                onClick={() => { setShowForm(false); setImagePreview(null); }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter full name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter email" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter phone number" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Member Number</label>
                <input type="text" name="memberNumber" value={formData.memberNumber} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter member number" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter address" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input type="text" name="category" value={formData.category} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter category" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <input type="text" name="position" value={formData.position} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter position" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <input type="number" name="priority" value={formData.priority} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter priority" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                <input type="file" name="image" accept="image/*" onChange={handleChange} required className="w-full" />
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded-full border" />
                )}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => { setShowForm(false); setImagePreview(null); }} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={loading}>
                  {loading ? 'Adding...' : 'Add Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profiles Table */}
      {profiles.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Member Directory</h2>
          <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200 relative z-0">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {profiles.map((profile, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-center">
                      {profile.image ? (
                        <img
                          src={`data:image/jpeg;base64,${profile.image}`}
                          alt={profile.fullName}
                          className="h-12 w-12 object-cover rounded-full mx-auto border cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => setImageModal({ open: true, src: `data:image/jpeg;base64,${profile.image}` })}
                        />
                      ) : (
                        <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
                          <span className="text-2xl">👤</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{profile.fullName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{profile.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{profile.phoneNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{profile.memberNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{profile.address}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{profile.category}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{profile.position}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{profile.priority}</td>
                    <td className="px-4 py-3 text-center relative z-10">
                      <div className="relative inline-block text-left dropdown-action">
                        <button
                          type="button"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dropdown-action"
                          onClick={e => { e.stopPropagation(); setOpenDropdown(openDropdown === idx ? null : idx); }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                        {openDropdown === idx && (
                          <div className="origin-top-right absolute right-0 mt-2 w-36 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 dropdown-action">
                            <div className="py-1 dropdown-action" role="menu" aria-orientation="vertical">
                              <button
                                onClick={e => { 
                                  e.stopPropagation(); 
                                  setOpenDropdown(null);
                                  navigate(`/profiles/${profile.id}`);
                                }}
                                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dropdown-action"
                                role="menuitem"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                                View
                              </button>
                              <button
                                onClick={e => { e.stopPropagation(); /* Edit logic here */ }}
                                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dropdown-action"
                                role="menuitem"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                                Edit
                              </button>
                              <button
                                onClick={e => { e.stopPropagation(); handleDeleteProfile(profile.id); }}
                                className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dropdown-action"
                                role="menuitem"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {imageModal.open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
          onClick={() => setImageModal({ open: false, src: null })}
        >
          <div
            className="bg-white rounded-lg p-4 shadow-lg flex flex-col items-center"
            style={{ maxWidth: '90vw', maxHeight: '90vh' }}
            onClick={e => e.stopPropagation()}
          >
            <img
              src={imageModal.src}
              alt="Profile Full"
              className="max-h-[70vh] max-w-[80vw] rounded-lg border"
            />
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => setImageModal({ open: false, src: null })}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profiles; 