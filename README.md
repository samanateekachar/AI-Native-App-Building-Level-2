# 🌦️ Level 2: Weather Intelligence App - Docker WSL Deployment Guide

This repository contains the complete, production-ready source code for the **Weather Intelligence Application**, optimized for local development and containerized deployment inside **Ubuntu WSL (Windows Subsystem for Linux)**.

---

## 🏛️ Application Architecture & Tech Stack

Our implementation establishes a high-performance, full-stack architecture that cleanly separates concerns while maintaining a lightweight footprint:

- **Frontend (SPA)**: React 19 + TypeScript + Vite. Dynamic components utilize **Tailwind CSS v4** for high-contrast presentation and styling, and **Lucide React** for sharp, scalable vector icons.
- **Backend (Express)**: A low-latency Express gateway proxies all third-party telemetry calls to prevent client CORS blocks, and handles intelligent processing using the official server-side **Google GenAI SDK (`@google/genai`)**.
- **Data Integrations**: 
  - **Open-Meteo Geocoding API**: Resolves human city queries into spatial coordinates (Lat/Lng).
  - **Open-Meteo Forecast API**: Retrieves 7-day micro-forecasting arrays, humidity rates, UV indexes, and hourly wind profiles.
- **AI Analytics Core**: When a `GEMINI_API_KEY` is present, **Gemini 3.5 Flash** acts as our meteorological intelligence engine, processing data streams into highly structured home-operation, micro-gardening, activity safety, and apparel layering models.
  - *Fail-Safe Grace*: If the API key is not supplied, the app gracefully degrades to standard, offline-accessible charts and lists, while providing clear setup steps on the UI dashboard.

---

## 🛠️ Step 1: Set up WSL Ubuntu & Local Environment

Follow these verified steps from inside your **Ubuntu WSL** terminal to install prerequisites and run the application locally.

### 1. Verify and Install Node.js LTS & npm
Your assignment requires running Node.js and npm directly inside the Ubuntu WSL kernel (not Windows cmd). Verify your setup:

```bash
# Check existing versions
node -v
npm -v
```

*If Node.js is missing, install the current LTS release using the NodeSource repository:*
```bash
# Update Ubuntu package lists
sudo apt update && sudo apt upgrade -y

# Install Node.js v20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify the installations succeeded
node -v  # Expected: v20.x.x
npm -v   # Expected: v10.x.x
```

### 2. Install Project Dependencies & Launch Locally
From inside your project workspace folder inside Ubuntu WSL:

```bash
# Clean install exact schema dependencies
npm install

# Run the full-stack app in Developer Mode
npm run dev
```

The terminal will bound the port and output:
```text
[DEV MODE] Dev middleware successfully mounted.
[START] Full-stack Server is listening intently on http://localhost:3000
```
Open your host browser to `http://localhost:3000` to interact with your live environment!

---

## 🐳 Step 2: Dockerize & Deploy Inside WSL

We packaged this app into a highly optimized, dual-stage **Dockerfile** to compile client-side React code and package the Express host for light, production-ready container environments.

### 1. Docker Environment Prerequisites
Ensure your Docker runtime is installed natively within Ubuntu WSL (avoiding Windows-side Docker Desktop for a true Linux-native execution):

```bash
# Verify docker service is active
sudo service docker status

# If Docker is not installed, trigger the standard apt script:
sudo apt install docker.io -y
sudo usermod -aG docker $USER
# (Restart your WSL workspace to apply groups)
```

### 2. Inspecting the Docker Blueprint Configuration
The configuration is split into two clean files at the project root:

- **`Dockerfile`**: Compiles all production assets inside an intermediate `node:20-alpine` stage, then drops development weight to produce a final, secure, single-run runtime image.
- **`.dockerignore`**: Blocks local log-files, `node_modules`, and previous build outcomes from clogging up the context container.

### 3. Build the Docker Image
Inside your Ubuntu WSL terminal:

```bash
# Build the production image & tag it locally
docker build -t weather-intelligence-app .
```

*Expected output ending:*
```text
Successfully built weather-intelligence-app:latest
```

### 4. Run the Containerized App
Execute the compiled microservice container, forwarding port `3000` from the container to your local system host:

```bash
# Run in background detached mode, forwarding port 3000
docker run -d -p 3000:3000 --name weather-intel-demo weather-intelligence-app
```

Verify that the micro-container is running perfectly:
```bash
docker ps
```

Open your web browser and navigate to **`http://localhost:3000`** to validate the containerized app.

---

## 🧪 Step 3: Mandatory Validation & Testing Cases

Ensure you capture evidence panels for each state to fulfill assignment rubrics:

### 🔬 Test Case 1: Core Search Telemetry (Tokyo)
- Enter **`Tokyo`** in the header query field.
- **Expected Outcome**:
  - The geocoder resolves `Tokyo, Japan` at lat `35.68`, lng `139.69`.
  - Grid values update correctly showing current temperature, relative humidity bar, rotatable wind direction compass, and UV indices.
  - The **7-Day Meteorology Cycle** renders the forecast blocks.
  - Horizontal **24-Hour bezier curves** show climate fluctuations on hover tooltips.

### 🔬 Test Case 2: Alternate Telemetry & Geolocation (Sydney)
- Search for **`Sydney`** or click the **`Auto-GPS`** button inside the Location Hub card.
- **Expected Outcome**:
  - Sydney coordinates show positive latitude and negative longitude grids.
  - Theme colors convert perfectly (e.g., if daytime in Sydney, nice amber glowing overlays; if night, deep cosmic slate backdrops).

### 🔬 Test Case 3: Error Mitigation & Fail-Safe Handling
- Search for a gibberish string like **`XYZ123ABC`** into the search field.
- **Expected Outcome**:
  - The search text highlights and shows an elegant, red-tinted banner: **"City 'XYZ123ABC' could not be located."**
  - All existing, validated metrics stay intact on screen, ensuring zero interface crashes or runtime breaking cycles.

---

## 📂 Step 4: Final Submission Packaging (ZIP Code)

Compress the deployment project folder directly from WSL, ensuring directories are named correctly:

```bash
# Navigate to parent folder
cd ..

# Zip project structure (replace with your individual Employee ID and name)
zip -r 102456_samana_teekachar_appbuilding_L2.zip weather-intelligence-app -x "**/node_modules/*" "**/dist/*"
```
*Submit this zipped folder containing your code, `Dockerfile`, `.dockerignore`, and this `README.md` to complete your Level 2 certification!*
