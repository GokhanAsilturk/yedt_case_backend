import { Request, Response, NextFunction, Express } from 'express';
import helmet from 'helmet';

export const setupSecurityMiddleware = (app: Express): void => {
  app.use(helmet());

  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    }
  }));

  app.use(helmet.hsts({
    maxAge: 15552000,
    includeSubDomains: true,
    preload: true
  }));

  app.use(helmet.xssFilter());
  app.use(helmet.noSniff());
  app.use(helmet.frameguard({ action: 'deny' }));
  app.use(helmet.referrerPolicy({ policy: 'same-origin' }));
  
  app.use(customXssProtection);
};

export const customXssProtection = (req: Request, res: Response, next: NextFunction): void => {
  if (req.body) {
    sanitizeObject(req.body);
  }

  if (req.params) {
    sanitizeObject(req.params);
  }

  next();
};

function sanitizeObject(obj: any, isSqlSanitize = false): void {
  if (!obj || typeof obj !== 'object') return;

  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'string') {
      if (isSqlSanitize) {
        obj[key] = obj[key]
          .replace(/(\b|\s)SELECT(\b|\s)/ig, '')
          .replace(/(\b|\s)INSERT(\b|\s)/ig, '')
          .replace(/(\b|\s)UPDATE(\b|\s)/ig, '')
          .replace(/(\b|\s)DELETE(\b|\s)/ig, '')
          .replace(/(\b|\s)DROP(\b|\s)/ig, '')
          .replace(/(\b|\s)ALTER(\b|\s)/ig, '')
          .replace(/(\b|\s)CREATE(\b|\s)/ig, '')
          .replace(/(\b|\s)TRUNCATE(\b|\s)/ig, '')
          .replace(/(\b|\s)--/g, '')
          .replace(/'/g, "''");
      } else {
        obj[key] = obj[key]
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
          .replace(/\//g, '&#x2F;');
      }
    } else if (typeof obj[key] === 'object') {
      sanitizeObject(obj[key], isSqlSanitize);
    }
  });
}

export const sqlInjectionProtection = (req: Request, res: Response, next: NextFunction): void => {
  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      return value
        .replace(/(\b|\s)SELECT(\b|\s)/ig, '')
        .replace(/(\b|\s)INSERT(\b|\s)/ig, '')
        .replace(/(\b|\s)UPDATE(\b|\s)/ig, '')
        .replace(/(\b|\s)DELETE(\b|\s)/ig, '')
        .replace(/(\b|\s)DROP(\b|\s)/ig, '')
        .replace(/(\b|\s)ALTER(\b|\s)/ig, '')
        .replace(/(\b|\s)CREATE(\b|\s)/ig, '')
        .replace(/(\b|\s)TRUNCATE(\b|\s)/ig, '')
        .replace(/(\b|\s)--/g, '')
        .replace(/'/g, "''");
    } else if (value !== null && typeof value === 'object') {
      const sanitizedObject: any = Array.isArray(value) ? [] : {};
      Object.keys(value).forEach((key) => {
        sanitizedObject[key] = sanitizeValue(value[key]);
      });
      return sanitizedObject;
    }
    return value;
  };

  if (req.body) {
    sanitizeObject(req.body, true);
  }

  if (req.query && Object.keys(req.query).length > 0) {
    const sanitizedQuery = Object.assign({}, req.query);
    sanitizeObject(sanitizedQuery, true);
  }

  if (req.params) {
    sanitizeObject(req.params, true);
  }

  next();
};