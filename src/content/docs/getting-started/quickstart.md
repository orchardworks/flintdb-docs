---
title: Quick Start
description: Get up and running with FlintDB in minutes.
---

## Installation

```bash
npm install flintdb
```

## Basic Usage

```javascript
import { FlintDB } from 'flintdb';

// Open a database
const db = FlintDB.open('./mydata');

// Insert documents
db.put('users', { name: 'Alice', age: 30, role: 'engineer' });
db.put('users', { name: 'Bob', age: 25, role: 'designer' });
db.put('users', { name: 'Carol', age: 35, role: 'engineer' });

// Query with filtering
const engineers = db.query({
  collection: 'users',
  filter: { role: 'engineer' },
  sort: { age: 'asc' }
});
// [{ name: 'Alice', age: 30, ... }, { name: 'Carol', age: 35, ... }]

// Aggregate data
const stats = db.query({
  collection: 'users',
  aggregate: {
    count: { count: true },
    avgAge: { avg: 'age' }
  }
});
// [{ count: 3, avgAge: 30 }]
```

## What's Next?

- [Querying Data](/guides/querying/) — learn the full query syntax
- [Analytics](/guides/analytics/) — aggregations, window functions, and statistics
- [API Reference](/reference/node-sdk/) — complete API documentation
