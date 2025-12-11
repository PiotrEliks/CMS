import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../db/sequelize.js';
import { Role } from './role.model.js';
import { Permission } from './permission.model.js';

export class RolePermission extends Model<
  InferAttributes<RolePermission>,
  InferCreationAttributes<RolePermission>
> {
  declare role_id: string;
  declare permission_id: string;
}

RolePermission.init(
  {
    role_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      references: { model: 'role', key: 'role_id' },
      onDelete: 'CASCADE',
    },
    permission_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      references: { model: 'permission', key: 'permission_id' },
      onDelete: 'CASCADE',
    },
  },
  {
    sequelize,
    tableName: 'role_permission',
    timestamps: false,
  }
);
