# CLAUDEUNDERSTANDING.md

# GovDocs AI — Complete System Understanding

> Produced on: 2026-03-12 | Author: Claude Code (claude-sonnet-4-6)
> Last updated: 2026-03-12 — Cache invalidation refactored: SCAN-based cacheDelPattern + invalidateDocumentCaches() utility across all document-mutating routes

---

## 1. Product Summary

GovDocs AI is a **fullstack Nuxt 3 web application** for intelligent access, search, and analysis of Indonesian government documents. It is designed to feel like a hybrid of Humata, Perplexity document chat, and Glean — but oriented specifically toward Indonesian government workflows.

The platform serves three main personas:

- **Public visitors** — search and read government documents, use the landing page, contact form, FAQ
- **Authenticated users (viewer/editor)** — use AI-powered RAG chat, view document summaries, upload documents (editor+)
- **Administrators** — manage documents (upload, edit, re-index, delete), manage users (role changes), review feedback, manage changelogs

The core value loops are:

> Upload PDF → Auto-index (extract + chunk + embed) → User searches or chats → RAG retrieves relevant chunks → AI generates grounded response → Response streams in real-time

> User types natural language query → Smart Search embeds query → Vector similarity search → Group + rank documents → AI synthesizes answer → Highlight snippets navigate to exact PDF page

---

## 2. Feature Map

### Public (unauthenticated)

| Feature                       | Entry Point                  | API                                                                                 |
| ----------------------------- | ---------------------------- | ----------------------------------------------------------------------------------- |
| Landing page with stats       | `/`                          | `/api/public/stats`, `/api/public/documents/latest`, `/api/public/popular-searches` |
| Document search + filter      | `/documents`                 | `/api/public/documents`                                                             |
| **Smart Search (semantic)**   | `/documents` (modal)         | **`POST /api/ai/smart-search`**                                                     |
| Document detail + PDF preview | `/documents/:id`             | `/api/public/documents/:id`                                                         |
| About / FAQ / Contact         | `/about`, `/faq`, `/contact` | `/api/public/contact`                                                               |
| Public changelog              | `/changelog`                 | `/api/public/changelog`                                                             |
| Chat AI teaser                | `/chat-ai`                   | (static or limited)                                                                 |

### Authenticated (viewer+)

| Feature                | Entry Point         | API                                  |
| ---------------------- | ------------------- | ------------------------------------ |
| Multi-session RAG chat | `/chat`             | `/api/chat/sessions`, `/api/ai/chat` |
| Document-scoped chat   | `/chat/:documentId` | `/api/ai/chat` with documentIds      |
| AI document summary    | `/documents/:id`    | `/api/ai/summarize`                  |

### Editor+

| Feature                | Entry Point      | API                      |
| ---------------------- | ---------------- | ------------------------ |
| Upload document        | `/admin` (modal) | `POST /api/documents`    |
| Edit document metadata | `/admin`         | `PUT /api/documents/:id` |

### Admin only

| Feature                  | Entry Point                  | API                                              |
| ------------------------ | ---------------------------- | ------------------------------------------------ |
| Admin document dashboard | `/admin`                     | `/api/documents`, `/api/admin/reindex`           |
| User management          | `/admin/users`               | `/api/admin/users`, `/api/admin/users/:id/role`  |
| Feedback inbox           | `/admin/feedback`            | `/api/admin/feedback`, `/api/admin/feedback/:id` |
| Changelog management     | `/admin/changelog`           | `/api/admin/changelog/*`                         |
| Delete document          | `/admin` or `/documents/:id` | `DELETE /api/documents/:id`                      |

---

## 3. System Architecture

```
Browser
  │
  ├── Public pages (public layout: PublicNavTop + PublicNavBottom)
  ├── Auth pages (no layout: login.vue)
  ├── App pages (default layout: AppSidebar + main)
  ├── Chat pages (chat layout: AppSidebar + full-height container)
  └── Admin pages (admin layout: AppSidebar + main)
         │
         ▼
  Nuxt 3 SSR (Nitro)
  ├── /api/auth/*       JWT login / logout / me
  ├── /api/documents/*  CRUD + multipart upload (editor+)
  ├── /api/ai/*         chat (SSE streaming) + summarize + smart-search
  ├── /api/chat/*       sessions + messages
  ├── /api/admin/*      users, feedback, changelog, reindex (admin)
  └── /api/public/*     stats, documents, changelog, contact (no auth)
         │
         ├── PostgreSQL (Sequelize v6, plain Model.init())
         │     ├── users
         │     ├── documents
         │     ├── document_chunks (pgvector 1536-dim HNSW)
         │     ├── ai_summaries
         │     ├── chat_sessions
         │     ├── chat_messages
         │     ├── search_logs
         │     ├── feedback
         │     └── changelogs
         │
         ├── Redis (ioredis)
         │     └── TTL-keyed cache for list queries, stats, summaries, changelogs
         │
         ├── OpenAI API
         │     ├── text-embedding-3-small (1536 dims) — chunk + query embeddings
         │     └── gpt-4o-mini — summarization + RAG generation (NOTE: NOT Claude despite file name)
         │
         └── File Storage
               ├── Local disk (dev) — ./uploads or STORAGE_PATH
               └── S3 (prod) — AWS_BUCKET + AWS_ACCESS_KEY detected at runtime
```

