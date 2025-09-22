const { Document, User, Entrepreneur } = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    const userFolder = path.join(uploadPath, req.user.id);
    
    try {
      await fs.mkdir(userFolder, { recursive: true });
      cb(null, userFolder);
    } catch (error) {
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = file.fieldname + '-' + uniqueSuffix + extension;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
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

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB
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
        return res.status(403).json({ error: 'Access denied' });
      }

      try {
        await fs.access(document.filePath);
        res.download(document.filePath, document.filename);
      } catch (fileError) {
        return res.status(404).json({ error: 'File not found on server' });
      }
    } catch (error) {
      console.error('Download document error:', error);
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