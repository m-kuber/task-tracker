// frontend/src/components/AttachmentList.jsx
import React from 'react';
import { deleteAttachment } from '../api/tasks';

export default function AttachmentList({ attachments = [], onDeleted }) {
  // attachments: array of { id, filename, originalName, mimeType, size, path, uploadedBy, uploader, createdAt }

  async function handleDelete(id) {
    if (!confirm('Delete this attachment?')) return;
    try {
      await deleteAttachment(id);
      if (onDeleted) onDeleted();
    } catch (err) {
      console.error('Failed to delete attachment', err);
      alert('Failed to delete attachment');
    }
  }

  if (!attachments || attachments.length === 0) {
    return <div className="text-sm text-slate-500">No attachments</div>;
  }

  return (
    <div className="space-y-2">
      {attachments.map((a) => (
        <div key={a.id} className="flex items-center justify-between bg-white p-2 rounded shadow-sm">
          <div className="flex items-center gap-3">
            <a
              className="text-indigo-600 hover:underline"
              href={(() => {
                const api = import.meta.env.VITE_API_URL || 'http://13.233.152.67:4000/api';
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
            >
              {a.originalName}
            </a>
            <div className="text-xs text-slate-500">{a.uploader?.name || 'Unknown'}</div>
          </div>
          <div>
            <button
              onClick={() => handleDelete(a.id)}
              className="text-red-600 text-sm hover:text-red-800"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
