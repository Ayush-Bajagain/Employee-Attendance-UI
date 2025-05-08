import { useState } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import { Outlet, Route, Routes, Navigate } from "react-router-dom";
import Dashboard from "./Pages/Dashboard";
import Report from "./Pages/Report";
import Layout from "./Layout";
import Attendance from "./Pages/Attendance";
import NotFound from "./Pages/NotFound";
import Login from "./Pages/Login";
import Protected from "./Protected";
import SetPassword from "./Pages/SetPassword";
import Employee from "./Pages/Employee";
import EmployeeDetails from "./Pages/EmployeeDetails";
import AttendanceDetails from "./Pages/AttendanceDetails";
import EmployeeDashboard from './components/EmployeeDashboard';
import EmployeeReport from './components/EmployeeReport';
import RoleProtected from './components/RoleProtected';
import AdminAttendance from './components/AdminAttendance';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Routes>
        <Route path="/create-password/:uuid" element={<SetPassword />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <Protected>
              <Layout />
            </Protected>
          }
        >
          {/* Admin Routes */}
          <Route path="admin">
            <Route
              path="dashboard"
              element={
                <RoleProtected allowedRoles={["ADMIN"]}>
                  <Dashboard />
                </RoleProtected>
              }
            />
            <Route
              path="employees"
              element={
                <RoleProtected allowedRoles={["ADMIN"]}>
                  <Employee />
                </RoleProtected>
              }
            />
            <Route
              path="employees/:id"
              element={
                <RoleProtected allowedRoles={["ADMIN"]}>
                  <EmployeeDetails />
                </RoleProtected>
              }
            />
            <Route
              path="attendance"
              element={
                <RoleProtected allowedRoles={["ADMIN"]}>
                  <AdminAttendance />
                </RoleProtected>
              }
            />
            <Route
              path="attendance/:id"
              element={
                <RoleProtected allowedRoles={["ADMIN"]}>
                  <AttendanceDetails />
                </RoleProtected>
              }
            />
            <Route
              path="reports"
              element={
                <RoleProtected allowedRoles={["ADMIN"]}>
                  <Report />
                </RoleProtected>
              }
            />
          </Route>

          {/* Employee Routes */}
          <Route path="employee">
            <Route
              path="dashboard"
              element={
                <RoleProtected allowedRoles={["EMPLOYEE"]}>
                  <EmployeeDashboard />
                </RoleProtected>
              }
            />
            <Route
              path="attendance"
              element={
                <RoleProtected allowedRoles={["EMPLOYEE"]}>
                  <Attendance />
                </RoleProtected>
              }
            />
            <Route
              path="attendance/:id"
              element={
                <RoleProtected allowedRoles={["EMPLOYEE"]}>
                  <AttendanceDetails />
                </RoleProtected>
              }
            />
            <Route
              path="reports"
              element={
                <RoleProtected allowedRoles={["EMPLOYEE"]}>
                  <EmployeeReport />
                </RoleProtected>
              }
            />
          </Route>

          {/* Redirect root to appropriate dashboard */}
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
