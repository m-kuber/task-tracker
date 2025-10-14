import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { listTasks, createTask, updateTask, deleteTask } from '../api/tasks';
import { Link } from 'react-router-dom';

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await listTasks();
      setTasks(res.tasks || []);
    } catch (e) {
      setErr(e?.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function add() {
    if (!title.trim()) return setErr('Title required');
    try {
      await createTask({ title, description: desc });
      setTitle('');
      setDesc('');
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || 'Failed to create task');
    }
  }

  async function changeStatus(task, next) {
    try {
      await updateTask(task.id, { status: next });
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || 'Failed to update status');
    }
  }

  async function removeTask(id) {
    try {
      await deleteTask(id);
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || 'Failed to delete');
    }
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1">
        <Topbar title="My Tasks" />
        <main className="p-6">
          <div className="max-w-3xl">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Personal Tasks</h2>
              <Link
                to="/my-tasks-board"
                className="text-sm text-indigo-600 hover:underline"
              >
                View Kanban Board →
              </Link>
            </div>

            <div className="bg-white border rounded p-4 mb-6">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title"
                className="w-full border p-2 rounded mb-2"
              />
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Description (optional)"
                className="w-full border p-2 rounded mb-2"
              />
              <button
                onClick={add}
                className="bg-indigo-600 text-white px-4 py-2 rounded"
              >
                Add Task
              </button>
              {err && <div className="text-red-600 mt-2">{err}</div>}
            </div>

            {loading ? (
              <p>Loading...</p>
            ) : (
              <ul>
                {tasks.length === 0 && (
                  <p className="text-slate-500">No personal tasks yet.</p>
                )}
                {tasks.map((t) => (
                  <li
                    key={t.id}
                    className="p-3 mb-2 border rounded flex justify-between items-start"
                  >
                    <div className="flex-1 pr-4">
                      <div
                        className={
                          t.status === 'done'
                            ? 'line-through text-slate-400 font-medium'
                            : 'font-medium'
                        }
                      >
                        {t.title}
                      </div>
                      {t.description && (
                        <p className="text-sm text-slate-600">
                          {t.description}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <select
                        value={t.status}
                        onChange={(e) => changeStatus(t, e.target.value)}
                        className="border rounded p-1 text-sm"
                      >
                        <option value="todo">To do</option>
                        <option value="inprogress">In progress</option>
                        <option value="done">Done</option>
                      </select>
                      <button
                        onClick={() => removeTask(t.id)}
                        className="text-sm text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
