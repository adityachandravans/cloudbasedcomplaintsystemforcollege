import React, { useState, useEffect } from 'react';
import { AuditLog } from '../types';
import API from '../services/api';
import { formatDate } from '../utils/formatters';
import { RoleBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Pagination } from '../components/common/Pagination';
import { History, ShieldAlert } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchAuditLogs();
  }, [page]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await API.get('/audit-logs', { params: { page, limit: 20 } });
      if (res.data.success) {
        setLogs(res.data.logs);
        setPages(res.data.pages);
        setTotal(res.data.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-xl font-bold text-gray-900">System Audit Trail</h2>
        <p className="text-xs text-gray-500">Immutable security audit log of all administrative actions & complaint changes</p>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching audit logs..." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 uppercase tracking-wider text-gray-500 border-b">
                <tr>
                  <th className="px-4 py-3.5 font-semibold">Timestamp</th>
                  <th className="px-4 py-3.5 font-semibold">Actor / User</th>
                  <th className="px-4 py-3.5 font-semibold">Role</th>
                  <th className="px-4 py-3.5 font-semibold">Action Event</th>
                  <th className="px-4 py-3.5 font-semibold">Target Entity</th>
                  <th className="px-4 py-3.5 font-semibold">Entity ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50 font-mono">
                    <td className="px-4 py-3 text-gray-500">{formatDate(log.timestamp)}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{log.userName}</td>
                    <td className="px-4 py-3">
                      <RoleBadge role={log.userRole as any} />
                    </td>
                    <td className="px-4 py-3 font-bold text-brand-700">{log.action}</td>
                    <td className="px-4 py-3 text-gray-700">{log.entity}</td>
                    <td className="px-4 py-3 text-gray-500">{log.entityId || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pages={pages} total={total} onPageChange={(p) => setPage(p)} />
        </div>
      )}
    </div>
  );
};
