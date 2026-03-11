import { Model, DataTypes, type Sequelize } from 'sequelize'
import bcrypt from 'bcryptjs'

export class User extends Model {
  declare id: string
  declare email: string
  declare passwordHash: string
  declare name: string
  declare role: 'admin' | 'editor' | 'viewer'
  declare createdAt: Date
  declare updatedAt: Date

  async verifyPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.passwordHash)
  }

  toSafeObject() {
    return { id: this.id, email: this.email, name: this.name, role: this.role, createdAt: this.createdAt }
  }
}

export function initUser(sequelize: Sequelize) {
  User.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      email: { type: DataTypes.TEXT, unique: true, allowNull: false },
      passwordHash: { type: DataTypes.TEXT, allowNull: false },
      name: { type: DataTypes.TEXT, allowNull: false },
      role: { type: DataTypes.ENUM('admin', 'editor', 'viewer'), allowNull: false, defaultValue: 'viewer' },
    },
    { sequelize, tableName: 'users', underscored: true },
  )
}
