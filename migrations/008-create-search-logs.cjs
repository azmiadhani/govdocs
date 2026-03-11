'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('search_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      query: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      result_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('search_logs')
  },
}
