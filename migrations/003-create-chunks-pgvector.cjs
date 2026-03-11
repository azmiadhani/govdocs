'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    // Enable pgvector extension
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS vector;')

    // Create document_chunks table with vector column via raw SQL
    await queryInterface.sequelize.query(`
      CREATE TABLE document_chunks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        chunk_index INTEGER NOT NULL,
        page_number INTEGER DEFAULT 0,
        embedding vector(1536)
      );
    `)

    // Create HNSW index for fast approximate nearest-neighbor search
    await queryInterface.sequelize.query(`
      CREATE INDEX document_chunks_embedding_hnsw_idx
      ON document_chunks
      USING hnsw (embedding vector_cosine_ops);
    `)

    await queryInterface.addIndex('document_chunks', ['document_id'], {
      name: 'document_chunks_document_id_idx',
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('document_chunks')
  },
}
