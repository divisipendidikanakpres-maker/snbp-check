import { NextFunction, Request, Response } from 'express';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ message: 'Endpoint tidak ditemukan.' });
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  console.error(err);
  res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
}
