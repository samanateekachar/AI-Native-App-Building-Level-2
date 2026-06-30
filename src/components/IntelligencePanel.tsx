/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { GeminiResponseSchema } from "../types";
import { 
  Brain, 
  Shirt, 
  Sprout, 
  Trophy, 
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Clock,
  Gauge
} from "lucide-react";

interface IntelligencePanelProps {
  intel: GeminiResponseSchema;
}

export default function IntelligencePanel({ intel }: IntelligencePanelProps) {
  const [activeSegment, setActiveSegment] = useState<"meteorology" | "apparel" | "activities" | "lifestyle">("meteorology");

  const safetyScore = intel?.activities?.outdoorSafetyScore ?? 100;
  
  // Safety context config
  const getSafetyConfig = (score: number) => {
    if (score >= 80) return { label: "Pristine", bg: "bg-emerald-950/30", text: "text-emerald-400", border: "border-emerald-800/40" };
    if (score >= 55) return { label: "Caution Advisory", bg: "bg-amber-950/30", text: "text-amber-400", border: "border-amber-800/40" };
    return { label: "Critical Hazard", bg: "bg-red-950/30", text: "text-red-400", border: "border-red-800/40" };
  };

  const safety = getSafetyConfig(safetyScore);

  const meteorologySummary = intel?.meteorology?.summary ?? "Synthesis pending.";
  const atmosphericPressureContext = intel?.meteorology?.atmosphericPressureContext ?? "Analysis not available.";
  const temperatureAnalysis = intel?.meteorology?.temperatureAnalysis ?? "No context available.";

  const layersList = intel?.apparel?.layers ?? [];
  const footwearConfig = intel?.apparel?.footwear ?? "No footwear guidance.";
  const accessoriesList = intel?.apparel?.accessories ?? [];
  const proTipText = intel?.apparel?.proTip ?? "Stay prepared.";

  const safeActivitiesList = intel?.activities?.safeActivities ?? [];
  const activitiesToAvoidList = intel?.activities?.activitiesToAvoid ?? [];
  const precautionsText = intel?.activities?.precautions ?? "Standard conditions apply.";

  const gardeningActionText = intel?.lifestyleAndGardening?.gardeningAction ?? "Standard care advised.";
  const homeOperationTipText = intel?.lifestyleAndGardening?.homeOperationTip ?? "Optimize ventilation.";
  const wellbeingRecommendationText = intel?.lifestyleAndGardening?.wellbeingRecommendation ?? "Maintain basic hydration.";

  return (
    <div id="ai-intelligence-container" className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 md:p-6 space-y-5 relative overflow-hidden">
      {/* Decorative Cybernetic Ambient Header */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-700/5 blur-3xl rounded-full pointer-events-none" />

      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h2 id="ai-intelligence-heading" className="text-sm font-bold text-zinc-200 tracking-wider font-mono uppercase">
              Gemini Weather Intelligence
            </h2>
            <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
              Hyper-local meteorological analysis and micro-advice
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono bg-zinc-950 px-2.5 py-1.5 rounded-lg border border-zinc-800/60">
          <Clock className="w-3 h-3 text-zinc-400 animate-pulse" />
          <span>REAL-TIME ANALYSIS FEED</span>
        </div>
      </div>

      {/* Tabs interface */}
      <div id="intel-tabs-wrapper" className="flex flex-wrap gap-1.5 border-b border-zinc-800/60 pb-3">
        <button
          id="btn-intel-tab-met"
          onClick={() => setActiveSegment("meteorology")}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
            activeSegment === "meteorology"
              ? "bg-cyan-950/40 border border-cyan-800/40 text-cyan-400 shadow-md"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30 border border-transparent"
          }`}
        >
          <Brain className="w-3.5 h-3.5" />
          Meteorology
        </button>

        <button
          id="btn-intel-tab-app"
          onClick={() => setActiveSegment("apparel")}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
            activeSegment === "apparel"
              ? "bg-cyan-950/40 border border-cyan-800/40 text-cyan-400 shadow-md"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30 border border-transparent"
          }`}
        >
          <Shirt className="w-3.5 h-3.5" />
          Apparel Advisor
        </button>

        <button
          id="btn-intel-tab-act"
          onClick={() => setActiveSegment("activities")}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
            activeSegment === "activities"
              ? "bg-cyan-950/40 border border-cyan-800/40 text-cyan-400 shadow-md"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30 border border-transparent"
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          Activity & Safety
        </button>

        <button
          id="btn-intel-tab-life"
          onClick={() => setActiveSegment("lifestyle")}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
            activeSegment === "lifestyle"
              ? "bg-cyan-950/40 border border-cyan-800/40 text-cyan-400 shadow-md"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30 border border-transparent"
          }`}
        >
          <Sprout className="w-3.5 h-3.5" />
          Gardening & Home
        </button>
      </div>

      {/* Segment Content panels */}
      <div id="intel-details-panel" className="pt-2">
        {/* METEOROLOGY */}
        {activeSegment === "meteorology" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-cyan-950/10 border border-cyan-900/20 text-cyan-100 text-xs sm:text-sm leading-relaxed">
              <span className="font-mono text-[9px] text-cyan-400 uppercase tracking-widest block mb-1">
                Meteorological Synthesis
              </span>
              <p className="font-medium text-zinc-300">
                {meteorologySummary}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1.5 hover:border-zinc-700 transition duration-300">
                <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block">
                  Atmospheric Circulation
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  {atmosphericPressureContext}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1.5 hover:border-zinc-700 transition duration-300">
                <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block">
                  Thermal Boundary Context
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  {temperatureAnalysis}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* APPAREL */}
        {activeSegment === "apparel" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800/80">
              <span className="font-mono text-[9px] text-indigo-400 uppercase tracking-widest block mb-3">
                Pre-defined Apparel Layers
              </span>
              <div className="grid sm:grid-cols-3 gap-3">
                {layersList.map((layer, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs text-zinc-300 leading-snug">{layer}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1.5">
                <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block">
                  Footwear Configuration
                </span>
                <p className="text-xs text-zinc-300 font-sans">
                  {footwearConfig}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-2">
                <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block">
                  Critical Shelter Accessories
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {accessoriesList.map((acc, index) => (
                    <span key={index} className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-md text-[10px] text-zinc-300">
                      {acc}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-950/10 border border-amber-900/10 text-xs text-amber-200 flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="font-semibold text-amber-300">Apparel Pro-Tip: </strong>
                {proTipText}
              </p>
            </div>
          </div>
        )}

        {/* ACTIVITIES & SAFETY */}
        {activeSegment === "activities" && (
          <div className="space-y-4">
            {/* Visual safety score metrics */}
            <div className="grid md:grid-cols-3 gap-3.5 items-stretch">
              <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex flex-col items-center justify-center text-center space-y-1">
                <Gauge className="w-6 h-6 text-zinc-400 mb-1" />
                <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
                  Safety Rating
                </span>
                <span className="text-3xl font-extrabold text-white">
                  {safetyScore}%
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold border ${safety.bg} ${safety.text} ${safety.border}`}>
                  {safety.label}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 col-span-2 space-y-2.5">
                <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block">
                  Activity Alignment Checklist
                </span>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Optimized Routines
                    </span>
                    <ul className="space-y-1 shrink-0">
                      {safeActivitiesList.map((act, index) => (
                        <li key={index} className="text-xs text-zinc-300 leading-snug flex items-center gap-1">
                          <span className="text-zinc-600">•</span> {act}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wider font-mono flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" />
                      Avoid Actions
                    </span>
                    <ul className="space-y-1 shrink-0">
                      {activitiesToAvoidList.map((act, index) => (
                        <li key={index} className="text-xs text-zinc-400 leading-snug flex items-center gap-1">
                          <span className="text-zinc-600">•</span> {act}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800/80 text-xs text-zinc-300 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="font-semibold text-zinc-200">Mitigation Safeguards: </strong>
                {precautionsText}
              </p>
            </div>
          </div>
        )}

        {/* GARDENING & HOME LIFESTYLE */}
        {activeSegment === "lifestyle" && (
          <div className="grid md:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-2 hover:border-zinc-700 transition duration-300">
              <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-2">
                <Sprout className="w-4 h-4 text-emerald-400" />
                <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-widest">
                  Micro-Botany & Gardening Advice
                </span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                {gardeningActionText}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-2 hover:border-zinc-700 transition duration-300">
              <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-2">
                <Lightbulb className="w-4 h-4 text-cyan-400" />
                <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-widest">
                  Home Operations & HVAC Load
                </span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                {homeOperationTipText}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-2 hover:border-zinc-700 transition duration-300">
              <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-widest">
                  Physiological Wellbeing Advice
                </span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                {wellbeingRecommendationText}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
