---
title: "Sensor Dashboard"
description: "IoT sensor data analysis with FlintDB window functions, EMA, and time filters."
---

Analyze IoT sensor data — per-device aggregation, EMA smoothing, time-windowed queries, and threshold alerts.

## What you'll learn

- Bulk time-series ingestion with `putBatch()`
- Per-device aggregation with `groupBy`
- EMA smoothing for noisy sensor data
- `last()` for time-windowed queries
- Threshold-based alerting with filters

## Setup

```bash
mkdir sensor-dashboard && cd sensor-dashboard
npm init -y
npm install flintdb
```

## Step 1: Ingest sensor data

Generate readings from 3 devices — temperature, humidity, pressure every 5 minutes:

```js
import { FlintDB } from "flintdb";

function generateSensorData(deviceId, days) {
  const docs = [];
  const start = new Date("2024-09-01T00:00:00Z");
  const readingsPerDay = 288; // every 5 min

  const baselines = {
    "sensor-A": { temp: 22, humidity: 45, pressure: 1013 },
    "sensor-B": { temp: 25, humidity: 55, pressure: 1010 },
    "sensor-C": { temp: 18, humidity: 60, pressure: 1015 },
  };
  const base = baselines[deviceId];

  for (let d = 0; d < days; d++) {
    for (let r = 0; r < readingsPerDay; r++) {
      const ts = new Date(start.getTime() + (d * readingsPerDay + r) * 5 * 60 * 1000);
      const hour = ts.getUTCHours();
      const dailyCycle = Math.sin(((hour - 6) / 24) * Math.PI * 2) * 4;
      const noise = (Math.random() - 0.5) * 1.5;

      docs.push({
        device_id: deviceId,
        timestamp: ts.toISOString(),
        temperature: +(base.temp + dailyCycle + noise).toFixed(2),
        humidity: +(base.humidity + (Math.random() - 0.5) * 8).toFixed(1),
        pressure: +(base.pressure + (Math.random() - 0.5) * 3).toFixed(1),
        battery_pct: +(100 - d * 1.2 - Math.random() * 0.5).toFixed(1),
      });
    }
  }
  return docs;
}

const db = FlintDB.open("./data");

for (const device of ["sensor-A", "sensor-B", "sensor-C"]) {
  const data = generateSensorData(device, 7);
  db.putBatch("sensors", data);
}

db.createIndex("sensors", "device_id");
db.createIndex("sensors", "timestamp", "BTree");
db.close();
```

## Step 2: Device overview

```js
import { FlintDB, col, avg, stddev, min, max, count } from "flintdb";

const db = FlintDB.open("./data");

const overview = db
  .from("sensors")
  .groupBy("device_id")
  .select({
    device_id: col("device_id"),
    readings: count("device_id"),
    avg_temp: avg("temperature"),
    temp_sd: stddev("temperature"),
    min_temp: min("temperature"),
    max_temp: max("temperature"),
    min_battery: min("battery_pct"),
  })
  .sort("device_id")
  .run();
```

## Step 3: EMA smoothing

Noisy sensor data smoothed with a 12-point exponential moving average:

```js
import { FlintDB, col, ema } from "flintdb";

const db = FlintDB.open("./data");

const trend = db
  .from("sensors")
  .where({ device_id: "sensor-A" })
  .window({ orderBy: "timestamp", rows: 12 })
  .select({
    timestamp: col("timestamp"),
    temperature: col("temperature"),
    ema_temp: ema("temperature"),
  })
  .sort("timestamp", true)
  .limit(20)
  .run();
```

## Step 4: Time-windowed query

Query only the **last 24 hours** of data using `last()`:

```js
import { FlintDB, col, avg, count, percentile } from "flintdb";

const db = FlintDB.open("./data");

const recent = db
  .from("sensors")
  .where({ device_id: "sensor-B" })
  .last(1, "days", "timestamp")
  .groupBy("device_id")
  .select({
    device_id: col("device_id"),
    readings: count("device_id"),
    avg_temp: avg("temperature"),
    p95_temp: percentile("temperature", 95),
  })
  .run();
```

## Step 5: Temperature alerts

Find all readings above a threshold:

```js
const alerts = db
  .from("sensors")
  .where({ temperature: { gt: 35 } })
  .select({
    device_id: col("device_id"),
    timestamp: col("timestamp"),
    temperature: col("temperature"),
    humidity: col("humidity"),
  })
  .sort("temperature", true)
  .limit(15)
  .run();

console.log(`${alerts.count} total alerts`);
```

## Key takeaways

- **Time-series native** — `last(1, "days")` filters by time without manual date math
- **EMA smoothing** — denoise sensor readings inside the query engine
- **P95 monitoring** — `percentile("temperature", 95)` for SLA alerting
- **6,000+ readings analyzed in microseconds** — columnar cache makes aggregation fast
