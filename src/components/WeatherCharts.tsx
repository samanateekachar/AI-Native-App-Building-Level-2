/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { AreaChart, Activity, Droplets, Thermometer, Calendar } from "lucide-react";

interface WeatherChartsProps {
  trends: {
    temperatures: number[];
    humidities: number[];
    labels: string[];
  };
}

export default function WeatherCharts({ trends }: WeatherChartsProps) {
  const [activeTab, setActiveTab] = useState<"temperature" | "humidity">("temperature");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const temperatures = trends?.temperatures || [];
  const humidities = trends?.humidities || [];
  const labels = trends?.labels || [];

  const dataValues = activeTab === "temperature" ? temperatures : humidities;
  const unit = activeTab === "temperature" ? "°C" : "%";
  const iconColor = activeTab === "temperature" ? "text-blue-400" : "text-sky-400";
  const lineColor = activeTab === "temperature" ? "#3b82f6" : "#38bdf8";
  const fillColor = activeTab === "temperature" ? "rgba(59, 130, 246, 0.15)" : "rgba(56, 189, 248, 0.15)";

  // Scale data points to fit within a 600x160 viewport
  const paddingX = 40;
  const paddingY = 20;
  const chartWidth = 720;
  const chartHeight = 160;

  const minVal = dataValues.length > 0 ? Math.min(...dataValues) : 0;
  const maxVal = dataValues.length > 0 ? Math.max(...dataValues) : 0;
  const valueRange = maxVal - minVal === 0 ? 1 : maxVal - minVal;

  const points = dataValues.length > 0 ? dataValues.map((val, idx) => {
    const x = paddingX + (idx / Math.max(1, dataValues.length - 1)) * (chartWidth - paddingX * 2);
    // Inverse Y so higher value is physically higher up
    const y = chartHeight - paddingY - ((val - minVal) / valueRange) * (chartHeight - paddingY * 2);
    return { x, y, value: val, label: labels[idx] || "" };
  }) : [];

  // Render SVG Path (smoothed curve)
  let dPath = "";
  if (points.length > 0) {
    dPath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 3;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (2 * (p1.x - p0.x)) / 3;
      const cpY2 = p1.y;
      dPath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
  }

  // Filled closed path for gradient overlay
  const dFilledPath = points.length > 0
    ? `${dPath} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`
    : "";

  return (
    <div id="weather-charts-container" className="rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-5 space-y-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" />
          <h2 id="charts-main-heading" className="text-sm font-bold text-slate-300 font-mono tracking-wider uppercase">
            24-Hour Atmospheric Cycle
          </h2>
        </div>
        <div className="flex gap-1.5 p-1 rounded-full bg-white/5 border border-white/10 max-w-max">
          <button
            id="tab-btn-temp"
            onClick={() => { setActiveTab("temperature"); setHoveredIndex(null); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer ${
              activeTab === "temperature"
                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            Temperature
          </button>
          <button
            id="tab-btn-humid"
            onClick={() => { setActiveTab("humidity"); setHoveredIndex(null); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer ${
              activeTab === "humidity"
                ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                : "text-slate-400 hover:text-white relative"
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            Relative Humidity
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
        Hover over the dynamic bezier indices below to inspect physical meteorological changes and cycles as mapped from solar altitude transitions.
      </p>

      {/* SVG Container */}
      <div id="chart-viewport-wrapper" className="relative w-full overflow-x-auto select-none no-scrollbar">
        <div className="min-w-[720px] pb-2 relative">
          <svg className="w-full h-40 overflow-visible" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
            {/* Grid Lines */}
            <line
              x1={paddingX}
              y1={paddingY}
              x2={chartWidth - paddingX}
              y2={paddingY}
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray="4"
            />
            <line
              x1={paddingX}
              y1={chartHeight / 2}
              x2={chartWidth - paddingX}
              y2={chartHeight / 2}
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray="4"
            />
            <line
              x1={paddingX}
              y1={chartHeight - paddingY}
              x2={chartWidth - paddingX}
              y2={chartHeight - paddingY}
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray="4"
            />

            {/* Left and Right Min / Max Axis Helpers */}
            <text x={paddingX - 10} y={paddingY + 4} fill="#64748b" fontSize="10" textAnchor="end" className="font-mono">
              {maxVal.toFixed(1)}{unit}
            </text>
            <text x={paddingX - 10} y={chartHeight - paddingY + 4} fill="#64748b" fontSize="10" textAnchor="end" className="font-mono">
              {minVal.toFixed(1)}{unit}
            </text>

            {/* Filled area path */}
            {dFilledPath && <path d={dFilledPath} fill={fillColor} />}

            {/* Main Weather Line */}
            {dPath && (
              <path
                d={dPath}
                fill="none"
                stroke={lineColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Interaction points */}
            {points.map((pt, index) => {
              const isHovered = index === hoveredIndex;
              // Only draw hover guides
              return (
                <g key={index} id={`chart-node-group-${index}`}>
                  {/* Vertical Guide Line on Hover */}
                  {isHovered && (
                    <line
                      x1={pt.x}
                      y1={paddingY}
                      x2={pt.x}
                      y2={chartHeight - paddingY}
                      stroke={lineColor}
                      strokeWidth="1.5"
                      strokeDasharray="2"
                    />
                  )}
                  {/* Outer active circle */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 6 : 4}
                    fill={isHovered ? lineColor : "#05070a"}
                    stroke={lineColor}
                    strokeWidth="2"
                    className="transition-all duration-150 cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                </g>
              );
            })}
          </svg>

          {/* Time/Hour Labels Footer */}
          <div className="flex justify-between px-[40px] text-[10px] text-slate-500 font-mono pt-1">
            <span>00:00</span>
            <span>04:00</span>
            <span>08:00</span>
            <span>12:00</span>
            <span>16:00</span>
            <span>20:00</span>
            <span>23:00</span>
          </div>

          {/* Interactive Tooltip Overlay */}
          {hoveredIndex !== null && points[hoveredIndex] && (
            <div
              id="chart-tooltip-bubble"
              className="absolute pointer-events-none px-3 py-2 bg-[#090d16] border border-white/10 rounded-xl shadow-xl flex flex-col gap-0.5 z-20 transition-all duration-100"
              style={{
                left: `${points[hoveredIndex].x}px`,
                transform: "translate(-50%, -115%)",
                top: `${points[hoveredIndex].y}px`,
              }}
            >
              <span className="text-[10px] font-semibold text-slate-400 font-mono tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-500" />
                {points[hoveredIndex].label}
              </span>
              <span className={`text-sm font-extrabold flex items-center gap-1 ${iconColor}`}>
                {points[hoveredIndex].value.toFixed(1)}
                <span className="text-xs font-normal opacity-70">{unit}</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
