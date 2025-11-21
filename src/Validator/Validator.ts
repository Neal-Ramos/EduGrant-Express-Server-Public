import { NextFunction, Request, Response } from 'express';
import z, { ZodObject, ZodRawShape } from 'zod';

export const validate =
  <T extends ZodObject<any>>(schema: T) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
      cookies: req.cookies,
    });
    if (!result.success) {
      res.status(422).json(z.treeifyError(result.error).properties);
      return;
    }

    (req as Request & { validated: z.infer<T> }).validated = result.data;
    next();
  };

export const toFloat = () => {
  return z.union([z.string(), z.number()]).transform((val, ctx) => {
    const n = typeof val === 'string' ? Number(val) : val;
    if (Number.isNaN(n)) {
      ctx.addIssue({ code: 'custom', message: 'Invalid Float!' });
      return z.NEVER;
    }
    return n;
  });
};
export const toInt = () => {
  return z.union([z.string(), z.number()]).transform((val, ctx) => {
    const n = typeof val === 'string' ? Number(val) : val;
    if (!Number.isInteger(n)) {
      ctx.addIssue({ code: 'custom', message: 'Invalid Integer!' });
      return z.NEVER;
    }
    return n;
  });
};
export const toJSON = () => {
  return z.string().transform((val, ctx) => {
    try {
      const parsed = JSON.parse(val);
      return parsed;
    } catch (error) {
      ctx.addIssue({ code: 'custom', message: 'Invalid JSON Format!' });
      return z.NEVER;
    }
  });
};
export const toDate = () => {
  return z.union([z.string(), z.date(), z.number()]).transform((val, ctx) => {
    const d = new Date(val);
    if (isNaN(d.getTime())) {
      ctx.addIssue({ code: 'custom', message: 'Invalid Time Format!' });
      return z.NEVER;
    }
    return d;
  });
};
export const toBoolean = () => {
  return z.union([z.string(), z.boolean()]).transform((val, ctx) => {
    if (typeof val === "boolean") return val;
    if (val !== "true" && val !== "false") {
      ctx.addIssue({ code: 'custom', message: 'value must be "true" || "false"!' });
      return z.NEVER;
    }
    return val === "true";
  });
};
