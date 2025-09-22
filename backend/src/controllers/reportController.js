const { User, Entrepreneur, Meeting, Document, Message } = require('../models');
const currencyService = require('../services/currencyService');
const { Op } = require('sequelize');

class ReportController {
  async getImpactMetrics(req, res) {
    try {
      const { currency = 'COP', startDate, endDate } = req.query;

      let dateFilter = {};
      if (startDate || endDate) {
        dateFilter.createdAt = {};
        if (startDate) dateFilter.createdAt[Op.gte] = new Date(startDate);
        if (endDate) dateFilter.createdAt[Op.lte] = new Date(endDate);
      }

      // Get basic counts
      const totalEntrepreneurs = await Entrepreneur.count({ where: dateFilter });
      const vulnerablePopulationCount = await Entrepreneur.count({
        where: { ...dateFilter, isVulnerablePopulation: true }
      });

      // Get entrepreneurs by stage
      const entrepreneursByStage = await Entrepreneur.findAll({
        where: dateFilter,
        attributes: [
          'currentStage',
          [require('sequelize').fn('COUNT', require('sequelize').col('currentStage')), 'count']
        ],
        group: ['currentStage']
      });

      // Get total training hours and calculate investment
      const totalTrainingHours = await Entrepreneur.sum('trainingHours', { where: dateFilter });
      const baseCostPerSession = await currencyService.getConvertedTrainingCost(currency);
      const totalInvestment = (totalTrainingHours || 0) * (baseCostPerSession / 10); // 10 entrepreneurs per session

      // Get meetings metrics
      const totalMeetings = await Meeting.count({ where: dateFilter });
      const completedMeetings = await Meeting.count({
        where: { ...dateFilter, status: 'completed' }
      });

      // Get document metrics
      const totalDocuments = await Document.count({ where: dateFilter });
      const publicDocuments = await Document.count({
        where: { ...dateFilter, isPublic: true }
      });

      // Calculate percentages
      const vulnerablePopulationPercentage = totalEntrepreneurs > 0 
        ? Math.round((vulnerablePopulationCount / totalEntrepreneurs) * 100) 
        : 0;

      const completionRate = totalMeetings > 0 
        ? Math.round((completedMeetings / totalMeetings) * 100) 
        : 0;

      // Format stage data
      const stageData = entrepreneursByStage.reduce((acc, stage) => {
        acc[stage.currentStage] = parseInt(stage.dataValues.count);
        return acc;
      }, {});

      res.json({
        metrics: {
          totalEntrepreneurs,
          vulnerablePopulationCount,
          vulnerablePopulationPercentage,
          totalTrainingHours: totalTrainingHours || 0,
          totalInvestment,
          totalMeetings,
          completedMeetings,
          completionRate,
          totalDocuments,
          publicDocuments,
          baseCostPerSession,
          currency
        },
        stageDistribution: stageData,
        generatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get impact metrics error:', error);
      res.status(500).json({ error: 'Failed to get impact metrics' });
    }
  }

  async getEntrepreneurDirectory(req, res) {
    try {
      const { search, stage, isVulnerable, page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};

      if (search) {
        whereClause['$user.name$'] = { [Op.iLike]: `%${search}%` };
      }

      if (stage) {
        whereClause.currentStage = stage;
      }

      if (isVulnerable !== undefined) {
        whereClause.isVulnerablePopulation = isVulnerable === 'true';
      }

      const entrepreneurs = await Entrepreneur.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'profilePicture']
          },
          {
            model: User,
            as: 'assignedAlly',
            attributes: ['id', 'name', 'email'],
            required: false
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      const directory = entrepreneurs.rows.map(entrepreneur => ({
        id: entrepreneur.id,
        name: entrepreneur.user.name,
        email: entrepreneur.user.email,
        profilePicture: entrepreneur.user.profilePicture,
        currentStage: entrepreneur.currentStage,
        progressPercentage: entrepreneur.progressPercentage,
        trainingHours: entrepreneur.trainingHours,
        isVulnerablePopulation: entrepreneur.isVulnerablePopulation,
        assignedAlly: entrepreneur.assignedAlly,
        createdAt: entrepreneur.createdAt
      }));

      res.json({
        directory,
        pagination: {
          total: entrepreneurs.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(entrepreneurs.count / limit)
        }
      });
    } catch (error) {
      console.error('Get entrepreneur directory error:', error);
      res.status(500).json({ error: 'Failed to get entrepreneur directory' });
    }
  }

  async generateProgressReport(req, res) {
    try {
      const { startDate, endDate, format = 'json' } = req.query;

      let dateFilter = {};
      if (startDate || endDate) {
        dateFilter.createdAt = {};
        if (startDate) dateFilter.createdAt[Op.gte] = new Date(startDate);
        if (endDate) dateFilter.createdAt[Op.lte] = new Date(endDate);
      }

      // Get detailed entrepreneur progress
      const entrepreneurs = await Entrepreneur.findAll({
        where: dateFilter,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['name', 'email']
          },
          {
            model: Meeting,
            as: 'meetings',
            attributes: ['status', 'trainingHours', 'createdAt']
          }
        ]
      });

      const progressReport = entrepreneurs.map(entrepreneur => {
        const completedMeetings = entrepreneur.meetings.filter(m => m.status === 'completed').length;
        const totalMeetings = entrepreneur.meetings.length;
        
        return {
          id: entrepreneur.id,
          name: entrepreneur.user.name,
          email: entrepreneur.user.email,
          currentStage: entrepreneur.currentStage,
          progressPercentage: entrepreneur.progressPercentage,
          trainingHours: entrepreneur.trainingHours,
          isVulnerablePopulation: entrepreneur.isVulnerablePopulation,
          totalMeetings,
          completedMeetings,
          completionRate: totalMeetings > 0 ? Math.round((completedMeetings / totalMeetings) * 100) : 0,
          lastUpdate: entrepreneur.updatedAt
        };
      });

      if (format === 'csv') {
        const csv = this.convertToCSV(progressReport);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=progress-report.csv');
        return res.send(csv);
      }

      res.json({
        report: progressReport,
        summary: {
          totalEntrepreneurs: progressReport.length,
          averageProgress: Math.round(
            progressReport.reduce((sum, e) => sum + e.progressPercentage, 0) / progressReport.length
          ),
          totalTrainingHours: progressReport.reduce((sum, e) => sum + e.trainingHours, 0),
          vulnerablePopulation: progressReport.filter(e => e.isVulnerablePopulation).length
        },
        generatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Generate progress report error:', error);
      res.status(500).json({ error: 'Failed to generate progress report' });
    }
  }

  async getActivityMetrics(req, res) {
    try {
      const { period = '30' } = req.query; // days
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));

      const dateFilter = {
        createdAt: { [Op.gte]: startDate }
      };

      // Get activity by day
      const dailyActivity = await Promise.all([
        // New entrepreneurs
        User.findAll({
          where: { ...dateFilter, role: 'entrepreneur' },
          attributes: [
            [require('sequelize').fn('DATE', require('sequelize').col('createdAt')), 'date'],
            [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
          ],
          group: [require('sequelize').fn('DATE', require('sequelize').col('createdAt'))],
          order: [[require('sequelize').fn('DATE', require('sequelize').col('createdAt')), 'ASC']]
        }),
        // Meetings scheduled
        Meeting.findAll({
          where: dateFilter,
          attributes: [
            [require('sequelize').fn('DATE', require('sequelize').col('createdAt')), 'date'],
            [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
          ],
          group: [require('sequelize').fn('DATE', require('sequelize').col('createdAt'))],
          order: [[require('sequelize').fn('DATE', require('sequelize').col('createdAt')), 'ASC']]
        }),
        // Documents uploaded
        Document.findAll({
          where: dateFilter,
          attributes: [
            [require('sequelize').fn('DATE', require('sequelize').col('createdAt')), 'date'],
            [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
          ],
          group: [require('sequelize').fn('DATE', require('sequelize').col('createdAt'))],
          order: [[require('sequelize').fn('DATE', require('sequelize').col('createdAt')), 'ASC']]
        })
      ]);

      res.json({
        period: parseInt(period),
        newEntrepreneurs: dailyActivity[0],
        meetingsScheduled: dailyActivity[1],
        documentsUploaded: dailyActivity[2],
        generatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get activity metrics error:', error);
      res.status(500).json({ error: 'Failed to get activity metrics' });
    }
  }

  convertToCSV(data) {
    if (!data.length) return '';

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        }).join(',')
      )
    ].join('\n');

    return csvContent;
  }
}

module.exports = new ReportController();