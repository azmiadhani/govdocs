'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('chat_sessions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      scope: {
        type: Sequelize.ENUM('global', 'document'),
        allowNull: false,
        defaultValue: 'global',
      },
      document_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'documents', key: 'id' },
        onDelete: 'SET NULL',
      },
      title: {
        type: Sequelize.TEXT,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
        allowNull: false,
      },
    })

    await queryInterface.addIndex('chat_sessions', ['user_id'])
  },

  async down(queryInterface) {
    await queryInterface.dropTable('chat_sessions')
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_chat_sessions_scope";')
  },
}
