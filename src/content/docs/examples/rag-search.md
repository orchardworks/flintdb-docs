---
title: "RAG Search"
description: "Semantic search with FlintDB vector search and OpenAI embeddings."
---

Build a RAG-style semantic search — embeddings and documents in one database.

## What you'll learn

- Store embeddings alongside documents
- Cosine similarity search with `nearVector`
- Pre-filter by category before vector search
- No separate vector database needed

## Setup

```bash
mkdir rag-search && cd rag-search
npm init -y
npm install flintdb openai
export OPENAI_API_KEY=sk-...
```

## Step 1: Embed and store articles

```js
import { FlintDB } from "flintdb";
import OpenAI from "openai";

const openai = new OpenAI();

const articles = [
  {
    title: "Introduction to Vector Databases",
    category: "tech",
    content: "Vector databases store high-dimensional embeddings and enable similarity search...",
  },
  {
    title: "Building a RAG Pipeline",
    category: "tech",
    content: "Retrieval-Augmented Generation combines a retrieval step with an LLM...",
  },
  {
    title: "PostgreSQL Performance Tuning",
    category: "database",
    content: "Optimizing PostgreSQL involves index strategies, query plan analysis...",
  },
  {
    title: "Understanding Cosine Similarity",
    category: "math",
    content: "Cosine similarity measures the angle between two vectors...",
  },
  // ... more articles
];

// Generate embeddings (OpenAI call is async)
const texts = articles.map((a) => `${a.title}\n${a.content}`);
const response = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: texts,
});
const embeddings = response.data.map((d) => d.embedding);

// Store articles with their embedding vectors
const db = FlintDB.open("./data");

for (let i = 0; i < articles.length; i++) {
  db.put("articles", {
    ...articles[i],
    embedding: embeddings[i],
  });
}

db.createIndex("articles", "category");
db.close();
```

The key insight: **the embedding lives in the same document** as the title, content, and category. No need to sync between a document store and a separate vector DB.

## Step 2: Search

```js
import { FlintDB } from "flintdb";
import OpenAI from "openai";

const openai = new OpenAI();

const db = FlintDB.open("./data");
const query = "How do I build a semantic search system?";

// Embed the query (OpenAI call is async)
const response = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: query,
});
const queryVector = response.data[0].embedding;

// Find similar articles — sync, no await
const results = db.nearVector("articles", "embedding", queryVector, {
  topK: 5,
  metric: "cosine",
});

for (const row of results.rows) {
  console.log(`[${row.score.toFixed(4)}] ${row.data.title}`);
  console.log(`  ${row.data.content.slice(0, 100)}...`);
}
```

## Step 3: Filtered vector search

Pre-filter by category so only relevant documents are searched:

```js
const results = db.nearVector("articles", "embedding", queryVector, {
  topK: 5,
  metric: "cosine",
  filter: { op: "eq", field: "category", value: "tech" },
});
```

The filter runs **before** the vector search, narrowing the candidate set efficiently.

## Key takeaways

- **One database** — documents and vectors stored together
- **Pre-filtering** — narrow the search space with regular filters before vector comparison
- **Cosine and L2** — two distance metrics built in
- **No infrastructure** — no Pinecone, no Weaviate, no pgvector extension
