import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import { sequelize } from '../db/sequelize.js';

export type ComponentType = 'hero' | 'services';
// TODO: Add other component types here

export interface HeroComponentData {
  slides: Array<{
    title?: string;
    subtitle?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
    media_id?: string;
    overlayOpacity?: number;
  }>;
  autoplay?: boolean;
  interval?: number;
}

export interface ServicesComponentData {
  title?: string;
  subtitle?: string;
  items: Array<{
    icon?: string;
    name: string;
    description?: string;
    price?: string;
    media_id?: string;
    link?: string;
  }>;
  layout?: 'grid' | 'list' | 'carousel';
  columns?: number;
}

export type ComponentData = HeroComponentData | ServicesComponentData;
// TODO: Add other component data types here

export class PageComponent extends Model<
  InferAttributes<PageComponent>,
  InferCreationAttributes<PageComponent>
> {
  declare component_id: CreationOptional<string>;
  declare content_id: string;
  declare component_type: ComponentType;
  declare data: ComponentData;
  declare order_index: number;
  declare status: boolean;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

PageComponent.init(
  {
    component_id: {
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
    component_type: {
      type: DataTypes.ENUM(
        'hero',
        'services'
        // TODO: Add other component types here
      ),
      allowNull: false,
    },
    data: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    order_index: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
    tableName: 'page_components',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['content_id', 'order_index'],
      },
      {
        fields: ['content_id', 'status'],
      },
      {
        fields: ['component_type'],
      },
    ],
  }
);
