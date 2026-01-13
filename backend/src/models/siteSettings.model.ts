import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import { sequelize } from '../db/sequelize.js';

export interface SocialMedia {
  platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'tiktok' | 'github';
  url: string;
}

export interface SiteSettingsData {
  site_name?: string;
  site_tagline?: string;
  site_description?: string;

  header_logo_media_id?: string;
  header_menu_id?: string;
  header_background_type?: 'color' | 'image';
  header_background_color?: string;
  header_background_media_id?: string;
  header_show_social?: boolean;

  footer_logo_media_id?: string;
  footer_menu_id?: string;
  footer_description?: string;
  footer_background_color?: string;
  footer_copyright_text?: string;
  footer_show_social?: boolean;

  social_media?: SocialMedia[];

  contact_email?: string;
  contact_phone?: string;
  contact_address?: string;

  default_meta_title?: string;
  default_meta_description?: string;
  default_og_image_media_id?: string;

  google_analytics_id?: string;
  facebook_pixel_id?: string;

  favicon_media_id?: string;
  custom_css?: string;
  custom_js?: string;
}

export class SiteSetting extends Model<
  InferAttributes<SiteSetting>,
  InferCreationAttributes<SiteSetting>
> {
  declare setting_id: CreationOptional<string>;
  declare key: string;
  declare value: SiteSettingsData | null;
  declare description: string | null;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

SiteSetting.init(
  {
    setting_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    value: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true,
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
    tableName: 'site_settings',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['key'],
      },
    ],
  }
);
