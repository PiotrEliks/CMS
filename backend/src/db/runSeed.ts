import { sequelize } from './sequelize.js'
import { setupAssociations } from '../models/index.js'
import {
  ensureAdminSeed,
  ensureHomepageSeed,
  ensureSiteSettingsSeed,
  ensureMenuSeed,
  ensureSiteSettingsSeeded,
} from './seed.js'

async function runSeed() {
  try {
    console.log('🌱 Starting seed process...')

    // Setup model associations
    setupAssociations()

    // Connect to database
    await sequelize.authenticate()
    console.log('✅ Database connected')

    // Run seeds
    await ensureAdminSeed()
    await ensureSiteSettingsSeed()
    await ensureHomepageSeed()
    await ensureMenuSeed()
    await ensureSiteSettingsSeeded()

    console.log('🎉 Seed completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  }
}

runSeed()
