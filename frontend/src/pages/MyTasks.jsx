// frontend/src/pages/MyTasks.jsx
import React, { useEffect, useState, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { listTasks, createTask, updateTask, deleteTask, listAttachments, uploadAttachment, deleteAttachment } from '../api/tasks';
import { useNavigate } from 'react-router-dom';

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [file, setFile] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  async function load() {
    setLoading(true);
    try {
      const res = await listTasks(); // no teamId => personal tasks
      setTasks(res.tasks || []);
    } catch (e) {
      console.error('load mytasks', e);
      setErr('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!title.trim()) return alert('Title required');
    try {
      const res = await createTask({ title: title.trim(), description: desc || null, userId: undefined });
      const task = res.task || res;
      
      // Upload file if provided
      if (file && task?.id) {
        try {
          await uploadAttachment(task.id, file);
        } catch (err) {
          console.error('Attachment upload failed', err);
          alert('Task created but attachment upload failed.');
        }
      }
      
      setTitle('');
      setDesc('');
      setFile(null);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      await load();
    } catch (err) {
      console.error('create personal task', err);
      alert(err?.response?.data?.message || 'Failed to create task');
    }
  }

  async function changeStatus(task, next) {
    try {
      await updateTask(task.id, { status: next });
      await load();
    } catch (err) {
      console.error(err);
      alert('Failed to change status');
    }
  }

  async function removeTask(id) {
    try {
      await deleteTask(id);
      await load();
      if (selectedTask && selectedTask.id === id) setSelectedTask(null);
    } catch (err) {
      console.error('delete personal', err);
      const msg = err?.response?.data?.message || 'Failed to delete task';
      alert(msg);
    }
  }

  async function openTask(task) {
    setSelectedTask(task);
    try {
      const res = await listAttachments(task.id);
      setAttachments(res.attachments || []);
    } catch (err) {
      console.error('load attachments', err);
      setAttachments([]);
    }
  }

  async function handleUpload(file) {
    if (!selectedTask || !file) return;
    try {
      await uploadAttachment(selectedTask.id, file);
      const res = await listAttachments(selectedTask.id);
      setAttachments(res.attachments || []);
    } catch (err) {
      console.error('upload error', err);
      alert('Upload failed');
    }
  }

  async function handleDeleteAttachment(id) {
    try {
      await deleteAttachment(id);
      const res = await listAttachments(selectedTask.id);
      setAttachments(res.attachments || []);
    } catch (err) {
      console.error('delete attachment error', err);
      alert('Failed to delete attachment');
    }
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1">
        <Topbar title="My Tasks" />
        <main className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm bg-white border hover:shadow-sm"
              >
                ← Back
              </button>
              <h2 className="text-xl font-semibold">My Tasks</h2>
            </div>
          </div>

          <section className="mb-6">
            <form onSubmit={handleCreate} className="space-y-2 max-w-xl">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" className="w-full border px-3 py-2 rounded" />
              <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description (optional)" className="w-full border px-3 py-2 rounded" rows="3" />
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-2 cursor-pointer px-3 py-1 bg-slate-100 rounded border">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a1 1 0 001 1h14a1 1 0 001-1v-1M12 12V3m0 0l3.5 3.5M12 3 8.5 6.5" />
                  </svg>
                  <span className="text-sm">Attach file</span>
                  <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  {file && <span className="text-xs text-slate-600 ml-1">({file.name})</span>}
                </label>
                <button type="submit" className="bg-indigo-600 text-white px-3 py-1 rounded">Create</button>
              </div>
            </form>
          </section>

          {err && <div className="text-red-600 mb-3">{err}</div>}

          <section>
            <div className="space-y-3">
              {tasks.map((t) => (
                <div key={t.id} className="p-3 mb-2 border rounded flex justify-between items-start">
                  <div className="flex-1 pr-4">
                    <div className={t.status === 'done' ? 'line-through text-slate-400 font-medium' : 'font-medium'}>{t.title}</div>
                    {t.description && <p className="text-sm text-slate-600">{t.description}</p>}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <select value={t.status} onChange={(e) => changeStatus(t, e.target.value)} className="border rounded px-2 py-1 text-sm">
                        <option value="todo">To Do</option>
                        <option value="inprogress">In Progress</option>
                        <option value="done">Done</option>
                      </select>

                      <button onClick={() => openTask(t)} className="text-sm text-indigo-600 hover:underline px-2 py-1 rounded">Open</button>

                      <button onClick={() => removeTask(t.id)} className="ml-2 bg-red-50 text-red-700 hover:bg-red-100 px-2 py-1 rounded text-sm">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Personal task modal */}
          {selectedTask && (
            <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center p-4 z-50">
              <div className="bg-white w-full md:w-3/5 max-h-[80vh] overflow-auto rounded p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold">{selectedTask.title}</h3>
                  <button className="text-sm text-slate-500" onClick={() => setSelectedTask(null)}>Close</button>
                </div>

                <div className="mb-3">
                  <div className="text-sm text-slate-600">{selectedTask.description}</div>
                </div>

                <div className="mb-3">
                  <h4 className="font-medium mb-2">Attachments</h4>
                  {attachments.length === 0 ? (
                    <div className="text-sm text-slate-500">No attachments</div>
                  ) : (
                    <ul className="space-y-2">
                      {attachments.map(a => (
                        <li key={a.id} className="flex justify-between items-center">
                          <a 
                            href={(() => {
                              const api = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
                              const origin = api.replace(/\/?api\/?$/, '');
                              if (a.path.startsWith('http')) return a.path;
                              if (a.path.startsWith('/') || /^[A-Za-z]:/.test(a.path)) {
                                const filename = a.path.split(/[/\\]/).pop();
                                return `${origin}/uploads/${filename}`;
                              }
                              return `${origin}/${a.path}`;
                            })()}
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-indigo-600 hover:underline"
                          >
                            {a.originalName}
                          </a>
                          <button className="text-sm text-red-600" onClick={() => { if (confirm('Delete attachment?')) handleDeleteAttachment(a.id); }}>Delete</button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-3">
                    <label className="inline-flex items-center gap-2 cursor-pointer px-3 py-1 bg-slate-100 rounded">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a1 1 0 001 1h14a1 1 0 001-1v-1M12 12V3m0 0l3.5 3.5M12 3 8.5 6.5" />
                      </svg>
                      <span className="text-sm">Attach file</span>
                      <input type="file" className="hidden" onChange={(e) => handleUpload(e.target.files?.[0])} />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
