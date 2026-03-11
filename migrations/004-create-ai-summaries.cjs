'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ai_summaries', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      document_id: {
        type: Sequelize.UUID,
        unique: true,
        allowNull: false,
        references: { model: 'documents', key: 'id' },
        onDelete: 'CASCADE',
      },
      summary: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      key_points: {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      model_used: {
        type: Sequelize.TEXT,
      },
      generated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
        allowNull: false,
      },
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ai_summaries')
  },
}