---

## 4. Database Model Explanation

### Tables and Cardinality

```
users (1) ──────────────── (*) documents
  │                              │
  │                              │ (1)
  │                              │
  (1)                      (*) document_chunks
  │                              │ (pgvector 1536-dim embedding)
  │                              │
  │                        (1) ai_summaries
  │
  └──── (*) chat_sessions
               │
               ├── belongsTo documents (optional, nullable)
               │
               └── (*) chat_messages
                         └── sources JSONB (references chunk metadata)

feedback         (standalone, no FK)
search_logs      (standalone, no FK)
changelogs       (standalone, no FK)
```

### Key Relationships

| Relationship               | Cardinality | On Delete                 |
| -------------------------- | ----------- | ------------------------- |
| User → Documents           | 1:Many      | SET NULL (uploader)       |
| Document → DocumentChunks  | 1:Many      | CASCADE                   |
| Document → AiSummary       | 1:1         | CASCADE                   |
| User → ChatSessions        | 1:Many      | CASCADE                   |
| ChatSession → Document     | Many:1      | SET NULL (optional scope) |
| ChatSession → ChatMessages | 1:Many      | CASCADE                   |

### UUID Primary Keys

All tables use UUID v4 primary keys (UUID default via `UUIDV4`). This avoids sequential ID enumeration attacks and is appropriate for distributed inserts.

### Indexing Strategy

| Table           | Index                               | Type          | Reason                     |
| --------------- | ----------------------------------- | ------------- | -------------------------- |
| users           | email                               | UNIQUE        | Login lookup               |
| documents       | status, type, ministry, uploaded_by | B-Tree        | Filter queries             |
| document_chunks | document_id                         | B-Tree        | Per-document chunk lookups |
| document_chunks | embedding                           | HNSW (cosine) | Fast ANN vector search     |
| chat_sessions   | user_id                             | B-Tree        | User session list          |
| chat_messages   | session_id                          | B-Tree        | Message history load       |
| feedback        | status, created_at                  | B-Tree        | Admin filter/sort          |
| changelogs      | published, released_at              | B-Tree        | Public changelog filter    |

### Vector Search Specifics

- pgvector extension enabled via migration: `CREATE EXTENSION IF NOT EXISTS vector`
- Column type: `vector(1536)` (not a standard Sequelize type — defined as `'vector(1536)' as any`)
- HNSW index for approximate nearest-neighbor search with cosine similarity
- Query operator: `<=>` (cosine distance, lower = more similar)
- Search via raw `sequelize.query()` since Sequelize ORM has no native pgvector support

### Migration Strategy

- 10 migrations total (001–010), all `.cjs` extension (required: `package.json` has `"type": "module"`)
- Sequential, additive migrations (no destructive drops)
- `.sequelizerc` routes CLI to correct paths
- Seeders: `001-admin-user.cjs` — seeds `admin@govdocs.ai` / `admin123` (bcrypt hashed)

---

## 5. AI Pipeline Walkthrough

### A. Document Ingestion (fire-and-forget, triggered on upload)

```
POST /api/documents (multipart)
  │
  ├── 1. Save file to storage (local/S3)
  ├── 2. Create Document record (status='pending')
  ├── 3. Return HTTP 201 immediately
  │
  └── (async background, no await from client)
        │
        ├── 4. extractPdfText(filePath)
        │       → pdf-parse → {text, pageCount, info}
        │       → text truncated to 100k chars for very large PDFs
        │
        ├── 5. chunkText(text)
        │       → Split by paragraphs (2+ newlines)
        │       → Fill chunks: CHUNK_SIZE = 800 tokens (~3200 chars)
        │       → Overlap: 100 tokens (~400 chars) appended to next chunk start
        │       → Fallback: sentence → word → char split if paragraph too large
        │       → Output: [{content, chunkIndex, pageNumber}]
        │
        ├── 6. embedTexts(chunkContents) — batched
        │       → Groups of EMBED_BATCH_SIZE = 100 chunks per API call
        │       → OpenAI text-embedding-3-small (1536 dims)
        │       → Concatenates all batches
        │
        ├── 7. DocumentChunk.bulkCreate([...chunks with embeddings])
        │       → Inserts all chunks + vectors in bulk
        │
        ├── 8. Update Document: status='indexed', pageCount
        │
        └── (on error) Update Document: status='error'
```

### B. RAG Chat (streaming SSE)

