const User = require('./User');
const Entrepreneur = require('./Entrepreneur');
const Ally = require('./Ally');
const Client = require('./Client');
const Meeting = require('./Meeting');
const Message = require('./Message');
const Document = require('./Document');
const Notification = require('./Notification');

User.hasOne(Entrepreneur, { foreignKey: 'userId', as: 'entrepreneur' });
Entrepreneur.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(Ally, { foreignKey: 'userId', as: 'ally' });
Ally.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(Client, { foreignKey: 'userId', as: 'client' });
Client.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Entrepreneur.belongsTo(User, { foreignKey: 'assignedAllyId', as: 'assignedAlly' });
User.hasMany(Entrepreneur, { foreignKey: 'assignedAllyId', as: 'assignedEntrepreneurs' });

User.hasMany(Meeting, { foreignKey: 'organizerId', as: 'organizedMeetings' });
Meeting.belongsTo(User, { foreignKey: 'organizerId', as: 'organizer' });

Meeting.belongsTo(Entrepreneur, { foreignKey: 'entrepreneurId', as: 'entrepreneur' });
Entrepreneur.hasMany(Meeting, { foreignKey: 'entrepreneurId', as: 'meetings' });

User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

User.hasMany(Document, { foreignKey: 'uploadedById', as: 'uploadedDocuments' });
Document.belongsTo(User, { foreignKey: 'uploadedById', as: 'uploadedBy' });

Entrepreneur.hasMany(Document, { foreignKey: 'entrepreneurId', as: 'documents' });
Document.belongsTo(Entrepreneur, { foreignKey: 'entrepreneurId', as: 'entrepreneur' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  User,
  Entrepreneur,
  Ally,
  Client,
  Meeting,
  Message,
  Document,
  Notification
};