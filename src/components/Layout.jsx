import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* Main content wrapper with proper spacing and responsiveness */}
      <div className="lg:ml-[250px] pt-16 lg:pt-4">
        <main className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
} 