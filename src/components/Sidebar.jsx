import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { AuthContext } from '../context/ContextProvider';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const url = import.meta.env.VITE_BASE_URL;

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '' },
    { path: '/clubs', label: 'Clubs', icon: '🏢' },
    { path: '/resources', label: 'Resources', icon: '📚' },
    { path: '/events', label: 'Events', icon: '🎉' },
    { path: '/profiles', label: 'Profiles', icon: '👥' },
  ];

  const handleLogout = async () => {
    try {
      const response = await axios.post(`${url}/auth/logout`, {}, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.data && response.data.code === 200) {
        logout();
        await Swal.fire({
          icon: 'success',
          title: 'Logged out',
          text: response.data.message || 'You have been logged out.',
          timer: 1500,
          showConfirmButton: false
        });
        navigate('/login');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Logout Failed',
          text: response.data?.message || 'Failed to logout.'
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Logout Failed',
        text: error.response?.data?.message || 'Failed to logout.'
      });
    }
  };

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen p-4 flex flex-col justify-between">
      <div>
        <div className="text-2xl font-bold mb-8">Lions International K</div>
        <nav>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700 transition-colors ${
                    location.pathname === item.path ? 'bg-gray-700' : ''
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <button
        onClick={handleLogout}
        className="w-full mt-8 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
      >
        Logout
      </button>
    </div>
  );
};

export default Sidebar; 