// frontend/src/pages/TeamBoard.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listTasks, updateTask, deleteTask, listAttachments, uploadAttachment } from '../api/tasks';
import TaskForm from '../components/TaskForm';
import AttachmentList from '../components/AttachmentList';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const ORDER = ['todo', 'inprogress', 'done'];
const LABEL = { todo: 'To Do', inprogress: 'In Progress', done: 'Done' };

export default function TeamBoard() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [cols, setCols] = useState({ todo: [], inprogress: [], done: [] });
  const [err, setErr] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [attachments, setAttachments] = useState([]);

  async function load() {
    setErr(null);
    try {
      const res = await listTasks({ teamId });
      const tasks = res.tasks || [];
      const map = { todo: [], inprogress: [], done: [] };
      tasks.forEach((t) => map[t.status || 'todo'].push(t));
      setCols(map);
    } catch (e) {
      console.error(e);
      setErr('Failed to load tasks');
    }
  }

  useEffect(() => {
    if (!teamId) return;
    load();
  }, [teamId]);

  async function addTaskFromForm() {
    await load();
  }

  async function changeStatus(taskId, newStatus) {
    try {
      await updateTask(taskId, { status: newStatus });
      await load();
    } catch (err) {
      console.error(err);
      setErr('Failed to update status');
    }
  }

  async function removeTask(id) {
    try {
      await deleteTask(id);
      await load();
      if (selectedTask && selectedTask.id === id) setSelectedTask(null);
    } catch (err) {
      console.error('delete error', err);
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
      console.error(err);
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
      console.error(err);
      alert('Upload failed');
    }
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1">
        <Topbar title="Team Board" />
        <main className="p-6">
          <div className="mb-4 flex flex-col items-start gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm bg-white border hover:shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <h2 className="text-xl font-semibold">Team Board</h2>
            </div>

            <div className="w-full">
              <TaskForm teamId={teamId} onCreated={addTaskFromForm} />
            </div>
          </div>

          {err && <div className="text-red-600 mb-2">{err}</div>}

          <div className="grid grid-cols-3 gap-4">
            {ORDER.map((status) => (
              <div key={status} className="bg-slate-50 p-3 rounded min-h-[300px]">
                <h3 className="font-semibold mb-2">{LABEL[status]}</h3>
                <div className="space-y-3">
                  {(cols[status] || []).map((t) => (
                    <div key={t.id} className="bg-white p-3 rounded shadow-sm">
                      <div className="font-semibold mb-1">{t.title}</div>
                      {t.description && <div className="text-sm text-slate-600 mb-2">{t.description}</div>}
                      <div className="flex items-center gap-2">
                        <select
                          value={t.status}
                          onChange={(e) => changeStatus(t.id, e.target.value)}
                          className="border rounded px-2 py-1 text-sm"
                        >
                          <option value="todo">To Do</option>
                          <option value="inprogress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                        <button className="text-sm text-indigo-600 hover:underline px-2 py-1 rounded" onClick={() => openTask(t)}>
                          Open
                        </button>
                        <button
                          onClick={() => removeTask(t.id)}
                          className="bg-red-50 text-red-700 hover:bg-red-100 px-2 py-1 rounded text-sm"
                          title="Delete task"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Task drawer / modal */}
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
                  <AttachmentList attachments={attachments} onDeleted={() => openTask(selectedTask)} />
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
