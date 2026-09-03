import { Router } from 'express';
import { db } from '../db/supabaseClient.js';

const router = Router();

// GET /api/settings — Retrieve merchant AI autonomy settings
router.get('/', async (req, res) => {
  try {
    const settings = await db.getSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch settings' });
  }
});

// PUT /api/settings — Update merchant AI autonomy settings
router.put('/', async (req, res) => {
  try {
    const { maximum_transaction_amount, maximum_discount_percentage, human_approval_amount } = req.body;

    if (maximum_transaction_amount !== undefined && Number(maximum_transaction_amount) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Maximum transaction amount must be greater than 0'
      });
    }

    if (maximum_discount_percentage !== undefined && (Number(maximum_discount_percentage) < 0 || Number(maximum_discount_percentage) > 100)) {
      return res.status(400).json({
        success: false,
        error: 'Maximum discount percentage must be between 0 and 100'
      });
    }

    if (human_approval_amount !== undefined && Number(human_approval_amount) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Human approval threshold must be greater than 0'
      });
    }

    const updated = await db.updateSettings(req.body);
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to update settings' });
  }
});

export default router;
