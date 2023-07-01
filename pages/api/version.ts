// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

const VERSION = process.env.VERSION;

export default (req: NextApiRequest, res: NextApiResponse): void => {
  res.status(200).json({ version: VERSION });
};
