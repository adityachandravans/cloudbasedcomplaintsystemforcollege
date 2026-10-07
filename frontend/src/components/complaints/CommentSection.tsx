import React, { useState, useEffect } from 'react';
import { CommentItem, UserRole } from '../../types';
import API from '../../services/api';
import { formatDate } from '../../utils/formatters';
import { Send, Lock, Paperclip, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface CommentSectionProps {
  complaintId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ complaintId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [message, setMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [attachments, setAttachments] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [complaintId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/complaints/${complaintId}/comments`);
      if (res.data.success) {
        setComments(res.data.comments);
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('message', message);
      if (user?.role !== 'student') {
        formData.append('isInternal', String(isInternal));
      }

      if (attachments) {
        Array.from(attachments).forEach((file) => formData.append('attachments', file));
      }

      const res = await API.post(`/complaints/${complaintId}/comments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setMessage('');
        setIsInternal(false);
        setAttachments(null);
        fetchComments();
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
      <h4 className="flex items-center text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
        <MessageSquare className="mr-2 h-4 w-4 text-brand-600" /> Comments & Resolution Updates ({comments.length})
      </h4>

      {/* Existing Comments Stream */}
      <div className="space-y-4 max-h-96 overflow-y-auto pr-1 mb-6">
        {comments.length === 0 ? (
          <p className="text-xs text-gray-400 italic text-center py-4">No comments posted yet.</p>
        ) : (
          comments.map((item) => (
            <div
              key={item._id}
              className={`rounded-xl p-3.5 border text-xs transition-all ${
                item.isInternal
                  ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                  : item.userId?._id === user?.id
                  ? 'bg-brand-50/60 border-brand-200 ml-4'
                  : 'bg-gray-50 border-gray-200 mr-4'
              }`}
            >
              <div className="flex items-center justify-between font-semibold mb-1">
                <span className="flex items-center space-x-1.5">
                  <span className="text-gray-900">{item.userId?.name}</span>
                  <span className="text-[10px] text-gray-500 capitalize bg-white px-1.5 py-0.5 rounded border">
                    {item.userId?.role}
                  </span>
                  {item.isInternal && (
                    <span className="flex items-center text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                      <Lock className="mr-1 h-3 w-3" /> Internal Staff Note
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-gray-400">{formatDate(item.createdAt)}</span>
              </div>

              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{item.message}</p>

              {item.attachments && item.attachments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2 pt-2 border-t border-gray-200/50">
                  {item.attachments.map((file, idx) => (
                    <a
                      key={idx}
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center text-[11px] font-medium text-brand-700 bg-white px-2 py-1 rounded border hover:underline"
                    >
                      <Paperclip className="mr-1 h-3 w-3" /> {file.originalName}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="border-t border-gray-200 pt-4">
        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your comment or update here..."
          className="w-full rounded-lg border border-gray-300 p-3 text-xs focus:border-brand-500 focus:outline-hidden"
          required
        ></textarea>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-4">
            <label className="flex items-center text-xs text-gray-600 cursor-pointer">
              <Paperclip className="mr-1 h-4 w-4 text-gray-400" />
              <span>Attach files</span>
              <input
                type="file"
                multiple
                onChange={(e) => setAttachments(e.target.files)}
                className="hidden"
              />
            </label>

            {user?.role !== 'student' && (
              <label className="flex items-center text-xs text-amber-700 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                  className="mr-1.5 h-3.5 w-3.5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                Internal Staff Note (Hidden from Student)
              </label>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || !message.trim()}
            className="inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50 cursor-pointer transition-all"
          >
            <Send className="mr-1.5 h-3.5 w-3.5" /> Post Comment
          </button>
        </div>

        {attachments && attachments.length > 0 && (
          <p className="mt-2 text-[11px] text-gray-500">
            Selected: {Array.from(attachments).map((f) => f.name).join(', ')}
          </p>
        )}
      </form>
    </div>
  );
};
