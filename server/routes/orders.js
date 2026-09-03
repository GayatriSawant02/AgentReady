import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { db } from '../db/supabaseClient.js';
import { createRecommendation } from '../services/aiService.js';
import { evaluatePolicy } from '../services/policyEngine.js';

const router = Router();

function createId(prefix) {
  return `${prefix}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

async function logStep(orderId, step, decision, reason, metadata = {}) {
  return db.createAuditLog({
    id: createId('AUD'),
    order_id: orderId,
    step,
    decision,
    reason,
    metadata,
    timestamp: new Date().toISOString()
  });
}

// GET /api/orders — list order decisions
router.get('/', async (req, res) => {
  try {
    const orders = await db.getOrders();
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch orders' });
  }
});

// GET /api/orders/:id — retrieve one order
router.get('/:id', async (req, res) => {
  try {
    const order = await db.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch order' });
  }
});

// POST /api/orders — recalculate, evaluate, and record an AI purchase intent
router.post('/', async (req, res) => {
  const request = typeof req.body?.request === 'string' ? req.body.request.trim() : '';
  if (!request) return res.status(400).json({ success: false, error: 'A shopping request is required' });

  const orderId = createId('ORD');
  try {
    const [products, merchant] = await Promise.all([db.getProducts(), db.getSettings()]);

    const recommendation = await createRecommendation(request, { products, merchant });
    const product = products.find((candidate) => Number(candidate.id) === Number(recommendation.product.id));

    const policy = evaluatePolicy({
      productId: recommendation.product.id,
      quantity: recommendation.quantity,
      budget: recommendation.budget
    }, products, merchant);

    const status = policy.allowed ? 'APPROVED' : 'BLOCKED';
    const order = await db.createOrder({
      id: orderId,
      customer_request: request,
      product_id: product?.id || null,
      product_name: product?.name || recommendation.product.name,
      quantity: recommendation.quantity,
      original_price: policy.originalAmount,
      discount_percentage: policy.discountPercentage,
      discount_amount: policy.discountAmount,
      final_price: policy.calculatedAmount,
      status,
      policy_reason: policy.reason
    });

    // Insert the parent order before audit rows because audit_logs.order_id has a foreign key.
    await logStep(orderId, 'BUYER_REQUEST', 'RECEIVED', 'AI buyer request received.', { request });
    await logStep(orderId, 'CATALOG_SEARCH', 'COMPLETED', 'Backend catalog searched for matching products.');
    await logStep(orderId, 'PRODUCT_SELECTION', product ? 'SELECTED' : 'FAILED', product
      ? `Selected ${product.name} from the backend catalog.`
      : 'The selected product was not found in the backend catalog.', { product_id: recommendation.product.id });
    const stockCheck = policy.policyChecks.find((policyCheck) => policyCheck.key === 'stock_sufficient');
    const pricingCheck = policy.policyChecks.find((policyCheck) => policyCheck.key === 'bulk_discount_allowed');
    await logStep(orderId, 'STOCK_CHECK', stockCheck?.passed ? 'PASSED' : 'FAILED', stockCheck?.detail || 'Stock check completed.');
    await logStep(orderId, 'PRICING_RULE', pricingCheck?.passed ? 'APPLIED' : 'FAILED', pricingCheck?.detail || 'Pricing rule evaluation completed.', {
      discount_percentage: policy.discountPercentage,
      discount_amount: policy.discountAmount
    });
    for (const policyCheck of policy.policyChecks) {
      await logStep(orderId, 'POLICY_CHECK', policyCheck.passed ? 'PASSED' : 'FAILED', `${policyCheck.label}: ${policyCheck.detail}`, { key: policyCheck.key });
    }

    if (policy.allowed) {
      await logStep(orderId, 'ORDER_CREATED', 'APPROVED', `Order ${orderId} created from approved policy decision.`, { final_amount: policy.calculatedAmount });
    } else {
      await logStep(orderId, 'BLOCKED_TRANSACTION', 'BLOCKED', policy.reason, { final_amount: policy.calculatedAmount });
    }

    res.status(policy.allowed ? 201 : 422).json({
      success: policy.allowed,
      data: { order, recommendation, policy },
      error: policy.allowed ? undefined : policy.reason
    });
  } catch (error) {
    console.error('Error creating order:', error);
    const isUserInputError = error.message === 'No products are available in the catalog';
    res.status(isUserInputError ? 400 : 500).json({
      success: false,
      error: isUserInputError ? 'We could not find that product in the merchant catalog.' : error.message || 'Failed to create order'
    });
  }
});

export default router;
