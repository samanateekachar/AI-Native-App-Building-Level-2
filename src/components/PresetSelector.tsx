/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PRESET_CITIES, PresetCity } from "../utils/weatherUtils";
import { Navigation, Compass, MapPin } from "lucide-react";

interface PresetSelectorProps {
  currentCity: string;
  onSelectCity: (city: PresetCity) => void;
  onGeolocate: () => void;
  isGeolocating: boolean;
}

export default function PresetSelector({
  currentCity,
  onSelectCity,
  onGeolocate,
  isGeolocating,
}: PresetSelectorProps) {
  return (
    <div id="preset-selector-container" className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <h3 id="preset-selector-header" className="text-sm font-semibold text-zinc-300 font-mono tracking-widest uppercase flex items-center gap-2">
          <Navigation className="w-4 h-4 text-cyan-500" />
          Location Hub
        </h3>
        <button
          id="btn-geolocate"
          onClick={onGeolocate}
          disabled={isGeolocating}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-950/50 hover:bg-cyan-900 border border-cyan-800/60 text-cyan-400 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <Compass className={`w-3.5 h-3.5 ${isGeolocating ? "animate-spin" : ""}`} />
          {isGeolocating ? "Locating..." : "Auto-GPS"}
        </button>
      </div>

      <p className="text-xs text-zinc-500 leading-relaxed">
        Choose from our meteorological observation posts or trigger GPS telemetry to capture your current weather profile.
      </p>

      <div id="presets-grid" className="grid grid-cols-2 gap-2">
        {PRESET_CITIES.map((city) => {
          const isSelected = currentCity.toLowerCase().includes(city.name.toLowerCase());
          return (
            <button
              id={`preset-btn-${city.name.toLowerCase()}`}
              key={city.name}
              onClick={() => onSelectCity(city)}
              className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-300 group hover:scale-[1.02] cursor-pointer ${
                isSelected
                  ? "bg-cyan-950/40 border-cyan-500 text-zinc-100"
                  : "bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-sm font-medium">
                <span className="text-base group-hover:scale-110 transition-transform">{city.flag}</span>
                <span className="truncate">{city.name}</span>
              </div>
              <span className="text-[10px] text-zinc-500 line-clamp-1 group-hover:text-zinc-400">
                {city.country}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 p-3.5 rounded-xl bg-zinc-950/40 border border-zinc-800/60 text-zinc-500">
        <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
        <span className="text-[10px] leading-snug">
          Telemetry centers retrieve local pressure, dampness levels, and UV indices instantly.
        </span>
      </div>
    </div>
  );
}
