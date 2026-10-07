import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-2xl border border-slate-800 text-gray-900">
      <div className="text-center mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 mx-auto mb-3">
          <KeyRound className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
        <p className="text-xs text-gray-500 mt-1">
          Enter your registered email address to receive password reset instructions.
        </p>
      </div>

      {submitted ? (
        <div className="rounded-xl bg-emerald-50 p-6 text-center text-xs text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
          <h4 className="font-bold text-sm text-emerald-900">Reset Instructions Sent</h4>
          <p className="mt-1">
            If an account exists for <strong>{email}</strong>, a password reset link has been dispatched to your inbox.
          </p>
          <Link
            to="/login"
            className="mt-4 inline-flex items-center text-xs font-semibold text-brand-600 hover:underline"
          >
            <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Return to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@college.edu"
              className="w-full rounded-xl border border-gray-300 p-3 text-xs focus:border-brand-600 outline-hidden"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-brand-600 py-3 text-xs font-bold text-white shadow-md hover:bg-brand-700 cursor-pointer transition-all"
          >
            Send Reset Link
          </button>

          <div className="text-center mt-4">
            <Link
              to="/login"
              className="inline-flex items-center text-xs font-semibold text-gray-600 hover:text-brand-600"
            >
              <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back to Login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};
