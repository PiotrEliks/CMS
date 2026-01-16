import {
    DataTypes,
    Model,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from 'sequelize'
import { sequelize } from '../db/sequelize.js'

export class Media extends Model<
    InferAttributes<Media>,
    InferCreationAttributes<Media>
> {
    declare media_id: CreationOptional<string>
    declare storage_path: string
    declare mime_type: string | null
    declare file_size: number | null
    declare width: number | null
    declare height: number | null
    declare alt_text: string | null
    declare title: string | null
    declare status: boolean
    declare thumbnail_path: string | null
    declare created_at: CreationOptional<Date>
    declare uploaded_at: CreationOptional<Date>
}

Media.init(
    {
        media_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        storage_path: { type: DataTypes.STRING(1024), allowNull: false },
        mime_type: { type: DataTypes.STRING(100) },
        file_size: { type: DataTypes.INTEGER },
        width: { type: DataTypes.INTEGER },
        height: { type: DataTypes.INTEGER },
        alt_text: { type: DataTypes.STRING(255) },
        title: { type: DataTypes.STRING(255) },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        uploaded_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW,
        },
        thumbnail_path: { type: DataTypes.STRING(1024), allowNull: true },
    },
    { sequelize, tableName: 'media', timestamps: true, updatedAt: false }
)
