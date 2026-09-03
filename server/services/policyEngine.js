function numericValue(value) {
  return Number.isFinite(Number(value)) ? Number(value) : null;
}

function selectBulkRule(product, quantity) {
  return (product.bulk_rules || [])
    .filter((rule) => Number(rule.minimum_quantity) <= quantity)
    .sort((left, right) => Number(right.minimum_quantity) - Number(left.minimum_quantity))[0] || null;
}

function check(key, label, passed, detail) {
  return { key, label, passed, detail };
}

export function evaluatePolicy({ productId, quantity, budget, proposedUnitPrice, proposedDiscountPercentage, proposedFinalAmount }, products, merchantSettings) {
  const requestedQuantity = numericValue(quantity);
  const product = products.find((candidate) => Number(candidate.id) === Number(productId));
  const settings = merchantSettings || {};
  const maximumTransactionAmount = numericValue(settings.maximum_transaction_amount) || 0;
  const maximumDiscountPercentage = numericValue(settings.maximum_discount_percentage) || 0;
  const humanApprovalAmount = numericValue(settings.human_approval_amount) || 0;

  if (!product) {
    return {
      allowed: false,
      requiresHumanApproval: false,
      calculatedAmount: 0,
      policyChecks: [
        check('product_exists', 'Product exists', false, 'The requested product is not present in the backend catalog.')
      ],
      reason: 'Product does not exist in the merchant catalog.'
    };
  }

  const validQuantity = Number.isInteger(requestedQuantity) && requestedQuantity > 0;
  const stockSufficient = validQuantity && requestedQuantity <= Number(product.stock);
  const unitPrice = Number(product.price);
  const originalAmount = validQuantity ? unitPrice * requestedQuantity : 0;
  const bulkRule = validQuantity ? selectBulkRule(product, requestedQuantity) : null;
  const discountPercentage = bulkRule ? Number(bulkRule.discount_percentage) : 0;
  const discountAmount = Math.round(originalAmount * discountPercentage / 100);
  const calculatedAmount = originalAmount - discountAmount;
  const calculatedUnitPrice = validQuantity ? calculatedAmount / requestedQuantity : 0;
  const budgetValue = numericValue(budget);
  const priceMatchesCatalog = proposedUnitPrice === undefined || numericValue(proposedUnitPrice) === unitPrice;
  const discountMatchesCatalog = proposedDiscountPercentage === undefined || numericValue(proposedDiscountPercentage) === discountPercentage;
  const finalAmountMatchesCalculation = proposedFinalAmount === undefined || numericValue(proposedFinalAmount) === calculatedAmount;
  const checks = [
    check('product_exists', 'Product exists', true, `${product.name} is present in the backend catalog.`),
    check('quantity_valid', 'Quantity is valid', validQuantity, validQuantity ? `${requestedQuantity} units requested.` : 'Quantity must be a positive whole number.'),
    check('stock_sufficient', 'Stock available', stockSufficient, validQuantity ? `Requested ${requestedQuantity}; available ${product.stock}.` : 'Stock cannot be checked until quantity is valid.'),
    check('product_price_correct', 'Product price is correct', priceMatchesCatalog, priceMatchesCatalog ? `Backend list price is ₹${unitPrice.toLocaleString('en-IN')} per unit.` : 'Submitted price does not match the backend catalog price.'),
    check('bulk_discount_allowed', 'Discount allowed', discountMatchesCatalog, discountMatchesCatalog
      ? (bulkRule ? `${discountPercentage}% comes from the ${bulkRule.minimum_quantity}+ unit catalog rule.` : 'No bulk discount rule applies.')
      : 'Submitted discount does not match an allowed backend catalog rule.'),
    check('discount_within_limit', 'Maximum discount satisfied', discountPercentage <= maximumDiscountPercentage, `${discountPercentage}% applied; merchant maximum is ${maximumDiscountPercentage}%.`),
    check('minimum_price_satisfied', 'Minimum price satisfied', calculatedUnitPrice >= Number(product.minimum_price), `Effective unit price ₹${calculatedUnitPrice.toLocaleString('en-IN')}; floor is ₹${Number(product.minimum_price).toLocaleString('en-IN')}.`),
    check('total_amount_calculated', 'Total amount calculated', validQuantity && finalAmountMatchesCalculation, finalAmountMatchesCalculation
      ? `Backend calculation: ₹${unitPrice.toLocaleString('en-IN')} × ${validQuantity ? requestedQuantity : 0} − ₹${discountAmount.toLocaleString('en-IN')} = ₹${calculatedAmount.toLocaleString('en-IN')}.`
      : 'Submitted final amount does not match the backend calculation.'),
    check('maximum_transaction_limit', 'Transaction limit satisfied', calculatedAmount <= maximumTransactionAmount, `Calculated amount ₹${calculatedAmount.toLocaleString('en-IN')}; merchant limit is ₹${maximumTransactionAmount.toLocaleString('en-IN')}.`),
    check('human_approval_threshold', 'Human approval threshold', calculatedAmount <= humanApprovalAmount, calculatedAmount <= humanApprovalAmount
      ? `Calculated amount is within the ₹${humanApprovalAmount.toLocaleString('en-IN')} autonomous approval threshold.`
      : `Calculated amount exceeds the ₹${humanApprovalAmount.toLocaleString('en-IN')} human approval threshold.`)
  ];

  const blockingChecks = checks.filter((policyCheck) => policyCheck.key !== 'human_approval_threshold');
  const allowed = blockingChecks.every((policyCheck) => policyCheck.passed);
  const requiresHumanApproval = allowed && calculatedAmount > humanApprovalAmount;
  const failedBlockingCheck = blockingChecks.find((policyCheck) => !policyCheck.passed);

  return {
    allowed,
    requiresHumanApproval,
    calculatedAmount,
    originalAmount,
    discountAmount,
    discountPercentage,
    policyChecks: checks,
    reason: failedBlockingCheck
      ? failedBlockingCheck.key === 'maximum_transaction_limit'
        ? `Transaction exceeds the merchant's AI spending limit of ₹${maximumTransactionAmount.toLocaleString('en-IN')}.`
        : failedBlockingCheck.detail
      : requiresHumanApproval
        ? `Transaction exceeds the human approval threshold of ₹${humanApprovalAmount.toLocaleString('en-IN')}.`
        : 'All deterministic policy checks passed.'
  };
}
