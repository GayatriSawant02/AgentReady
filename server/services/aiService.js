import dotenv from 'dotenv';

dotenv.config();

export const AI_SYSTEM_PROMPT = `You are AgentReady's shopping assistant. You help users discover products and form purchase recommendations.

You are not authorized to approve payments, create payment orders, or move money.
You must use the backend-provided catalog and must never invent products, prices, inventory, discounts, or stock.
Return purchase intent and recommendation data only. The backend independently performs all financial calculations.
A separate policy engine makes any final approval decision.`;

function parseBudget(request) {
  const lakhMatch = request.match(/(?:₹|rs\.?\s*)?([\d,.]+)\s*l(?:akh)?\b/i);
  if (lakhMatch) return Number(lakhMatch[1].replace(/,/g, '')) * 100000;

  const amountMatch = request.match(/(?:₹|rs\.?|inr)\s*([\d,]+)|\b([\d,]+)\s*(?:rupees|inr)\b/i);
  const amount = amountMatch?.[1] || amountMatch?.[2];
  return amount ? Number(amount.replace(/,/g, '')) : null;
}

function parseQuantity(request) {
  const quantityMatch = request.match(/\b(\d+)\b/);
  return quantityMatch ? Number(quantityMatch[1]) : 1;
}

function findProduct(request, products) {
  const normalizedRequest = request.toLowerCase();
  const exactMatch = products.find((product) => normalizedRequest.includes(product.name.toLowerCase()));
  if (exactMatch) return exactMatch;

  const categoryMatch = products.find((product) => normalizedRequest.includes(product.category.toLowerCase()));
  const explicitProductName = request.match(/\b\d+\s+(.+?)\s+(?:laptops?|notebooks?|mice|mouse|accessories|items?)\b/i);
  if (categoryMatch && explicitProductName && explicitProductName[1].trim().split(/\s+/).length > 1) return null;
  return categoryMatch || null;
}

function selectBulkRule(product, quantity) {
  return (product.bulk_rules || [])
    .filter((rule) => Number(rule.minimum_quantity) <= quantity)
    .sort((left, right) => Number(right.minimum_quantity) - Number(left.minimum_quantity))[0] || null;
}

function calculateRecommendation(request, catalog, intent = {}) {
  const products = catalog.products || [];
  const product = products.find((candidate) => candidate.id === intent.product_id) || findProduct(request, products);
  if (!product) throw new Error('No products are available in the catalog');

  const quantity = Number(intent.quantity) > 0 ? Number(intent.quantity) : parseQuantity(request);
  const budget = intent.budget !== undefined && intent.budget !== null
    ? Number(intent.budget)
    : parseBudget(request);
  const unitPrice = Number(product.price);
  const originalAmount = unitPrice * quantity;
  const bulkRule = selectBulkRule(product, quantity);
  const discountPercentage = bulkRule ? Number(bulkRule.discount_percentage) : 0;
  const savings = Math.round(originalAmount * discountPercentage / 100);
  const estimatedFinalAmount = originalAmount - savings;
  const stockAvailable = quantity <= Number(product.stock);

  return {
    product: {
      id: product.id,
      name: product.name,
      category: product.category,
      unit_price: unitPrice,
      minimum_price: Number(product.minimum_price),
      stock: Number(product.stock)
    },
    quantity,
    budget,
    original_amount: originalAmount,
    discount_percentage: discountPercentage,
    savings,
    estimated_final_amount: estimatedFinalAmount,
    selected_bulk_rule: bulkRule,
    stock_available: stockAvailable,
    recommendation_status: 'RECOMMENDATION_ONLY',
    explanation: bulkRule
      ? `${quantity} units qualify for the ${discountPercentage}% bulk discount tier. Estimated total is based on the backend catalog price and discount rule.`
      : `No bulk discount tier applies to ${quantity} units. Estimated total uses the backend catalog price.`,
    security_notice: 'This is an AI recommendation only. It is not an approved payment or order.'
  };
}

async function requestIntentFromProvider(request) {
  const apiKey = process.env.AI_API_KEY;
  const apiUrl = process.env.AI_API_URL;
  if (!apiKey || !apiUrl) return null;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL || 'agentready-demo',
      temperature: 0,
      messages: [
        { role: 'system', content: `${AI_SYSTEM_PROMPT}\nReturn JSON with only quantity, budget, and product_id when known.` },
        { role: 'user', content: request }
      ],
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) throw new Error(`AI provider request failed (${response.status})`);
  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content;
  return content ? JSON.parse(content) : null;
}

export async function createRecommendation(request, catalog) {
  const providerIntent = await requestIntentFromProvider(request).catch(() => null);
  return calculateRecommendation(request, catalog, providerIntent || {});
}
