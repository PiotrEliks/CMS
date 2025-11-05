import { Sequelize, SyncOptions } from 'sequelize';
import { sequelize } from './sequelize.js';
import { setupAssociations } from '../models/index.js';

import '../models/user.model.js';

type InitDbOptions = {
  sync?: boolean | SyncOptions;
  seed?: (() => Promise<void>) | null;
};

export async function initDatabase(opts: InitDbOptions = {}) {
  const syncOpt =
    opts.sync ??
    (process.env.NODE_ENV === 'production' ? false : { alter: true });

  setupAssociations();
  await sequelize.authenticate();
  if (syncOpt) {
    await sequelize.sync(typeof syncOpt === 'object' ? syncOpt : undefined);
  }
  if (opts.seed) {
    await opts.seed();
  }
  return sequelize;
}
