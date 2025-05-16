import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProfileView = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const url = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    if (id) {
      fetchProfile();
    }
  }, [id]);

  const fetchProfile = async () => {
    try {
      const response = await axios.post(`${url}/profiles/get`, 
        { id: parseInt(id) },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );
      
      if (response.data && response.data.code === 200 && response.data.date) {
        setProfile(response.data.date);
      } else {
        setError('Profile not found');
      }
    } catch (error) {
      setError('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">No profile data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Profile Details</h1>
            <button
              onClick={() => navigate('/profiles')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Profiles
            </button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                {profile.image ? (
                  <img
                    src={`data:image/jpeg;base64,${profile.image}`}
                    alt={profile.fullName}
                    className="h-48 w-48 object-cover rounded-full border-4 border-blue-100"
                  />
                ) : (
                  <div className="h-48 w-48 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-6xl">👤</span>
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-grow">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{profile.fullName}</h2>
                <p className="text-xl text-gray-600 mb-6">{profile.position}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-500">Email</label>
                      <p className="text-gray-900 font-medium">{profile.email}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Phone Number</label>
                      <p className="text-gray-900 font-medium">{profile.phoneNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Member Number</label>
                      <p className="text-gray-900 font-medium">{profile.memberNumber}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-500">Category</label>
                      <p className="text-gray-900 font-medium">{profile.category}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Address</label>
                      <p className="text-gray-900 font-medium">{profile.address}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Priority</label>
                      <p className="text-gray-900 font-medium">{profile.priority}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView; 