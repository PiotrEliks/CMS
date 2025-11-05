import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../db/sequelize.js';

export class MenuItem extends Model<InferAttributes<MenuItem>, InferCreationAttributes<MenuItem>> {
  declare menu_item_id: CreationOptional<string>;
  declare label: string;
  declare content_id: string | null;
  declare order_index: number | null;
  declare parent_id: string | null;
  declare menu_id: string;
}

MenuItem.init(
  {
    menu_item_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    label: { type: DataTypes.STRING(255), allowNull: false },
    content_id: { type: DataTypes.UUID },
    order_index: { type: DataTypes.INTEGER },
    parent_id: { type: DataTypes.UUID },
    menu_id: { type: DataTypes.UUID, allowNull: false }
  },
  { sequelize, tableName: 'menu_item', timestamps: false }
);
