import React from 'react';
import { Cpu, TrendingUp } from 'lucide-react';

/**
 * HistoricalTrendChart Component
 *
 * Lightweight, zero-dependency SVG visualization displaying the user's
 * assessment history over time. Shows chronological discrete model classes (0, 1, 2)
 * and reflection dimension scores without third-party chart libraries.
 */
export default function HistoryTrendChart({ history = [] }) {
  if (!history || history.length < 2) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 text-center space-y-2">
        <div className="w-10 h-10 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mx-auto">
          <TrendingUp className="w-5 h-5" />
        </div>
        <h3 className="text-base font-bold text-slate-800">
          Historical Trends
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Complete at least two assessments over time to visualize changes in your model outputs and reflection patterns.
        </p>
      </div>
    );
  }

  // Chronological order (oldest to newest) for chart timeline
  const chronological = [...history].reverse();
  const count = chronological.length;

  const width = 640;
  const height = 180;
  const paddingX = 48;
  const paddingY = 32;

  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  // Map points for discrete classes (0 = bottom, 1 = mid, 2 = top)
  const points = chronological.map((item, idx) => {
    const x = paddingX + (idx / Math.max(count - 1, 1)) * chartW;
    const cls = typeof item.predictedClass === 'number' ? item.predictedClass : 1;
    // Invert Y so Class 2 is higher up, Class 0 is near bottom
    const y = paddingY + chartH - (cls / 2) * chartH;
    return { x, y, cls, date: item.completedAt, id: item.id };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-xs font-bold text-violet-700 uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            <span>Timeline Visualization</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Model Output History Over Time
          </h3>
          <p className="text-xs text-slate-500">
            Chronological progression of discrete model outputs across your {count} recorded assessments.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            <span>Class Point</span>
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-[11px] font-mono text-slate-500">Classes: 0, 1, 2</span>
        </div>
      </div>

      {/* SVG Timeline Chart */}
      <div className="overflow-x-auto pt-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[500px] h-48 select-none"
        >
          {/* Horizontal Grid lines for Class 2, 1, 0 */}
          {[2, 1, 0].map((cls) => {
            const y = paddingY + chartH - (cls / 2) * chartH;
            return (
              <g key={cls}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] font-bold fill-slate-400 font-mono"
                >
                  Class {cls}
                </text>
              </g>
            );
          })}

          {/* Line Path */}
          <path
            d={pathD}
            fill="none"
            stroke="#6366F1"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((pt, idx) => (
            <g key={pt.id || idx}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r="6"
                fill="#FFFFFF"
                stroke="#4F46E5"
                strokeWidth="2.5"
                className="hover:r-8 transition-all cursor-pointer"
              />
              <circle cx={pt.x} cy={pt.y} r="2.5" fill="#4F46E5" />
              <text
                x={pt.x}
                y={height - 8}
                textAnchor="middle"
                className="text-[9px] font-semibold fill-slate-400 font-mono"
              >
                #{idx + 1}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="text-[11px] text-slate-400 pt-1 text-center">
        Hover over points to see individual checks. Points are ordered from earliest (#1) to most recent (#{count}).
      </div>
    </div>
  );
}

