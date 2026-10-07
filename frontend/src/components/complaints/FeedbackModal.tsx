import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Star } from 'lucide-react';
import API from '../../services/api';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaintId: string;
  onSuccess: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  complaintId,
  onSuccess,
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await API.post('/feedback', { complaintId, rating, comment });
      if (res.data.success) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit Complaint Resolution Feedback">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            Rate your resolution satisfaction (1 to 5 Stars):
          </label>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 focus:outline-hidden cursor-pointer"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                  } transition-colors`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Comments or suggestions (Optional):
          </label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us how quickly and effectively your issue was resolved..."
            className="w-full rounded-lg border border-gray-300 p-2.5 text-xs focus:border-brand-500"
          ></textarea>
        </div>

        <div className="flex justify-end space-x-2 pt-2 border-t">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 cursor-pointer"
          >
            Submit Feedback
          </button>
        </div>
      </form>
    </Modal>
  );
};
