import { Router } from 'express';
import { db } from '../db/supabaseClient.js';
import { createRecommendation } from '../services/aiService.js';

const router = Router();

// POST /api/ai/recommend — create a catalog-backed purchase recommendation
router.post('/recommend', async (req, res) => {
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

    res.json({
      success: true,
      data: {
        request,
        recommendation,
        approval_status: 'NOT_EVALUATED',
        payment_status: 'NOT_STARTED'
      }
    });
  } catch (error) {
    console.error('Error creating AI recommendation:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to create recommendation' });
  }
});

export default router;
