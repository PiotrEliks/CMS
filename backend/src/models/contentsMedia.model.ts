import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../db/sequelize.js'

export class ContentsMedia extends Model {
    declare content_id: string
    declare media_id: string
}

ContentsMedia.init(
    {
        content_id: { type: DataTypes.UUID, primaryKey: true },
        media_id: { type: DataTypes.UUID, primaryKey: true },
    },
    { sequelize, tableName: 'contents_media', timestamps: false }
)
