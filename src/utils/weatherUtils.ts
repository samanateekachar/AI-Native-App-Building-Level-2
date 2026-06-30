/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Sun, 
  CloudSun, 
  Cloud, 
  CloudFog, 
  CloudDrizzle, 
  CloudRain, 
  Snowflake, 
  CloudLightning,
  Compass,
  Wind
} from "lucide-react";

export interface PresetCity {
  name: string;
  country: string;
  flag: string;
  lat: number;
  lng: number;
  description: string;
}

export const PRESET_CITIES: PresetCity[] = [
  {
    name: "Tokyo",
    country: "Japan",
    flag: "🇯🇵",
    lat: 35.6762,
    lng: 139.6503,
    description: "Confluence of ultra-modern tech and historic shrines."
  },
  {
    name: "Reykjavik",
    country: "Iceland",
    flag: "🇮🇸",
    lat: 64.1466,
    lng: -21.9426,
    description: "Geothermal wonders and stark Nordic volcanic fields."
  },
  {
    name: "San Francisco",
    country: "United States",
    flag: "🇺🇸",
    lat: 37.7749,
    lng: -122.4194,
    description: "Chilly ocean breezes and iconic fog rolling over the bay."
  },
  {
    name: "Sydney",
    country: "Australia",
    flag: "🇦🇺",
    lat: -33.8688,
    lng: 151.2093,
    description: "Sun-soaked harbors and golden coastal surf cultures."
  },
  {
    name: "London",
    country: "United Kingdom",
    flag: "🇬🇧",
    lat: 51.5074,
    lng: -0.1278,
    description: "Moody historic skies and lush royal city parks."
  },
  {
    name: "Cairo",
    country: "Egypt",
    flag: "🇪🇬",
    lat: 30.0444,
    lng: 31.2357,
    description: "Arid golden deserts surrounding eternal pyramids."
  }
];

export interface WeatherMetadata {
  label: string;
  icon: any; // React element type
  gradient: string; // Tailwind bg gradient class
  bgGradient: string; // Whole card ambient background
  themeColor: string; // Primary accent
  textColor: string;
}

export function getWeatherMetadata(code: number, isDay: boolean = true): WeatherMetadata {
  switch (code) {
    case 0: // Clear sky
      return {
        label: isDay ? "Sunny & Clear" : "Clear Sky",
        icon: Sun,
        gradient: "from-amber-400 to-orange-500",
        bgGradient: isDay 
          ? "from-amber-500/10 via-orange-500/5 to-[#121214]" 
          : "from-blue-900/10 via-slate-900/5 to-[#121214]",
        themeColor: "text-amber-400",
        textColor: "text-amber-100"
      };
    case 1:
    case 2:
    case 3: // Mostly clear, partly cloudy, overcast
      return {
        label: code === 1 ? "Mainly Clear" : code === 2 ? "Partly Cloudy" : "Overcast Sky",
        icon: code === 3 ? Cloud : CloudSun,
        gradient: "from-blue-400 to-indigo-600",
        bgGradient: "from-blue-600/10 via-indigo-600/5 to-[#121214]",
        themeColor: "text-blue-400",
        textColor: "text-blue-100"
      };
    case 45:
    case 48: // Foggy
      return {
        label: "Fog & Haze",
        icon: CloudFog,
        gradient: "from-teal-400 to-slate-500",
        bgGradient: "from-teal-600/10 via-slate-600/5 to-[#121214]",
        themeColor: "text-teal-400",
        textColor: "text-teal-100"
      };
    case 51:
    case 53:
    case 55: // Drizzle
      return {
        label: "Damp Drizzle",
        icon: CloudDrizzle,
        gradient: "from-emerald-400 to-teal-600",
        bgGradient: "from-emerald-600/10 via-teal-600/5 to-[#121214]",
        themeColor: "text-emerald-400",
        textColor: "text-emerald-100"
      };
    case 56:
    case 57:
    case 66:
    case 67: // Freezing drizzle & freezing rain
      return {
        label: "Freezing Rain",
        icon: Snowflake,
        gradient: "from-cyan-300 to-blue-500",
        bgGradient: "from-cyan-500/10 via-blue-500/5 to-[#121214]",
        themeColor: "text-cyan-300",
        textColor: "text-cyan-100"
      };
    case 61:
    case 63:
    case 65:
    case 80:
    case 81:
    case 82: // Rain showers, slight to active
      return {
        label: "Rain Showers",
        icon: CloudRain,
        gradient: "from-cyan-400 to-blue-700",
        bgGradient: "from-cyan-600/10 via-blue-700/5 to-[#121214]",
        themeColor: "text-cyan-400",
        textColor: "text-cyan-100"
      };
    case 71:
    case 73:
    case 75:
    case 77:
    case 85:
    case 86: // Snow falling or showers
      return {
        label: "Wintry Snow",
        icon: Snowflake,
        gradient: "from-rose-100 to-cyan-200",
        bgGradient: "from-fuchsia-400/10 via-cyan-300/5 to-[#121214]",
        themeColor: "text-cyan-200",
        textColor: "text-sky-100"
      };
    case 95:
    case 96:
    case 99: // Thunderstorm
      return {
        label: "Thunderstorm",
        icon: CloudLightning,
        gradient: "from-red-400 via-purple-600 to-indigo-800",
        bgGradient: "from-red-600/10 via-purple-600/5 to-[#121214]",
        themeColor: "text-purple-400",
        textColor: "text-purple-100"
      };
    default:
      return {
        label: "Ambient Sky",
        icon: Cloud,
        gradient: "from-slate-400 to-slate-600",
        bgGradient: "from-slate-600/10 via-slate-700/5 to-[#121214]",
        themeColor: "text-slate-400",
        textColor: "text-slate-100"
      };
  }
}

export function getWindDirectionLabel(degree: number): string {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round(degree / 22.5) % 16;
  return directions[index];
}
