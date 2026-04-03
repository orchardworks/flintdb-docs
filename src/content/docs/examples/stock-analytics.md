---
title: "Stock Analytics"
description: "Analyze stock prices with FlintDB's built-in analytics — EMA, Bollinger Bands, RSI, MACD."
---

Analyze stock prices with FlintDB's built-in analytics — no Pandas, no CSV export.

## What you'll learn

- Bulk insert with `putBatch()`
- Hash and BTree indexes
- GroupBy with `avg`, `stddev`, `min`, `max`, `sum`
- Window functions: SMA and EMA
- Finance indicators: Bollinger Bands, RSI, MACD

## Setup

```bash
mkdir stock-analytics && cd stock-analytics
npm init -y
npm install flintdb
```

## Step 1: Seed data

Generate realistic stock price data and bulk-insert it:

```js
import { FlintDB } from "flintdb";

function generatePrices(ticker, startPrice, days) {
  const docs = [];
  let price = startPrice;
  const startDate = new Date("2024-01-02");

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const dailyReturn = (Math.random() - 0.48) * 0.06;
    price *= 1 + dailyReturn;

    const high = price * (1 + Math.random() * 0.02);
    const low = price * (1 - Math.random() * 0.02);
    const volume = Math.floor(20_000_000 + Math.random() * 30_000_000);

    docs.push({
      ticker,
      date: date.toISOString().slice(0, 10),
      open: +(price * (1 + (Math.random() - 0.5) * 0.01)).toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +price.toFixed(2),
      volume,
    });
  }
  return docs;
}

const db = FlintDB.open("./data");

const aapl = generatePrices("AAPL", 185, 400);
const googl = generatePrices("GOOGL", 140, 400);
db.putBatch("prices", [...aapl, ...googl]);

// Create indexes for fast filtering
db.createIndex("prices", "ticker");
db.createIndex("prices", "date", "BTree");

db.close();
```

## Step 2: Per-ticker summary

GroupBy with multiple aggregate functions in a single query:

```js
import { FlintDB, col, avg, stddev, min, max, sum } from "flintdb";

const db = FlintDB.open("./data");

const summary = db
  .from("prices")
  .groupBy("ticker")
  .select({
    ticker: col("ticker"),
    avg_close: avg("close"),
    volatility: stddev("close"),
    low: min("low"),
    high: max("high"),
    total_volume: sum("volume"),
  })
  .sort("avg_close", true)
  .run();

console.log(summary.rows);
// [
//   { ticker: "AAPL", avg_close: 201.34, volatility: 12.45, ... },
//   { ticker: "GOOGL", avg_close: 155.67, volatility: 9.82, ... }
// ]
```

## Step 3: Moving averages

20-day SMA and EMA using window functions:

```js
import { FlintDB, col, avg, ema } from "flintdb";

const db = FlintDB.open("./data");

const result = db
  .from("prices")
  .where({ ticker: "AAPL" })
  .window({ orderBy: "date", rows: 20 })
  .select({
    date: col("date"),
    close: col("close"),
    sma_20: avg("close"),
    ema_20: ema("close"),
  })
  .sort("date", true)
  .limit(10)
  .run();
```

## Step 4: Bollinger Bands

```js
import { FlintDB, col, bollinger } from "flintdb";

const db = FlintDB.open("./data");

const bands = db
  .from("prices")
  .where({ ticker: "GOOGL" })
  .window({ orderBy: "date", rows: 20 })
  .select({
    date: col("date"),
    close: col("close"),
    bollinger: bollinger("close"),
  })
  .sort("date", true)
  .limit(10)
  .run();

// Each row's bollinger field contains: { upper, middle, lower, percent_b }
```

## Step 5: RSI and MACD

```js
import { FlintDB, col, rsi, macd } from "flintdb";

const db = FlintDB.open("./data");

// RSI(14)
const rsiResult = db
  .from("prices")
  .where({ ticker: "AAPL" })
  .window({ orderBy: "date", rows: 14 })
  .select({
    date: col("date"),
    close: col("close"),
    rsi_14: rsi("close"),
  })
  .sort("date", true)
  .limit(10)
  .run();

// MACD(12, 26, 9)
const macdResult = db
  .from("prices")
  .where({ ticker: "AAPL" })
  .window({ orderBy: "date", rows: 26 })
  .select({
    date: col("date"),
    close: col("close"),
    macd: macd("close"),
  })
  .sort("date", true)
  .limit(10)
  .run();

// Each row's macd field contains: { macd_line, signal_line, histogram }
```

## Key takeaways

- **No external libraries** — EMA, Bollinger, RSI, MACD are computed inside the engine
- **One query** — aggregation, windowing, and sorting in a single call
- **Microsecond latency** — analytics run on in-memory columnar cache
