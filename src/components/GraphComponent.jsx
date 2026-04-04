import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Cell, CartesianGrid,
  Area, AreaChart,
} from "recharts";

const GRADIENT_COLORS = [
  { start: "#8B5CF6", end: "#6D28D9" },
  { start: "#3B82F6", end: "#1D4ED8" },
  { start: "#10B981", end: "#059669" },
  { start: "#F59E0B", end: "#D97706" },
  { start: "#F43F5E", end: "#BE123C" },
  { start: "#06B6D4", end: "#0891B2" },
];

const CHART_TYPES = ["bar", "line", "area"];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-3 py-2 shadow-xl border border-white/[0.1]">
      <p className="text-xs text-zinc-400 mb-1">{label}</p>
      <p className="text-sm font-semibold text-white">
        {payload[0].value?.toLocaleString()}
      </p>
    </div>
  );
}

function CustomXAxis({ data, ...props }) {
  // recharts passes all props, just return an XAxis
  return (
    <XAxis
      {...props}
      tick={{ fill: "#71717A", fontSize: 11, fontFamily: "Inter" }}
      axisLine={false}
      tickLine={false}
    />
  );
}

export default function GraphComponent({ labels = [], values = [], title = "Data Overview" }) {
  const [chartType, setChartType] = useState("bar");

  const data = labels.map((l, i) => ({ name: l, value: values[i] ?? 0 }));
  if (!data.length) return null;

  const gradientId = "barGradient";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="mt-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
          {title}
        </h4>
        {/* Chart type switcher */}
        <div className="flex gap-1 bg-white/[0.04] rounded-lg p-0.5 border border-white/[0.06]">
          {CHART_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setChartType(t)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all duration-200 capitalize ${
                chartType === t
                  ? "bg-violet-600/25 text-violet-300 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Chart container */}
      <div className="bg-white/[0.02] rounded-xl border border-white/[0.05] p-4"
        style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "bar" ? (
            <BarChart data={data} barCategoryGap="35%">
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#6D28D9" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: "#71717A", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="value" fill={`url(#${gradientId})`} radius={[6, 6, 0, 0]}
                isAnimationActive animationDuration={900} animationEasing="ease-out">
                {data.map((_, i) => (
                  <Cell
                    key={i}
                    fill={`url(#${gradientId})`}
                    opacity={0.75 + (i / data.length) * 0.25}
                  />
                ))}
              </Bar>
            </BarChart>
          ) : chartType === "line" ? (
            <LineChart data={data}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: "#71717A", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone" dataKey="value"
                stroke="url(#lineGradient)" strokeWidth={2.5}
                dot={{ fill: "#8B5CF6", r: 4, strokeWidth: 2, stroke: "#1a1a2e" }}
                activeDot={{ r: 6, fill: "#A78BFA" }}
                isAnimationActive animationDuration={900}
              />
            </LineChart>
          ) : (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: "#71717A", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone" dataKey="value"
                stroke="#8B5CF6" strokeWidth={2.5}
                fill="url(#areaGradient)"
                dot={{ fill: "#8B5CF6", r: 3 }}
                isAnimationActive animationDuration={900}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-zinc-500">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: GRADIENT_COLORS[i % GRADIENT_COLORS.length].start }} />
            <span>{d.name}</span>
            <span className="text-zinc-400 font-medium">{d.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
