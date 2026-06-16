import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const UPLOAD_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../uploads'
);

export const deleteFile = (publicPath) => {
  if (!publicPath?.startsWith('/uploads/')) return;
  const abs = path.join(UPLOAD_ROOT, publicPath.replace(/^\/uploads\//, ''));
  fs.unlink(abs, () => {}); // silent — file may already be gone
};
