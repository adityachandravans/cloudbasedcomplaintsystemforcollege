import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color?: 'blue' | 'amber' | 'emerald' | 'rose' | 'purple' | 'indigo' | 'orange';
  subtitle?: string;
  trend?: string;
  onClick?: () => void;
}

const colorMap = {
  blue: { bg: 'bg-blue-50 text-blue-600 border-blue-100', iconBg: 'bg-blue-600 text-white' },
  amber: { bg: 'bg-amber-50 text-amber-600 border-amber-100', iconBg: 'bg-amber-500 text-white' },
  emerald: { bg: 'bg-emerald-50 text-emerald-600 border-emerald-100', iconBg: 'bg-emerald-600 text-white' },
  rose: { bg: 'bg-rose-50 text-rose-600 border-rose-100', iconBg: 'bg-rose-600 text-white' },
  purple: { bg: 'bg-purple-50 text-purple-600 border-purple-100', iconBg: 'bg-purple-600 text-white' },
  indigo: { bg: 'bg-indigo-50 text-indigo-600 border-indigo-100', iconBg: 'bg-indigo-600 text-white' },
  orange: { bg: 'bg-orange-50 text-orange-600 border-orange-100', iconBg: 'bg-orange-600 text-white' },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color = 'blue',
  subtitle,
  trend,
  onClick,
}) => {
  const styles = colorMap[color] || colorMap.blue;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border bg-white p-5 shadow-xs transition-all duration-200 hover:shadow-md ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</p>
          <h3 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">{value}</h3>
          {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
          {trend && (
            <p className="mt-1 flex items-center text-xs font-medium text-emerald-600">
              <span>{trend}</span>
            </p>
          )}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${styles.iconBg} shadow-sm`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};
