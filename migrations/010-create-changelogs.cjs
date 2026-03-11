'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('changelogs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      version: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM('feature', 'improvement', 'fix', 'security', 'breaking'),
        defaultValue: 'feature',
        allowNull: false,
      },
      published: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      released_at: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    })

    await queryInterface.addIndex('changelogs', ['published'])
    await queryInterface.addIndex('changelogs', ['released_at'])
  },

  async down(queryInterface) {
    await queryInterface.dropTable('changelogs')
  },
}
