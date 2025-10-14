// frontend/src/api/tasks.js
import api from './axios';

// ✅ Get list of tasks (personal or team)
export async function listTasks(params = {}) {
  const res = await api.get('/tasks', { params });
  return res.data;
}

// ✅ Create a new task
export async function createTask(data) {
  const res = await api.post('/tasks', data);
  return res.data;
}

// ✅ Update an existing task
export async function updateTask(id, data) {
  const res = await api.patch(`/tasks/${id}`, data);
  return res.data;
}

// ✅ Delete a task
export async function deleteTask(id) {
  const res = await api.delete(`/tasks/${id}`);
  return res.data;
}
