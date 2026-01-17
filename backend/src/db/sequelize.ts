import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'
dotenv.config()

const isProd = process.env.NODE_ENV === 'production'
const dbUrl = process.env.DATABASE_URL

if (!dbUrl) {
  throw new Error('DATABASE_URL is not set')
}

export const sequelize = new Sequelize(dbUrl, {
  dialect: 'postgres',
  logging: !isProd ? console.log : false,
  dialectOptions: process.env.PGSSLMODE
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : undefined,
  define: {
    underscored: true,
    freezeTableName: true,
  },
})
