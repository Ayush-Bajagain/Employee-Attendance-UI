import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Provider } from "../context/ContextProvider";
import { MdEmail, MdLock, MdClose, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';

const Login = () => {
  const url = import.meta.env.VITE_BASE_URL;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showQuickAttendance, setShowQuickAttendance] = useState(false);
  const [quickAttendanceData, setQuickAttendanceData] = useState({
    email: "",
    password: "",
    action: "CHECKIN"
  });
  const [quickAttendanceMessage, setQuickAttendanceMessage] = useState("");
  const navigate = useNavigate();
  const { dispatch } = Provider();
  const [showPassword, setShowPassword] = useState(false);
  const [showQuickAttendancePassword, setShowQuickAttendancePassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${url}/auth/authenticate`,
        {
          email: email,
          password: password,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.code === 200) {
        dispatch({ type: "LOGIN" });
        sessionStorage.setItem("isLogged", "true");
        toast.success('Login successful');
        navigate("/");
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError("Login failed, please try again!");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAttendance = async (e) => {
    e.preventDefault();
    setError("");
    setQuickAttendanceMessage("");

    try {
      const response = await axios.post(
        `${url}/auth/quick-action`,
        {
          email: quickAttendanceData.email,
          password: quickAttendanceData.password,
          action: quickAttendanceData.action
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.code === 200) {
        if (response.data.data.code === 500) {
          await Swal.fire({
            title: "Error!",
            text: response.data.data.message,
            icon: "error",
            confirmButtonText: "OK",
            confirmButtonColor: "#4F46E5",
            position: "center",
            customClass: {
              popup: 'animated fadeInDown'
            }
          });
          // Don't close modal on error
          return;
        }

        // Show success message using SweetAlert2
        await Swal.fire({
          title: "Success!",
          text: response.data.data.message,
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#4F46E5",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
          position: "center",
          toast: false,
          customClass: {
            popup: 'animated fadeInDown'
          }
        });

        // Only reset and close modal on success
        setShowQuickAttendance(false);
        setQuickAttendanceData({ email: "", password: "", action: "CHECKIN" });
        setQuickAttendanceMessage("");
      } else if (response.data.code === 500) {
        // Show error message for server error
        await Swal.fire({
          title: "Server Error!",
          text: response.data.message || "Something went wrong on the server",
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#4F46E5",
          position: "center",
          customClass: {
            popup: 'animated fadeInDown'
          }
        });
        // Don't close modal on error
      } else {
        // Show error message for other error codes
        await Swal.fire({
          title: "Error!",
          text: response.data.message || "Something went wrong",
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#4F46E5",
          position: "center",
          customClass: {
            popup: 'animated fadeInDown'
          }
        });
        // Don't close modal on error
      }
    } catch (err) {
      // Show error message using SweetAlert2
      await Swal.fire({
        title: "Error!",
        text: err.response?.data?.message || "Quick attendance failed, please try again!",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#4F46E5",
        position: "center",
        customClass: {
          popup: 'animated fadeInDown'
        }
      });
      console.error(err);
      // Don't close modal on error
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleQuickAttendancePasswordVisibility = () => {
    setShowQuickAttendancePassword(!showQuickAttendancePassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Please sign in to your account</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MdEmail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MdLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <MdVisibilityOff className="h-5 w-5" />
                ) : (
                  <MdVisibility className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowQuickAttendance(true)}
            className="w-full bg-white text-indigo-600 px-4 py-3 rounded-xl font-medium border-2 border-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-[1.02]"
          >
            Quick Attendance
          </button>
        </form>
      </div>

      {/* Quick Attendance Modal */}
      {showQuickAttendance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={() => {
                setShowQuickAttendance(false);
                setQuickAttendanceMessage("");
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <MdClose className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Attendance</h2>

            <form onSubmit={handleQuickAttendance} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MdEmail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={quickAttendanceData.email}
                    onChange={(e) => setQuickAttendanceData({ ...quickAttendanceData, email: e.target.value })}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MdLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showQuickAttendancePassword ? "text" : "password"}
                    value={quickAttendanceData.password}
                    onChange={(e) => setQuickAttendanceData({ ...quickAttendanceData, password: e.target.value })}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={toggleQuickAttendancePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showQuickAttendancePassword ? (
                      <MdVisibilityOff className="h-5 w-5" />
                    ) : (
                      <MdVisibility className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Action
                </label>
                <select
                  value={quickAttendanceData.action}
                  onChange={(e) => setQuickAttendanceData({ ...quickAttendanceData, action: e.target.value })}
                  className="block w-full px-3 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                >
                  <option value="CHECKIN">Check In</option>
                  <option value="CHECKOUT">Check Out</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-[1.02]"
              >
                Submit Attendance
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
