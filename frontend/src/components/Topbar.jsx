import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Topbar({ title }) {
  const { user, logout } = useAuth();

  return (
    <div className="flex items-center justify-between bg-white px-4 py-3 border-b">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-sm text-slate-700">{user?.name}</div>
        <button
          onClick={logout}
          className="px-3 py-1 rounded-md border hover:bg-slate-50 text-sm"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
