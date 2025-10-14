import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { listTeamTasks, updateTask } from '../api/tasks';

const COLUMN_ORDER = ['todo', 'inprogress', 'done'];
const COLUMN_LABEL = { todo: 'To do', inprogress: 'In progress', done: 'Done' };

export default function KanbanBoard({ teamId }) {
  const [columns, setColumns] = useState({
    todo: [],
    inprogress: [],
    done: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  async function loadTasks() {
    setLoading(true);
    try {
      const res = await listTeamTasks(teamId);
      const tasks = res.tasks || [];
      const cols = { todo: [], inprogress: [], done: [] };
      tasks.forEach((t) => {
        cols[t.status || 'todo'].push(t);
      });
      setColumns(cols);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function onDragEnd(result) {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Find task object
    const sourceList = Array.from(columns[source.droppableId]);
    const [moved] = sourceList.splice(source.index, 1);

    const destList = Array.from(columns[destination.droppableId]);
    destList.splice(destination.index, 0, moved);

    const newColumns = {
      ...columns,
      [source.droppableId]: sourceList,
      [destination.droppableId]: destList
    };
    setColumns(newColumns);

    // Persist status change
    try {
      await updateTask(moved.id, { status: destination.droppableId });
    } catch (err) {
      console.error('Failed to update task status', err);
      // revert by reloading
      loadTasks();
    }
  }

  return (
    <div className="flex gap-4 p-4 overflow-auto">
      <DragDropContext onDragEnd={onDragEnd}>
        {COLUMN_ORDER.map((colId) => (
          <div key={colId} className="flex-1 min-w-[260px]">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">{COLUMN_LABEL[colId]}</h3>
            <Droppable droppableId={colId}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="min-h-[200px] bg-slate-50 p-2 rounded space-y-2"
                >
                  {columns[colId].map((task, idx) => (
                    <Draggable key={task.id} draggableId= {String(task.id)} index={idx}>
                      {(prov) => (
                        <div
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          {...prov.dragHandleProps}
                          className="bg-white p-3 rounded shadow-sm border"
                        >
                          <div className="flex justify-between">
                            <div className="font-medium">{task.title}</div>
                            <div className="text-xs text-slate-400">{task.priority}</div>
                          </div>
                          <div className="text-sm text-slate-600 mt-2">{task.description ? task.description.slice(0, 100) : ''}</div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </DragDropContext>
      {loading && <div className="text-sm text-slate-500">Loading...</div>}
    </div>
  );
}
