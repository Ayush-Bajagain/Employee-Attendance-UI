import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* Add margin for mobile header and sidebar */}
      <div className="lg:ml-[250px] pt-20 lg:pt-0">
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
} 