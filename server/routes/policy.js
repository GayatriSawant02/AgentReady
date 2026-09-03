import { Router } from 'express';
import { db } from '../db/supabaseClient.js';
import { createRecommendation } from '../services/aiService.js';
import { evaluatePolicy } from '../services/policyEngine.js';

const router = Router();

// POST /api/policy/evaluate — recalculate and evaluate a request server-side
router.post('/evaluate', async (req, res) => {
  try {
    const request = typeof req.body?.request === 'string' ? req.body.request.trim() : '';
    if (!request) {
      return res.status(400).json({ success: false, error: 'A shopping request is required' });
    }

    const [products, merchant] = await Promise.all([
      db.getProducts(),
      db.getSettings()
    ]);
    const recommendation = await createRecommendation(request, { products, merchant });
    const policy = evaluatePolicy({
      productId: recommendation.product.id,
      quantity: recommendation.quantity,
      budget: recommendation.budget,
      proposedUnitPrice: req.body?.recommendation?.unit_price,
      proposedDiscountPercentage: req.body?.recommendation?.discount_percentage,
      proposedFinalAmount: req.body?.recommendation?.final_amount
    }, products, merchant);

    res.json({
      success: true,
      data: {
        request,
        recommendation,
        policy,
        payment_status: 'NOT_STARTED'
      }
    });
  } catch (error) {
    console.error('Error evaluating policy:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to evaluate policy' });
  }
});

export default router;
