import React, { useEffect, useState, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { listTasks, createTask, updateTask, deleteTask, uploadAttachment, listAttachments, deleteAttachment } from '../api/tasks';
import AttachmentList from '../components/AttachmentList';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const ORDER = ['todo', 'inprogress', 'done'];
const LABEL = { todo: 'To Do', inprogress: 'In Progress', done: 'Done' };

export default function MyTasksBoard() {
  const [cols, setCols] = useState({ todo: [], inprogress: [], done: [] });
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [err, setErr] = useState(null);
  const fileInputRef = useRef(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [attachments, setAttachments] = useState([]);

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
      const res = await createTask({ title, description });
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
      setDescription('');
      setFile(null);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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

  async function openTask(task) {
    setSelectedTask(task);
    try {
      const res = await listAttachments(task.id);
      setAttachments(res.attachments || []);
    } catch (e) {
      setAttachments([]);
    }
  }

  async function handleUpload(file) {
    if (!selectedTask || !file) return;
    try {
      await uploadAttachment(selectedTask.id, file);
      const res = await listAttachments(selectedTask.id);
      setAttachments(res.attachments || []);
    } catch (e) {
      alert('Upload failed');
    }
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1">
        <Topbar title="My Tasks Kanban" />
        <main className="p-4">
          <div className="mb-4 flex flex-col gap-2">
            <div className="flex gap-2">
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
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="border p-2 rounded"
              rows="3"
            />
            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-2 cursor-pointer px-3 py-1 bg-slate-100 rounded border text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a1 1 0 001 1h14a1 1 0 001-1v-1M12 12V3m0 0l3.5 3.5M12 3 8.5 6.5" />
                </svg>
                <span>Attach file</span>
                <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                {file && <span className="text-xs text-slate-600 ml-1">({file.name})</span>}
              </label>
            </div>
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
                              <div className="font-semibold mb-1">{task.title}</div>
                              {task.description && (
                                <div className="text-sm text-slate-600 mb-2">{task.description}</div>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <select
                                  value={task.status}
                                  onChange={(e) => changeStatus(task, e.target.value)}
                                  className="border text-sm rounded p-1"
                                >
                                  {ORDER.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {LABEL[opt]}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => openTask(task)}
                                  className="text-xs text-indigo-600"
                                >
                                  Open
                                </button>
                                <button
                                  onClick={() => remove(task.id)}
                                  className="text-xs text-red-600"
                                >
                                  Delete
                                </button>
                              </div>
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

          {selectedTask && (
            <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center p-4 z-50">
              <div className="bg-white w-full md:w-3/5 max-h-[80vh] overflow-auto rounded p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold">{selectedTask.title}</h3>
                  <button className="text-sm text-slate-500" onClick={() => setSelectedTask(null)}>Close</button>
                </div>

                {selectedTask.description && (
                  <div className="mb-3 text-sm text-slate-600">{selectedTask.description}</div>
                )}

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

// Add modal to view attachments and upload for selected personal task
// (placed at end of component's return block)
