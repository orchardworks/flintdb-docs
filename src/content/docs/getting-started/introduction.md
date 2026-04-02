---
title: Introduction
description: What is FlintDB and why use it.
---

FlintDB is an embedded JSON-native database with built-in analytics and vector search. Store JSON, query it, analyze it — all in-engine. No daemon, no schema, no ETL.

## Key Concepts

### Query is Data

In FlintDB, queries are plain JSON objects. There is no SQL parser, no query language to learn. Your query is just data that describes what you want.

```json
{
  "collection": "sales",
  "filter": { "region": "US" },
  "groupBy": "category",
  "aggregate": { "total": { "sum": "amount" } },
  "sort": { "total": "desc" },
  "limit": 10
}
```

### Flexible Input, Strict Output

Store any JSON document without defining a schema upfront. FlintDB applies types at query time, giving you structured, typed results from schema-free storage.

### Two Access Modes

| Mode | Latency | Use Case |
|------|---------|----------|
| **Native** (napi-rs) | ~2 us/get | In-process, sync, maximum performance |
| **IPC** (Unix socket) | ~50 us/get | Multi-process, async, daemon-based |

Both modes share the same Rust engine underneath.

## Architecture

FlintDB is built in Rust with:

- **redb** — mmap-backed, ACID, crash-safe storage via Copy-on-Write
- **Lazy loading** — collections deserialized on first access
- **Columnar cache** — dense f64 arrays built lazily per field for fast analytics
- **Hash & BTree indexes** — auto-maintained on mutations
