'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('documents', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM('law', 'regulation', 'decree', 'circular', 'guideline', 'other'),
        allowNull: false,
        defaultValue: 'other',
      },
      ministry: {
        type: Sequelize.TEXT,
      },
      file_path: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      file_size: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      page_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      published_at: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('pending', 'indexed', 'error'),
        defaultValue: 'pending',
        allowNull: false,
      },
      tags: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        defaultValue: [],
      },
      uploaded_by: {
        type: Sequelize.UUID,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL',
        allowNull: true,
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

    await queryInterface.addIndex('documents', ['status'])
    await queryInterface.addIndex('documents', ['type'])
    await queryInterface.addIndex('documents', ['ministry'])
    await queryInterface.addIndex('documents', ['uploaded_by'])
  },

  async down(queryInterface) {
    await queryInterface.dropTable('documents')
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_documents_type";')
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_documents_status";')
  },
}
