import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useContext } from 'react';
import { AuthContext } from '../context/ContextProvider';

const Events = () => {
  const navigate = useNavigate();
  const url = import.meta.env.VITE_BASE_URL;
  const { user, login } = useContext(AuthContext);
  const [showForm, setShowForm] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(null);
  const [formData, setFormData] = useState({
    eventDate: '',
    title: '',
    location: '',
    eventTime: '',
    description: ''
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (user) {
          fetchEvents();
          return;
        }

        const response = await axios.post(`${url}/auth/verify`, {}, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data.code === 200) {
          login({ email: response.data.email });
          fetchEvents();
        } else {
          navigate('/login');
        }
      } catch (error) {
        if (error.response?.status === 401) {
          navigate('/login');
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to verify authentication. Please try again.',
          });
        }
      }
    };

    checkAuth();
  }, [url, navigate, login, user]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${url}/events/getAll`, {}, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.data && response.data.code === 200) {
        const eventsData = response.data.date || response.data.data || [];
        if (Array.isArray(eventsData)) {
          const formattedEvents = eventsData.map(event => ({
            ...event,
            id: event.id || event.eventId,
            date: event.date ? new Date(event.date).toLocaleDateString() : 'N/A',
            time: event.time || 'N/A'
          }));
          setEvents(formattedEvents);
        } else {
          setEvents([]);
        }
      } else {
        setEvents([]);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
        return;
      }

      const errorMessage = error.response?.data?.message || 
        (error.message === 'Network Error' ? 'Unable to connect to the server. Please check your internet connection.' : 
        'Unable to fetch events. Please try again later.');

      Swal.fire({
        icon: 'error',
        title: 'Error Loading Events',
        text: errorMessage,
        confirmButtonText: 'Try Again',
        showCancelButton: true,
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          fetchEvents();
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowForm(true);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const eventDate = new Date(formData.eventDate);
      if (isNaN(eventDate.getTime())) {
        throw new Error('Invalid date format');
      }

      const eventData = {
        ...formData,
        eventDate: eventDate.toISOString()
      };

      const response = await axios.post(`${url}/events/add`, eventData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.code === 201) {
        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: response.data.message || 'Event created successfully',
          timer: 2000,
          showConfirmButton: false
        });
        setShowForm(false);
        setFormData({
          eventDate: '',
          title: '',
          location: '',
          eventTime: '',
          description: ''
        });
        fetchEvents();
      } else {
        throw new Error(response.data.message || 'Failed to create event');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
        return;
      }

      const errorMessage = error.response?.data?.message || 
        (error.message === 'Network Error' ? 'Unable to connect to the server. Please check your internet connection.' : 
        'Failed to create event. Please try again.');

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage
      });
    }
  };

  const handleViewEvent = (event) => {
    Swal.fire({
      title: event.title,
      html: `
        <div class="text-left">
          <p><strong>Location:</strong> ${event.location}</p>
          <p><strong>Date:</strong> ${event.date || 'N/A'}</p>
          <p><strong>Time:</strong> ${event.time || 'N/A'}</p>
          <p><strong>Description:</strong> ${event.description}</p>
        </div>
      `,
      confirmButtonText: 'Close'
    });
  };

  const handleEditEvent = (event) => {
    const formattedDate = event.date ? new Date(event.date).toISOString().split('T')[0] : '';
    setFormData({
      eventDate: formattedDate,
      title: event.title || '',
      location: event.location || '',
      eventTime: event.time || '',
      description: event.description || ''
    });
    setShowForm(true);
  };

  const handleDeleteEvent = async (event) => {
    if (!event.id) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Event ID is missing. Cannot delete this event.',
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.post(
          `${url}/events/delete`,
          { id: parseInt(event.id) },
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.code === 200) {
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Event has been deleted successfully.',
            timer: 2000,
            showConfirmButton: false
          });
          fetchEvents();
        } else {
          throw new Error(response.data.message || 'Failed to delete event');
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: error.response?.data?.message || 'Failed to delete event. Please try again.',
        });
      }
    }
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <button
            onClick={handleAddEvent}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <span>Add Event</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    Loading events...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No events found
                  </td>
                </tr>
              ) : (
                events.map((event, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{event.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.time}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{event.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          onClick={() => setShowDropdown(showDropdown === index ? null : index)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                        
                        {showDropdown === index && (
                          <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                            <div className="py-1" role="menu" aria-orientation="vertical">
                              <button
                                onClick={() => {
                                  handleViewEvent(event);
                                  setShowDropdown(null);
                                }}
                                className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                                role="menuitem"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                                View Event
                              </button>
                              <button
                                onClick={() => {
                                  handleEditEvent(event);
                                  setShowDropdown(null);
                                }}
                                className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                                role="menuitem"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                                Edit
                              </button>
                              <div className="border-t border-gray-100 my-1"></div>
                              <button
                                onClick={() => {
                                  handleDeleteEvent(event);
                                  setShowDropdown(null);
                                }}
                                className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                                role="menuitem"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Create New Event</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter event title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter event description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
                  <input
                    type="date"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Time</label>
                  <input
                    type="text"
                    name="eventTime"
                    value={formData.eventTime}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter event time (e.g., 2:30 PM)"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter event location"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events; 