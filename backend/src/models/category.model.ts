import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize'
import { sequelize } from '../db/sequelize.js'

export class Category extends Model<
  InferAttributes<Category>,
  InferCreationAttributes<Category>
> {
  declare category_id: CreationOptional<string>
  declare type: string | null
  declare display_name: string
  declare slug: string
  declare path: string | null
  declare status: boolean
  declare created_by: string | null
  declare updated_by: string | null
  declare created_at: CreationOptional<Date>
  declare updated_at: CreationOptional<Date>
}

Category.init(
  {
    category_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    type: { type: DataTypes.STRING(50) },
    display_name: { type: DataTypes.STRING(255), allowNull: false },
    slug: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    path: { type: DataTypes.STRING(1024) },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    created_by: { type: DataTypes.UUID, allowNull: true },
    updated_by: { type: DataTypes.UUID, allowNull: true },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  { sequelize, tableName: 'category', timestamps: true, underscored: true }
)
