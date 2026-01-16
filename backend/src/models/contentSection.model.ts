import {
    DataTypes,
    Model,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from 'sequelize'
import { sequelize } from '../db/sequelize.js'

export type SectionType =
    | 'text'
    | 'image'
    | 'gallery'
    | 'pdf'
    | 'video'
    | 'html'
    | 'embed'

export interface SectionSettings {
    alignment?: 'left' | 'center' | 'right'
    width?: 'full' | 'contained'
    background_color?: string
    padding?: string
    custom_css?: string
    embed_code?: string
    embed_url?: string
    video_url?: string
    video_provider?: 'youtube' | 'vimeo' | 'custom'
    autoplay?: boolean
    layout?: 'grid' | 'carousel' | 'masonry'
    columns?: number
}

export class ContentSection extends Model<
    InferAttributes<ContentSection>,
    InferCreationAttributes<ContentSection>
> {
    declare section_id: CreationOptional<string>
    declare content_id: string
    declare section_type: SectionType
    declare order_index: number
    declare display_order: number
    declare heading: string | null
    declare subheading: string | null
    declare body: string | null
    declare media_ids: string[] | null
    declare settings: SectionSettings | null
    declare status: boolean
    declare created_at: CreationOptional<Date>
    declare updated_at: CreationOptional<Date>
}

ContentSection.init(
    {
        section_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        content_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'contents',
                key: 'content_id',
            },
            onDelete: 'CASCADE',
        },
        section_type: {
            type: DataTypes.ENUM(
                'text',
                'image',
                'gallery',
                'pdf',
                'video',
                'html',
                'embed'
            ),
            allowNull: false,
        },
        order_index: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        display_order: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        heading: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        subheading: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        body: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        media_ids: {
            type: DataTypes.ARRAY(DataTypes.UUID),
            allowNull: true,
            defaultValue: [],
        },
        settings: {
            type: DataTypes.JSONB,
            allowNull: true,
            defaultValue: {},
        },
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
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: 'content_sections',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                fields: ['content_id', 'order_index'],
            },
            {
                fields: ['content_id', 'status'],
            },
        ],
    }
)
