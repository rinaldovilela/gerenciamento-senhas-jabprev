import { Request, Response, NextFunction } from 'express';

export function logger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const originalSend = res.send;

  res.send = function (data: any) {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const logLevel = statusCode >= 400 ? '🔴' : '🟢';

    console.log(
      `${logLevel} [${new Date().toISOString()}] ${req.method} ${req.path} - ${statusCode} (${duration}ms)`
    );

    if (statusCode >= 400) {
      console.error(`   Body: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
    }

    return originalSend.call(this, data);
  };

  next();
}
