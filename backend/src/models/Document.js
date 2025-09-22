const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileSize: {
    type: DataTypes.INTEGER
  },
  fileType: {
    type: DataTypes.STRING
  },
  uploadedById: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  entrepreneurId: {
    type: DataTypes.UUID,
    references: {
      model: 'entrepreneurs',
      key: 'id'
    }
  },
  documentType: {
    type: DataTypes.ENUM('business_plan', 'financial_report', 'presentation', 'legal_document', 'other'),
    defaultValue: 'other'
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  }
}, {
  tableName: 'documents',
  timestamps: true
});

module.exports = Document;