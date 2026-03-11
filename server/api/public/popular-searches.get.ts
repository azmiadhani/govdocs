import { getSequelize } from '~/server/models'

const DEFAULTS = [
  'Peraturan Daerah',
  'Anggaran',
  'Kebijakan',
  'Undang-Undang',
  'Pengumuman',
  'Laporan Keuangan',
]

export default defineEventHandler(async () => {
  const sequelize = getSequelize()

  const [searched, viewed] = await Promise.all([
    sequelize.query<{ query: string; score: string }>(
      `SELECT query, COUNT(*) AS score
       FROM search_logs
       WHERE created_at > NOW() - INTERVAL '30 days'
       GROUP BY query
       ORDER BY score DESC
       LIMIT 4`,
      { type: 'SELECT' as any },
    ),
    sequelize.query<{ query: string; score: string }>(
      `SELECT title AS query, view_count AS score
       FROM documents
       WHERE status = 'indexed'
       ORDER BY view_count DESC
       LIMIT 4`,
      { type: 'SELECT' as any },
    ),
  ])

  const results: { query: string; type: 'searched' | 'viewed' | 'default' }[] = []
  const seen = new Set<string>()

  for (const row of searched) {
    const key = row.query.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      results.push({ query: row.query, type: 'searched' })
    }
  }

  for (const row of viewed) {
    const key = row.query.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      results.push({ query: row.query, type: 'viewed' })
    }
  }

  results.sort((a, b) => {
    const order = { searched: 0, viewed: 1, default: 2 }
    return order[a.type] - order[b.type]
  })

  for (const def of DEFAULTS) {
    if (results.length >= 6) break
    const key = def.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      results.push({ query: def, type: 'default' })
    }
  }

  return results.slice(0, 6)
})
