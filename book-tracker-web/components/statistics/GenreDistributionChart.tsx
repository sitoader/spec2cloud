'use client';

/**
 * Genre distribution donut chart using Recharts.
 */

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { BookTrackerGenreDistribution } from '@/types';

interface GenreDistributionChartProps {
  data: BookTrackerGenreDistribution[];
}

const COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1',
];

export function GenreDistributionChart({ data }: GenreDistributionChartProps): React.JSX.Element {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-zinc-400 dark:text-zinc-500">
        No genre data available
      </div>
    );
  }

  const top = data.slice(0, 8);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={top}
          dataKey="count"
          nameKey="genre"
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={2}
        >
          {top.map((_, idx) => (
            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e4e4e7',
            borderRadius: '8px',
            fontSize: '12px',
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: '11px' }}
          iconType="circle"
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
