import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { normalizeFilename } from '../utils/slugifyFilename.js';

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.resolve(process.cwd(), 'uploads');

const ensureDir = (p: string) => {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
};

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    const folder = isImage ? 'images' : 'documents';
    const dest = path.join(UPLOAD_DIR, folder);
    ensureDir(dest);
    cb(null, dest);
  },

  filename: (_req, file, cb) => {
    const safe = normalizeFilename(file.originalname || 'file');
    const ext = path.extname(safe);
    const base = path.basename(safe, ext);
    console.log(base);

    const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    cb(null, `${base}-${unique}${ext}`.toLowerCase());
  },
});

export const uploadMediaMiddleware = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});
