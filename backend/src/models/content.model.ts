import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize'
import { sequelize } from '../db/sequelize.js'

export class Content extends Model<
  InferAttributes<Content>,
  InferCreationAttributes<Content>
> {
  declare content_id: CreationOptional<string>
  declare type: string | null
  declare status: string | null
  declare slug: string
  declare title: string
  declare lead: string | null
  declare body: string | null
  declare cover_media_id: string | null
  declare author: string | null
  declare published_at: Date | null
  declare created_by: string | null
  declare updated_by: string | null
  declare meta_title: string | null
  declare meta_description: string | null
  declare og_title: string | null
  declare og_description: string | null
  declare created_at: CreationOptional<Date>
  declare updated_at: CreationOptional<Date>
}

Content.init(
  {
    content_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    type: { type: DataTypes.STRING(50) },
    status: { type: DataTypes.STRING(1) },
    slug: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    title: { type: DataTypes.STRING(255), allowNull: false },
    lead: { type: DataTypes.TEXT },
    body: { type: DataTypes.TEXT },
    cover_media_id: { type: DataTypes.UUID },
    author: { type: DataTypes.STRING(255) },
    published_at: { type: DataTypes.DATE },
    created_by: { type: DataTypes.UUID },
    updated_by: { type: DataTypes.UUID },
    meta_title: { type: DataTypes.STRING(255) },
    meta_description: { type: DataTypes.STRING(500) },
    og_title: { type: DataTypes.STRING(255) },
    og_description: { type: DataTypes.STRING(500) },
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
  { sequelize, tableName: 'contents', timestamps: true }
)
