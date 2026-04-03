---
title: "Log Analyzer"
description: "Analyze heterogeneous JSON logs with FlintDB — no schema needed."
---

Analyze heterogeneous JSON logs — HTTP requests, errors, and auth events with different shapes, all in one collection.

## What you'll learn

- Schema-free storage — different document shapes coexist
- `describe()` to inspect field types across all documents
- GroupBy + aggregation on mixed-shape data
- Percentile (P95 latency)
- Composite filters: `{ type: "http", latency_ms: { gt: 1000 } }`

## Setup

```bash
mkdir log-analyzer && cd log-analyzer
npm init -y
npm install flintdb
```

## Step 1: Store logs with different shapes

The key point: **each log type has a different shape**, but they all go into the same collection.

```js
import { FlintDB } from "flintdb";

const db = FlintDB.open("./data");

// HTTP request log
db.put("logs", {
  type: "http",
  timestamp: "2024-06-01T10:30:00Z",
  method: "GET",
  path: "/api/users",
  status: 200,
  latency_ms: 45,
  user_agent: "Chrome/125",
});

// Error log — different shape, has stack trace, no latency
db.put("logs", {
  type: "error",
  timestamp: "2024-06-01T10:31:00Z",
  error_type: "TypeError",
  message: "Cannot read property 'id' of undefined",
  stack: "Error: ...\n    at handler (server.js:142)",
  request_id: "req-a1b2c3d4",
});

// Auth event — different shape again
db.put("logs", {
  type: "auth",
  timestamp: "2024-06-01T10:32:00Z",
  action: "login_failed",
  user_id: "user-23",
  ip: "10.0.42.7",
  success: false,
});

db.createIndex("logs", "type");
db.createIndex("logs", "timestamp", "BTree");
```

No schema definition — FlintDB accepts any JSON shape.

## Step 2: Inspect the collection

```js
const desc = db.describe("logs");
console.log(desc.fields);
// Shows the union of all fields across all document shapes:
// { type, timestamp, method, path, status, latency_ms, user_agent,
//   error_type, message, stack, request_id, action, user_id, ip, success }
```

## Step 3: Latency analysis by endpoint

```js
import { FlintDB, col, avg, count, percentile, max } from "flintdb";

const db = FlintDB.open("./data");

const latency = db
  .from("logs")
  .where({ type: "http" })
  .groupBy("path")
  .select({
    path: col("path"),
    requests: count("path"),
    avg_ms: avg("latency_ms"),
    p95_ms: percentile("latency_ms", 95),
    max_ms: max("latency_ms"),
  })
  .sort("avg_ms", true)
  .run();
```

## Step 4: Find slow requests

```js
const slow = db
  .from("logs")
  .where({ type: "http", latency_ms: { gt: 1000 } })
  .select({
    timestamp: col("timestamp"),
    method: col("method"),
    path: col("path"),
    status: col("status"),
    latency_ms: col("latency_ms"),
  })
  .sort("latency_ms", true)
  .limit(10)
  .run();
```

## Step 5: Failed login attempts

```js
const failedLogins = db
  .from("logs")
  .where({ type: "auth", action: "login_failed" })
  .groupBy("user_id")
  .select({
    user_id: col("user_id"),
    attempts: count("user_id"),
  })
  .sort("attempts", true)
  .limit(10)
  .run();
```

## Key takeaways

- **No schema required** — HTTP logs, errors, and auth events have completely different shapes
- **Flexible queries** — filter by `type`, then aggregate only the fields that exist for that type
- **P95 built in** — `percentile("latency_ms", 95)` without exporting to a stats tool
- **Composite filters** — combine equality and comparison in one `where()` call
