import React from 'react';
import { Cloud, Server, Database, HardDrive, Shield, Cpu, Layers, CheckCircle2, Globe, Lock, Activity } from 'lucide-react';

export const SystemArchitecturePage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center space-x-2 text-brand-600 font-semibold text-xs uppercase tracking-wider">
          <Cloud className="h-4 w-4" /> Cloud Computing College Project
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mt-1">System Architecture & Cloud Infrastructure</h2>
        <p className="text-xs text-gray-500 mt-1">
          Technical explanation of multi-tier cloud-native architecture, decoupling, stateless APIs, and deployment pipelines.
        </p>
      </div>

      {/* Visual System Architecture Diagram Card */}
      <div className="rounded-2xl border border-brand-200 bg-linear-to-br from-slate-900 via-slate-850 to-brand-950 p-6 sm:p-8 text-white shadow-xl">
        <h3 className="text-sm font-bold uppercase tracking-wider text-brand-400 mb-6 flex items-center">
          <Layers className="mr-2 h-5 w-5 text-brand-400" /> Multi-Tier Cloud Deployment Diagram
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Tier 1: Client Tier */}
          <div className="rounded-xl bg-slate-800/80 p-5 border border-slate-700 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 mx-auto">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">Presentation Layer</span>
              <h4 className="text-base font-bold text-white">React + Vite SPA</h4>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Client-side rendered React application with TypeScript & Tailwind CSS. Hosted on CDN (Vercel / Netlify PaaS).
            </p>
          </div>

          {/* Tier 2: Backend REST API Tier */}
          <div className="rounded-xl bg-slate-800/80 p-5 border border-slate-700 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/20 text-brand-400 mx-auto">
              <Server className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-400">Application Layer</span>
              <h4 className="text-base font-bold text-white">Node.js + Express API</h4>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Stateless REST API micro-service handling JWT auth, role authorization, and SLA management. Deployed on Render / AWS.
            </p>
          </div>

          {/* Tier 3: Cloud Database & Storage Tier */}
          <div className="rounded-xl bg-slate-800/80 p-5 border border-slate-700 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 mx-auto">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Persistence Layer</span>
              <h4 className="text-base font-bold text-white">MongoDB Atlas + Cloud Object Storage</h4>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Managed MongoDB Atlas document store + modular Cloudinary / AWS S3 storage for complaint media attachments.
            </p>
          </div>
        </div>
      </div>

      {/* Cloud Computing Service Models Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 mb-3">
            <Cpu className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-bold text-gray-900">Infrastructure as a Service (IaaS)</h4>
          <p className="text-xs text-gray-600 mt-2 leading-relaxed">
            Provides underlying virtual compute instances, network security groups, and cloud storage volumes (e.g. AWS EC2, EBS volumes, VPC subnets).
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600 mb-3">
            <Layers className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-bold text-gray-900">Platform as a Service (PaaS)</h4>
          <p className="text-xs text-gray-600 mt-2 leading-relaxed">
            Eliminates OS maintenance. Vercel hosts the React frontend CDN while Render / AWS Elastic Beanstalk automatically scales Node.js instances.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 mb-3">
            <Cloud className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-bold text-gray-900">Software as a Service (SaaS)</h4>
          <p className="text-xs text-gray-600 mt-2 leading-relaxed">
            Delivers a complete Web Browser application to Students, Staff, and Administrators without requiring local installation or specialized hardware.
          </p>
        </div>
      </div>

      {/* Key Cloud Capabilities Demonstrated */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-gray-900">12 Cloud Computing Principles Implemented</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-gray-50 border">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-gray-900 block">Stateless API Architecture</strong>
              <span className="text-gray-500">JWT token authorization allows horizontally scalable server instances behind a load balancer.</span>
            </div>
          </div>

          <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-gray-50 border">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-gray-900 block">Decoupled Storage & Database</strong>
              <span className="text-gray-500">Binary images & documents are stored in Cloud Storage, saving MongoDB database bandwidth and storage costs.</span>
            </div>
          </div>

          <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-gray-50 border">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-gray-900 block">Managed Cloud Database</strong>
              <span className="text-gray-500">MongoDB Atlas provides automatic clustering, replica set failover, point-in-time backups, and auto-indexing.</span>
            </div>
          </div>

          <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-gray-50 border">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-gray-900 block">Centralized Access & RBAC</strong>
              <span className="text-gray-500">Role-based access control enforces strict security barriers between Student, Staff, HOD, and Admin.</span>
            </div>
          </div>

          <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-gray-50 border">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-gray-900 block">Environment Variable Secrets</strong>
              <span className="text-gray-500">JWT secrets, connection strings, and storage keys are loaded dynamically from environment variables.</span>
            </div>
          </div>

          <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-gray-50 border">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-gray-900 block">Audit Trail & Telemetry</strong>
              <span className="text-gray-500">Comprehensive audit logging records administrative changes, user state transitions, and SLA events.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
