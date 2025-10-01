const { body, param, query, validationResult } = require('express-validator');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Validaciones comunes
const commonValidations = {
  uuid: (field) => param(field).isUUID().withMessage('Invalid UUID format'),
  email: (field = 'email') => body(field).isEmail().normalizeEmail().withMessage('Invalid email format'),
  notEmpty: (field, message) => body(field).notEmpty().trim().withMessage(message || `${field} is required`),
  isBoolean: (field) => body(field).optional().isBoolean().withMessage(`${field} must be a boolean`),
  isInt: (field, options = {}) => body(field).optional().isInt(options).withMessage(`${field} must be an integer`),
  isFloat: (field) => body(field).optional().isFloat({ min: 0 }).withMessage(`${field} must be a positive number`),
  isDate: (field) => body(field).isISO8601().toDate().withMessage(`${field} must be a valid date`),
  sanitizeString: (field) => body(field).trim().escape(),
  isIn: (field, values) => body(field).isIn(values).withMessage(`${field} must be one of: ${values.join(', ')}`),
};

// Validaciones específicas por módulo
const authValidation = {
  register: [
    body('token').notEmpty().withMessage('Token is required'),
    body('role').isIn(['super_user', 'entrepreneur', 'ally', 'client']).withMessage('Invalid role'),
    body('additionalData').optional().isObject().withMessage('Additional data must be an object'),
    handleValidationErrors
  ],

  login: [
    body('token').notEmpty().withMessage('Token is required'),
    handleValidationErrors
  ],

  updateProfile: [
    body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('profilePicture').optional().isURL().withMessage('Profile picture must be a valid URL'),
    handleValidationErrors
  ]
};

const documentValidation = {
  upload: [
    body('title').optional().trim().isLength({ max: 255 }).withMessage('Title too long'),
    body('documentType').optional().isIn(['business_plan', 'financial_report', 'presentation', 'legal_document', 'other']),
    body('isPublic').optional().isBoolean(),
    body('tags').optional().customSanitizer(value => {
      if (typeof value === 'string') {
        return value.split(',').map(tag => tag.trim()).filter(tag => tag).slice(0, 10);
      }
      return Array.isArray(value) ? value.slice(0, 10) : [];
    }),
    handleValidationErrors
  ],

  update: [
    param('id').isUUID().withMessage('Invalid document ID'),
    body('title').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Title must be between 1 and 255 characters'),
    body('documentType').optional().isIn(['business_plan', 'financial_report', 'presentation', 'legal_document', 'other']),
    body('isPublic').optional().isBoolean(),
    body('tags').optional().isArray({ max: 10 }).withMessage('Tags must be an array with max 10 items'),
    handleValidationErrors
  ],

  getDocuments: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().trim().escape(),
    query('type').optional().isIn(['business_plan', 'financial_report', 'presentation', 'legal_document', 'other']),
    handleValidationErrors
  ]
};

const meetingValidation = {
  create: [
    body('title').notEmpty().trim().isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
    body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description too long'),
    body('startTime').isISO8601().toDate().withMessage('Start time must be a valid date'),
    body('endTime').isISO8601().toDate().withMessage('End time must be a valid date')
      .custom((endTime, { req }) => {
        if (new Date(endTime) <= new Date(req.body.startTime)) {
          throw new Error('End time must be after start time');
        }
        return true;
      }),
    body('entrepreneurId').optional().isUUID().withMessage('Invalid entrepreneur ID'),
    handleValidationErrors
  ],

  update: [
    param('id').isUUID().withMessage('Invalid meeting ID'),
    body('title').optional().trim().isLength({ min: 3, max: 200 }),
    body('description').optional().trim().isLength({ max: 1000 }),
    body('status').optional().isIn(['scheduled', 'completed', 'cancelled']),
    body('trainingHours').optional().isFloat({ min: 0, max: 24 }).withMessage('Training hours must be between 0 and 24'),
    handleValidationErrors
  ]
};

const messageValidation = {
  send: [
    body('receiverId').isUUID().withMessage('Invalid receiver ID'),
    body('content').notEmpty().trim().isLength({ min: 1, max: 5000 }).withMessage('Content must be between 1 and 5000 characters'),
    body('messageType').optional().isIn(['text', 'file', 'notification']),
    body('attachments').optional().isArray({ max: 5 }).withMessage('Maximum 5 attachments allowed'),
    handleValidationErrors
  ],

  searchUsers: [
    query('query').notEmpty().trim().isLength({ min: 2, max: 100 }).withMessage('Search query must be between 2 and 100 characters'),
    handleValidationErrors
  ]
};

const entrepreneurValidation = {
  updateLifecycle: [
    body('stage').isIn(['ideacion', 'preincubacion', 'incubacion', 'aceleracion', 'consolidacion']).withMessage('Invalid stage'),
    body('responses').isObject().withMessage('Responses must be an object'),
    handleValidationErrors
  ]
};

const reportValidation = {
  getMetrics: [
    query('currency').optional().isIn(['COP', 'USD', 'EUR']).withMessage('Invalid currency'),
    query('startDate').optional().isISO8601().toDate(),
    query('endDate').optional().isISO8601().toDate(),
    handleValidationErrors
  ]
};

// Validación de filename seguro
const sanitizeFilename = (filename) => {
  // Remover path traversal
  let clean = filename.replace(/\.\./g, '');
  // Remover caracteres especiales peligrosos
  clean = clean.replace(/[^a-zA-Z0-9._-]/g, '_');
  // Limitar longitud
  if (clean.length > 255) {
    const ext = clean.split('.').pop();
    clean = clean.substring(0, 250 - ext.length) + '.' + ext;
  }
  return clean;
};

// Validación de tamaño de archivo
const validateFileSize = (maxSize = 10485760) => { // 10MB default
  return (req, res, next) => {
    if (req.file && req.file.size > maxSize) {
      return res.status(400).json({
        error: 'File too large',
        maxSize: `${maxSize / 1048576}MB`
      });
    }
    next();
  };
};

module.exports = {
  handleValidationErrors,
  commonValidations,
  authValidation,
  documentValidation,
  meetingValidation,
  messageValidation,
  entrepreneurValidation,
  reportValidation,
  sanitizeFilename,
  validateFileSize
};
