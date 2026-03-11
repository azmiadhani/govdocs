export default defineNuxtConfig({
  devtools: { enabled: true },

  components: [
    { path: '~/components', pathPrefix: false },
  ],

  modules: [
    '@nuxt/ui',
    '@nuxtjs/mdc',
  ],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    // Server-only secrets
    jwtSecret: process.env.JWT_SECRET,
    openaiApiKey: process.env.OPENAI_API_KEY,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    redisUrl: process.env.REDIS_URL,
    storagePath: process.env.STORAGE_PATH || './uploads',
    awsBucket: process.env.AWS_BUCKET,
    awsRegion: process.env.AWS_REGION,
    awsAccessKey: process.env.AWS_ACCESS_KEY,
    awsSecretKey: process.env.AWS_SECRET_KEY,
    dbHost: process.env.DB_HOST,
    dbPort: process.env.DB_PORT,
    dbName: process.env.DB_NAME,
    dbUser: process.env.DB_USER,
    dbPass: process.env.DB_PASS,
    databaseUrl: process.env.DATABASE_URL,
    // Public (exposed to client)
    public: {},
  },

  nitro: {
    experimental: {
      wasm: true,
    },
  },

  typescript: {
    strict: true,
    tsConfig: {
      compilerOptions: {
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
      },
    },
  },

  routeRules: {
    '/admin/**': { appMiddleware: ['auth', 'admin'] },
    '/chat/**': { appMiddleware: ['auth'] },
  },

  compatibilityDate: '2024-11-01',
})
