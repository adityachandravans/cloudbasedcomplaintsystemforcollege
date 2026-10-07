import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';

interface ChartProps {
  data: { name?: string; count?: number; month?: string; submitted?: number; resolved?: number }[];
}

const COLORS = ['#3b82f6', '#8b5cf6', '#6366f1', '#f59e0b', '#10b981', '#6b7280', '#ef4444', '#f97316', '#dc2626'];

export const StatusPieChart: React.FC<ChartProps> = ({ data }) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="count"
            nameKey="name"
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} complaints`, 'Count']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const CategoryBarChart: React.FC<ChartProps> = ({ data }) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} tick={{ fontSize: 10 }} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#026fc7" radius={[4, 4, 0, 0]} name="Complaints" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const DepartmentBarChart: React.FC<ChartProps> = ({ data }) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" angle={-15} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Complaints" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const PriorityChart: React.FC<ChartProps> = ({ data }) => {
  const priorityColors: Record<string, string> = {
    low: '#3b82f6',
    medium: '#eab308',
    high: '#f97316',
    critical: '#dc2626',
  };

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Complaints">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={priorityColors[entry.name?.toLowerCase() || 'medium'] || '#3b82f6'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const MonthlyTrendChart: React.FC<ChartProps> = ({ data }) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="submitted" stroke="#3b82f6" fill="#bfdbfe" name="Submitted" />
          <Area type="monotone" dataKey="resolved" stroke="#10b981" fill="#a7f3d0" name="Resolved" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const WorkloadBarChart: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" angle={-15} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="inProgress" stackId="a" fill="#f59e0b" name="In Progress" />
          <Bar dataKey="resolved" stackId="a" fill="#10b981" name="Resolved" />
          <Bar dataKey="overdue" stackId="a" fill="#ef4444" name="Overdue" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
