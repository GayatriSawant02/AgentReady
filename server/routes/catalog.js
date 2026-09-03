import { Router } from 'express';
import { db } from '../db/supabaseClient.js';

const router = Router();

// GET /api/catalog/agent-readable — structured catalog for shopping agents
router.get('/agent-readable', async (req, res) => {
  try {
    const [products, merchant] = await Promise.all([
      db.getProducts(),
      db.getSettings()
    ]);

    res.json({
      success: true,
      data: {
        schema: 'agentready.catalog.v1',
        description: 'Prototype Agent-Readable Commerce Layer inspired by emerging agentic commerce protocols.',
        merchant: {
          currency: merchant.currency,
          maximum_transaction_amount: Number(merchant.maximum_transaction_amount),
          maximum_discount_percentage: Number(merchant.maximum_discount_percentage),
          human_approval_amount: Number(merchant.human_approval_amount),
          store_name: merchant.store_name
        },
        products: products.map((product) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          category: product.category,
          price: Number(product.price),
          minimum_price: Number(product.minimum_price),
          stock: Number(product.stock),
          inventory: { available: Number(product.stock) },
          bulk_rules: (product.bulk_rules || []).map((rule) => ({
            minimum_quantity: Number(rule.minimum_quantity),
            discount_percentage: Number(rule.discount_percentage)
          }))
        }))
      }
    });
  } catch (error) {
    console.error('Error building agent-readable catalog:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to build agent-readable catalog' });
  }
});

export default router;
