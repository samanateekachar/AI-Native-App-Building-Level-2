/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

//const PORT = 3000;
const app = express();
app.use(express.json());
const PORT = Number(process.env.PORT) || 3000;

// Initialize the premium Gemini AI SDK on the server side
// We check for GEMINI_API_KEY and log an elegant status check
const hasApiKey = !!process.env.GEMINI_API_KEY;
console.log(`[Gemini Activation Check] API Key detected: ${hasApiKey ? "ACTIVE" : "MISSING"}`);

const ai = hasApiKey 
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    })
  : null;

// Helper to translate Open-Meteo weather codes into beautiful standard labels
function mapWeatherCodeToCondition(code: number): string {
  const codeMap: Record<number, string> = {
    0: "Clear Sky",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing Rime Fog",
    51: "Light Drizzle",
    53: "Moderate Drizzle",
    55: "Dense Drizzle",
    56: "Light Freezing Drizzle",
    57: "Dense Freezing Drizzle",
    61: "Slight Rain",
    63: "Moderate Rain",
    65: "Heavy Rain",
    66: "Light Freezing Rain",
    67: "Heavy Freezing Rain",
    71: "Slight Snow Fall",
    73: "Moderate Snow Fall",
    75: "Heavy Snow Fall",
    77: "Snow Grains",
    80: "Slight Rain Showers",
    81: "Moderate Rain Showers",
    82: "Violent Rain Showers",
    85: "Slight Snow Showers",
    86: "Heavy Snow Showers",
    95: "Thunderstorm",
    96: "Thunderstorm with Slight Hail",
    99: "Thunderstorm with Heavy Hail"
  };
  return codeMap[code] || "Ambient Conditions";
}

/**
 * Endpoint to geocode a city and fetch real-time weather & 7-day forecast data
 */
