import fs from 'fs';
import path from 'path';
import multer from 'multer';

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.resolve(process.cwd(), 'uploads');

const ensureDir = (p: string) => {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    const folder = isImage ? 'images' : 'documents';
    const dest = path.join(UPLOAD_DIR, folder);
    ensureDir(dest);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '');
    const base = path
      .basename(file.originalname || 'file', ext)
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .toLowerCase();

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
