const { Document, User, Entrepreneur } = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const { validatePath, validateFileType, securityLogger } = require('../middleware/security');
const { sanitizeFilename } = require('../middleware/validation');
const logger = require('../utils/logger');

// Directorio seguro de uploads (fuera del código fuente)
const UPLOAD_BASE_PATH = process.env.UPLOAD_PATH || path.join(__dirname, '../../uploads');

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      // Crear estructura de carpetas por año/mes/usuario para mejor organización
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');

      const userFolder = path.join(UPLOAD_BASE_PATH, String(year), month, req.user.id);

      // Validar que la ruta no escape del directorio permitido
      validatePath(userFolder, UPLOAD_BASE_PATH);

      await fs.mkdir(userFolder, { recursive: true });
      cb(null, userFolder);
    } catch (error) {
      logger.error('Error creating upload directory', { error: error.message, userId: req.user.id });
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    try {
      // Sanitizar el nombre original
      const sanitizedOriginal = sanitizeFilename(file.originalname);
      const extension = path.extname(sanitizedOriginal);
      const nameWithoutExt = path.basename(sanitizedOriginal, extension);

      // Generar nombre único y seguro
      const uniqueId = crypto.randomBytes(16).toString('hex');
      const timestamp = Date.now();
      const filename = `${nameWithoutExt.substring(0, 50)}-${timestamp}-${uniqueId}${extension}`;

      cb(null, filename);
    } catch (error) {
      logger.error('Error generating filename', { error: error.message });
      cb(error, null);
    }
  }
});

const fileFilter = async (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain'
  ];

  // Validar MIME type
  if (!allowedTypes.includes(file.mimetype)) {
    securityLogger('Rejected file upload - invalid MIME type', {
      mimetype: file.mimetype,
      originalname: file.originalname
    }, req);
    return cb(new Error('Tipo de archivo no permitido'), false);
  }

  // Validar extensión
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.jpg', '.jpeg', '.png', '.gif', '.txt'];

  if (!allowedExtensions.includes(ext)) {
    securityLogger('Rejected file upload - invalid extension', {
      extension: ext,
      originalname: file.originalname
    }, req);
    return cb(new Error('Extensión de archivo no permitida'), false);
  }

  cb(null, true);
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
    files: 1, // Solo un archivo a la vez
    fields: 10,
    fileSize: 10485760,
    parts: 100
  },
  fileFilter: fileFilter
});

class DocumentController {
  constructor() {
    this.upload = upload;
  }

