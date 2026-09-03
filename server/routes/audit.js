import { Router } from 'express';
import { db } from '../db/supabaseClient.js';

const router = Router();

// GET /api/audit?order_id=... — chronological audit trail
router.get('/', async (req, res) => {
  try {
    const logs = await db.getAuditLogs(req.query.order_id);
    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch audit logs' });
  }
});

export default router;
