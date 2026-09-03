import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { db } from '../db/supabaseClient.js';
import { evaluatePolicy } from '../services/policyEngine.js';
import {
  createTestOrder,
  isRazorpayConfigured,
  safeCheckoutDetails,
  verifySignature,
  verifyTestPayment
} from '../services/razorpayService.js';

const router = Router();

function auditId() {
  return `AUD-${randomUUID().slice(0, 8).toUpperCase()}`;
}

async function logPayment(orderId, decision, reason, metadata = {}) {
  return db.createAuditLog({
    id: auditId(),
    order_id: orderId,
    step: 'PAYMENT',
    decision,
    reason,
    metadata,
    timestamp: new Date().toISOString()
  });
}

async function loadVerifiedOrder(orderId, allowPaymentPending = false) {
  const order = await db.getOrderById(orderId);
  if (!order) return { error: 'Order not found', status: 404 };
  if (order.status !== 'APPROVED' && !(allowPaymentPending && order.status === 'PAYMENT_PENDING')) {
    return { error: 'Only APPROVED orders can start payment', status: 409 };
  }

  const [products, merchant] = await Promise.all([db.getProducts(), db.getSettings()]);
  const policy = evaluatePolicy({ productId: order.product_id, quantity: order.quantity }, products, merchant);
  if (!policy.allowed || policy.requiresHumanApproval || policy.calculatedAmount !== Number(order.final_price)) {
    return { error: 'Order failed server-side policy revalidation', status: 422, policy };
  }
  return { order, policy };
}

// POST /api/payments/orders — create a Razorpay test order from server-calculated amount
router.post('/orders', async (req, res) => {
  try {
    const orderId = typeof req.body?.order_id === 'string' ? req.body.order_id : '';
    const verified = await loadVerifiedOrder(orderId);
    if (verified.error) return res.status(verified.status).json({ success: false, error: verified.error, policy: verified.policy });

    const { order, policy } = verified;
    const amount = Math.round(policy.calculatedAmount * 100);
    const razorpayOrder = await createTestOrder({ amount, currency: 'INR', receipt: order.id });
    const updatedOrder = await db.updateOrderPayment(order.id, {
      status: 'PAYMENT_PENDING',
      razorpay_order_id: razorpayOrder.id
    });
    await logPayment(order.id, razorpayOrder.demoMode ? 'DEMO_ORDER_CREATED' : 'ORDER_CREATED', razorpayOrder.demoMode
      ? 'DEMO PAYMENT MODE: no Razorpay credentials configured.'
      : 'Razorpay TEST order created from server-calculated amount.', { amount, demo_mode: razorpayOrder.demoMode });

    res.status(201).json({
      success: true,
      data: {
        order: updatedOrder,
        checkout: safeCheckoutDetails({ razorpayOrder, orderId: order.id, amount, currency: 'INR' }),
        demo_message: razorpayOrder.demoMode ? 'DEMO PAYMENT MODE' : undefined
      }
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(502).json({ success: false, error: error.message || 'Failed to create payment order' });
  }
});

// POST /api/payments/verify — verify Razorpay payment server-side
router.post('/verify', async (req, res) => {
  try {
    const orderId = typeof req.body?.order_id === 'string' ? req.body.order_id : '';
    const verified = await loadVerifiedOrder(orderId, true);
    if (verified.error) return res.status(verified.status).json({ success: false, error: verified.error, policy: verified.policy });

    const { order, policy } = verified;
    if (!order.razorpay_order_id || order.razorpay_order_id.startsWith('DEMO-')) {
      if (order.razorpay_order_id !== req.body?.razorpay_order_id) {
        return res.status(400).json({ success: false, error: 'Demo payment order does not match this order' });
      }
      const paymentId = `DEMO-PAY-${randomUUID().slice(0, 8).toUpperCase()}`;
      const updatedOrder = await db.updateOrderPayment(order.id, { status: 'PAID', razorpay_payment_id: paymentId });
      await logPayment(order.id, 'DEMO_PAYMENT_RECORDED', 'DEMO PAYMENT MODE: local demonstration payment recorded.', { payment_id: paymentId, amount: Math.round(policy.calculatedAmount * 100) });
      return res.json({ success: true, data: { order: updatedOrder, demo_mode: true } });
    }

    if (!isRazorpayConfigured || !verifySignature({
      razorpayOrderId: order.razorpay_order_id,
      razorpayPaymentId: req.body?.razorpay_payment_id,
      signature: req.body?.razorpay_signature
    })) {
      await db.updateOrderPayment(order.id, { status: 'PAYMENT_FAILED' });
      await logPayment(order.id, 'PAYMENT_FAILED', 'Razorpay signature verification failed.');
      return res.status(400).json({ success: false, error: 'Payment signature verification failed' });
    }

    const paymentVerification = await verifyTestPayment({
      razorpayOrderId: order.razorpay_order_id,
      razorpayPaymentId: req.body.razorpay_payment_id,
      expectedAmount: Math.round(policy.calculatedAmount * 100)
    });
    if (!paymentVerification.valid) {
      await db.updateOrderPayment(order.id, { status: 'PAYMENT_FAILED' });
      await logPayment(order.id, 'PAYMENT_FAILED', 'Razorpay payment amount, order, or status could not be verified.');
      return res.status(400).json({ success: false, error: 'Server-side Razorpay payment verification failed' });
    }

    const updatedOrder = await db.updateOrderPayment(order.id, { status: 'PAID', razorpay_payment_id: req.body.razorpay_payment_id });
    await logPayment(order.id, 'PAYMENT_VERIFIED', 'Razorpay TEST payment verified server-side.', { payment_id: req.body.razorpay_payment_id, amount: paymentVerification.razorpayPayment.amount });
    res.json({ success: true, data: { order: updatedOrder, demo_mode: false } });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(502).json({ success: false, error: error.message || 'Failed to verify payment' });
  }
});

export default router;
