import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Provider } from "../context/ContextProvider";
import { MdEmail, MdLock, MdClose } from "react-icons/md";

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

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
        navigate("/");
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError("Login failed, please try again!");
      console.error(err);
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
        setQuickAttendanceMessage(response.data.data.message);
        // Reset form after 2 seconds
        setTimeout(() => {
          setShowQuickAttendance(false);
          setQuickAttendanceData({ email: "", password: "", action: "CHECKIN" });
          setQuickAttendanceMessage("");
        }, 2000);
      } else {
        setQuickAttendanceMessage(response.data.message || "Something went wrong");
      }
    } catch (err) {
      setQuickAttendanceMessage(err.response?.data?.message || "Quick attendance failed, please try again!");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50">
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
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-[1.02]"
          >
            Sign In
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

            {quickAttendanceMessage && (
              <div className={`mb-4 p-4 rounded-lg ${
                quickAttendanceMessage.includes("already") ? "bg-yellow-50 text-yellow-700" : "bg-green-50 text-green-700"
              }`}>
                {quickAttendanceMessage}
              </div>
            )}

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
                    type="password"
                    value={quickAttendanceData.password}
                    onChange={(e) => setQuickAttendanceData({ ...quickAttendanceData, password: e.target.value })}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Enter your password"
                    required
                  />
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
