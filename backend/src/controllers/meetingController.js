const { Meeting, User, Entrepreneur } = require('../models');
const googleMeetService = require('../services/googleMeetService');
const { Op } = require('sequelize');

class MeetingController {
  async createMeeting(req, res) {
    try {
      const {
        title,
        description,
        startTime,
        endTime,
        entrepreneurId,
        attendees = []
      } = req.body;

      if (!title || !startTime || !endTime) {
        return res.status(400).json({ error: 'Title, start time, and end time are required' });
      }

      const startDate = new Date(startTime);
      const endDate = new Date(endTime);

      if (startDate >= endDate) {
        return res.status(400).json({ error: 'End time must be after start time' });
      }

      if (startDate < new Date()) {
        return res.status(400).json({ error: 'Meeting cannot be scheduled in the past' });
      }

      let googleMeetLink = null;
      try {
        if (req.body.createGoogleMeet && req.body.accessToken) {
          const meetingData = {
            title,
            description,
            startTime: startDate.toISOString(),
            endTime: endDate.toISOString(),
            attendees
          };
          
          const googleMeetResult = await googleMeetService.createMeeting(
            meetingData, 
            req.body.accessToken
          );
          googleMeetLink = googleMeetResult.meetLink;
        } else {
          googleMeetLink = googleMeetService.generateInstantMeetLink();
        }
      } catch (googleError) {
        console.warn('Google Meet creation failed, using fallback:', googleError);
        googleMeetLink = googleMeetService.generateInstantMeetLink();
      }

      const meeting = await Meeting.create({
        title,
        description,
        startTime: startDate,
        endTime: endDate,
        googleMeetLink,
        organizerId: req.user.id,
        entrepreneurId: entrepreneurId || null
      });

      const meetingWithRelations = await Meeting.findByPk(meeting.id, {
        include: [
          { model: User, as: 'organizer', attributes: ['id', 'name', 'email'] },
          { model: Entrepreneur, as: 'entrepreneur', include: [
            { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
          ]}
        ]
      });

      res.status(201).json({
        message: 'Meeting created successfully',
        meeting: meetingWithRelations
      });
    } catch (error) {
      console.error('Create meeting error:', error);
      res.status(500).json({ error: 'Failed to create meeting' });
    }
  }

  async getMeetings(req, res) {
    try {
      const { page = 1, limit = 20, status, startDate, endDate } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};

      if (req.user.role === 'entrepreneur') {
        const entrepreneur = await Entrepreneur.findOne({ where: { userId: req.user.id } });
        whereClause.entrepreneurId = entrepreneur?.id;
      } else if (req.user.role === 'ally') {
        whereClause[Op.or] = [
          { organizerId: req.user.id },
          { '$entrepreneur.assignedAllyId$': req.user.id }
        ];
      } else if (req.user.role !== 'super_user') {
        whereClause.organizerId = req.user.id;
      }

      if (status) {
        whereClause.status = status;
      }

      if (startDate || endDate) {
        whereClause.startTime = {};
        if (startDate) {
          whereClause.startTime[Op.gte] = new Date(startDate);
        }
        if (endDate) {
          whereClause.startTime[Op.lte] = new Date(endDate);
        }
      }

      const meetings = await Meeting.findAndCountAll({
        where: whereClause,
        include: [
          { model: User, as: 'organizer', attributes: ['id', 'name', 'email'] },
          { model: Entrepreneur, as: 'entrepreneur', include: [
            { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
          ]}
        ],
        order: [['startTime', 'ASC']],
        limit: parseInt(limit),
        offset
      });

      res.json({
        meetings: meetings.rows,
        pagination: {
          total: meetings.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(meetings.count / limit)
        }
      });
    } catch (error) {
      console.error('Get meetings error:', error);
      res.status(500).json({ error: 'Failed to get meetings' });
    }
  }

  async updateMeeting(req, res) {
    try {
      const { id } = req.params;
      const {
        title,
        description,
        startTime,
        endTime,
        status,
        notes,
        trainingHours
      } = req.body;

      const meeting = await Meeting.findByPk(id, {
        include: [{ model: Entrepreneur, as: 'entrepreneur' }]
      });

      if (!meeting) {
        return res.status(404).json({ error: 'Meeting not found' });
      }

      const canUpdate = 
        req.user.role === 'super_user' ||
        meeting.organizerId === req.user.id ||
        (req.user.role === 'ally' && meeting.entrepreneur?.assignedAllyId === req.user.id);

      if (!canUpdate) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const updateData = {};
      if (title) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (startTime) updateData.startTime = new Date(startTime);
      if (endTime) updateData.endTime = new Date(endTime);
      if (status) updateData.status = status;
      if (notes !== undefined) updateData.notes = notes;
      if (trainingHours !== undefined) updateData.trainingHours = trainingHours;

      await meeting.update(updateData);

      if (status === 'completed' && trainingHours && meeting.entrepreneurId) {
        const entrepreneur = await Entrepreneur.findByPk(meeting.entrepreneurId);
        if (entrepreneur) {
          await entrepreneur.update({
            trainingHours: entrepreneur.trainingHours + parseFloat(trainingHours)
          });
        }
      }

      const updatedMeeting = await Meeting.findByPk(meeting.id, {
        include: [
          { model: User, as: 'organizer', attributes: ['id', 'name', 'email'] },
          { model: Entrepreneur, as: 'entrepreneur', include: [
            { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
          ]}
        ]
      });

      res.json({
        message: 'Meeting updated successfully',
        meeting: updatedMeeting
      });
    } catch (error) {
      console.error('Update meeting error:', error);
      res.status(500).json({ error: 'Failed to update meeting' });
    }
  }

  async deleteMeeting(req, res) {
    try {
      const { id } = req.params;

      const meeting = await Meeting.findByPk(id);

      if (!meeting) {
        return res.status(404).json({ error: 'Meeting not found' });
      }

      const canDelete = 
        req.user.role === 'super_user' ||
        meeting.organizerId === req.user.id;

      if (!canDelete) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await meeting.destroy();

      res.json({ message: 'Meeting deleted successfully' });
    } catch (error) {
      console.error('Delete meeting error:', error);
      res.status(500).json({ error: 'Failed to delete meeting' });
    }
  }

  async getUpcomingMeetings(req, res) {
    try {
      const { limit = 5 } = req.query;
      
      const whereClause = {
        startTime: { [Op.gte]: new Date() },
        status: 'scheduled'
      };

      if (req.user.role === 'entrepreneur') {
        const entrepreneur = await Entrepreneur.findOne({ where: { userId: req.user.id } });
        whereClause.entrepreneurId = entrepreneur?.id;
      } else if (req.user.role === 'ally') {
        whereClause[Op.or] = [
          { organizerId: req.user.id },
          { '$entrepreneur.assignedAllyId$': req.user.id }
        ];
      } else if (req.user.role !== 'super_user') {
        whereClause.organizerId = req.user.id;
      }

      const meetings = await Meeting.findAll({
        where: whereClause,
        include: [
          { model: User, as: 'organizer', attributes: ['id', 'name'] },
          { model: Entrepreneur, as: 'entrepreneur', include: [
            { model: User, as: 'user', attributes: ['id', 'name'] }
          ]}
        ],
        order: [['startTime', 'ASC']],
        limit: parseInt(limit)
      });

      res.json({ meetings });
    } catch (error) {
      console.error('Get upcoming meetings error:', error);
      res.status(500).json({ error: 'Failed to get upcoming meetings' });
    }
  }

  async getAvailableEntrepreneurs(req, res) {
    try {
      if (req.user.role === 'ally') {
        const entrepreneurs = await Entrepreneur.findAll({
          where: { assignedAllyId: req.user.id },
          include: [
            { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
          ]
        });
        return res.json({ entrepreneurs });
      }

      if (req.user.role === 'super_user') {
        const entrepreneurs = await Entrepreneur.findAll({
          include: [
            { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
          ]
        });
        return res.json({ entrepreneurs });
      }

      res.json({ entrepreneurs: [] });
    } catch (error) {
      console.error('Get available entrepreneurs error:', error);
      res.status(500).json({ error: 'Failed to get entrepreneurs' });
    }
  }
}

module.exports = new MeetingController();