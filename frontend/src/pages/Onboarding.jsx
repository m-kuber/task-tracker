import React, { useState } from 'react';
import { createTeam, joinTeam } from '../api/teams';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import Sidebar from '../components/Sidebar';

export default function Onboarding() {
  const [teamName, setTeamName] = useState('');
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState(null);
  const nav = useNavigate();

  const create = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      const res = await createTeam(teamName);
      const id = res.team.id;
      nav(`/team/${id}/dashboard`);
    } catch (err) {
      setMsg(err?.response?.data?.message || 'Failed to create team');
    }
  };

  const join = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      const res = await joinTeam(code);
      // server returns teamId or team
      const id = res.team?.id || res.teamId;
      nav(`/team/${id}/dashboard`);
    } catch (err) {
      setMsg(err?.response?.data?.message || 'Failed to join team');
    }
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1">
        <Topbar title="Create or Join Team" />
        <main className="p-6">
          <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded shadow">
              <h3 className="font-semibold mb-2">Create a Team</h3>
              <form onSubmit={create} className="space-y-3">
                <input value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Team name" className="w-full border px-3 py-2 rounded" required />
                <button className="bg-indigo-600 text-white px-4 py-2 rounded">Create</button>
              </form>
            </div>

            <div className="bg-white p-5 rounded shadow">
              <h3 className="font-semibold mb-2">Join with Code</h3>
              <form onSubmit={join} className="space-y-3">
                <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Team code" className="w-full border px-3 py-2 rounded" required />
                <button className="bg-indigo-600 text-white px-4 py-2 rounded">Join</button>
              </form>
            </div>
          </div>

          {msg && <div className="mt-4 text-sm text-red-600">{msg}</div>}
        </main>
      </div>
    </div>
  );
}
