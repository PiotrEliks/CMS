import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/sequelize.js';

export class ContentMenu extends Model {
  declare content_id: string;
  declare menu_id: string;
}

ContentMenu.init(
  {
    content_id: { type: DataTypes.UUID, primaryKey: true },
    menu_id: { type: DataTypes.UUID, primaryKey: true }
  },
  { sequelize, tableName: 'content_menu', timestamps: false }
);
