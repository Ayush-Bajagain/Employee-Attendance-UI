import { useState } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import { Outlet, Route, Routes } from "react-router-dom";
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
              {" "}
              <Layout />{" "}
            </Protected>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="employee" element={<Employee />} />
          <Route path="employee-details/:id" element={<EmployeeDetails />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="attendance-details/:id" element={<AttendanceDetails />} />
          <Route path="report" element={<Report />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
