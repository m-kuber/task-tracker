import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { listTasks, createTask, updateTask, deleteTask } from '../api/tasks';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const ORDER = ['todo', 'inprogress', 'done'];
const LABEL = { todo: 'To Do', inprogress: 'In Progress', done: 'Done' };

export default function MyTasksBoard() {
  const [cols, setCols] = useState({ todo: [], inprogress: [], done: [] });
  const [title, setTitle] = useState('');
  const [err, setErr] = useState(null);

  async function load() {
    try {
      const res = await listTasks();
      const tasks = res.tasks || [];
      const map = { todo: [], inprogress: [], done: [] };
      tasks.forEach((t) => map[t.status || 'todo'].push(t));
      setCols(map);
    } catch (e) {
      setErr(e?.response?.data?.message || 'Failed to load tasks');
    }
  }

  useEffect(() => { load(); }, []);

  async function add() {
    if (!title.trim()) return setErr('Title required');
    try {
      await createTask({ title });
      setTitle('');
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || 'Failed to create');
    }
  }

  async function changeStatus(task, next) {
    await updateTask(task.id, { status: next });
    await load();
  }

  async function remove(id) {
    await deleteTask(id);
    await load();
  }

  async function onDragEnd(result) {
    const { destination, draggableId } = result;
    if (!destination) return;
    await updateTask(draggableId, { status: destination.droppableId });
    await load();
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1">
        <Topbar title="My Tasks Kanban" />
        <main className="p-4">
          <div className="mb-4 flex gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="New personal task"
              className="flex-grow border p-2 rounded"
            />
            <button onClick={add} className="bg-indigo-600 text-white px-4 py-2 rounded">
              Add
            </button>
          </div>
          {err && <div className="text-red-600 mb-2">{err}</div>}

          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-4">
              {ORDER.map((s) => (
                <Droppable key={s} droppableId={s}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="flex-1 bg-slate-50 p-3 rounded min-h-[400px]"
                    >
                      <h3 className="font-semibold mb-2">{LABEL[s]}</h3>
                      {(cols[s] || []).map((task, idx) => (
                        <Draggable key={String(task.id)} draggableId={String(task.id)} index={idx}>
                          {(prov) => (
                            <div
                              ref={prov.innerRef}
                              {...prov.draggableProps}
                              {...prov.dragHandleProps}
                              className="bg-white p-3 mb-2 rounded shadow"
                            >
                              <div className="font-medium">{task.title}</div>
                              {task.description && (
                                <div className="text-sm text-slate-500 mt-1">
                                  {task.description}
                                </div>
                              )}
                              <select
                                value={task.status}
                                onChange={(e) => changeStatus(task, e.target.value)}
                                className="mt-2 border text-sm rounded p-1 w-full"
                              >
                                {ORDER.map((opt) => (
                                  <option key={opt} value={opt}>
                                    {LABEL[opt]}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => remove(task.id)}
                                className="text-xs text-red-600 mt-2"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
        </main>
      </div>
    </div>
  );
}
