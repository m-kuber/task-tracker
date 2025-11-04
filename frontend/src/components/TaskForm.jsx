// frontend/src/components/TaskForm.jsx
import React, { useState } from 'react';
import { createTask, uploadAttachment } from '../api/tasks';

export default function TaskForm({
  teamId = null,
  onCreated = null,
  placeholder = 'New task title'
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return alert('Title required');
    setLoading(true);
    try {
      const payload = { title, description };
      if (teamId) payload.teamId = teamId;
      const res = await createTask(payload);
      const task = res.task || res; // adapt to backend responses
      if (file) {
        try {
          await uploadAttachment(task.id, file);
        } catch (err) {
          console.error('Attachment upload failed', err);
          // do not abort; inform user
          alert('Task created but attachment upload failed.');
        }
      }
      setTitle('');
      setDescription('');
      setFile(null);
      if (onCreated) onCreated();
    } catch (err) {
      console.error('Create task error', err);
      alert('Failed to create task');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={placeholder}
        className="w-full border p-2 rounded"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        className="w-full border p-2 rounded"
      />
      <div className="flex items-center gap-2">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-3 py-1 rounded"
        >
          {loading ? 'Creating...' : 'Create'}
        </button>
      </div>
    </form>
  );
}
