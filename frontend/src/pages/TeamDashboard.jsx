// frontend/src/pages/TeamDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useAuth } from '../context/AuthContext';
import { getTeam, getTeamMembers, removeTeamMember, deleteTeam } from '../api/teams';

export default function TeamDashboard() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
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

  // Check if current user is admin
  const isAdmin = team && (
    team.createdBy === user?.id || 
    members.find(m => m.id === user?.id && m.role === 'admin')
  );

  async function handleRemoveMember(memberId) {
    if (!confirm('Are you sure you want to remove this member?')) return;
    try {
      await removeTeamMember(teamId, memberId);
      await loadMembers();
      await loadTeam();
    } catch (err) {
      console.error('Failed to remove member', err);
      alert(err?.response?.data?.message || 'Failed to remove member');
    }
  }

  async function handleDeleteTeam() {
    if (!confirm('Are you sure you want to delete this team? This action cannot be undone.')) return;
    try {
      await deleteTeam(teamId);
      navigate('/onboarding');
    } catch (err) {
      console.error('Failed to delete team', err);
      alert(err?.response?.data?.message || 'Failed to delete team');
    }
  }

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

          <section className="mb-6">
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
                    <div className="flex items-center gap-3">
                      {isAdmin && m.id !== user?.id && (
                        <button
                          onClick={() => handleRemoveMember(m.id)}
                          className="text-sm text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50"
                          title="Remove member"
                        >
                          Remove
                        </button>
                      )}
                      <div className="text-sm text-slate-600">{m.role}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {isAdmin && (
            <section className="border-t pt-4">
              <h2 className="text-lg font-semibold mb-2 text-red-600">Danger Zone</h2>
              <div className="bg-white p-4 rounded shadow border border-red-200">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-red-700">Delete Team</div>
                    <div className="text-sm text-slate-500">This will permanently delete the team and all its tasks.</div>
                  </div>
                  <button
                    onClick={handleDeleteTeam}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Delete Team
                  </button>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