```
POST /api/ai/chat
  Body: {query, sessionId, documentIds[]}
  │
  ├── 1. requireAuth(event) — validates JWT
  ├── 2. Validate: query non-empty, sessionId provided
  ├── 3. Verify ChatSession belongs to user
  │
  ├── 4. embedText(query)
  │       → OpenAI text-embedding-3-small, 1536 dims
  │
  ├── 5. vectorSearch({embedding, documentIds, topK: 6})
  │       → Raw SQL: SELECT ... FROM document_chunks dc
  │                  JOIN documents d ON d.id = dc.document_id
  │                  WHERE d.status = 'indexed'
  │                  [AND dc.document_id = ANY(ARRAY[:ids]::uuid[])]
  │                  ORDER BY dc.embedding <=> :queryVector
  │                  LIMIT :topK
  │       → Returns: [{content, documentTitle, pageNumber, distance, ...}]
  │
  ├── 6. Build RAG context string:
  │       → Format each chunk: "Document: {title}\nPage: {page}\n{content}"
  │       → Join all chunks into system prompt context block
  │
  ├── 7. Fetch last 20 messages from ChatSession (history for multi-turn)
  │
  ├── 8. Save user message to chat_messages (before streaming)
  │
  ├── 9. Set SSE headers:
  │       Content-Type: text/event-stream
  │       Cache-Control: no-cache
  │       Connection: keep-alive
  │
  ├── 10. streamClaude({systemPrompt (RAG context), messages (history + new query)})
  │        → OpenAI gpt-4o-mini streaming chat completion
  │        → ReadableStream: emits "data: {text}\n\n" per token chunk
  │        → Client reads EventSource-style line-by-line
  │
  ├── 11. While streaming: accumulate fullText
  │
  └── 12. After stream ends (async, non-blocking):
           → Save assistant message to chat_messages
           → Sources: first 3 chunks (chunkId, documentId, documentTitle, pageNumber, content snippet)
           → Auto-title session from first user message (truncated to 60 chars)
```

### C. Summarization

````
POST /api/ai/summarize
  Body: {documentId}
  │
  ├── 1. requireAuth(event)
  ├── 2. Check AiSummary cache: Redis key `summary:{id}` (1 hour TTL)
  ├── 3. Check DB: AiSummary.findOne({documentId})
  │
  └── (if not cached)
        ├── 4. extractPdfText(filePath) → truncate to 100k chars
        ├── 5. callClaude(buildSummarizationPrompt(), text, 4096)
        │       → OpenAI gpt-4o-mini (non-streaming)
        │       → Prompt: return JSON {summary (markdown), keyPoints (5-7 items)}
        │       → Strips ```json code fences if present
        ├── 6. JSON.parse response
        ├── 7. AiSummary.create({documentId, summary, keyPoints, modelUsed})
        └── 8. cacheSet(`summary:{id}`, result, 3600)
````

**IMPORTANT NOTE:** Despite the file being named `claude.ts` and the function `streamClaude()`, the actual model used is **OpenAI gpt-4o-mini**, not Anthropic Claude. The CLAUDE.md spec says `claude-sonnet-4-5` should be used. This is a discrepancy — the Anthropic SDK (`@anthropic-ai/sdk`) is installed but appears unused in the current implementation.

### D. Smart Search / Semantic Search — Hybrid Retrieval (non-streaming, public)

> Last updated: upgraded from pure vector to hybrid retrieval + sentence-level snippets + confidence metric.

```
POST /api/ai/smart-search
  Body: {query: string}
  Auth: None (public)
  │
  ├── 1. Validate: query non-empty, length ≤ 500 chars
  │
  ├── 2. Cache check (Redis — sha256 key, no KEYS pattern):
  │       key = smart-search:{sha256(normalizedQuery)}
  │       TTL = 300s (5 min)
  │       → Return cached result immediately if hit
  │
  ├── 3. embedText(rawQuery)
  │       → OpenAI text-embedding-3-small, 1536 dims
  │
  ├── 4. Hybrid retrieval — run BOTH in parallel (Promise.all):
  │
  │   A) vectorSearch({embedding, topK: 30})
  │         → Raw pgvector SQL: cosine distance <=> on document_chunks
  │         → Returns chunks sorted by distance ASC (lowest = most similar)
  │         → Score = 1 - cosineDistance
  │
  │   B) keywordSearch(normalizedQuery, topK: 20)
  │         → Per-word ILIKE on dc.content + d.title
  │         → Words: significant (≥3 chars), dedupe stopwords, longest-first, max 5
  │         → Pattern: %word% ORed across all selected words
  │         → Returns flag: titleMatch (bool) for boost calculation
  │
  ├── 5. mergeResults(vectorChunks, keywordChunks) — hybrid scoring:
  │       Chunk ID used as deduplication key.
  │       vector-only  → finalScore = 1 - cosineDistance
  │       keyword-only → finalScore = BOOST_TITLE(0.25) | BOOST_CONTENT(0.15)
  │       hybrid       → finalScore = vectorScore + boost  (capped at 1.0)
  │       → Rewards chunks confirmed by BOTH signals
  │
  ├── 6. Group merged chunks by documentId:
  │       → Track bestScore and totalChunks per document
  │       → Keep top 3 chunks per document (by insertion order = best first)
  │       → Sort documents by bestScore DESC
  │       → Take top 8 documents
  │
  ├── 7. Document.findAll(topDocIds) — batched metadata fetch
  │       → ministry, type, publishedAt  (does NOT modify vectorSearch utility)
  │
  ├── 8. Build AI context block (chunks from all 8 docs, up to 24 chunks):
  │       "Dokumen: {title}\nHalaman: {page}\nKonten: {content}"
  │       → Joined with '\n\n---\n\n' separators
  │
  ├── 9. callClaude(buildSmartSearchSystemPrompt(context), query, 2048)
  │       → OpenAI gpt-4o-mini (non-streaming)
  │       → Prompt: answer only from context, cite doc + page, Bahasa Indonesia
  │       → Returns markdown answer string
  │
  ├── 10. Build highlight snippets — sentence-level scoring:
  │         extractBestSnippet(chunk.content, normalizedQuery, maxLen=300)
  │         ├── Split chunk text into sentences (on . ! ? \n)
  │         ├── Score each sentence: matchCount / sqrt(wordCount)  [TF-style]
  │         │     → Rewards dense, on-topic sentences over padded ones
  │         ├── Pick best-scoring sentence
  │         ├── Return best ± 1 surrounding sentences for context
  │         └── Fallback to character-based snippet if no query words match
  │
  ├── 11. Compute confidence metric:
  │         breadth    = min(totalSupportingChunks / 5, 1.0)
  │         topScore   = best document's finalScore
  │         rerankScore = harmonic_mean(breadth, topScore)
  │                     = 2 * breadth * topScore / (breadth + topScore)
  │         → Harmonic mean penalises if EITHER dimension is weak
  │
  ├── 12. cacheSet(key, result, 300)
  │
  └── Return:
        {
          answer: string (markdown),
          documents: [{
            id, title, ministry, type, year, score,
            highlights: [{chunkId, snippet, pageNumber}]
          }],
          confidence: {
            supportingChunks: number,   // total chunks retrieved
            topScore: number,           // best finalScore (0–1)
            rerankScore: number         // harmonic quality index (0–1)
          }
        }
