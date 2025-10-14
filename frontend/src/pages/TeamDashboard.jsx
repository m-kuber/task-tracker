// frontend/src/pages/TeamDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { getTeam } from '../api/teams';

export default function TeamDashboard() {
  const { teamId } = useParams();
  const [team, setTeam] = useState(null);
  const [counts, setCounts] = useState({ todo: 0, inprogress: 0, done: 0 });
  const [err, setErr] = useState(null);

  async function load() {
    setErr(null);
    try {
      const res = await getTeam(teamId);
      setTeam(res);
      setCounts(res.counts || { todo: 0, inprogress: 0, done: 0 });
    } catch (e) {
      setErr(e?.response?.data?.message || 'Failed to load team');
    }
  }

  useEffect(() => { load(); }, [teamId]);

  if (err) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1">
          <Topbar title="Team Dashboard" />
          <main className="p-6">
            <div className="text-red-600">{err}</div>
          </main>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1">
          <Topbar title="Team Dashboard" />
          <main className="p-6">
            <div>Loading team...</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1">
        <Topbar title="Team Dashboard" />
        <main className="p-6">
          <h1 className="text-2xl font-bold mb-2">{team.name}</h1>
          <p className="text-sm text-slate-500 mb-4">
            Team Code: <span className="font-mono">{team.code}</span>
          </p>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white shadow p-4 rounded">
              <div className="text-sm text-slate-500">To Do</div>
              <div className="text-3xl font-semibold">{counts.todo}</div>
            </div>
            <div className="bg-white shadow p-4 rounded">
              <div className="text-sm text-slate-500">In Progress</div>
              <div className="text-3xl font-semibold">{counts.inprogress}</div>
            </div>
            <div className="bg-white shadow p-4 rounded">
              <div className="text-sm text-slate-500">Done</div>
              <div className="text-3xl font-semibold">{counts.done}</div>
            </div>
          </div>

          <div className="mt-6">
            <Link to={`/team/${teamId}/board`} className="bg-indigo-600 text-white px-4 py-2 rounded">
              View Kanban Board
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
