const API_BASE = '/api';

export async function fetchProducts() {
  const response = await fetch(`${API_BASE}/products`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch products (${response.status})`);
  }
  const result = await response.json();
  return result.data || [];
}

export async function createProduct(productData) {
  const response = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to create product (${response.status})`);
  }
  const result = await response.json();
  return result.data;
}

export async function updateProduct(id, productData) {
  const response = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to update product (${response.status})`);
  }
  const result = await response.json();
  return result.data;
}

export async function deleteProduct(id) {
  const response = await fetch(`${API_BASE}/products/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to delete product (${response.status})`);
  }
  return true;
}

export async function fetchSettings() {
  const response = await fetch(`${API_BASE}/settings`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch settings (${response.status})`);
  }
  const result = await response.json();
  return result.data;
}

export async function updateSettings(settingsData) {
  const response = await fetch(`${API_BASE}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settingsData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to update settings (${response.status})`);
  }
  const result = await response.json();
  return result.data;
}

export async function fetchAgentReadableCatalog() {
  const response = await fetch(`${API_BASE}/catalog/agent-readable`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch agent-readable catalog (${response.status})`);
  }
  const result = await response.json();
  return result.data;
}

export async function requestAiRecommendation(request) {
  const response = await fetch(`${API_BASE}/ai/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ request }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to get AI recommendation (${response.status})`);
  }
  const result = await response.json();
  return result.data;
}

export async function evaluatePolicy(request) {
  const response = await fetch(`${API_BASE}/policy/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ request }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to evaluate policy (${response.status})`);
  }
  const result = await response.json();
  return result.data;
}

export async function createOrder(request) {
  const response = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ request }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(result.error || `Failed to create order (${response.status})`);
    error.data = result.data;
    throw error;
  }
  return result.data;
}

export async function fetchOrders() {
  const response = await fetch(`${API_BASE}/orders`);
  if (!response.ok) throw new Error(`Failed to fetch orders (${response.status})`);
  const result = await response.json();
  return result.data || [];
}

export async function fetchAuditLogs(orderId) {
  const query = orderId ? `?order_id=${encodeURIComponent(orderId)}` : '';
  const response = await fetch(`${API_BASE}/audit${query}`);
  if (!response.ok) throw new Error(`Failed to fetch audit logs (${response.status})`);
  const result = await response.json();
  return result.data || [];
}

export async function createPaymentOrder(orderId) {
  const response = await fetch(`${API_BASE}/payments/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order_id: orderId }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || `Failed to create payment order (${response.status})`);
  return result.data;
}

export async function verifyPayment(paymentData) {
  const response = await fetch(`${API_BASE}/payments/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || `Failed to verify payment (${response.status})`);
  return result.data;
}
