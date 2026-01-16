import {
    DataTypes,
    Model,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from 'sequelize'
import { sequelize } from '../db/sequelize.js'

export class KeyValue extends Model<
    InferAttributes<KeyValue>,
    InferCreationAttributes<KeyValue>
> {
    declare key: string
    declare value: string | null
    declare description: string | null
    declare user_id: string | null
    declare created_at: CreationOptional<Date>
    declare updated_at: CreationOptional<Date>
}

KeyValue.init(
    {
        key: { type: DataTypes.STRING(255), primaryKey: true },
        value: { type: DataTypes.TEXT },
        description: { type: DataTypes.STRING(500) },
        user_id: { type: DataTypes.UUID },
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
    { sequelize, tableName: 'key_value', timestamps: true }
)
