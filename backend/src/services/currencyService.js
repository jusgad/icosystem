const axios = require('axios');
const redis = require('../config/redis');
const cron = require('node-cron');

class CurrencyService {
  constructor() {
    this.baseUrl = process.env.EXCHANGE_RATE_BASE_URL;
    this.apiKey = process.env.EXCHANGE_RATE_API_KEY;
    this.cacheKey = 'exchange_rates';
    this.cacheDuration = 30 * 60;
    
    this.startPeriodicUpdate();
  }

  async getExchangeRates() {
    try {
      const cachedRates = await redis.get(this.cacheKey);
      if (cachedRates) {
        return JSON.parse(cachedRates);
      }

      const response = await axios.get(`${this.baseUrl}/COP`);
      const rates = response.data.rates;

      await redis.setex(this.cacheKey, this.cacheDuration, JSON.stringify(rates));
      return rates;
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      
      const fallbackRates = {
        COP: 1,
        USD: 0.00025,
        EUR: 0.00023
      };
      return fallbackRates;
    }
  }

  async convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    const rates = await this.getExchangeRates();
    
    let amountInCOP = amount;
    if (fromCurrency !== 'COP') {
      amountInCOP = amount / rates[fromCurrency];
    }

    if (toCurrency === 'COP') {
      return amountInCOP;
    }

    return amountInCOP * rates[toCurrency];
  }

  async updateExchangeRates() {
    try {
      console.log('Updating exchange rates...');
      await this.getExchangeRates();
      console.log('Exchange rates updated successfully');
    } catch (error) {
      console.error('Failed to update exchange rates:', error);
    }
  }

  startPeriodicUpdate() {
    cron.schedule('*/30 * * * *', () => {
      this.updateExchangeRates();
    });
  }

  async getConvertedTrainingCost(currency = 'COP') {
    const baseCost = parseFloat(process.env.BASE_TRAINING_COST) || 60000;
    return await this.convertCurrency(baseCost, 'COP', currency);
  }
}

module.exports = new CurrencyService();