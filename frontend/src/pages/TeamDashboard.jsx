// frontend/src/pages/TeamDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { getTeam } from '../api/teams';
import { getTeamMembers } from '../api/teams';

export default function TeamDashboard() {
  const { teamId } = useParams();
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [counts, setCounts] = useState({ todo: 0, inprogress: 0, done: 0 });
  const [err, setErr] = useState(null);

  async function loadTeam() {
    try {
      const res = await getTeam(teamId);
      setTeam(res);
      setCounts(res.counts || { todo: 0, inprogress: 0, done: 0 });
    } catch (e) {
      setErr(e?.response?.data?.message || 'Failed to load team');
    }
  }

  async function loadMembers() {
    try {
      const res = await getTeamMembers(teamId);
      setMembers(res.members || []);
    } catch (e) {
      console.error('Failed to load members', e);
      setMembers([]);
    }
  }

  useEffect(() => {
    loadTeam();
    loadMembers();
  }, [teamId]);

  if (err) {
    return <div className="min-h-screen flex"><Sidebar /><div className="flex-1 p-6"><Topbar title="Team Dashboard"/><div className="text-red-600">{err}</div></div></div>;
  }

  if (!team) {
    return <div className="min-h-screen flex"><Sidebar /><div className="flex-1 p-6"><Topbar title="Team Dashboard"/><div>Loading team...</div></div></div>;
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1">
        <Topbar title="Team Dashboard" />
        <main className="p-6">
          <h1 className="text-2xl font-bold mb-1">{team.name}</h1>
          <p className="text-sm text-slate-500 mb-4">Team Code: <span className="font-mono">{team.code}</span></p>

          <div className="grid grid-cols-3 gap-4 mb-6">
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

          <div className="mb-6">
            <Link to={`/team/${teamId}/board`} className="bg-indigo-600 text-white px-4 py-2 rounded">Open Kanban Board</Link>
          </div>

          <section>
            <h2 className="text-lg font-semibold mb-2">Members</h2>
            <div className="bg-white p-4 rounded shadow">
              {members.length === 0 && <div className="text-sm text-slate-500">No members</div>}
              <ul className="space-y-2">
                {members.map(m => (
                  <li key={m.id} className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{m.name || 'Unknown'}</div>
                      <div className="text-xs text-slate-500">{m.email || '—'}</div>
                    </div>
                    <div className="text-sm text-slate-600">{m.role}</div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
