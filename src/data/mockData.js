export const mockMerchantSettings = {
  currency: "INR",
  currencySymbol: "₹",
  maximum_transaction_amount: 1000000, // ₹10,00,000
  maximum_discount_percentage: 10,
  human_approval_amount: 500000, // ₹5,00,000
  store_name: "Apex Tech Enterprise Store",
  status: "ACTIVE",
  policy_version: "v1.4-deterministic"
};

export const mockProducts = [
  {
    id: 1,
    name: "MacBook Air M4",
    category: "Laptops",
    description: "Apple M4 chip, 16GB Unified Memory, 512GB SSD, 13.6-inch Liquid Retina Display",
    price: 100000,
    minimum_price: 90000,
    stock: 20,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
    bulk_rules: [
      { minimum_quantity: 5, discount_percentage: 5 },
      { minimum_quantity: 10, discount_percentage: 8 }
    ]
  },
  {
    id: 2,
    name: "Dell XPS 14",
    category: "Laptops",
    description: "Intel Core Ultra 7, 32GB RAM, 1TB SSD, 3.2K OLED Touch Display, CNC Aluminum",
    price: 120000,
    minimum_price: 108000,
    stock: 15,
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80",
    bulk_rules: [
      { minimum_quantity: 5, discount_percentage: 6 }
    ]
  },
  {
    id: 3,
    name: "Lenovo ThinkPad X1",
    category: "Laptops",
    description: "Carbon Gen 12, Intel Core Ultra 7 165H, 32GB LPDDR5X, Enterprise Security Engine",
    price: 110000,
    minimum_price: 99000,
    stock: 25,
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80",
    bulk_rules: [
      { minimum_quantity: 5, discount_percentage: 5 },
      { minimum_quantity: 10, discount_percentage: 8 }
    ]
  },
  {
    id: 4,
    name: "HP Spectre x360",
    category: "Laptops",
    description: "2-in-1 convertible, 14-inch 2.8K OLED, Intel Core Ultra 7, Nightfall Black with Gem Cut",
    price: 95000,
    minimum_price: 85000,
    stock: 12,
    image: "https://images.unsplash.com/photo-1544731612-de2f96407ad9?auto=format&fit=crop&w=600&q=80",
    bulk_rules: [
      { minimum_quantity: 4, discount_percentage: 5 }
    ]
  },
  {
    id: 5,
    name: "Logitech MX Master 3S",
    category: "Accessories",
    description: "Performance wireless ergonomic mouse, 8K DPI sensor, Quiet Clicks, MagSpeed Wheel",
    price: 9500,
    minimum_price: 8500,
    stock: 50,
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80",
    bulk_rules: [
      { minimum_quantity: 10, discount_percentage: 5 }
    ]
  }
];

export const mockDashboardStats = {
  aiOrders: {
    value: "142",
    change: "+18.4%",
    isPositive: true,
    description: "Transactions initiated by AI agents"
  },
  aiRevenue: {
    value: "₹28,45,000",
    change: "+24.6%",
    isPositive: true,
    description: "Total revenue settled via AI commerce"
  },
  averageDiscount: {
    value: "5.8%",
    change: "-0.4%",
    isPositive: true,
    description: "Within merchant limit of 10.0%"
  },
  blockedTransactions: {
    value: "9",
    change: "100% policy enforcement",
    isPositive: null,
    description: "Exceeded spend or discount caps"
  }
};

export const mockRecentActivity = [
  {
    id: "act-101",
    agent: "ProcureBot-StartupAlpha",
    request: "6x MacBook Air M4 for seed team under ₹6L",
    amount: "₹5,70,000",
    status: "APPROVED",
    policyResult: "Passed all 6 policy guardrails",
    timestamp: "2 mins ago"
  },
  {
    id: "act-102",
    agent: "EnterpriseBuyer-HQ",
    request: "20x MacBook Air M4 bulk requisition",
    amount: "₹20,00,000",
    status: "BLOCKED",
    policyResult: "Exceeded AI spending limit (Max ₹10,00,000)",
    timestamp: "14 mins ago"
  },
  {
    id: "act-103",
    agent: "AutoSourcing-V3",
    request: "2x Dell XPS 14 engineering workstation",
    amount: "₹2,40,000",
    status: "APPROVED",
    policyResult: "Standard price verified, stock confirmed",
    timestamp: "38 mins ago"
  },
  {
    id: "act-104",
    agent: "GrowthAgent-Dev",
    request: "10x Lenovo ThinkPad X1 remote team setup",
    amount: "₹10,12,000",
    status: "HUMAN_APPROVAL",
    policyResult: "Exceeds ₹5,00,000 human review trigger",
    timestamp: "1 hour ago"
  }
];

export const mockDecisionTraceSample = [
  { step: 1, time: "10:42:01.120", action: "Buyer Request Received", details: "Query: '6 laptops under ₹6 lakh' parsed from agent ProcureBot-StartupAlpha", status: "INFO" },
  { step: 2, time: "10:42:01.340", action: "Catalog Search & Match", details: "Matched Product ID 1 (MacBook Air M4) at base ₹1,00,000/unit", status: "SUCCESS" },
  { step: 3, time: "10:42:01.480", action: "Inventory Verification", details: "Requested: 6 units | In Stock: 20 units -> PASSED", status: "SUCCESS" },
  { step: 4, time: "10:42:01.620", action: "Bulk Pricing Rule Evaluation", details: "Tier >= 5 units matched: 5% discount applied (₹30,000 discount)", status: "SUCCESS" },
  { step: 5, time: "10:42:01.780", action: "Minimum Price Floor Check", details: "Effective unit price ₹95,000 >= Merchant floor ₹90,000 -> PASSED", status: "SUCCESS" },
  { step: 6, time: "10:42:01.910", action: "Deterministic Policy Engine", details: "Transaction ₹5,70,000 <= Limit ₹10,00,000 -> APPROVED", status: "SUCCESS" },
  { step: 7, time: "10:42:02.100", action: "Order Reservation Created", details: "Order ID #ORD-8491 generated. Locked stock reserved.", status: "SUCCESS" },
  { step: 8, time: "10:42:05.450", action: "Razorpay Payment Settled", details: "Test Payment ID: pay_test_9k1lMn92 verified via webhook signature", status: "SUCCESS" }
];

