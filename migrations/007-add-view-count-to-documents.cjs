'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('documents', 'view_count', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false,
    })
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('documents', 'view_count')
  },
}
