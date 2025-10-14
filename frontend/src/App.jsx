// frontend/src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import TeamDashboard from './pages/TeamDashboard';
import TeamBoard from './pages/TeamBoard';
import MyTasks from './pages/MyTasks';
import MyTasksBoard from './pages/MyTasksBoard';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/onboarding" /> : <Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/onboarding" element={user ? <Onboarding /> : <Navigate to="/login" />} />
      <Route path="/my-tasks" element={user ? <MyTasks /> : <Navigate to="/login" />} />
      <Route path="/my-tasks-board" element={user ? <MyTasksBoard /> : <Navigate to="/login" />} />
      <Route path="/team/:teamId/dashboard" element={user ? <TeamDashboard /> : <Navigate to="/login" />} />
      <Route path="/team/:teamId/board" element={user ? <TeamBoard /> : <Navigate to="/login" />} />
      <Route path="*" element={<div className="p-8">Page not found</div>} />
    </Routes>
  );
}
