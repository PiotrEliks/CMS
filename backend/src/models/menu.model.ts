import {
    DataTypes,
    Model,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from 'sequelize'
import { sequelize } from '../db/sequelize.js'

export class Menu extends Model<
    InferAttributes<Menu>,
    InferCreationAttributes<Menu>
> {
    declare menu_id: CreationOptional<string>
    declare code: string
    declare name: string
    declare status: boolean
    declare created_by: string | null
    declare updated_by: string | null
    declare created_at: CreationOptional<Date>
    declare updated_at: CreationOptional<Date>
}

Menu.init(
    {
        menu_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        code: { type: DataTypes.STRING(50), allowNull: false, unique: true },
        name: { type: DataTypes.STRING(255), allowNull: false },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        created_by: { type: DataTypes.UUID, allowNull: true },
        updated_by: { type: DataTypes.UUID, allowNull: true },
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
    { sequelize, tableName: 'menu', timestamps: true, underscored: true }
)
