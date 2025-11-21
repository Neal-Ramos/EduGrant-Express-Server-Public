import { Request, Response, NextFunction } from 'express';
import { supabase } from '../Config/Supabase';
import { prisma } from '../lib/prisma';

export const healthCheckMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const { data, error } = await supabase.storage.from('Edugrant-Files').list('', { limit: 1 });
    if (error) {
      res
        .status(500)
        .json({ success: false, message: 'Supabase not available', error: error.message });
      return;
    }

    next();
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ success: false, message: 'Service unavailable', error });
    return;
  }
};