```

**Hybrid scoring rationale:**
| Match type | Mechanism | Typical finalScore |
|---|---|---|
| Strong semantic + keyword | vector (0.85) + title boost (0.25) | 1.0 (capped) |
| Semantic only | vector score alone | 0.5 – 0.95 |
| Keyword title match only | BOOST_TITLE | 0.25 |
| Keyword content match only | BOOST_CONTENT | 0.15 |

**Snippet improvement:**

- Old: character slice of first 200 chars — biased toward document boilerplate at chunk start
- New: TF-style sentence scoring picks the sentence most densely matching query terms, then expands ±1 sentence for readability. Stopwords excluded from scoring. Fallback to char-based when no query terms found.

**Confidence interpretation (frontend):**
| rerankScore | Label | Color |
|---|---|---|
| ≥ 0.75 | Tinggi (High) | Green |
| 0.45–0.74 | Sedang (Medium) | Yellow |
| < 0.45 | Rendah (Low) | Orange |

**Navigation from Smart Search results:**

- Clicking a result navigates to `/documents/:id?page=N`
- `pages/documents/[id].vue` reads `route.query.page`, appends `#page=N` to the PDF iframe URL
- Standard PDF open parameter — supported natively by Chrome and Firefox built-in PDF viewer

---

## 6. Authentication Flow

### JWT Cookie-Based Auth

```
Login
  POST /api/auth/login
  ├── Find User by email (case-insensitive trim)
  ├── bcrypt.compare(password, user.passwordHash)
  ├── signToken(user.toSafeObject()) → HS256, 7-day exp
  └── setAuthCookie(event, token)
        → httpOnly: true
        → secure: true (prod), false (dev)
        → sameSite: 'lax'
        → maxAge: 604800 (7 days)
        → path: '/'
        → name: 'auth_token'

Auth Persistence on Refresh (SSR-safe)
  plugins/auth.ts (runs on server + client)
  ├── On server: useRequestFetch() forwards cookie → /api/auth/me
  ├── Sets useState('auth.user') → SSR state serialized into HTML payload
  └── On client hydration: state already populated (no refetch needed)
       Fallback: if state empty on client, fetchUser() re-fetches

Protected Route Access
  middleware/auth.ts
  ├── Checks user state (useState)
  ├── If null, calls fetchUser()
  ├── If still null → navigateTo('/login?redirect=' + route.fullPath)
  └── Passes if authenticated

Admin Route Protection
  middleware/admin.ts
  ├── Runs after auth.ts
  ├── Checks user.role === 'admin'
  └── Throws createError(403) if not admin

Server-side Route Protection
  requireAuth(event)
  ├── getCookie(event, 'auth_token')
  ├── verifyToken(token) → jose JWT verify (HS256)
  ├── Returns AuthUser payload from token
  └── Throws 401 if missing or invalid

  requireRole(event, role)
  ├── Calls requireAuth(event)
  ├── Role hierarchy: viewer(0) < editor(1) < admin(2)
  └── Throws 403 if user role rank < required role rank
```

### Role Hierarchy

| Role   | Rank | Permissions                                                             |
| ------ | ---- | ----------------------------------------------------------------------- |
| viewer | 0    | Read documents, use chat                                                |
| editor | 1    | viewer + upload/edit documents                                          |
| admin  | 2    | editor + delete docs, manage users, manage feedback/changelog, re-index |

---

## 7. Frontend Composition

### Layouts

| Layout    | Used By                                                                     | Components                                              |
| --------- | --------------------------------------------------------------------------- | ------------------------------------------------------- |
| `public`  | `/`, `/documents/*`, `/about`, `/faq`, `/contact`, `/changelog`, `/chat-ai` | PublicNavTop + PublicNavBottom + Footer                 |
| `default` | Authenticated document pages                                                | AppSidebar + scrollable main                            |
| `admin`   | `/admin/*`                                                                  | AppSidebar + scrollable main (identical to default)     |
| `chat`    | `/chat`, `/chat/:documentId`                                                | AppSidebar + full-height flex (chat scrolls internally) |
| `false`   | `/login`                                                                    | No layout wrapper                                       |

