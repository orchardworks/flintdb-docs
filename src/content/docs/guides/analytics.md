---
title: Analytics
description: Built-in aggregation, window functions, and statistical analysis.
---

FlintDB includes powerful analytics capabilities without external dependencies.

## Aggregation Functions

Use aggregates with or without `groupBy`:

```json
{
  "collection": "trades",
  "aggregate": {
    "total": { "sum": "amount" },
    "average": { "avg": "price" },
    "highest": { "max": "price" },
    "lowest": { "min": "price" },
    "count": { "count": true }
  }
}
```

## Window Functions

Apply calculations across ordered sets of rows:

```json
{
  "collection": "stocks",
  "window": {
    "movingAvg": { "avg": "close", "window": 20 },
    "cumSum": { "sum": "volume", "cumulative": true }
  },
  "sort": { "date": "asc" }
}
```

## Statistical Functions

Built-in statistical analysis:

- **Descriptive**: mean, median, stddev, variance, percentile
- **Correlation**: pearson, covariance
- **Regression**: linear regression

## Finance Functions

Specialized indicators for financial data:

- **Moving averages**: SMA, EMA, WMA
- **Volatility**: Bollinger Bands, ATR
- **Momentum**: RSI, MACD, Stochastic
- **Volume**: OBV, VWAP
