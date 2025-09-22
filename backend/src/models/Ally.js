const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Ally = sequelize.define('Ally', {
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
  specialization: {
    type: DataTypes.STRING,
    allowNull: false
  },
  experience: {
    type: DataTypes.TEXT
  },
  expertise: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  totalMentoringHours: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'allies',
  timestamps: true
});

module.exports = Ally;