### Pages

| Page                | Layout | Auth Required                | Description                                   |
| ------------------- | ------ | ---------------------------- | --------------------------------------------- |
| `/`                 | public | No                           | Landing: hero, stats, categories, latest docs |
| `/documents`        | public | No                           | Search/filter all indexed documents           |
| `/documents/:id`    | public | No (admin actions need auth) | Document detail, PDF preview, AI summary      |
| `/chat`             | chat   | Yes (viewer+)                | Multi-session RAG chat                        |
| `/chat/:documentId` | chat   | Yes (viewer+)                | Document-scoped chat                          |
| `/login`            | none   | Redirect if logged in        | Login form                                    |
| `/admin`            | admin  | Yes (admin)                  | Document management dashboard                 |
| `/admin/users`      | admin  | Yes (admin)                  | User list + role management                   |
| `/admin/feedback`   | admin  | Yes (admin)                  | Feedback inbox                                |
| `/admin/changelog`  | admin  | Yes (admin)                  | Changelog CRUD                                |
| `/about`            | public | No                           | Static (prerendered)                          |
| `/faq`              | public | No                           | Static (prerendered)                          |
| `/contact`          | public | No                           | Contact form                                  |
| `/changelog`        | public | No                           | Public changelog                              |
| `/chat-ai`          | public | No                           | Unauthenticated chat teaser                   |
| `/error`            | —      | No                           | Error boundary                                |

### Key Components

| Component               | Location                                     | Purpose                                               |
| ----------------------- | -------------------------------------------- | ----------------------------------------------------- |
| `AppSidebar`            | `components/AppSidebar.vue`                  | Main nav with logo, links, user info, logout          |
| `PublicNavTop`          | `components/ui/PublicNavTop.vue`             | Top bar for public pages                              |
| `PublicNavBottom`       | `components/ui/PublicNavBottom.vue`          | Category nav for public pages                         |
| `DocumentCard`          | `components/documents/DocumentCard.vue`      | Grid card                                             |
| `DocumentListItem`      | `components/documents/DocumentListItem.vue`  | List row                                              |
| `DocumentUpload`        | `components/documents/DocumentUpload.vue`    | Upload form modal                                     |
| `FilterPanel`           | `components/documents/FilterPanel.vue`       | Search/sort/type/ministry filters                     |
| `PdfPreview`            | `components/documents/PdfPreview.vue`        | PDF viewer                                            |
| `DocumentSummary`       | `components/documents/DocumentSummary.vue`   | AI summary display                                    |
| `DocumentKeyPoints`     | `components/documents/DocumentKeyPoints.vue` | Key points list                                       |
| `ChatWindow`            | `components/chat/ChatWindow.vue`             | Full chat interface                                   |
| `ChatInput`             | `components/chat/ChatInput.vue`              | Message input                                         |
| `ChatMessage`           | `components/chat/ChatMessage.vue`            | Single message with sources                           |
| `ChatHistory`           | `components/chat/ChatHistory.vue`            | Scrollable message list                               |
| `DocumentScopeSelector` | `components/chat/DocumentScopeSelector.vue`  | Filter chat to specific docs                          |
| `CategoryCard`          | `components/documents/CategoryCard.vue`      | Document type card on landing                         |
| `SearchChip`            | `components/ui/SearchChip.vue`               | Popular search chip                                   |
| `StatCard`              | `components/ui/StatCard.vue`                 | Stats display on landing                              |
| `ChangelogEntry`        | `components/ui/ChangelogEntry.vue`           | Changelog row renderer                                |
| `FaqAccordion`          | `components/ui/FaqAccordion.vue`             | FAQ accordion item                                    |
| `ContactForm`           | `components/ui/ContactForm.vue`              | Contact form                                          |
| `StreamingText`         | `components/ui/StreamingText.vue`            | Animated streaming text display                       |
| `LoadingDots`           | `components/ui/LoadingDots.vue`              | Loading indicator                                     |
| `MarkdownRenderer`      | `components/ui/MarkdownRenderer.vue`         | @nuxtjs/mdc markdown render                           |
| **`SmartSearchResult`** | **`components/SmartSearchResult.vue`**       | **AI answer + document grid with highlight snippets** |

### Composables

| Composable           | State Management        | Key Methods                                                                   |
| -------------------- | ----------------------- | ----------------------------------------------------------------------------- |
| `useAuth`            | `useState('auth.user')` | fetchUser, login, logout, isAdmin, isEditor, isLoggedIn                       |
| `useDocuments`       | `ref` (local)           | fetchDocuments, fetchDocument, updateDocument, deleteDocument, uploadDocument |
| `useChat`            | `useState` (SSR-safe)   | createSession, loadHistory, fetchSessions, sendMessage (streaming)            |
| `useAISummary`       | `ref` (local)           | fetchSummary                                                                  |
| **`useSmartSearch`** | **`ref` (local)**       | **search(query), clear() — loading, result, error, lastQuery**                |

### Plugins

| Plugin            | Runs On         | Purpose                                                             |
| ----------------- | --------------- | ------------------------------------------------------------------- |
| `plugins/auth.ts` | Server + Client | Initialize auth state on app boot; calls fetchUser() if state empty |

