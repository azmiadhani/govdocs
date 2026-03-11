'use strict'

const bcrypt = require('bcryptjs')

module.exports = {
  async up(queryInterface) {
    const passwordHash = await bcrypt.hash('admin123', 12)
    await queryInterface.bulkInsert('users', [
      {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'admin@govdocs.ai',
        password_hash: passwordHash,
        name: 'Admin',
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ])
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { email: 'admin@govdocs.ai' })
  },
}
