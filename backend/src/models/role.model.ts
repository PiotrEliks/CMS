import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../db/sequelize.js';

export class Role extends Model<InferAttributes<Role>, InferCreationAttributes<Role>> {
  declare role_id: CreationOptional<string>;
  declare display_name: string;
  declare type: string;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

Role.init(
  {
    role_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    display_name: { type: DataTypes.STRING(100), allowNull: false },
    type: { type: DataTypes.STRING(50), allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  },
  { sequelize, tableName: 'role', timestamps: true }
);
