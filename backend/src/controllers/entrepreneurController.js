const { Entrepreneur, User, Meeting, Document } = require('../models');
const currencyService = require('../services/currencyService');

class EntrepreneurController {
  async updateLifecycleForm(req, res) {
    try {
      const { stage, responses } = req.body;
      const entrepreneur = await Entrepreneur.findOne({
        where: { userId: req.user.id }
      });

      if (!entrepreneur) {
        return res.status(404).json({ error: 'Entrepreneur profile not found' });
      }

      const currentResponses = entrepreneur.lifecycleResponses || {};
      currentResponses[stage] = responses;

      const progress = this.calculateProgress(currentResponses);

      await entrepreneur.update({
        currentStage: stage,
        lifecycleResponses: currentResponses,
        progressPercentage: progress
      });

      res.json({
        message: 'Lifecycle form updated successfully',
        entrepreneur: entrepreneur,
        progress: progress
      });
    } catch (error) {
      console.error('Update lifecycle form error:', error);
      res.status(500).json({ error: 'Failed to update lifecycle form' });
    }
  }

  calculateProgress(responses) {
    const stages = ['ideacion', 'preincubacion', 'incubacion', 'aceleracion', 'consolidacion'];
    const questionsPerStage = {
      ideacion: 3,
      preincubacion: 3,
      incubacion: 3,
      aceleracion: 3,
      consolidacion: 3
    };

    let totalQuestions = 0;
    let answeredQuestions = 0;

    stages.forEach(stage => {
      totalQuestions += questionsPerStage[stage];
      if (responses[stage]) {
        answeredQuestions += Object.keys(responses[stage]).length;
      }
    });

    return Math.round((answeredQuestions / totalQuestions) * 100);
  }

  async getDashboard(req, res) {
    try {
      const entrepreneur = await Entrepreneur.findOne({
        where: { userId: req.user.id },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['name', 'email']
          },
          {
            model: User,
            as: 'assignedAlly',
            attributes: ['name', 'email']
          },
          {
            model: Meeting,
            as: 'meetings',
            where: { status: 'scheduled' },
            required: false,
            limit: 5,
            order: [['startTime', 'ASC']]
          }
        ]
      });

      if (!entrepreneur) {
        return res.status(404).json({ error: 'Entrepreneur profile not found' });
      }

      const trainingCost = await currencyService.getConvertedTrainingCost('COP');
      const totalInvestment = entrepreneur.trainingHours * (trainingCost / 10);

      const dashboardData = {
        entrepreneur: entrepreneur,
        progress: {
          percentage: entrepreneur.progressPercentage,
          currentStage: entrepreneur.currentStage,
          trainingHours: entrepreneur.trainingHours
        },
        investment: {
          totalHours: entrepreneur.trainingHours,
          costPerHour: trainingCost / 10,
          totalInvestment: totalInvestment
        },
        upcomingMeetings: entrepreneur.meetings
      };

      res.json(dashboardData);
    } catch (error) {
      console.error('Get entrepreneur dashboard error:', error);
      res.status(500).json({ error: 'Failed to get dashboard data' });
    }
  }

  async getLifecycleQuestions(req, res) {
    const questions = {
      ideacion: [
        { id: 'problem', question: '¿Cuál es el problema principal que resuelve?', type: 'text' },
        { id: 'validation', question: '¿Ha validado la necesidad?', type: 'boolean' },
        { id: 'prototype', question: '¿Tiene un prototipo?', type: 'boolean' }
      ],
      preincubacion: [
        { id: 'business_model', question: '¿Tiene un modelo de negocio?', type: 'boolean' },
        { id: 'target_customers', question: '¿Ha identificado a los clientes objetivo?', type: 'boolean' },
        { id: 'pilot_tests', question: '¿Ha realizado pruebas piloto?', type: 'boolean' }
      ],
      incubacion: [
        { id: 'financial_plan', question: '¿Tiene un plan financiero?', type: 'boolean' },
        { id: 'partnerships', question: '¿Ha establecido alianzas?', type: 'boolean' },
        { id: 'team', question: '¿Tiene un equipo formalizado?', type: 'boolean' }
      ],
      aceleracion: [
        { id: 'external_investment', question: '¿Ha recibido inversión externa?', type: 'boolean' },
        { id: 'growth_rate', question: '¿Cuál es su tasa de crecimiento?', type: 'number' },
        { id: 'retention_metrics', question: '¿Tiene métricas de retención de clientes?', type: 'boolean' }
      ],
      consolidacion: [
        { id: 'recurring_revenue', question: '¿Genera ingresos recurrentes?', type: 'boolean' },
        { id: 'international_markets', question: '¿Ha escalado a mercados internacionales?', type: 'boolean' },
        { id: 'automated_processes', question: '¿Cuenta con procesos automatizados?', type: 'boolean' }
      ]
    };

    res.json({ questions });
  }
}

module.exports = new EntrepreneurController();