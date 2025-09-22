const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Client = sequelize.define('Client', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  organization: {
    type: DataTypes.STRING
  },
  sector: {
    type: DataTypes.STRING
  },
  interests: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  preferredCurrency: {
    type: DataTypes.ENUM('COP', 'USD', 'EUR'),
    defaultValue: 'COP'
  },
  notificationPreferences: {
    type: DataTypes.JSONB,
    defaultValue: {
      email: true,
      dashboard: true,
      reports: true
    }
  }
}, {
  tableName: 'clients',
  timestamps: true
});

module.exports = Client;