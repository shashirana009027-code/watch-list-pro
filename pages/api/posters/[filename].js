import fs from 'fs';
import path from 'path';
import { root } from '../../../middlewares/uploadMiddleware';
const types = { '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.png':'image/png', '.webp':'image/webp' };
export default function handler(req,res) {
  if(req.method!=='GET')return res.status(405).end();
  const filename=path.basename(req.query.filename || ''); const ext=path.extname(filename).toLowerCase(); const full=path.join(root,filename);
  if(!filename || !types[ext] || !fs.existsSync(full))return res.status(404).end();
  res.setHeader('Content-Type',types[ext]);res.setHeader('Cache-Control','private, max-age=3600');fs.createReadStream(full).pipe(res);
}
