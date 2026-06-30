/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from "react";
import { WeatherData, GeminiResponseSchema } from "./types";
import { PresetCity, PRESET_CITIES } from "./utils/weatherUtils";
import PresetSelector from "./components/PresetSelector";
import WeatherDetails from "./components/WeatherDetails";
import WeatherCharts from "./components/WeatherCharts";
import WeeklyForecast from "./components/WeeklyForecast";
import IntelligencePanel from "./components/IntelligencePanel";
import { 
  CloudSun, 
  Search, 
  Sparkles, 
  AlertCircle, 
  Cpu, 
  RefreshCw,
  Compass,
  ArrowRight
} from "lucide-react";

export default function App() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [trends, setTrends] = useState<{ temperatures: number[]; humidities: number[]; labels: string[] } | null>(null);
  const [intel, setIntel] = useState<GeminiResponseSchema | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isCelsius, setIsCelsius] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isIntelLoading, setIsIntelLoading] = useState(false);
  
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [intelError, setIntelError] = useState<string | null>(null);
  const [isGeolocating, setIsGeolocating] = useState(false);

  // Load standard initial city on mount (e.g. San Francisco)
  useEffect(() => {
    fetchWeatherByCity("San Francisco");
  }, []);

  // Fetch weather data from our custom full-stack backend
  async function fetchWeatherByCity(cityName: string) {
    setIsLoading(true);
    setWeatherError(null);
    setIntelError(null);
    setIntel(null); // Clear previous AI report

    try {
      const response = await fetch("/api/weather", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cityQuery: cityName }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "An anomaly occurred while querying location data.");
      }

      setWeatherData(result.weatherData);
      setTrends(result.trends);
      
      // Trigger Gemini analyze instantly on loaded weather data
      analyzeWeatherWithGemini(result.weatherData);
    } catch (err: any) {
      setWeatherError(err.message || "Failed to resolve coordinates.");
    } finally {
      setIsLoading(false);
    }
  }

  // Fetch weather data using user coordinates
  async function fetchWeatherByCoords(lat: number, lng: number) {
    setIsLoading(true);
    setWeatherError(null);
    setIntelError(null);
    setIntel(null);

    try {
      const response = await fetch("/api/weather", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lng }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Coordinate telemetry tracking failed.");
      }

      setWeatherData(result.weatherData);
      setTrends(result.trends);

      // Trigger Gemini analyze
      analyzeWeatherWithGemini(result.weatherData);
    } catch (err: any) {
      setWeatherError(err.message || "Latitude telemetry connection lost.");
    } finally {
      setIsLoading(false);
    }
  }

  // Ask server to invoke server-side Gemini API on weather profiles
  async function analyzeWeatherWithGemini(dataToAnalyze: WeatherData) {
    setIsIntelLoading(true);
    setIntelError(null);

    try {
      const response = await fetch("/api/intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weatherData: dataToAnalyze }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Gemini modeling unit experienced a cycle exception.");
      }

      setIntel(result.intel);
    } catch (err: any) {
      setIntelError(err.message || "Intelligence analysis failed.");
    } finally {
      setIsIntelLoading(false);
    }
  }

  // Browser level Geolocation query
  function handleGeolocate() {
    if (!navigator.geolocation) {
      setWeatherError("This browser model does not support geo-coordinate tracking.");
      return;
    }

    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsGeolocating(false);
        fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        setIsGeolocating(false);
        setWeatherError("Device geotracker denied access. Please choose a post preset.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  // Manual form text search
  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    if (searchQuery.trim().length > 0) {
      fetchWeatherByCity(searchQuery);
    }
  }

  return (
    <div id="app-root-wrapper" className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Decorative cybernetic skyline top bars */}
      <div className="h-[2px] w-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500" />

      {/* Primary Header */}
      <header id="main-header" className="border-b border-zinc-800/80 bg-zinc-950/60 backdrop-blur-md sticky top-0 z-50 px-4 py-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-indigo-600 rounded-xl text-black shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <CloudSun className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold px-2 py-0.5 border border-cyan-800 bg-cyan-950/40 text-cyan-400 rounded-full font-mono scale-[0.85] origin-left">
                  V1.2 PRO
                </span>
                <span className="text-zinc-600 text-xs font-mono">• CLOUDRUN CLIMATE EDGE</span>
              </div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2 font-mono">
                WEATHER INTELLIGENCE
              </h1>
            </div>
          </div>

          {/* Search box form */}
          <form id="city-search-form" onSubmit={handleSearchSubmit} className="relative flex items-center flex-1 max-w-sm w-full">
            <Search className="absolute left-3 w-4 h-4 text-zinc-500 pointer-events-none" />
            <input
              id="search-input-field"
              type="text"
              placeholder="Query any city (e.g., Paris, Berlin...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-24 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-zinc-200 outline-none transition-all placeholder:text-zinc-600"
            />
            <button
              id="search-trigger-btn"
              type="submit"
              disabled={isLoading || searchQuery.trim().length === 0}
              className="absolute right-1.5 px-3 py-1 bg-cyan-950/60 border border-cyan-850 hover:bg-cyan-900 text-cyan-400 text-xs font-semibold rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Analyze
            </button>
          </form>
        </div>
      </header>

      {/* Main Content Arena */}
      <main id="main-content" className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 space-y-6">
        {/* Error notification block */}
        {weatherError && (
          <div id="error-alert-box" className="p-4 rounded-xl bg-red-950/20 border border-red-900/40 text-red-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-zinc-100 font-semibold text-sm">Meteorology Node Exception</strong>
              <p className="text-xs text-red-300 leading-relaxed">{weatherError}</p>
            </div>
          </div>
        )}

        <div id="applayout-grid" className="grid lg:grid-cols-4 gap-6 items-start">
          {/* LEFT SIDEBAR: Controls & Preset posts */}
          <div className="lg:col-span-1 space-y-4">
            <PresetSelector
              currentCity={weatherData?.city || "San Francisco"}
              onSelectCity={(city: PresetCity) => {
                setSearchQuery("");
                fetchWeatherByCity(city.name);
              }}
              onGeolocate={handleGeolocate}
              isGeolocating={isGeolocating}
            />

            {/* Diagnostic system info */}
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2 text-zinc-500">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Cpu className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                <span className="text-[10px] font-bold tracking-widest font-mono uppercase">
                  Telemetry Diagnostics
                </span>
              </div>
              <div className="space-y-1 text-[10px] font-mono leading-tight">
                <div className="flex justify-between">
                  <span>Satellites Linked</span>
                  <span className="text-zinc-400">3 ACTIVE</span>
                </div>
                <div className="flex justify-between">
                  <span>WMO Mapping v2</span>
                  <span className="text-zinc-400 text-emerald-400">SYNCED</span>
                </div>
                <div className="flex justify-between">
                  <span>Gemini Model</span>
                  <span className="text-zinc-400">gemini-3.5-flash</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT CONTAINER AREA */}
          <div id="main-weatherview-panel" className="lg:col-span-3 space-y-6">
            {isLoading ? (
              /* Loading Skeleton structure */
              <div id="skeleton-loader-weather" className="rounded-3xl bg-zinc-900/40 border border-zinc-800/80 p-8 flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
                <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin" />
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-zinc-200 font-mono uppercase tracking-widest">
                    Synchronizing Telemetry
                  </h3>
                  <p className="text-xs text-zinc-500 max-w-sm leading-relaxed">
                    Retrieving coordinate sets from geocoding arrays and mapping current solar altitude metrics...
                  </p>
                </div>
              </div>
            ) : weatherData && trends ? (
              <div className="space-y-6">
                {/* Active City Information & Bento stats grid */}
                <WeatherDetails
                  weather={weatherData}
                  isCelsius={isCelsius}
                  onToggleUnit={() => setIsCelsius(!isCelsius)}
                />

                {/* 24-hour cycle graphs */}
                <WeatherCharts trends={trends} />

                {/* 7-day extended forecasts */}
                <WeeklyForecast forecast={weatherData.forecast} isCelsius={isCelsius} />

                {/* AI Intelligence Sector */}
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <h3 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                      Analytical Core
                    </h3>
                    {weatherData && !isIntelLoading && (
                      <button
                        id="btn-reanalyze-ai"
                        onClick={() => analyzeWeatherWithGemini(weatherData)}
                        className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
                        title="Force refresh intelligence analysis"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Re-Analyze Profile
                      </button>
                    )}
                  </div>

                  {isIntelLoading ? (
                    <div id="skeleton-loader-intel" className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center text-center space-y-4 min-h-[220px]">
                      <div className="relative">
                        <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
                        <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-zinc-300 font-mono tracking-widest uppercase flex items-center justify-center gap-1.5">
                          Invoking AI Analytical Model
                        </h4>
                        <p className="text-[11px] text-zinc-500 max-w-sm leading-relaxed">
                          Gemini 3.5-flash is assessing micro-apparel indices, outdoor sports boundaries, and bio-health factors...
                        </p>
                      </div>
                    </div>
                  ) : intelError ? (
                    <div id="intel-error" className="p-5 rounded-2xl bg-amber-950/20 border border-amber-900/30 space-y-3.5 text-left">
                      <div className="flex gap-2 text-amber-300 items-start">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-semibold text-zinc-200">
                            AI Analytical Engine Deactivated
                          </h4>
                          <p className="text-xs text-amber-400/90 leading-relaxed mt-1">
                            {intelError}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-900 space-y-2.5 text-xs text-zinc-400 leading-relaxed">
                        <p>
                          To enable full generative meteorology processing, please configure your **GEMINI_API_KEY** under the secrets settings:
                        </p>
                        <ol className="list-decimal pl-4 space-y-1 text-[11px] font-mono text-zinc-300">
                          <li>Click on **Settings → Secrets** in the top-right AI Studio workspace.</li>
                          <li>Add a key named `GEMINI_API_KEY` mapped to your Gemini personal token.</li>
                          <li>Refresh the page to sync key registries.</li>
                        </ol>
                        <hr className="border-zinc-900" />
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-zinc-500 font-semibold font-mono">STANDALONE RETRY PORT:</span>
                          <button
                            id="btn-retry-auth-intel"
                            onClick={() => analyzeWeatherWithGemini(weatherData)}
                            className="px-3 py-1 bg-amber-950/40 hover:bg-amber-900/50 text-amber-400 text-[10px] font-bold border border-amber-900/50 rounded-lg transition cursor-pointer"
                          >
                            Retry Handshake
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : intel ? (
                    <IntelligencePanel intel={intel} />
                  ) : (
                    <div className="p-6 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20 text-zinc-500 text-xs">
                      Invoke 'Re-Analyze Profile' to trigger generative analysis.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center border-2 border-dashed border-zinc-800 rounded-3xl text-zinc-400">
                Please search for a city or pick a preset telemetry post.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer id="main-footer" className="border-t border-zinc-900 bg-zinc-950/50 text-center py-6 text-xs text-zinc-600 font-mono mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© 2026 Weather Intelligence Edge • Satellite Network Synced</span>
          <span className="flex items-center gap-1.5">
            Powered by <strong className="text-zinc-400">Gemini 3.5</strong> Models
          </span>
        </div>
      </footer>
    </div>
  );
}
