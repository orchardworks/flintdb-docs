---
title: Querying Data
description: Learn how to query data in FlintDB using JSON queries.
---

FlintDB queries are JSON objects. Each query targets a collection and can include filtering, sorting, grouping, and aggregation.

## Basic Query Structure

```json
{
  "collection": "collectionName",
  "filter": { ... },
  "sort": { "field": "asc" | "desc" },
  "limit": 10,
  "select": ["field1", "field2"]
}
```

## Filtering

Filter documents by field values:

```json
{
  "collection": "orders",
  "filter": { "status": "shipped", "total": { "$gt": 100 } }
}
```

### Filter Operators

| Operator | Description |
|----------|-------------|
| `$gt` | Greater than |
| `$gte` | Greater than or equal |
| `$lt` | Less than |
| `$lte` | Less than or equal |
| `$ne` | Not equal |
| `$in` | In array |

## Sorting

Sort results by one or more fields:

```json
{
  "collection": "products",
  "sort": { "price": "desc" }
}
```

## Grouping

Group documents and compute aggregates per group:

```json
{
  "collection": "sales",
  "groupBy": "region",
  "aggregate": {
    "totalRevenue": { "sum": "amount" },
    "orderCount": { "count": true }
  }
}
```

## Limiting Results

```json
{
  "collection": "logs",
  "sort": { "timestamp": "desc" },
  "limit": 50
}
```
