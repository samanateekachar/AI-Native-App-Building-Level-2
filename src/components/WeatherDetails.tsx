/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WeatherData } from "../types";
import { getWeatherMetadata, getWindDirectionLabel } from "../utils/weatherUtils";
import { 
  Wind, 
  Droplets, 
  Sun, 
  Compass, 
  Thermometer,
  Cloudy,
  Activity
} from "lucide-react";

interface WeatherDetailsProps {
  weather: WeatherData;
  isCelsius: boolean;
  onToggleUnit: () => void;
}

export default function WeatherDetails({
  weather,
  isCelsius,
  onToggleUnit,
}: WeatherDetailsProps) {
  const metadata = getWeatherMetadata(weather.weatherCode, weather.isDay);
  const TargetIcon = metadata.icon;

  // Unit conversion helper
  const convertTemp = (cVal: number) => {
    if (isCelsius) return `${cVal.toFixed(1)}°C`;
    return `${((cVal * 9) / 5 + 32).toFixed(1)}°F`;
  };

  // Compute UV rating category
  const getUvRating = (uv: number) => {
    if (uv <= 2) return { text: "Low Risk", color: "text-emerald-400" };
    if (uv <= 5) return { text: "Moderate", color: "text-amber-400" };
    if (uv <= 7) return { text: "High Risk", color: "text-orange-400" };
    return { text: "Extreme", color: "text-red-400" };
  };

  const uvRating = getUvRating(weather.uvIndex || 0);

  return (
    <div id="weather-details-section" className="space-y-4">
      {/* Current Meteorology Hero Card */}
      <div
        id="weather-hero-card"
        className={`relative overflow-hidden rounded-3xl border border-zinc-800/80 p-6 sm:p-8 bg-zinc-950/60 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-500`}
      >
        {/* Glow Ambient Filter */}
        <div 
          className={`absolute inset-0 bg-gradient-to-tr ${metadata.gradient} opacity-[0.04] blur-2xl pointer-events-none`} 
        />

        <div className="space-y-3 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-[10px] font-semibold text-zinc-400 border border-zinc-800 bg-zinc-900 rounded-full tracking-wider uppercase font-mono">
              Observation Station
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div>
            <h1 id="hero-city-name" className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1">
              {weather.city}
            </h1>
            <p className="text-xs text-zinc-400 font-mono">
              Coordinates: LAT {weather.lat.toFixed(4)} • LNG {weather.lng.toFixed(4)}
            </p>
          </div>

          <div className="flex items-baseline gap-2.5 pt-1">
            <span id="hero-display-temp" className="text-5xl sm:text-6xl font-extrabold tracking-tighter text-white">
              {convertTemp(weather.temperature)}
            </span>
            <button
              id="btn-toggle-units"
              onClick={onToggleUnit}
              className="text-xs font-semibold px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-all duration-200 cursor-pointer"
              title="Toggle metric / imperial units"
            >
              Convert to {isCelsius ? "Fahrenheit (°F)" : "Celsius (°C)"}
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm text-zinc-300">
            <div className={`p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 ${metadata.themeColor}`}>
              <TargetIcon className="w-4 h-4" />
            </div>
            <span className="font-semibold">{weather.condition}</span>
            <span className="text-zinc-600">•</span>
            <span className="text-xs text-zinc-400">
              Feels like <strong className="text-zinc-300">{convertTemp(weather.feelsLike || weather.temperature)}</strong>
            </span>
          </div>
        </div>

        {/* Ambient Big Sky Graphic */}
        <div id="ambient-sky-graphic" className="relative flex items-center justify-center p-4 bg-zinc-900/40 border border-zinc-800/40 rounded-2xl md:w-36 md:h-36 shrink-0 z-10">
          <TargetIcon className={`w-16 h-16 ${metadata.themeColor} drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]`} />
          <span className="absolute bottom-2 text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
            {weather.isDay ? "DAYLIGHT" : "NIGHTTIME"}
          </span>
        </div>
      </div>

      {/* Grid Specs */}
      <div id="weather-specs-bento-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Humidity Block */}
        <div className="bg-zinc-900 border border-zinc-800/60 p-4 rounded-2xl flex items-start gap-3 group hover:border-zinc-700 transition-all duration-300">
          <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-800/50 text-cyan-400">
            <Droplets className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider font-mono text-zinc-500 font-semibold block">
              Humidity
            </span>
            <span className="text-base font-bold text-zinc-200 block">
              {weather.humidity}%
            </span>
            <div className="w-16 h-1 bg-zinc-800 rounded-full overflow-hidden mt-1">
              <div 
                className="h-full bg-cyan-500 transition-all duration-500" 
                style={{ width: `${weather.humidity}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Wind Index */}
        <div className="bg-zinc-900 border border-zinc-800/60 p-4 rounded-2xl flex items-start gap-3 group hover:border-zinc-700 transition-all duration-300">
          <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/50 text-indigo-400">
            <Wind className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider font-mono text-zinc-500 font-semibold block">
              Wind Velocity
            </span>
            <span className="text-base font-bold text-zinc-200 block">
              {weather.windSpeed} <span className="text-[10px] font-normal text-zinc-500">km/h</span>
            </span>
            <span className="text-[10px] text-zinc-400 block truncate">
              Heading {weather.windDirection}° ({getWindDirectionLabel(weather.windDirection)})
            </span>
          </div>
        </div>

        {/* Dynamic Compass Angle orientation */}
        <div className="bg-zinc-900 border border-zinc-800/60 p-4 rounded-2xl flex items-start gap-3 group hover:border-zinc-700 transition-all duration-300">
          <div className="p-2.5 rounded-xl bg-teal-950/40 border border-teal-800/50 text-teal-400">
            <Compass className="w-4 h-4" />
          </div>
          <div className="space-y-0.5 w-full">
            <span className="text-[10px] uppercase tracking-wider font-mono text-zinc-500 font-semibold block">
              Air Currents
            </span>
            <span className="text-base font-bold text-zinc-200 block">
              {getWindDirectionLabel(weather.windDirection)} Direction
            </span>
            {/* Render mini rotatable compass card */}
            <div className="flex items-center gap-1.5 pt-0.5 text-[10px] text-zinc-500">
              <Compass 
                className="w-3.5 h-3.5 text-zinc-400 transition-all duration-1000" 
                style={{ transform: `rotate(${weather.windDirection}deg)` }} 
              />
              <span className="font-mono">{weather.windDirection}° Rotation</span>
            </div>
          </div>
        </div>

        {/* Solar UV Index */}
        <div className="bg-zinc-900 border border-zinc-800/60 p-4 rounded-2xl flex items-start gap-3 group hover:border-zinc-700 transition-all duration-300">
          <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/50 text-amber-400">
            <Sun className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider font-mono text-zinc-500 font-semibold block">
              Solar UV Index
            </span>
            <span className="text-base font-bold text-zinc-200 block">
              {weather.uvIndex?.toFixed(1) || "0.0"}
            </span>
            <span className={`text-[10px] font-semibold block ${uvRating.color}`}>
              {uvRating.text}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
