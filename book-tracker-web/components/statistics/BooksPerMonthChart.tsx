'use client';

/**
 * Monthly books bar chart using Recharts.
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { BookTrackerMonthlyReading } from '@/types';

interface BooksPerMonthChartProps {
  data: BookTrackerMonthlyReading[];
}

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function BooksPerMonthChart({ data }: BooksPerMonthChartProps): React.JSX.Element {
  const chartData = MONTH_LABELS.map((name, idx) => {
    const item = data.find((d) => d.month === idx + 1);
    return { name, count: item?.count ?? 0 };
  });

  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-zinc-400 dark:text-zinc-500">
        No data for this period
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: '#71717a' }}
          axisLine={{ stroke: '#d4d4d8' }}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: '#71717a' }}
          axisLine={{ stroke: '#d4d4d8' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e4e4e7',
            borderRadius: '8px',
            fontSize: '12px',
          }}
        />
        <Bar
          dataKey="count"
          fill="#10b981"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
