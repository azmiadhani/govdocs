# GovDocs AI

## Stack

- Nuxt 3 fullstack (no separate backend)
- PostgreSQL + pgvector (raw, no BaaS)
- Sequelize v6 + sequelize-typescript (decorator models)
- sequelize-cli for migrations
- Upstash Redis for caching
- Claude API (claude-sonnet-4-5) for AI with streaming + prompt caching
- OpenAI text-embedding-3-small (1536-dim) for embeddings
- Custom JWT auth with jose + bcryptjs in httpOnly cookies
- File storage: local disk (dev), S3-compatible (prod)
- Nuxt UI + Tailwind CSS
- @nuxtjs/mdc for markdown rendering

## Roles

admin > editor > viewer

## Conventions

- All server logic in /server/api/ (Nitro routes)
- All Sequelize models in /server/models/
- Use requireAuth(event) for protected routes
- Use requireRole(event, 'admin') for admin-only routes
- Chunks: 800 tokens, 100 token overlap, preserve paragraph boundaries
- Vector dims: 1536 (OpenAI text-embedding-3-small)
- Stream AI via SSE (Content-Type: text/event-stream), NOT WebSockets
- pgvector queries use raw sequelize.query() with <=> cosine distance operator
- vector(1536) column defined as 'vector(1536)' as any in Sequelize model

## Environment variables

DATABASE_URL, DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS
JWT_SECRET
OPENAI_API_KEY
ANTHROPIC_API_KEY
REDIS_URL
STORAGE_PATH (local) or AWS_BUCKET, AWS_REGION, AWS_ACCESS_KEY, AWS_SECRET_KEY
