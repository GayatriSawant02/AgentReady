import crypto from 'node:crypto';
import dotenv from 'dotenv';

dotenv.config();

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;
export const isRazorpayConfigured = Boolean(keyId && keySecret);

function authorizationHeader() {
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;
}

async function razorpayRequest(path, options = {}) {
  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    ...options,
    headers: {
      Authorization: authorizationHeader(),
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error?.description || `Razorpay request failed (${response.status})`);
  }
  return body;
}

export async function createTestOrder({ amount, currency, receipt }) {
  if (!isRazorpayConfigured) {
    return {
      demoMode: true,
      id: `DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      amount,
      currency,
      receipt
    };
  }

  const razorpayOrder = await razorpayRequest('/orders', {
    method: 'POST',
    body: JSON.stringify({ amount, currency, receipt, notes: { environment: 'test' } })
  });
  return { demoMode: false, ...razorpayOrder };
}

export function verifySignature({ razorpayOrderId, razorpayPaymentId, signature }) {
  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(signature || '');
  return expectedBuffer.length === receivedBuffer.length && crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

export async function verifyTestPayment({ razorpayOrderId, razorpayPaymentId, expectedAmount }) {
  const razorpayOrder = await razorpayRequest(`/orders/${encodeURIComponent(razorpayOrderId)}`);
  const razorpayPayment = await razorpayRequest(`/payments/${encodeURIComponent(razorpayPaymentId)}`);
  const amountMatches = Number(razorpayOrder.amount) === expectedAmount && Number(razorpayPayment.amount) === expectedAmount;
  const orderMatches = razorpayPayment.order_id === razorpayOrderId;
  const statusValid = ['authorized', 'captured'].includes(razorpayPayment.status);
  return { valid: amountMatches && orderMatches && statusValid, razorpayOrder, razorpayPayment };
}

export function safeCheckoutDetails({ razorpayOrder, orderId, amount, currency }) {
  return {
    key_id: isRazorpayConfigured ? keyId : null,
    razorpay_order_id: razorpayOrder.id,
    amount,
    currency,
    order_id: orderId,
    demo_mode: !isRazorpayConfigured
  };
}
