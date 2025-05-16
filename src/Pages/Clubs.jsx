import { useState, useContext, useEffect } from 'react';
import { FaPlus, FaTimes, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/ContextProvider';

export default function Clubs() {
  const [showForm, setShowForm] = useState(false);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [selectedClub, setSelectedClub] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    clubName: '',
    clubId: '',
    logoUrl: null,
    member: '',
    districtMultiple: '',
    charteredDate: '',
    extensionChairperson: '',
    guidingLionOne: '',
    guidingLionTwo: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const url = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  // Fetch clubs data
  const fetchClubs = async () => {
    try {
      setTableLoading(true);
      const response = await axios.post(`${url}/clubs/getAll`, {}, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        withCredentials: true
      });

      if (response.data && response.data.code === 200) {
        setClubs(response.data.date || []);
      }
    } catch (error) {
      if (error.response?.status === 403) {
        Swal.fire({
          icon: 'error',
          title: 'Forbidden',
          text: 'You do not have permission to view clubs. Please log in again.',
        }).then(() => {
          logout();
          navigate('/login');
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch clubs data.'
        });
      }
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  // Handle Form Changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'logoUrl') {
      setFormData({ ...formData, logoUrl: files[0] });
      setImagePreview(files[0] ? URL.createObjectURL(files[0]) : null);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle View Club
  const handleView = (club) => {
    setSelectedClub(club);
    setShowViewModal(true);
  };

  // Handle Edit Club
  const handleEdit = (club) => {
    setFormData({
      clubName: club.clubName,
      clubId: club.clubId,
      member: club.member,
      districtMultiple: club.districtMultiple,
      charteredDate: new Date(club.charteredDate).toISOString().split('T')[0],
      extensionChairperson: club.extensionChairperson,
      guidingLionOne: club.guidingLionOne,
      guidingLionTwo: club.guidingLionTwo
    });
    setIsEditing(true);
    setShowForm(true);
  };

  // Reset Form
  const handleClose = () => {
    setShowForm(false);
    setShowViewModal(false);
    setIsEditing(false);
    setFormData({
      clubName: '',
      clubId: '',
      logoUrl: null,
      member: '',
      districtMultiple: '',
      charteredDate: '',
      extensionChairperson: '',
      guidingLionOne: '',
      guidingLionTwo: ''
    });
    setImagePreview(null);
  };

  // Handle Form Submit
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

      const endpoint = isEditing ? `${url}/clubs/update` : `${url}/clubs/add`;
      const response = await axios.post(endpoint, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json'
        },
        withCredentials: true
      });

      if (response.data && (response.data.code === 201 || response.data.code === 200)) {
        await Swal.fire({
          icon: 'success',
          title: 'Success',
          text: isEditing ? 'Club updated successfully.' : 'Club added successfully.',
          timer: 2000,
          showConfirmButton: false
        });
        handleClose();
        fetchClubs();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: response.data.message || (isEditing ? 'Failed to update club.' : 'Failed to add club.')
        });
      }
    } catch (error) {
      if (error.response?.status === 403) {
        Swal.fire({
          icon: 'error',
          title: 'Forbidden',
          text: 'You do not have permission to perform this action. Please log in again.',
        }).then(() => {
          logout();
          navigate('/login');
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || (isEditing ? 'Failed to update club.' : 'Failed to add club.')
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete Club
  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        icon: 'warning',
        title: 'Are you sure?',
        text: 'This action cannot be undone.',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it',
        cancelButtonText: 'No, cancel'
      });

      if (result.isConfirmed) {
        const response = await axios.post(`${url}/clubs/delete`, { id }, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          withCredentials: true
        });

        if (response.data && response.data.code === 200) {
          await Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Club has been deleted.',
            timer: 1500,
            showConfirmButton: false
          });
          fetchClubs(); // Refresh the clubs list
        }
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to delete club.'
      });
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Clubs</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <span>Add Club</span>
          <FaPlus className="ml-2" />
        </button>
      </div>

      {/* Clubs Table */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        {tableLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Club Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Club ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Members</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">District</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chartered Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clubs.map((club) => (
                  <tr key={club.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {club.logoUrl ? (
                        <img
                          src={`data:image/jpeg;base64,${club.logoUrl}`}
                          alt={club.clubName}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500">No Logo</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{club.clubName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{club.clubId}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{club.totalMember}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{club.districtMultiple}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(club.charteredDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(club)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleEdit(club)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(club.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Club Modal */}
      {showViewModal && selectedClub && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Club Details</h2>
              <button
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                {selectedClub.logoUrl ? (
                  <img
                    src={`data:image/jpeg;base64,${selectedClub.logoUrl}`}
                    alt={selectedClub.clubName}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No Logo</span>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold">{selectedClub.clubName}</h3>
                  <p className="text-gray-600">ID: {selectedClub.clubId}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total Members</p>
                  <p className="font-medium">{selectedClub.totalMember}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">District</p>
                  <p className="font-medium">{selectedClub.districtMultiple}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Chartered Date</p>
                  <p className="font-medium">{new Date(selectedClub.charteredDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Extension Chairperson</p>
                  <p className="font-medium">{selectedClub.extensionChairperson}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Guiding Lion One</p>
                  <p className="font-medium">{selectedClub.guidingLionOne}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Guiding Lion Two</p>
                  <p className="font-medium">{selectedClub.guidingLionTwo}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Club Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">{isEditing ? 'Edit Club' : 'Add Club'}</h2>
              <button
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="h-6 w-6" />
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <input type="file" name="logoUrl" onChange={handleChange} className="block mb-4" />
              {imagePreview && <img src={imagePreview} alt="Preview" className="w-32 h-32 mb-4 rounded-full object-cover" />}
              
              {['member', 'districtMultiple', 'charteredDate', 'extensionChairperson', 'guidingLionOne', 'guidingLionTwo'].map((field, index) => (
                <div key={index}>
                  <input
                    type="text"
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1')}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}

              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">Submit</button>
              <button onClick={handleClose} type="button" className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors ml-2">Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}