---

## 8. Backend Route Responsibilities

### Route Summary Table

| Method   | Path                            | Auth    | Cache                  | Description                                                                 |
| -------- | ------------------------------- | ------- | ---------------------- | --------------------------------------------------------------------------- |
| POST     | /api/auth/login                 | No      | No                     | Authenticate, set cookie                                                    |
| POST     | /api/auth/logout                | No      | No                     | Clear cookie                                                                |
| GET      | /api/auth/me                    | Yes     | No                     | Validate token, return user                                                 |
| GET      | /api/documents                  | Yes     | 5 min                  | List with filters (admin view)                                              |
| POST     | /api/documents                  | Editor+ | Invalidates            | Upload + async index                                                        |
| GET      | /api/documents/:id              | Yes     | No                     | Detail with uploader + summary                                              |
| PUT      | /api/documents/:id              | Editor+ | Invalidates            | Update metadata                                                             |
| DELETE   | /api/documents/:id              | Admin   | Invalidates            | Delete file + DB cascade                                                    |
| POST     | /api/ai/chat                    | Yes     | No                     | RAG chat stream (SSE)                                                       |
| POST     | /api/ai/summarize               | Yes     | 1 hr                   | Generate or return cached summary                                           |
| **POST** | **/api/ai/smart-search**        | **No**  | **5 min (sha256 key)** | **Semantic search: embed → vector search → group → AI answer + highlights** |
| GET      | /api/chat/sessions              | Yes     | No                     | List user sessions                                                          |
| POST     | /api/chat/sessions              | Yes     | No                     | Create session                                                              |
| PATCH    | /api/chat/sessions/:id          | Yes     | No                     | Update title                                                                |
| GET      | /api/chat/sessions/:id/messages | Yes     | No                     | Load history                                                                |
| GET      | /api/admin/users                | Admin   | No                     | List all users                                                              |
| PATCH    | /api/admin/users/:id/role       | Admin   | No                     | Change role                                                                 |
| GET      | /api/admin/feedback             | Admin   | No                     | Paginated feedback                                                          |
| PATCH    | /api/admin/feedback/:id         | Admin   | No                     | Update status                                                               |
| POST     | /api/admin/reindex              | Admin   | Invalidates            | Force re-index document                                                     |
| GET      | /api/admin/changelog            | Admin   | No                     | All changelogs (including drafts)                                           |
| POST     | /api/admin/changelog            | Admin   | Invalidates            | Create entry                                                                |
| PATCH    | /api/admin/changelog/:id        | Admin   | Invalidates            | Update entry                                                                |
| DELETE   | /api/admin/changelog/:id        | Admin   | Invalidates            | Delete entry                                                                |
| GET      | /api/public/stats               | No      | 30 min                 | Platform stats                                                              |
| GET      | /api/public/documents           | No      | 5 min (no-q)           | Public document list                                                        |
| GET      | /api/public/documents/latest    | No      | No                     | 6 newest docs                                                               |
| GET      | /api/public/documents/:id       | No      | 1 hr                   | Document detail + related                                                   |
| GET      | /api/public/changelog           | No      | 1 hr                   | Published changelogs                                                        |
| POST     | /api/public/contact             | No      | No                     | Submit feedback form                                                        |
| GET      | /api/public/popular-searches    | No      | 1 hr                   | Search chips for landing                                                    |
| GET      | /api/public/files/:filename     | No      | CDN headers            | Serve PDF file                                                              |

---

## 9. Performance Considerations

### Caching Strategy (Redis)

| Cache Key Pattern                  | TTL       | Invalidated By                                                        |
| ---------------------------------- | --------- | --------------------------------------------------------------------- |
| `docs:list:*` (hashed params)      | 5 min     | Upload, update, delete, reindex                                       |
| `public:docs:list:*`               | 5 min     | Same as above                                                         |
| `public:doc:${id}`                 | 1 hr      | Update, delete, reindex                                               |
| `public:stats`                     | 30 min    | Upload, delete, reindex (NOT metadata-only update)                    |
| `summary:${id}`                    | 1 hr      | Delete, reindex                                                       |
| `public:changelog`                 | 1 hr      | Changelog create/update/delete                                        |
| `public:popular-searches`          | 1 hr      | Time-based only                                                       |
| **`smart-search:{sha256(query)}`** | **5 min** | **Document update, delete, reindex (via `invalidateDocumentCaches`)** |

**Cache Invalidation Utility — `invalidateDocumentCaches(docId?, invalidateStats?)`**
All document-mutating routes use a single shared utility in `server/utils/redis.ts` instead of scattered `cacheDelPattern`/`cacheDel` calls:

```ts
invalidateDocumentCaches(docId?, invalidateStats = true)
// Always clears: docs:list:* + public:docs:list:*
// When docId given: also clears public:doc:{id} + summary:{id}
// When invalidateStats=false: skips public:stats (metadata-only edits don't change counts)
```

| Route                                    | Call                                                                             |
| ---------------------------------------- | -------------------------------------------------------------------------------- |
| `POST /api/documents` (upload)           | `invalidateDocumentCaches()` — no docId yet, clears lists + stats + smart-search |
| `PUT /api/documents/:id` (metadata edit) | `invalidateDocumentCaches(id, false)` — clears lists + smart-search, skips stats |
| `DELETE /api/documents/:id`              | `invalidateDocumentCaches(id, true)` — clears all                                |
| `POST /api/admin/reindex`                | `invalidateDocumentCaches(id, true)` — clears all                                |

