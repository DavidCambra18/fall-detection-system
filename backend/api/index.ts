import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../src/app';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Pasar la request a Express
  await new Promise((resolve, reject) => {
    app(req, res);
    res.on('finish', resolve);
    res.on('error', reject);
  });
}
