const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');
const crypto = require('crypto');

// Rate limiting por IP y por usuario
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      // Usar user ID si está autenticado, sino IP
      return req.user?.id || req.ip;
    }
  });
};

// Rate limiters específicos
const rateLimiters = {
  // Endpoints de autenticación - más restrictivo
  auth: createRateLimiter(15 * 60 * 1000, 5, 'Too many authentication attempts'),

  // Endpoints generales
  general: createRateLimiter(15 * 60 * 1000, 100, 'Too many requests'),

  // Upload de archivos - muy restrictivo
  upload: createRateLimiter(60 * 60 * 1000, 20, 'Too many upload attempts'),

  // Endpoints de mensajería
  messaging: createRateLimiter(60 * 1000, 30, 'Too many messages sent'),

  // Endpoints de reportes - moderado
  reports: createRateLimiter(60 * 1000, 10, 'Too many report requests')
};

// Configuración de Helmet mejorada
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:3001'],
      frameSrc: ["'self'", 'https://meet.google.com'],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
  hidePoweredBy: true,
  frameguard: { action: 'deny' }
});

// Sanitización de queries SQL/NoSQL injection
const sanitizeInput = (req, res, next) => {
  // Sanitizar body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitizar query params
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  // Sanitizar params
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  const sanitized = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      // Prevenir prototype pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }

      const value = obj[key];

      if (typeof value === 'string') {
        // Escapar caracteres SQL peligrosos
        sanitized[key] = value.replace(/[;'"\\]/g, '');
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
  }

  return sanitized;
};

// Validación de path traversal
const validatePath = (filePath, allowedDirectory) => {
  const resolvedPath = path.resolve(filePath);
  const resolvedAllowedDir = path.resolve(allowedDirectory);

  if (!resolvedPath.startsWith(resolvedAllowedDir)) {
    throw new Error('Invalid file path');
  }

  return resolvedPath;
};

// Validación de tipo de archivo por contenido (magic numbers)
const validateFileType = async (buffer, allowedTypes) => {
  const fileSignatures = {
    'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
    'image/jpeg': [[0xFF, 0xD8, 0xFF]],
    'image/png': [[0x89, 0x50, 0x4E, 0x47]],
    'image/gif': [[0x47, 0x49, 0x46, 0x38]],
    'application/zip': [[0x50, 0x4B, 0x03, 0x04], [0x50, 0x4B, 0x05, 0x06]],
    'application/vnd.openxmlformats-officedocument': [[0x50, 0x4B, 0x03, 0x04]],
  };

  for (const [mimeType, signatures] of Object.entries(fileSignatures)) {
    if (!allowedTypes.some(type => mimeType.includes(type))) continue;

    for (const signature of signatures) {
      let matches = true;
      for (let i = 0; i < signature.length; i++) {
        if (buffer[i] !== signature[i]) {
          matches = false;
          break;
        }
      }
      if (matches) return true;
    }
  }

  return false;
};

// Generar token CSRF
const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Middleware CSRF
const csrfProtection = (req, res, next) => {
  // Excluir GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const token = req.headers['x-csrf-token'];
  const sessionToken = req.session?.csrfToken;

  if (!token || token !== sessionToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  next();
};

// Logging de eventos de seguridad
const securityLogger = (event, details, req) => {
  const logger = require('../utils/logger');

  logger.warn('Security Event', {
    event,
    details,
    ip: req.ip,
    user: req.user?.id,
    userAgent: req.get('user-agent'),
    timestamp: new Date().toISOString()
  });
};

// Detección de ataques comunes
const detectAttacks = (req, res, next) => {
  const suspiciousPatterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i, // SQL injection
    /((\%3C)|<)((\%2F)|\/)*[a-z0-9\%]+((\%3E)|>)/i, // XSS
    /((\%3C)|<)((\%69)|i|(\%49))((\%6D)|m|(\%4D))((\%67)|g|(\%47))[^\n]+((\%3E)|>)/i, // XSS img
    /\.\.[\/\\]/g, // Path traversal
  ];

  const checkString = (str) => {
    return suspiciousPatterns.some(pattern => pattern.test(str));
  };

  // Revisar todos los inputs
  const checkObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string' && checkString(obj[key])) {
        return true;
      } else if (typeof obj[key] === 'object') {
        if (checkObject(obj[key])) return true;
      }
    }
    return false;
  };

  if (
    (req.body && checkObject(req.body)) ||
    (req.query && checkObject(req.query)) ||
    (req.params && checkObject(req.params))
  ) {
    securityLogger('Potential attack detected', {
      body: req.body,
      query: req.query,
      params: req.params
    }, req);

    return res.status(400).json({ error: 'Invalid input detected' });
  }

  next();
};

// Middleware para prevenir información leakage en errores
const sanitizeError = (err, req, res, next) => {
  const logger = require('../utils/logger');

  // Log completo internamente
  logger.error('Application Error', {
    error: err.message,
    stack: err.stack,
    user: req.user?.id,
    path: req.path,
    method: req.method
  });

  // Respuesta genérica al cliente en producción
  if (process.env.NODE_ENV === 'production') {
    res.status(err.status || 500).json({
      error: 'An error occurred',
      requestId: req.id // Si usas request ID tracking
    });
  } else {
    // En desarrollo, más detalles
    res.status(err.status || 500).json({
      error: err.message,
      stack: err.stack
    });
  }
};

// Headers de seguridad adicionales
const securityHeaders = (req, res, next) => {
  // Prevenir clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevenir MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  next();
};

// Validar que el usuario tiene acceso al recurso
const validateResourceOwnership = (resourceGetter) => {
  return async (req, res, next) => {
    try {
      const resource = await resourceGetter(req);

      if (!resource) {
        return res.status(404).json({ error: 'Resource not found' });
      }

      // Super users siempre tienen acceso
      if (req.user.role === 'super_user') {
        req.resource = resource;
        return next();
      }

      // Verificar ownership
      const isOwner =
        resource.userId === req.user.id ||
        resource.uploadedById === req.user.id ||
        resource.organizerId === req.user.id ||
        resource.senderId === req.user.id;

      if (!isOwner) {
        securityLogger('Unauthorized resource access attempt', {
          resourceId: req.params.id,
          resourceType: resource.constructor.name
        }, req);

        return res.status(403).json({ error: 'Access denied' });
      }

      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  rateLimiters,
  helmetConfig,
  sanitizeInput,
  validatePath,
  validateFileType,
  generateCSRFToken,
  csrfProtection,
  securityLogger,
  detectAttacks,
  sanitizeError,
  securityHeaders,
  validateResourceOwnership
};