  async uploadDocument(req, res) {
    try {
      const { title, documentType = 'other', isPublic = false, tags = [] } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      let entrepreneurId = null;
      if (req.user.role === 'entrepreneur') {
        const entrepreneur = await Entrepreneur.findOne({ where: { userId: req.user.id } });
        entrepreneurId = entrepreneur?.id;
      }

      const document = await Document.create({
        title: title || file.originalname,
        filename: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        fileType: file.mimetype,
        uploadedById: req.user.id,
        entrepreneurId,
        documentType,
        isPublic: isPublic === 'true',
        tags: Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim())
      });

      const documentWithUser = await Document.findByPk(document.id, {
        include: [
          { model: User, as: 'uploadedBy', attributes: ['id', 'name'] },
          { model: Entrepreneur, as: 'entrepreneur', attributes: ['id'] }
        ]
      });

      res.status(201).json({
        message: 'Document uploaded successfully',
        document: documentWithUser
      });
    } catch (error) {
      console.error('Upload document error:', error);
      res.status(500).json({ error: 'Failed to upload document' });
    }
  }

  async getDocuments(req, res) {
    try {
      const { page = 1, limit = 20, type, tags, search } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      
      if (req.user.role === 'entrepreneur') {
        const entrepreneur = await Entrepreneur.findOne({ where: { userId: req.user.id } });
        whereClause.entrepreneurId = entrepreneur?.id;
      } else if (req.user.role === 'ally') {
        // Allies can see documents from their assigned entrepreneurs
        const assignedEntrepreneurs = await Entrepreneur.findAll({
          where: { assignedAllyId: req.user.id },
          attributes: ['id']
        });
        const entrepreneurIds = assignedEntrepreneurs.map(e => e.id);
        whereClause.entrepreneurId = entrepreneurIds;
      } else if (req.user.role === 'client') {
        // Clients can only see public documents
        whereClause.isPublic = true;
      }
      // Super users can see all documents

      if (type) {
        whereClause.documentType = type;
      }

      if (tags) {
        const tagArray = tags.split(',');
        whereClause.tags = { [require('sequelize').Op.overlap]: tagArray };
      }

      if (search) {
        whereClause[require('sequelize').Op.or] = [
          { title: { [require('sequelize').Op.iLike]: `%${search}%` } },
          { filename: { [require('sequelize').Op.iLike]: `%${search}%` } }
        ];
      }

      const documents = await Document.findAndCountAll({
        where: whereClause,
        include: [
          { model: User, as: 'uploadedBy', attributes: ['id', 'name'] },
          { model: Entrepreneur, as: 'entrepreneur', attributes: ['id'] }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      res.json({
        documents: documents.rows,
        pagination: {
          total: documents.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(documents.count / limit)
        }
      });
    } catch (error) {
      console.error('Get documents error:', error);
      res.status(500).json({ error: 'Failed to get documents' });
    }
  }

  async downloadDocument(req, res) {
    try {
      const { id } = req.params;

      const document = await Document.findByPk(id, {
        include: [
          { model: Entrepreneur, as: 'entrepreneur' }
        ]
      });

      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      // Check permissions
      const canAccess =
        req.user.role === 'super_user' ||
        document.uploadedById === req.user.id ||
        (req.user.role === 'ally' && document.entrepreneur?.assignedAllyId === req.user.id) ||
        (req.user.role === 'client' && document.isPublic);

      if (!canAccess) {
        securityLogger('Unauthorized document download attempt', {
          documentId: id,
          userId: req.user.id,
          userRole: req.user.role
        }, req);
        return res.status(403).json({ error: 'Access denied' });
      }

      try {
        // Validar que el path es seguro
        const safePath = validatePath(document.filePath, UPLOAD_BASE_PATH);

        // Verificar que el archivo existe
        await fs.access(safePath);

        // Log de descarga para auditoría
        logger.info('Document downloaded', {
          documentId: id,
          userId: req.user.id,
          filename: document.filename
        });

        // Configurar headers de seguridad para descarga
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(document.filename)}"`);
        res.setHeader('Content-Type', document.fileType);
        res.setHeader('X-Content-Type-Options', 'nosniff');

        res.download(safePath, document.filename);
      } catch (fileError) {
        logger.error('File not found on server', {
          documentId: id,
          filePath: document.filePath,
          error: fileError.message
        });
        return res.status(404).json({ error: 'File not found on server' });
      }
    } catch (error) {
      logger.error('Download document error', { error: error.message, documentId: req.params.id });
      res.status(500).json({ error: 'Failed to download document' });
    }
  }

  async deleteDocument(req, res) {
    try {
      const { id } = req.params;

      const document = await Document.findByPk(id);

      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      // Check permissions
      const canDelete = 
        req.user.role === 'super_user' ||
        document.uploadedById === req.user.id;

      if (!canDelete) {
        return res.status(403).json({ error: 'Access denied' });
      }

      try {
        await fs.unlink(document.filePath);
      } catch (fileError) {
        console.warn('File not found on disk:', document.filePath);
      }

      await document.destroy();

      res.json({ message: 'Document deleted successfully' });
    } catch (error) {
      console.error('Delete document error:', error);
      res.status(500).json({ error: 'Failed to delete document' });
    }
  }

  async updateDocument(req, res) {
    try {
      const { id } = req.params;
      const { title, documentType, isPublic, tags } = req.body;

      const document = await Document.findByPk(id);

      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      // Check permissions
      const canUpdate = 
        req.user.role === 'super_user' ||
        document.uploadedById === req.user.id;

      if (!canUpdate) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const updateData = {};
      if (title) updateData.title = title;
      if (documentType) updateData.documentType = documentType;
      if (isPublic !== undefined) updateData.isPublic = isPublic;
      if (tags) updateData.tags = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());

      await document.update(updateData);

      const updatedDocument = await Document.findByPk(document.id, {
        include: [
          { model: User, as: 'uploadedBy', attributes: ['id', 'name'] },
          { model: Entrepreneur, as: 'entrepreneur', attributes: ['id'] }
        ]
      });

      res.json({
        message: 'Document updated successfully',
        document: updatedDocument
      });
    } catch (error) {
      console.error('Update document error:', error);
      res.status(500).json({ error: 'Failed to update document' });
    }
  }

  async getDocumentTypes(req, res) {
    const types = [
      { value: 'business_plan', label: 'Plan de Negocio' },
      { value: 'financial_report', label: 'Reporte Financiero' },
      { value: 'presentation', label: 'Presentación' },
      { value: 'legal_document', label: 'Documento Legal' },
      { value: 'other', label: 'Otro' }
    ];

    res.json({ types });
  }
}

module.exports = new DocumentController();