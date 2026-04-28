import { getCanonicalCanteenName } from '@/lib/canteen-details'

const API_BASE_URL = 'http://localhost:8000/api';

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('mealq_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'Something went wrong');
  }

  return data;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export async function loginUser(student_id: string, password: string) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ student_id, password }),
  });
}

export async function registerUser(data: any) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ---------------------------------------------------------------------------
// Canteens & Menu
// ---------------------------------------------------------------------------
export async function getCanteens() {
  return apiRequest('/canteens');
}

export async function getCanteen(id: number | string) {
  return apiRequest(`/canteens/${id}`);
}

export async function getCanteenMenu(id: number | string) {
  return apiRequest(`/canteens/${id}/menu`);
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------
export async function getOrders() {
  const data = await apiRequest('/orders');
  return data.map((order: any) => ({
    id: order.order_id,
    studentId: order.student_id,
    canteenId: order.canteen_id.toString(),
    canteenName: getCanonicalCanteenName(order.canteen_id, order.canteen_name),
    subtotal: order.subtotal,
    gst: order.gst,
    total: order.total_amount,
    status: order.status,
    paymentMethod: order.payment_method,
    createdAt: order.order_date,
    items: order.items.map((item: any) => ({
      menuItem: {
        id: item.item_id.toString(),
        name: item.name,
        price: item.price,
        category: item.category,
      },
      quantity: item.quantity,
      subtotal: item.subtotal,
    })),
  }));
}

export async function getOrder(id: string) {
  return apiRequest(`/orders/${id}`);
}

export async function createOrder(data: { canteen_id: number, items: any[], payment_method: string }) {
  return apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function cancelOrder(id: string) {
  return apiRequest(`/orders/${id}`, {
    method: 'DELETE',
  });
}

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------
export async function createPayment(data: { order_id: string, method: string, amount: number }) {
  return apiRequest('/payments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getPayment(order_id: string) {
  return apiRequest(`/payments/${order_id}`);
}
