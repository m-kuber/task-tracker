// frontend/src/pages/TeamBoard.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { listTasks, createTask, updateTask, deleteTask } from '../api/tasks';

export default function TeamBoard() {
  const { teamId } = useParams();
  const [columns, setColumns] = useState({
    todo: [],
    inprogress: [],
    done: [],
  });
  const [newTitle, setNewTitle] = useState('');

  async function load() {
    try {
      const res = await listTasks({ teamId });
      const tasks = res.tasks || [];
      const cols = { todo: [], inprogress: [], done: [] };
      tasks.forEach((t) => cols[t.status || 'todo'].push(t));
      setColumns(cols);
    } catch (err) {
      console.error('Error loading tasks:', err);
    }
  }

  useEffect(() => {
    if (teamId) load();
  }, [teamId]);

  async function handleAddTask() {
    if (!newTitle.trim()) return;
    try {
      await createTask({ title: newTitle, teamId });
      setNewTitle('');
      load();
    } catch (err) {
      console.error('Error creating task:', err);
    }
  }

  async function handleDeleteTask(id) {
    try {
      await deleteTask(id);
      load();
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  }

  async function handleStatusChange(id, newStatus) {
    try {
      await updateTask(id, { status: newStatus });
      load();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex mb-4">
        <input
          className="border p-2 flex-grow rounded"
          placeholder="New task title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button
          onClick={handleAddTask}
          className="ml-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add
        </button>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-3 gap-4">
        {Object.keys(columns).map((col) => (
          <div key={col} className="bg-gray-50 rounded-lg p-3 shadow">
            <h2 className="font-semibold text-lg capitalize mb-2 border-b pb-1">
              {col === 'todo'
                ? 'To Do'
                : col === 'inprogress'
                ? 'In Progress'
                : 'Done'}
            </h2>

            <div className="space-y-2">
              {columns[col].map((task) => (
                <div
                  key={task.id}
                  className="bg-white p-3 shadow-sm rounded flex flex-col gap-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{task.title}</span>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-red-500 text-sm hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>

                  <select
                    value={task.status}
                    onChange={(e) =>
                      handleStatusChange(task.id, e.target.value)
                    }
                    className="border rounded p-1 text-sm"
                  >
                    <option value="todo">To Do</option>
                    <option value="inprogress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
