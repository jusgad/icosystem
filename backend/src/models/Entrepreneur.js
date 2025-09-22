const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Entrepreneur = sequelize.define('Entrepreneur', {
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
  personalInfo: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  isVulnerablePopulation: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  currentStage: {
    type: DataTypes.ENUM('ideacion', 'preincubacion', 'incubacion', 'aceleracion', 'consolidacion'),
    defaultValue: 'ideacion'
  },
  lifecycleResponses: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  progressPercentage: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0
  },
  trainingHours: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0
  },
  assignedAllyId: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'entrepreneurs',
  timestamps: true
});

module.exports = Entrepreneur;