**`cacheDelPattern` now uses Redis `SCAN` (non-blocking)**
Replaced the previous `KEYS`-based implementation with an iterative `SCAN` loop (`COUNT 100` per batch). This is O(N) like `KEYS` in total but non-blocking — the Redis event loop is not held during the scan, making it safe for production keyspaces.

### Connection Pooling

- Sequelize pool: `max: 10, min: 0, idle: 10000ms`
- Adequate for moderate traffic; not tuned for high concurrency

### Async Background Processing

- Document ingestion is fire-and-forget (no job queue)
- If Nitro worker dies mid-ingestion, document remains `status='pending'` forever
- No retry mechanism, no dead-letter queue

### Embedding Batching

- 100 chunks per OpenAI API batch call
- Sequential batches (not parallel) — suitable for medium-sized PDFs
- Large PDFs with 1000+ chunks could take significant time

---

## 10. Identified Technical Debt

### Resolved by Smart Search implementation

- ~~**Item 8**: No max-length enforcement on query input~~ — Smart search enforces `MAX_QUERY_LENGTH = 500` chars server-side.
- **Cache key safety**: Smart search uses deterministic `GET`/`SET` only — never `cacheDelPattern()`.
- ~~**Snippet quality**: Character-based snippet biased toward boilerplate~~ — Replaced with sentence-level TF-style scoring that surfaces the most query-relevant sentence in each chunk.
- ~~**Recall**: Pure vector search misses exact-term documents~~ — Hybrid retrieval combines vector similarity + per-word ILIKE keyword search with additive scoring boosts.
- **Confidence signal added**: Every search result now includes `confidence.rerankScore` (harmonic mean of evidence breadth × top similarity), surfaced in the UI as a labelled colour bar.

### Critical

1. **AI Model Mismatch**: `server/utils/claude.ts` uses OpenAI `gpt-4o-mini` despite being named `claude.ts`. The `@anthropic-ai/sdk` package is installed but unused. CLAUDE.md spec requires `claude-sonnet-4-5`. This is the most significant functional discrepancy.

2. **No Background Job Queue**: Document ingestion runs as a fire-and-forget `setImmediate`/async block inside the request handler. If the Nitro process restarts, in-flight indexing is lost permanently. No retry, no observability, no queue.

3. **~~`KEYS` pattern in Redis~~** ✅ **Resolved**: `cacheDelPattern()` now uses iterative `SCAN` (non-blocking, `COUNT 100` per batch). All document-mutating routes use the shared `invalidateDocumentCaches()` utility — no more scattered `cacheDelPattern`/`cacheDel` calls across routes.

4. **Admin delete bypasses ownership check**: `DELETE /api/documents/:id` requires admin role but does not verify the document exists before attempting file deletion (will throw if record not found — this is acceptable, but the error path should be cleaner).

### Moderate

5. **`admin.vue` layout = duplicate of `default.vue`**: Both files are identical (`AppSidebar + scrollable main`). One should extend the other.

6. **No input sanitization for document text**: PDF text is passed directly to OpenAI without sanitizing prompt injection. A malicious PDF could inject instructions into the summarization/chat prompts.

7. **No pagination on chat messages**: `GET /api/chat/sessions/:id/messages` returns all messages with no limit. Long chat sessions will return unbounded data.

8. **`searchQuery` sends raw text to OpenAI embeddings**: No max-length enforcement on query input. Very long queries could cause API errors.

9. **No file type validation server-side**: Upload route assumes PDF — no MIME type verification server-side. A non-PDF binary would fail silently during text extraction.

10. **`popular-searches` uses hardcoded fallback terms**: Hardcoded Indonesian government search terms are acceptable as a UX fallback, but are not configurable from the admin panel.

### Minor

11. **`ChatMessage.ts` model name collision**: The Sequelize model is also named `ChatMessage`, same as the Vue component `ChatMessage.vue`. Not a runtime issue (different contexts), but confusing during debugging.

12. **`view_count` increment not atomic**: `Document.increment('viewCount')` is used — this is correct (Sequelize uses SQL `UPDATE SET view_count = view_count + 1`), but there's a race with the cache read. View count updates may not be reflected until cache expires.

13. **`tags` as `TEXT[]` PostgreSQL array**: Sequelize does not natively support PostgreSQL arrays well. Works correctly via raw migration SQL, but array operations (contains, overlap) would require raw queries if added in future.

14. **No soft deletes**: Documents deleted are permanently removed (CASCADE). No trash/recovery mechanism.

15. **~~Smart search cache staleness after re-index~~** ✅ **Resolved**: `smart-search:*` is now included in `invalidateDocumentCaches()`, so all smart search results are cleared immediately on any document update, delete, or reindex.

16. **Smart search result XSS safety**: `SmartSearchResult.vue` uses `v-html` for highlight rendering. Mitigated by: (a) escaping all HTML in snippet text before injection, (b) only injecting controlled `<mark>` tags via regex replacement on the already-escaped string. Regex targets query word matches only.

