/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ForecastDay } from "../types";
import { getWeatherMetadata } from "../utils/weatherUtils";
import { Calendar } from "lucide-react";

interface WeeklyForecastProps {
  forecast: ForecastDay[];
  isCelsius: boolean;
}

export default function WeeklyForecast({ forecast, isCelsius }: WeeklyForecastProps) {
  // Translate numeric temp to standard selected unit
  const formatTemp = (cVal: number) => {
    if (isCelsius) return `${Math.round(cVal)}°`;
    return `${Math.round((cVal * 9) / 5 + 32)}°`;
  };

  // Convert string date into day names ("Mon", "Tue")
  const getDayName = (dateStr: string) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dObj = new Date(dateStr);
    
    // Check if valid date
    if (isNaN(dObj.getTime())) return dateStr;

    // Check if it's today
    const current = new Date();
    if (dObj.toDateString() === current.toDateString()) {
      return "Today";
    }

    return days[dObj.getDay()].slice(0, 3);
  };

  return (
    <div id="weekly-forecast-container" className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 space-y-4">
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
        <Calendar className="w-5 h-5 text-indigo-400" />
        <h2 id="weekly-forecast-heading" className="text-sm font-semibold text-zinc-300 font-mono tracking-wider uppercase">
          7-Day Meteorology Cycles
        </h2>
      </div>

      <p className="text-xs text-zinc-500 leading-relaxed max-w-xl">
        Cyclical prediction indicators outline temperature changes and expected humidity shifts as computed by our satellite telemetry nodes.
      </p>

      {/* Grid of 7 days */}
      <div id="weekly-forecast-grid" className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {forecast.map((day, idx) => {
          const meta = getWeatherMetadata(day.weatherCode, true);
          const WeatherIcon = meta.icon;

          return (
            <div
              id={`weekly-day-card-${idx}`}
              key={day.date}
              className="p-3.5 rounded-xl bg-zinc-950/50 border border-zinc-800/80 hover:border-zinc-700/80 text-center flex flex-col items-center justify-between gap-2.5 transition-all duration-300 group hover:scale-[1.03]"
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-zinc-200 block font-mono">
                  {getDayName(day.date)}
                </span>
                <span className="text-[10px] text-zinc-500 block font-mono">
                  {day.date.split("-").slice(1).join("/")}
                </span>
              </div>

              <div className={`p-2 rounded-lg bg-zinc-900 border border-zinc-850 ${meta.themeColor} group-hover:scale-115 transition-transform duration-300`}>
                <WeatherIcon className="w-4 h-4" />
              </div>

              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-zinc-300 block leading-tight truncate max-w-[80px]">
                  {day.condition}
                </span>
                <div className="flex items-baseline justify-center gap-1.5 pt-1">
                  <span className="text-xs font-bold text-zinc-100">
                    {formatTemp(day.tempMax)}
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    {formatTemp(day.tempMin)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
