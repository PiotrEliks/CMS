import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../db/sequelize.js'

export class ContentCategory extends Model {
    declare category_id: string
    declare content_id: string
}

ContentCategory.init(
    {
        category_id: { type: DataTypes.UUID, primaryKey: true },
        content_id: { type: DataTypes.UUID, primaryKey: true },
    },
    { sequelize, tableName: 'content_category', timestamps: false }
)
