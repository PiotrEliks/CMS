import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { initDatabase } from './db/init.js';
import { ensureAdminSeed } from './db/seed.js';

import adminRouter from './routes/admin/index.js';
import siteRouter from './routes/site/index.js';

const app = express();

const CORS_ORIGIN = process.env.CORS_ORIGIN;

app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ type: ['application/json', 'application/*+json'] }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/admin', adminRouter);
app.use('/api/sites', siteRouter);

const PORT = Number(process.env.PORT);

(async () => {
  try {
    await initDatabase({ seed: ensureAdminSeed });
    console.log('Database ready.');
    app.listen(PORT, () => {
      console.log('Server running on port', PORT);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
})();

export default app;
