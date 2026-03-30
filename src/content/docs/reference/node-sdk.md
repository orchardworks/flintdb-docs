---
title: Node.js SDK
description: Complete API reference for the FlintDB Node.js SDK.
---

## FlintDB.open(path)

Opens or creates a database at the given path.

```javascript
import { FlintDB } from 'flintdb';
const db = FlintDB.open('./mydata');
```

**Parameters:**
- `path` (string) — directory path for database files

**Returns:** `FlintDB` instance

## db.put(collection, document)

Inserts a document into a collection.

```javascript
db.put('users', { name: 'Alice', age: 30 });
```

**Parameters:**
- `collection` (string) — collection name
- `document` (object) — JSON document to insert

## db.get(collection, id)

Retrieves a document by ID.

```javascript
const user = db.get('users', 'abc123');
```

## db.query(query)

Executes a query and returns matching documents.

```javascript
const results = db.query({
  collection: 'users',
  filter: { age: { $gte: 18 } },
  sort: { name: 'asc' },
  limit: 10
});
```

**Parameters:**
- `query` (object) — query object (see [Querying Data](/guides/querying/))

**Returns:** Array of matching documents

## db.count(collection)

Returns the number of documents in a collection.

```javascript
const n = db.count('users');
```

## db.close()

Closes the database and flushes pending writes.

```javascript
db.close();
```
