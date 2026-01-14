import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import { sequelize } from '../db/sequelize.js';

export type ComponentType =
  | 'hero'
  | 'services'
  | 'testimonial'
  | 'team'
  | 'pricing'
  | 'hours'
  | 'contact_form'
  | 'map';

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

export interface TestimonialComponentData {
  title?: string;
  items: Array<{
    quote: string;
    author: string;
    role?: string;
    company?: string;
    rating?: number;
    media_id?: string;
  }>;
  layout?: 'slider' | 'grid' | 'masonry';
}

export interface TeamComponentData {
  title?: string;
  subtitle?: string;
  members: Array<{
    name: string;
    role: string;
    bio?: string;
    media_id?: string;
    email?: string;
    phone?: string;
    social?: {
      linkedin?: string;
      twitter?: string;
      facebook?: string;
      instagram?: string;
    };
  }>;
  layout?: 'grid' | 'list';
  columns?: number;
}

export interface PricingComponentData {
  title?: string;
  subtitle?: string;
  services: Array<{
    name: string;
    price: string;
    description?: string;
    media_id?: string;
  }>;
}

export interface HoursComponentData {
  title?: string;
  hours: Array<{
    days: string;
    time: string;
    closed?: boolean;
  }>;
  specialNote?: string;
}

export interface ContactFormComponentData {
  title?: string;
  subtitle?: string;
  fields: Array<{
    type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox';
    name: string;
    label: string;
    placeholder?: string;
    required?: boolean;
    options?: string[];
  }>;
  submitText?: string;
  successMessage?: string;
  emailTo?: string;
}

export interface MapComponentData {
  title?: string;
  latitude: number;
  longitude: number;
  zoom?: number;
  marker?: boolean;
  markerTitle?: string;
  height?: string;
}

export type ComponentData =
  | HeroComponentData
  | ServicesComponentData
  | TestimonialComponentData
  | TeamComponentData
  | PricingComponentData
  | HoursComponentData
  | ContactFormComponentData
  | MapComponentData;

export class PageComponent extends Model<
  InferAttributes<PageComponent>,
  InferCreationAttributes<PageComponent>
> {
  declare component_id: CreationOptional<string>;
  declare content_id: string;
  declare component_type: ComponentType;
  declare data: ComponentData;
  declare order_index: number;
  declare display_order: number;
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
        'services',
        'testimonial',
        'team',
        'pricing',
        'hours',
        'contact_form',
        'map'
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
    display_order: {
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
