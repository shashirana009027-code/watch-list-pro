import multer from 'multer';
import os from 'os';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const root = process.env.VERCEL ? os.tmpdir() : path.join(process.cwd(), 'uploads');
if (!fs.existsSync(root)) fs.mkdirSync(root, { recursive: true });
const allowed = new Set(['image/jpeg', 'image/png', 'image/webp']);
const upload = multer({ storage: multer.diskStorage({ destination: (_req, _file, cb) => cb(null, root), filename: (_req, file, cb) => cb(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`) }), limits: { fileSize: 2 * 1024 * 1024 }, fileFilter: (_req, file, cb) => cb(allowed.has(file.mimetype) ? null : new Error('Upload a JPEG, PNG, or WEBP image.'), allowed.has(file.mimetype)) });
export { upload, root };
