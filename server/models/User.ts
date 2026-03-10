import 'reflect-metadata'
import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  BeforeCreate,
  BeforeUpdate,
} from 'sequelize-typescript'
import bcrypt from 'bcryptjs'

@Table({ tableName: 'users', underscored: true })
export class User extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  declare id: string

  @Column({ type: DataType.TEXT, unique: true, allowNull: false })
  declare email: string

  @Column({ type: DataType.TEXT, allowNull: false })
  declare passwordHash: string

  @Column({ type: DataType.TEXT, allowNull: false })
  declare name: string

  @Column({
    type: DataType.ENUM('admin', 'editor', 'viewer'),
    allowNull: false,
    defaultValue: 'viewer',
  })
  declare role: 'admin' | 'editor' | 'viewer'

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  declare createdAt: Date

  async verifyPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.passwordHash)
  }

  toSafeObject() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      role: this.role,
      createdAt: this.createdAt,
    }
  }
}
