// frontend/src/api/tasks.js
import api from './axios';

/**
 * List tasks. params: { teamId?, status? }
 * If no teamId -> personal tasks (server-side).
 */
export async function listTasks(params = {}) {
  const res = await api.get('/tasks', { params });
  return res.data;
}

export async function createTask(payload) {
  // payload: { title, description?, teamId?, userId?, assigneeId?, priority?, dueDate? }
  const res = await api.post('/tasks', payload);
  return res.data;
}

export async function updateTask(id, payload) {
  const res = await api.patch(`/tasks/${id}`, payload);
  return res.data;
}

export async function deleteTask(id) {
  const res = await api.delete(`/tasks/${id}`);
  return res.data;
}

/** Attachments */

// Upload single file for a task. `file` is a File object from input[type=file].
export async function uploadAttachment(taskId, file) {
  const form = new FormData();
  form.append('file', file);
  const res = await api.post(`/tasks/${taskId}/attachments`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

// List attachments for a task
export async function listAttachments(taskId) {
  const res = await api.get(`/tasks/${taskId}/attachments`);
  return res.data;
}

// Delete an attachment by its attachment id
export async function deleteAttachment(attachmentId) {
  const res = await api.delete(`/tasks/attachments/${attachmentId}`);
  return res.data;
}