app.post("/api/weather", async (req, res): Promise<any> => {
  const { cityQuery, lat, lng } = req.body;

  try {
    let resolvedCity = "San Francisco";
    let latitude = 37.7749;
    let longitude = -122.4194;

    if (lat !== undefined && lng !== undefined) {
      latitude = Number(lat);
      longitude = Number(lng);
      resolvedCity = `Grid [${latitude.toFixed(2)}, ${longitude.toFixed(2)}]`;

      // Try reverse geocoding city name roughly from coordinates using Open-Meteo if query is default
      try {
        const revResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=auto`);
        if (revResponse.ok) {
          const revData = await revResponse.json();
          if (revData.timezone) {
            resolvedCity = revData.timezone.split("/").pop()?.replace("_", " ") || resolvedCity;
          }
        }
      } catch (e) {
        // Fall back gracefully
      }
    } else if (cityQuery && cityQuery.trim().length > 0) {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityQuery.trim())}&count=1&language=en&format=json`;
      const geoRes = await fetch(geoUrl);
      if (!geoRes.ok) {
        return res.status(404).json({ error: "Failed to locate city on the global coordinate system." });
      }
      const geoData: any = await geoRes.json();
      if (!geoData.results || geoData.results.length === 0) {
        return res.status(404).json({ error: `City '${cityQuery}' could not be located.` });
      }
      const topResult = geoData.results[0];
      latitude = topResult.latitude;
      longitude = topResult.longitude;
      resolvedCity = `${topResult.name}, ${topResult.country}`;
    }

    // Call Open-Meteo Forecast weather API
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode,uv_index_max&hourly=temperature_2m,relative_humidity_2m&timezone=auto`;
    const weatherRes = await fetch(weatherUrl);
    
    if (!weatherRes.ok) {
      return res.status(500).json({ error: "Failed to retrieve real-time weather stats from Open-Meteo." });
    }

    const wData: any = await weatherRes.json();
    
    const cw = wData.current_weather || {};
    const daily = wData.daily || { time: [], weathercode: [], temperature_2m_min: [], temperature_2m_max: [], uv_index_max: [] };
    const hourly = wData.hourly || { temperature_2m: [], relative_humidity_2m: [], time: [] };

    // Match daily values to form 7-day forecast state
    const forecast = (daily.time || []).map((timeStr: string, index: number) => {
      const wCode = daily.weathercode ? daily.weathercode[index] : 0;
      return {
        date: timeStr,
        tempMin: daily.temperature_2m_min ? daily.temperature_2m_min[index] : 15,
        tempMax: daily.temperature_2m_max ? daily.temperature_2m_max[index] : 25,
        weatherCode: wCode,
        condition: mapWeatherCodeToCondition(wCode)
      };
    });

    // Compute simple feels-like (using wind chill / heat approximation)
    const currentTemp = cw.temperature !== undefined ? cw.temperature : 20;
    const windSpeed = cw.windspeed !== undefined ? cw.windspeed : 10;
    const weatherCode = cw.weathercode !== undefined ? cw.weathercode : 0;
    const isDayStr = cw.is_day;
    const isDay = isDayStr === 1 || isDayStr === true;
    const uvIndex = (daily.uv_index_max && daily.uv_index_max[0]) !== undefined ? daily.uv_index_max[0] : 0.0;

    // Build responsive weather bundle
    const weatherData = {
      city: resolvedCity,
      lat: latitude,
      lng: longitude,
      temperature: currentTemp,
      feelsLike: currentTemp > 26 ? currentTemp + 1.2 : currentTemp - (windSpeed * 0.1),
      humidity: (hourly.relative_humidity_2m && hourly.relative_humidity_2m[0]) !== undefined ? hourly.relative_humidity_2m[0] : 65,
      windSpeed: windSpeed,
      windDirection: cw.winddirection !== undefined ? cw.winddirection : 180,
      uvIndex: uvIndex,
      weatherCode: weatherCode,
      condition: mapWeatherCodeToCondition(weatherCode),
      isDay: isDay,
      forecast: forecast
    };

    // Include the next 24 hours of hourly indices for graphing safely
    const trends = {
      temperatures: hourly.temperature_2m ? hourly.temperature_2m.slice(0, 24) : Array(24).fill(20),
      humidities: hourly.relative_humidity_2m ? hourly.relative_humidity_2m.slice(0, 24) : Array(24).fill(65),
      labels: hourly.time ? hourly.time.slice(0, 24).map((tStr: string) => {
        try {
          const hVal = new Date(tStr).getHours();
          return `${hVal}:00`;
        } catch (e) {
          return "00:00";
        }
      }) : Array(24).fill("00:00")
    };

    return res.json({ weatherData, trends });

  } catch (error: any) {
    console.error("Meteorology retrieval crash:", error);
    return res.status(500).json({ error: "An overarching error occurred while fetching meteorology data." });
  }
});

/**
 * Dynamic meteorological rule-based fallback generator for server simulation mode
 */
function generateLocalIntelligenceFallback(w: any): any {
  const city = w.city || "Selected location";
  const temp = w.temperature ?? 20;
  const condition = w.condition || "Clear Sky";
  const uv = w.uvIndex ?? 2;
  const wind = w.windSpeed ?? 10;

  // Layered configuration based on temp
  let layers = ["Lightweight breathable t-shirt", "Comfortable cotton trousers"];
  let footwear = "Standard athletic running shoes with moisture-wicking socks.";
  let accessories = ["Polarized UV sunglasses"];
  let proTip = "Keep an active posture. The ambient relative humidity indicates a cozy moisture balance.";

  if (temp < 10) {
    layers = ["Thermal wool base layer", "Insulating dry-fit fleece", "Windproof outer shell jacket"];
    footwear = "Insulated water-resistant boots with heavy merino wool socks.";
    accessories = ["Thermal fleece gloves", "Premium wind-guard beanie"];
    proTip = "Seal your wrist and ankle collars to prevent convective wind chill from cooling core body warmth.";
  } else if (temp < 18) {
    layers = ["Comfortable air-flow core layers", "Breathable fleece or light denim jacket"];
    footwear = "Casual sneakers or premium walking shoes.";
    accessories = ["Lightweight transitional scarf"];
    proTip = "Carry a packable dry-shell layer as temperatures are within a transitional cooling threshold.";
  } else if (temp > 28) {
    layers = ["Ultra-light moisture-flex tank or thin shirt", "Breeze-mesh cooling shorts"];
    footwear = "Open-structure air-mesh sandals or hyper-breathable runners.";
    accessories = ["Reflective sun hat", "High-capacity water flask"];
    proTip = "Pre-hydrate at least 30 minutes before stepping into high thermal zones to avoid heat loading.";
  }

  if (condition.toLowerCase().includes("rain") || condition.toLowerCase().includes("drizzle") || condition.toLowerCase().includes("shower")) {
    layers.push("Waterproof Gore-Tex outer shell");
    footwear = "Non-slip weather-proofed sneakers or direct-grip boots.";
    accessories.push("High-tensile wind-resistant umbrella", "Sling bag with weather seals");
    proTip = "Ensure your footwear possesses deep traction channels to safely clear standing surface waters.";
  }

  let safetyScore = 95;
  let safeActivities = ["Scenic low-impact jogging", "Open-air photography", "Outdoors physical training"];
  let activitiesToAvoid = ["None as conditions are highly stable."];
  let precautions = "Follow standard UV safety guidelines and hydrate periodically.";

  if (temp < 5) {
    safetyScore = 55;
    safeActivities = ["Indoor high-intensity yoga", "Extended flexibility routine", "Gymnasium based cardiovascular training"];
    activitiesToAvoid = ["Prolonged subatomic outdoor exposure", "Cycling on potential ice patches"];
    precautions = "Keep extremities fully covered to guard against localized numbness or muscle stiffening.";
  } else if (temp > 35) {
    safetyScore = 40;
    safeActivities = ["Indoor swimming pool routines", "Air-conditioned indoor stretching"];
    activitiesToAvoid = ["Midday high-impact outdoor running", "Prolonged direct sunlight exposure"];
    precautions = "Seek ambient shade, wear SPF 50+ sunscreen, or limit direct solar contact to under 15 minutes.";
  } else if (condition.toLowerCase().includes("thunderstorm")) {
    safetyScore = 20;
    safeActivities = ["Indoor flexibility routines", "Static weight-lifting inside"];
    activitiesToAvoid = ["All outdoor recreation near open fields or water", "Using tall antennas or high structures"];
    precautions = "Remain entirely sheltered inside thick structural walls until electrical discharges clear.";
  }

  // Lifestyle & gardening
  let gardeningAction = "Irrigate standard beds during early morning to stabilize moisture content before solar peaking.";
  let homeOperationTip = "Open cross-ventilation vents to allow natural air balancing while outdoor temperatures remain mild.";
  let wellbeingRecommendation = "Optimize daylight exposure for 15 minutes to support your natural circadian rhythm.";

  if (temp < 10) {
    gardeningAction = "Apply organic mulch barrier around root structures to guard against low-temperature shock.";
    homeOperationTip = "Activate secondary storm window seals or adjust HVAC dampeners to lock in convective heat.";
    wellbeingRecommendation = "Support joint mobility by staying hydrated and performing warm-up exercises inside.";
  } else if (temp > 30) {
    gardeningAction = "Increase watering frequency to twice daily. Irrigate very early or late to avoid immediate evaporation.";
    homeOperationTip = "Lower thermal blinds on south-facing windows to deflect infrared solar heat loading.";
    wellbeingRecommendation = "Add multi-electrolyte solutions to your drinking water to replenish active trace mineral sweat losses.";
  }

  return {
    meteorology: {
      summary: `The micro-climate profile in ${city} is currently characterized by a temperature of ${temp}°C and ${condition} conditions. This is governed by localized thermal layers and standard atmospheric dynamics.`,
      atmosphericPressureContext: `Steady barometric setups and gentle air currents at ${wind} km/h indicate a stable boundary layer with comfortable wind circulation.`,
      temperatureAnalysis: `A reading of ${temp}°C represents ${temp > 22 ? "warm" : temp < 12 ? "cool" : "mild"} levels suited for standard daily business, showing normal diurnal patterns.`
    },
    apparel: {
      layers,
      footwear,
      accessories,
      proTip
    },
    activities: {
      outdoorSafetyScore: safetyScore,
      safeActivities,
      activitiesToAvoid,
      precautions
    },
    lifestyleAndGardening: {
      gardeningAction,
      homeOperationTip,
      wellbeingRecommendation
    }
  };
}

/**
 * Intelligent insight generation utilizing server-side Gemini
 */
app.post("/api/intelligence", async (req, res): Promise<any> => {
  const { weatherData, weather } = req.body;
  const targetWeatherData = weatherData || weather;

  if (!targetWeatherData) {
    return res.status(400).json({ error: "No weather context was forwarded to the analyst server." });
  }

  // If GEMINI_API_KEY is missing, fall back to a high-fidelity local rule engine
  if (!ai) {
    const fallbackIntel = generateLocalIntelligenceFallback(targetWeatherData);
    return res.json({ intel: fallbackIntel });
  }

  try {
    const prompt = `
Analyze the following real-time weather profile for ${targetWeatherData.city}:
- Temperature: ${targetWeatherData.temperature}°C (Feels like: ${targetWeatherData.feelsLike?.toFixed(1)}°C)
- Humidity: ${targetWeatherData.humidity}%
- Wind Speed: ${targetWeatherData.windSpeed} km/h (Heading: ${targetWeatherData.windDirection}°)
- UV Index: ${targetWeatherData.uvIndex}
- Current Condition: ${targetWeatherData.condition} (Weather Code: ${targetWeatherData.weatherCode})
- Time of Day: ${targetWeatherData.isDay ? "Daylight" : "Nighttime"}

Provide high-precision, actionable, scientifically sound weather intelligence.
Output must map perfectly to the requested JSON structure.
`;

    // Prompt Gemini with the correct structure schema
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are the primary AI core of the Weather Intelligence center, generating meticulous clothing guidance, safety metrics, micro-gardening advices, and meteorological interpretations. Answer honestly without extra preamble.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            meteorology: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING, description: "Actionable summary containing actual physical causes of this climate profile in 2 detailed sentences." },
                atmosphericPressureContext: { type: Type.STRING, description: "Scientific statement explaining the current setup (cyclonic low, dry anticyclone, breeze currents, etc.)." },
                temperatureAnalysis: { type: Type.STRING, description: "Detailed summary explaining standard heat levels for this locality and thermal behavior prediction." }
              },
              required: ["summary", "atmosphericPressureContext", "temperatureAnalysis"]
            },
            apparel: {
              type: Type.OBJECT,
              properties: {
                layers: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Layered configuration (e.g. lightweight dry-fit core, waterproof membrane, technical fleece)."
                },
                footwear: { type: Type.STRING, description: "Best type of shoes/socks to wear today." },
                accessories: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Items like premium UV eye shields, thermal gloves, or high-tensile umbrellas."
                },
                proTip: { type: Type.STRING, description: "A highly sophisticated lifestyle/comfort advice." }
              },
              required: ["layers", "footwear", "accessories", "proTip"]
            },
            activities: {
              type: Type.OBJECT,
              properties: {
                outdoorSafetyScore: { type: Type.INTEGER, description: "Dynamic outdoor rate scaling from 0 to 100 based on hazards, UV, or gusts." },
                safeActivities: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Curated active routines suited for these exact levels."
                },
                activitiesToAvoid: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Dangerous or counter-productive routines."
                },
                precautions: { type: Type.STRING, description: "Mitigation safeguards to apply if moving outside." }
              },
              required: ["outdoorSafetyScore", "safeActivities", "activitiesToAvoid", "precautions"]
            },
            lifestyleAndGardening: {
              type: Type.OBJECT,
              properties: {
                gardeningAction: { type: Type.STRING, description: "Expert irrigation or shield recommendation matching current moistures & UV." },
                homeOperationTip: { type: Type.STRING, description: "Suggestions targeting windows, ventilation, HVAC load minimization or humidity checks." },
                wellbeingRecommendation: { type: Type.STRING, description: "Bio-health advice on hydration, joint loading, mood, or sun absorption." }
              },
              required: ["gardeningAction", "homeOperationTip", "wellbeingRecommendation"]
            }
          },
          required: ["meteorology", "apparel", "activities", "lifestyleAndGardening"]
        }
      }
    });

    const bodyText = response.text;
    if (!bodyText) {
      throw new Error("No payload was returned by the GenAI coordinator.");
    }

    const intel = JSON.parse(bodyText.trim());
    return res.json({ intel });

  } catch (err: any) {
    console.error("Gemini analytical fail:", err);
    return res.status(500).json({ error: `AI Intelligence assessment hit an anomaly: ${err?.message || "Internal failure"}` });
  }
});

// Configure Vite middleware and full-stack runtime boundaries
async function startAppletServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("[DEV MODE] Dev middleware successfully mounted.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("[PROD MODE] Production asset routers connected.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[START] Full-stack Server is listening intently on http://localhost:${PORT}`);
  });
}

startAppletServer();
