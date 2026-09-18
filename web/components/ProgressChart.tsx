'use client';
import { ChartBarIcon } from '@heroicons/react/24/outline';

interface Props {
  data: { date: string; score: number }[];
}

export default function ProgressChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-purple-500/20">
        <h2 className="text-white font-semibold text-xl mb-4 flex items-center gap-2">
          <ChartBarIcon className="w-6 h-6 text-purple-400" /> Progress
        </h2>
        <p className="text-gray-400 text-center py-8">No data yet. Start training to see your progress!</p>
      </div>
    );
  }

  const maxScore = Math.max(...data.map(d => d.score), 100);
  const chartHeight = 200;
  const chartWidth = data.length * 60;

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-purple-500/20">
      <h2 className="text-white font-semibold text-xl mb-4 flex items-center gap-2">
        <ChartBarIcon className="w-6 h-6 text-purple-400" /> Progress Over Time
      </h2>
      <div className="overflow-x-auto">
        <svg width={Math.max(chartWidth, 400)} height={chartHeight + 40} className="min-w-full">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <line
              key={i}
              x1="0"
              y1={chartHeight * (1 - ratio)}
              x2={chartWidth}
              y2={chartHeight * (1 - ratio)}
              stroke="rgba(147,51,234,0.2)"
              strokeWidth="1"
            />
          ))}
          {/* Bars */}
          {data.map((d, i) => (
            <g key={i}>
              <rect
                x={i * 60 + 10}
                y={chartHeight - (d.score / maxScore) * chartHeight}
                width="40"
                height={(d.score / maxScore) * chartHeight}
                fill="#8B5CF6"
                rx="4"
              />
              <text
                x={i * 60 + 30}
                y={chartHeight + 20}
                textAnchor="middle"
                fill="rgba(156,163,175,0.8)"
                fontSize="10"
              >
                {d.date.slice(5)}
              </text>
              <text
                x={i * 60 + 30}
                y={chartHeight - (d.score / maxScore) * chartHeight - 8}
                textAnchor="middle"
                fill="white"
                fontSize="10"
              >
                {d.score}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