---

## 11. Scaling Risks

### Short-term (1k documents)

- Current architecture is sufficient
- Redis cache covers most hot read paths
- HNSW index handles vector search efficiently at this scale

### Medium-term (10k documents)

- **Risk: Embedding latency spike** — Large PDFs with many chunks will take minutes to index. Fire-and-forget is unreliable; users may check status and see `pending` indefinitely.
- **Risk: PostgreSQL vector search latency** — HNSW is approximate; at 10M+ vectors, memory usage and index build time become significant.
- **Risk: Redis keyspace size** — Pattern-based invalidation with `KEYS` will noticeably slow as keyspace grows.

### Long-term (100k+ documents)

- **Risk: Sequelize pool exhaustion** — Max 10 connections may bottleneck under concurrent uploads + chat sessions.
- **Risk: S3 file serving through Nitro** — `/api/public/files/:filename` serves files via Node.js stream. At scale, this should use CDN-signed URLs instead.
- **Risk: Chat history unbounded growth** — No archiving or pruning strategy for `chat_messages`.
- **Risk: No horizontal scaling** — Redis caching is fine, but the async ingestion background task assumes single-process. Multiple Nitro instances would not share in-flight ingestion state.

---

## 12. Missing Production Concerns

| Concern                      | Status       | Notes                                                                   |
| ---------------------------- | ------------ | ----------------------------------------------------------------------- |
| Rate limiting                | Missing      | No rate limiting on `/api/public/contact`, chat, or login endpoints     |
| Request size limit           | Unclear      | Nuxt default may reject large PDFs; needs explicit `maxBodySize` config |
| CORS policy                  | Default Nuxt | No explicit CORS headers configured for public API                      |
| Error monitoring             | Missing      | No Sentry, Datadog, or equivalent integration                           |
| Structured logging           | Missing      | Only `console.log` / `console.error` — not queryable in production      |
| Health check endpoint        | Missing      | No `/api/health` or `/api/ping` for load balancer probes                |
| Database migrations in CI/CD | Unclear      | No deployment script ensures migrations run before app start            |
| SSL/TLS termination          | Not in app   | Assumed to be handled by reverse proxy (nginx/ALB)                      |
| Secret rotation              | No mechanism | JWT_SECRET rotation would invalidate all sessions immediately           |
| Backup strategy              | Not defined  | No database backup schedule mentioned                                   |
| PDF malware scanning         | Missing      | Uploaded PDFs are not scanned before text extraction                    |
| Content moderation           | Missing      | No filtering on AI-generated outputs or user-submitted contact form     |

---

## 13. Questions / Ambiguities

1. **AI Model**: The codebase uses `gpt-4o-mini` for both generation and summarization. CLAUDE.md explicitly specifies `claude-sonnet-4-5` (Anthropic). Was this an intentional cost/availability decision during development, or an oversight that should be corrected?

2. **`/api/public/files/:filename` security**: File serving is unauthenticated and serves any file by filename from the uploads directory. Is this intentional? Could path traversal be a concern if `filename` is not sanitized?

3. **`chat-ai.vue` page**: The file exists at `/pages/chat-ai.vue` but its content was not fully inspected. Is this a working unauthenticated demo, a stub, or a deprecated page?

4. **Feedback model vs SearchLog**: Feedback is submitted via `ContactForm` and stored in `feedback` table. `SearchLog` is populated by public document searches. Are these intentionally separate, or is there a plan to unify analytics?

5. **Default layout vs admin layout**: Both `layouts/default.vue` and `layouts/admin.vue` are structurally identical (AppSidebar + scrollable main). Is `admin.vue` intentionally separate for future divergence (e.g., different sidebar items or breadcrumbs)?

6. **`tags` field on documents**: The Document model has a `tags TEXT[]` field. The upload form appears to accept `tags` as a JSON array. Is tag-based filtering planned for the public search API? (It is not currently implemented in `/api/public/documents`.)

7. **Multi-document chat scope**: The `documentIds` array allows scoping chat to multiple documents simultaneously. The UI uses checkboxes in the sidebar. Is there a limit on how many documents can be in scope? Currently none is enforced.

8. **AiSummary one-per-document constraint**: `AiSummary` has a unique constraint on `documentId`. If a document is re-indexed, the old summary is deleted and regenerated. Is this always desired, or should summaries be versioned?

9. **`SearchLog` table**: Search logs are written on every public document search request. At scale this table will grow very fast with no TTL or archiving. Is there a data retention policy?

10. **Production deployment target**: Is this deployed on a VPS (Docker Compose present), Vercel, Railway, or a managed Kubernetes cluster? The `Dockerfile` and `docker-compose.yml` suggest self-hosted. This affects how the async ingestion concern is resolved (queue vs worker process).

11. **Smart search rate limiting**: `POST /api/ai/smart-search` is public and calls OpenAI twice per uncached request (embed + generation). No rate limiting is in place — a burst of requests could exhaust OpenAI quota or incur unexpected cost.

12. **Smart search `#page=N` browser support**: The `#page=N` PDF fragment is honoured by Chrome and Firefox's built-in PDF viewer, but not all browsers or embedded PDF plugins. Safari on iOS may ignore it. This is a graceful-degradation scenario (user still lands on the document, just not the exact page).
