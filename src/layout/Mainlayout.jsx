import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import AiChatBot from '../components/AiChatBot';



function MainLayout() {
  const token = localStorage.getItem('token');

  if (!token) return <Navigate to="/login" replace />;

  
  const user = {
    name: 'Admin User',
    role: 'Administrator',
    initials: 'AD',
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      {/* ── Top navbar ── */}
      <Navbar user={user} />

      {/* ── Body: sidebar + main content ── */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        {/* Page content rendered by nested <Route> */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <AiChatBot/>
    </div>
  );
}

export default MainLayout;