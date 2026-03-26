import { Request, Response, NextFunction } from 'express';
import * as Joi from 'joi';

export function validateRequest(schema: Joi.Schema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((d) => `${d.path.join('.')}: ${d.message}`);
      return res.status(400).json({
        error: 'Validation failed',
        details: messages,
      });
    }

    req.body = value;
    next();
  };
}
