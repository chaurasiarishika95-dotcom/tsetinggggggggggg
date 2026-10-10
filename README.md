# Network Watch

Simulated transportation network planner showing how weather disrupts lanes and what a planner can do about it.

**Synthetic data:** network hubs, lanes, volumes and costs are invented, not company data. Saved weather scenarios are illustrative. Live mode retrieves current wind gusts, precipitation and snowfall from Open-Meteo for each hub; it refreshes on demand. Official severe-weather alerts are not integrated in this version.

## Regions
- Southeast US
- Germany
- Western North America
- Northeast North America
- United Kingdom & Ireland
- India North & West

Live weather readings are real, but the impact on lane capacity is a simplified rule-based estimate. Validate recommendations before treating them as operational advice.

## Run locally
```
npm install
npm run dev
```
Open http://localhost:3000

## Deploy
Push to GitHub, then import the repo in Vercel (framework: Next.js, no settings needed). No API keys are required for this version.
