// frontend/src/api/teams.js
import api from './axios';

export async function listUserTeams() {
  const res = await api.get('/teams');
  return res.data;
}

export async function createTeam(name) {
  const res = await api.post('/teams', { name });
  return res.data;
}

export async function joinTeam(code) {
  const res = await api.post('/teams/join', { code });
  return res.data;
}

export async function getTeam(teamId) {
  const res = await api.get(`/teams/${teamId}`);
  return res.data;
}

export async function getTeamMembers(teamId) {
  const res = await api.get(`/teams/${teamId}/members`);
  return res.data;
}
