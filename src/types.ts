/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WeatherData {
  city: string;
  lat: number;
  lng: number;
  temperature: number;
  feelsLike?: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  uvIndex?: number;
  weatherCode: number;
  condition: string;
  isDay: boolean;
  forecast: ForecastDay[];
}

export interface ForecastDay {
  date: string;
  tempMin: number;
  tempMax: number;
  weatherCode: number;
  condition: string;
}

export interface GeminiResponseSchema {
  meteorology: {
    summary: string;
    atmosphericPressureContext: string;
    temperatureAnalysis: string;
  };
  apparel: {
    layers: string[];
    footwear: string;
    accessories: string[];
    proTip: string;
  };
  activities: {
    outdoorSafetyScore: number; // 0 to 100
    safeActivities: string[];
    activitiesToAvoid: string[];
    precautions: string;
  };
  lifestyleAndGardening: {
    gardeningAction: string;
    homeOperationTip: string;
    wellbeingRecommendation: string;
  };
}
