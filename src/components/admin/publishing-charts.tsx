"use client";

import { useState } from "react";

export function PublishingCharts({
  monthly,
  growth,
}: {
  monthly: { label: string; count: number }[];
  growth: { label: string; total: number }[];
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <ChartCard title="Monthly publications" description="Articles published each month over the last 12 months." empty="No articles published in the last 12 months.">
        {monthly.length ? <BarChart points={monthly.map((item) => ({ label: item.label, value: item.count }))} series="Published articles" /> : null}
      </ChartCard>
      <ChartCard title="Content growth" description="Cumulative articles created over time." empty="No article growth data available yet.">
        {growth.length ? <LineChart points={growth.map((item) => ({ label: item.label, value: item.total }))} series="Total articles" /> : null}
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, description, empty, children }: { title: string; description: string; empty: string; children: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden rounded-[16px] border border-[#e2d9cc]/50 bg-white shadow-sm">
      <span className="absolute inset-x-0 top-0 h-1 bg-[#c0623a]" />
      <header className="px-5 pb-3 pt-5">
        <h2 className="font-display text-base text-[#1c2b3a]">{title}</h2>
        <p className="mt-1 text-xs text-[#4a5568]">{description}</p>
      </header>
      <div className="h-[280px] px-4 pb-4">
        {children ?? <p className="flex h-full items-center justify-center rounded-[12px] border border-dashed border-[#e2d9cc] px-4 text-center text-sm text-[#4a5568]">{empty}</p>}
      </div>
    </section>
  );
}

function BarChart({ points, series }: { points: { label: string; value: number }[]; series: string }) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(...points.map((point) => point.value), 1);
  const width = 640;
  const height = 240;
  const left = 28;
  const slot = (width - left) / points.length;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" role="img" aria-label={series}>
      {[0, 1, 2, 3].map((line) => (
        <line key={line} x1={left} x2={width} y1={20 + line * 48} y2={20 + line * 48} stroke="#e2d9cc" strokeOpacity="0.5" strokeDasharray="3 3" />
      ))}
      {points.map((point, index) => {
        const barHeight = (point.value / max) * 160;
        const x = left + index * slot + slot * 0.25;
        const y = 188 - barHeight;
        return (
          <g key={point.label} onMouseEnter={() => setActive(index)} onMouseLeave={() => setActive(null)}>
            <rect x={x} y={y} width={slot * 0.5} height={barHeight} rx="8" fill="#c0623a" />
            <text x={x + slot * 0.25} y={214} textAnchor="middle" fontSize="11" fill="#4a5568">{point.label.split(" ")[0]}</text>
            {active === index ? <text x={x} y={Math.max(y - 8, 14)} fontSize="11" fill="#1c2b3a">{point.value} {series}</text> : null}
          </g>
        );
      })}
    </svg>
  );
}

function LineChart({ points, series }: { points: { label: string; value: number }[]; series: string }) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(...points.map((point) => point.value), 1);
  const width = 640;
  const height = 240;
  const left = 28;
  const step = (width - left - 12) / Math.max(points.length - 1, 1);
  const coords = points.map((point, index) => ({
    x: left + index * step,
    y: 188 - (point.value / max) * 160,
    ...point,
  }));
  const path = coords.map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`).join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" role="img" aria-label={series}>
      {[0, 1, 2, 3].map((line) => (
        <line key={line} x1={left} x2={width} y1={20 + line * 48} y2={20 + line * 48} stroke="#e2d9cc" strokeOpacity="0.5" strokeDasharray="3 3" />
      ))}
      <path d={path} fill="none" stroke="#c0623a" strokeWidth="2" />
      {coords.map((point, index) => (
        <g key={point.label} onMouseEnter={() => setActive(index)} onMouseLeave={() => setActive(null)}>
          <rect x={point.x - step / 2} y={16} width={step} height={180} fill="transparent" />
          <text x={point.x} y={214} textAnchor="middle" fontSize="11" fill="#4a5568">{point.label.split(" ")[0]}</text>
          {active === index ? <text x={point.x} y={point.y - 8} fontSize="11" fill="#1c2b3a">{point.value} {series}</text> : null}
        </g>
      ))}
    </svg>
  );
}
