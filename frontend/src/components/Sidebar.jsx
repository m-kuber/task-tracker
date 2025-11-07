import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { listUserTeams } from '../api/teams';

export default function Sidebar() {
  const [teams, setTeams] = useState([]);
  const location = useLocation();

  useEffect(() => {
    async function load() {
      try {
        const res = await listUserTeams();
        setTeams(res.teams || []);
      } catch (err) {
        console.error('Failed to load teams', err);
      }
    }
    load();
  }, []);

  const active = (path) => {
    const p = location.pathname;
    if (path === '/my-tasks') return p === '/my-tasks' ? 'bg-slate-100 font-semibold' : 'hover:bg-slate-50';
    if (path === '/my-tasks-board') return p === '/my-tasks-board' ? 'bg-slate-100 font-semibold' : 'hover:bg-slate-50';
    return p.startsWith(path) ? 'bg-slate-100 font-semibold' : 'hover:bg-slate-50';
  };

  return (
    <aside className="w-64 bg-white border-r min-h-screen p-4">
      <div className="mb-6">
        <div className="text-xs uppercase text-slate-400">Menu</div>
        <ul className="mt-3">
          <li className="mt-2">
            <Link to="/onboarding" className={`block px-3 py-2 rounded ${active('/onboarding')}`}>
              Create / Join Team
            </Link>
          </li>
          <li className="mt-2">
            <Link to="/my-tasks" className={`block px-3 py-2 rounded ${active('/my-tasks')}`}>
              My Tasks
            </Link>
          </li>
          <li className="mt-2">
            <Link to="/my-tasks-board" className={`block px-3 py-2 rounded ${active('/my-tasks-board')}`}>
              My Tasks Kanban
            </Link>
          </li>
        </ul>

        <div className="mt-6 text-xs uppercase text-slate-400">Teams</div>
        <ul className="mt-3">
          {teams.length === 0 && <li className="text-sm text-slate-500 px-3">No teams yet</li>}
          {teams.map(t => (
            <li key={t.id} className="mt-2">
              <Link
                to={`/team/${t.id}/dashboard`}
                className={`block px-3 py-2 rounded ${active(`/team/${t.id}`)}`}
              >
                {t.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