export const mockOrders = [
  {
    id: "ORD-8491",
    customer_request: "6 laptops for startup under ₹6 lakh budget",
    product: "MacBook Air M4",
    quantity: 6,
    original_price: 600000,
    discount_percentage: 5,
    discount_amount: 30000,
    final_price: 570000,
    status: "APPROVED",
    payment_status: "PAID",
    razorpay_order_id: "order_test_992101",
    razorpay_payment_id: "pay_test_9k1lMn92",
    created_at: "Today, 10:42 AM"
  },
  {
    id: "ORD-8490",
    customer_request: "2 developer laptops with OLED display",
    product: "Dell XPS 14",
    quantity: 2,
    original_price: 240000,
    discount_percentage: 0,
    discount_amount: 0,
    final_price: 240000,
    status: "APPROVED",
    payment_status: "PAID",
    razorpay_order_id: "order_test_992095",
    razorpay_payment_id: "pay_test_8m9xVq11",
    created_at: "Today, 09:15 AM"
  },
  {
    id: "ORD-8489",
    customer_request: "I need 20 MacBook Air M4 laptops",
    product: "MacBook Air M4",
    quantity: 20,
    original_price: 2000000,
    discount_percentage: 0,
    discount_amount: 0,
    final_price: 2000000,
    status: "BLOCKED",
    payment_status: "BLOCKED_BY_POLICY",
    policy_reason: "Transaction exceeds merchant AI spending limit of ₹10,00,000",
    razorpay_order_id: "N/A (No order created)",
    razorpay_payment_id: "N/A",
    created_at: "Yesterday, 04:30 PM"
  },
  {
    id: "ORD-8488",
    customer_request: "10 enterprise security laptops for QA division",
    product: "Lenovo ThinkPad X1",
    quantity: 10,
    original_price: 1100000,
    discount_percentage: 8,
    discount_amount: 88000,
    final_price: 1012000,
    status: "APPROVED",
    payment_status: "PAID",
    razorpay_order_id: "order_test_991873",
    razorpay_payment_id: "pay_test_7a6cBf44",
    created_at: "Yesterday, 02:10 PM"
  },
  {
    id: "ORD-8487",
    customer_request: "15 ergonomic precision mice for design studio",
    product: "Logitech MX Master 3S",
    quantity: 15,
    original_price: 142500,
    discount_percentage: 5,
    discount_amount: 7125,
    final_price: 135375,
    status: "APPROVED",
    payment_status: "PAID",
    razorpay_order_id: "order_test_991420",
    razorpay_payment_id: "pay_test_5n4qKl88",
    created_at: "2 days ago"
  }
];

export const mockAuditLogs = [
  {
    id: "AUD-1008",
    order_id: "ORD-8491",
    step: "PAYMENT_CONFIRMED",
    decision: "APPROVED",
    reason: "Signature verified for Razorpay test checkout",
    metadata: { payment_id: "pay_test_9k1lMn92", amount: 570000, currency: "INR" },
    timestamp: "10:42:15 AM"
  },
  {
    id: "AUD-1007",
    order_id: "ORD-8491",
    step: "POLICY_EVALUATION",
    decision: "APPROVED",
    reason: "Amount ₹5,70,000 <= Limit ₹10,00,000; Unit price ₹95,000 >= Min floor ₹90,000; Discount 5% <= Max 10%",
    metadata: { checks_run: 6, passed: 6, failed: 0 },
    timestamp: "10:42:05 AM"
  },
  {
    id: "AUD-1006",
    order_id: "ORD-8491",
    step: "PRICING_CALCULATION",
    decision: "DISCOUNT_APPLIED",
    reason: "Quantity 6 qualifies for bulk rule: 5% discount (₹30,000 savings)",
    metadata: { original: 600000, discount_pct: 5, final: 570000 },
    timestamp: "10:42:04 AM"
  },
  {
    id: "AUD-1005",
    order_id: "ORD-8491",
    step: "INVENTORY_CHECK",
    decision: "AVAILABLE",
    reason: "Requested 6 units, available 20 units in catalog",
    metadata: { stock: 20, reserved: 6 },
    timestamp: "10:42:03 AM"
  },
  {
    id: "AUD-1004",
    order_id: "ORD-8489",
    step: "POLICY_EVALUATION",
    decision: "BLOCKED",
    reason: "Transaction ₹20,00,000 exceeds merchant AI spending limit of ₹10,00,000",
    metadata: { requested_amount: 2000000, limit: 1000000, violation: "MAX_TRANSACTION_LIMIT" },
    timestamp: "Yesterday, 04:30:02 PM"
  },
  {
    id: "AUD-1003",
    order_id: "ORD-8489",
    step: "PAYMENT_GATEWAY",
    decision: "SKIPPED",
    reason: "Razorpay order creation inhibited due to upstream policy failure",
    metadata: { order_created: false },
    timestamp: "Yesterday, 04:30:03 PM"
  }
];
