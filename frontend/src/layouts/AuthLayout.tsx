import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between p-4 sm:p-6 text-white selection:bg-brand-500 selection:text-white">
      <div className="flex items-center justify-between max-w-5xl w-full mx-auto py-2">
        <Link to="/login" className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white font-bold shadow-md">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">CloudCampus</h1>
            <p className="text-xs text-slate-400">College Complaint Portal</p>
          </div>
        </Link>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
          Cloud Computing Project
        </span>
      </div>

      <main className="flex-1 flex items-center justify-center py-8">
        <Outlet />
      </main>

      <footer className="text-center text-xs text-slate-500 py-4">
        &copy; {new Date().getFullYear()} CloudCampus Complaint Management System. Designed for Cloud Computing Demonstration.
      </footer>
    </div>
  );
};
