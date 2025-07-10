/**
 * AI API Routes
 * 
 * This file contains all routes related to AI features:
 * - Customer segmentation
 * - Demand forecasting
 * - Price optimization
 * - Product recommendations
 */

const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const customerSegmentation = require('../ai/customerSegmentation');
const demandForecasting = require('../ai/demandForecasting');
const priceOptimization = require('../ai/priceOptimization');
const recommendationEngine = require('../ai/recommendationEngine');
const logger = require('../utils/logger');

/**
 * @route   GET /api/ai/customer-segments
 * @desc    Get customer segments using RFM analysis
 * @access  Private (Admin)
 */
router.get('/customer-segments', auth(['admin']), [
  check('timeframe').optional().isIn(['30d', '90d', '180d', '365d']).withMessage('Invalid timeframe'),
  check('segment_count').optional().isInt({ min: 3, max: 10 }).withMessage('Segment count must be between 3 and 10')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const timeframe = req.query.timeframe || '90d';
    const segmentCount = req.query.segment_count ? parseInt(req.query.segment_count) : 5;
    
    const result = await customerSegmentation.performRFMAnalysis(timeframe, segmentCount);
    
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error(`Error in customer segmentation: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error during customer segmentation analysis',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/ai/demand-forecast
 * @desc    Get demand forecasts for inventory planning
 * @access  Private (Admin)
 */
router.get('/demand-forecast', auth(['admin']), [
  check('forecast_period').optional().isIn(['7d', '14d', '30d', '90d']).withMessage('Invalid forecast period'),
  check('category_id').optional().isInt().withMessage('Invalid category ID'),
  check('product_id').optional().isInt().withMessage('Invalid product ID')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const forecastPeriod = req.query.forecast_period || '30d';
    const categoryId = req.query.category_id ? parseInt(req.query.category_id) : null;
    const productId = req.query.product_id ? parseInt(req.query.product_id) : null;
    
    const result = await demandForecasting.generateDemandForecast(forecastPeriod, categoryId, productId);
    
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error(`Error in demand forecasting: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error during demand forecasting',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/ai/price-optimization
 * @desc    Get price optimization recommendations
 * @access  Private (Admin)
 */
router.get('/price-optimization', auth(['admin']), [
  check('optimization_target').optional().isIn(['revenue', 'profit', 'units']).withMessage('Invalid optimization target'),
  check('category_id').optional().isInt().withMessage('Invalid category ID'),
  check('product_id').optional().isInt().withMessage('Invalid product ID')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const optimizationTarget = req.query.optimization_target || 'revenue';
    const categoryId = req.query.category_id ? parseInt(req.query.category_id) : null;
    const productId = req.query.product_id ? parseInt(req.query.product_id) : null;
    
    const result = await priceOptimization.optimizePrices(optimizationTarget, categoryId, productId);
    
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error(`Error in price optimization: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error during price optimization',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/ai/price-simulation
 * @desc    Simulate price changes for a product
 * @access  Private (Admin)
 */
router.post('/price-simulation', auth(['admin']), [
  check('product_id').isInt().withMessage('Product ID is required'),
  check('price').isNumeric().withMessage('Valid price is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { product_id, price } = req.body;
    
    const result = await priceOptimization.simulatePrice(product_id, price);
    
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error(`Error in price simulation: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error during price simulation',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/ai/recommendations
 * @desc    Get personalized product recommendations for a customer
 * @access  Private (Customer, Cashier, Admin)
 */
router.get('/recommendations', auth(['customer', 'cashier', 'admin']), [
  check('customer_id').isInt().withMessage('Customer ID is required'),
  check('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const customerId = parseInt(req.query.customer_id);
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;
    
    // If user is a customer, verify they're requesting their own recommendations
    if (req.user.role === 'customer' && req.user.id !== customerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only view your own recommendations'
      });
    }
    
    const recommendations = await recommendationEngine.getAllRecommendations(customerId, limit);
    
    return res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    logger.error(`Error getting recommendations: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching recommendations',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/ai/trending-products
 * @desc    Get trending products
 * @access  Public
 */
router.get('/trending-products', [
  check('category_id').optional().isInt().withMessage('Invalid category ID'),
  check('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const categoryId = req.query.category_id ? parseInt(req.query.category_id) : null;
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;
    
    const trendingProducts = await recommendationEngine.getTrendingProducts(limit, categoryId);
    
    return res.json({
      success: true,
      data: trendingProducts
    });
  } catch (error) {
    logger.error(`Error getting trending products: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching trending products',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/ai/similar-products/:productId
 * @desc    Get similar products to a specific product
 * @access  Public
 */
router.get('/similar-products/:productId', [
  check('productId').isInt().withMessage('Valid product ID is required'),
  check('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const productId = parseInt(req.params.productId);
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;
    
    const similarProducts = await recommendationEngine.getSimilarProducts(productId, limit);
    
    return res.json({
      success: true,
      data: similarProducts
    });
  } catch (error) {
    logger.error(`Error getting similar products: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching similar products',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/ai/complementary-products/:productId
 * @desc    Get complementary products (frequently bought together)
 * @access  Public
 */
router.get('/complementary-products/:productId', [
  check('productId').isInt().withMessage('Valid product ID is required'),
  check('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const productId = parseInt(req.params.productId);
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;
    
    const complementaryProducts = await recommendationEngine.getComplementaryProducts(productId, limit);
    
    return res.json({
      success: true,
      data: complementaryProducts
    });
  } catch (error) {
    logger.error(`Error getting complementary products: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching complementary products',
      error: error.message
    });
  }
});

module.exports = router;