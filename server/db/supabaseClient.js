import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { initialProducts, initialMerchantSettings } from './seedData.js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseKey && 
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('your-project')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;

if (isSupabaseConfigured) {
  console.log('⚡ Connected to remote Supabase instance:', supabaseUrl);
} else {
  console.log('📦 Supabase credentials not set or using placeholder. Running with seeded persistent repository.');
}

// In-memory persistent fallback store
let productsStore = JSON.parse(JSON.stringify(initialProducts));
let settingsStore = JSON.parse(JSON.stringify(initialMerchantSettings));
let ordersStore = [];
let auditLogsStore = [];
let nextProductId = 6;
let nextRuleId = 8;

export const db = {
  // PRODUCTS
  async getProducts() {
    if (isSupabaseConfigured) {
      const { data: products, error } = await supabase
        .from('products')
        .select('*, bulk_rules:pricing_rules(*)')
        .order('id', { ascending: true });
      if (error) throw error;
      return products;
    }
    return productsStore;
  },

  async getProductById(id) {
    const numId = Number(id);
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('products')
        .select('*, bulk_rules:pricing_rules(*)')
        .eq('id', numId)
        .single();
      if (error) throw error;
      return data;
    }
    return productsStore.find(p => p.id === numId) || null;
  },

  async createProduct(payload) {
    const { name, description, category, price, minimum_price, stock, image_url, bulk_rules } = payload;
    
    if (isSupabaseConfigured) {
      const { data: newProd, error: prodError } = await supabase
        .from('products')
        .insert([{
          name,
          description: description || '',
          category: category || 'General',
          price: Number(price),
          minimum_price: Number(minimum_price),
          stock: Number(stock),
          image_url: image_url || ''
        }])
        .select()
        .single();

      if (prodError) throw prodError;

      if (Array.isArray(bulk_rules) && bulk_rules.length > 0) {
        const rulesToInsert = bulk_rules.map(r => ({
          product_id: newProd.id,
          minimum_quantity: Number(r.minimum_quantity),
          discount_percentage: Number(r.discount_percentage)
        }));
        await supabase.from('pricing_rules').insert(rulesToInsert);
      }

      return this.getProductById(newProd.id);
    }

    const newProduct = {
      id: nextProductId++,
      name,
      description: description || '',
      category: category || 'General',
      price: Number(price),
      minimum_price: Number(minimum_price),
      stock: Number(stock),
      image_url: image_url || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
      bulk_rules: Array.isArray(bulk_rules) ? bulk_rules.map(r => ({
        id: nextRuleId++,
        minimum_quantity: Number(r.minimum_quantity),
        discount_percentage: Number(r.discount_percentage)
      })) : []
    };

    productsStore.push(newProduct);
    return newProduct;
  },

  async updateProduct(id, payload) {
    const numId = Number(id);
    const { name, description, category, price, minimum_price, stock, image_url, bulk_rules } = payload;

    if (isSupabaseConfigured) {
      const { error: updateError } = await supabase
        .from('products')
        .update({
          name,
          description,
          category,
          price: Number(price),
          minimum_price: Number(minimum_price),
          stock: Number(stock),
          image_url
        })
        .eq('id', numId);

      if (updateError) throw updateError;

      // Update pricing rules if provided
      if (Array.isArray(bulk_rules)) {
        await supabase.from('pricing_rules').delete().eq('product_id', numId);
        if (bulk_rules.length > 0) {
          const rules = bulk_rules.map(r => ({
            product_id: numId,
            minimum_quantity: Number(r.minimum_quantity),
            discount_percentage: Number(r.discount_percentage)
          }));
          await supabase.from('pricing_rules').insert(rules);
        }
      }

      return this.getProductById(numId);
    }

    const index = productsStore.findIndex(p => p.id === numId);
    if (index === -1) return null;

    productsStore[index] = {
      ...productsStore[index],
      name: name ?? productsStore[index].name,
      description: description ?? productsStore[index].description,
      category: category ?? productsStore[index].category,
      price: price !== undefined ? Number(price) : productsStore[index].price,
      minimum_price: minimum_price !== undefined ? Number(minimum_price) : productsStore[index].minimum_price,
      stock: stock !== undefined ? Number(stock) : productsStore[index].stock,
      image_url: image_url ?? productsStore[index].image_url,
      bulk_rules: Array.isArray(bulk_rules) ? bulk_rules.map(r => ({
        id: r.id || nextRuleId++,
        minimum_quantity: Number(r.minimum_quantity),
        discount_percentage: Number(r.discount_percentage)
      })) : productsStore[index].bulk_rules
    };

    return productsStore[index];
  },

  async deleteProduct(id) {
    const numId = Number(id);
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('products').delete().eq('id', numId);
      if (error) throw error;
      return true;
    }
    const prevLen = productsStore.length;
    productsStore = productsStore.filter(p => p.id !== numId);
    return productsStore.length < prevLen;
  },

  // SETTINGS
  async getSettings() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('merchant_settings')
        .select('*')
        .order('id', { ascending: true })
        .limit(1)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      if (data) return data;
    }
    return settingsStore;
  },

  async updateSettings(payload) {
    const { maximum_transaction_amount, maximum_discount_percentage, human_approval_amount, currency, store_name } = payload;
    
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('merchant_settings')
        .update({
          maximum_transaction_amount: Number(maximum_transaction_amount),
          maximum_discount_percentage: Number(maximum_discount_percentage),
          human_approval_amount: Number(human_approval_amount),
          currency: currency || 'INR',
          store_name: store_name || 'Apex Tech Enterprise Store',
          updated_at: new Date().toISOString()
        })
        .eq('id', 1)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    settingsStore = {
      ...settingsStore,
      maximum_transaction_amount: maximum_transaction_amount !== undefined ? Number(maximum_transaction_amount) : settingsStore.maximum_transaction_amount,
      maximum_discount_percentage: maximum_discount_percentage !== undefined ? Number(maximum_discount_percentage) : settingsStore.maximum_discount_percentage,
      human_approval_amount: human_approval_amount !== undefined ? Number(human_approval_amount) : settingsStore.human_approval_amount,
      currency: currency || settingsStore.currency,
      store_name: store_name || settingsStore.store_name
    };

    return settingsStore;
  },

  // ORDERS
  async getOrders() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
    return ordersStore;
  },

  async getOrderById(id) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();
      if (error && error.code === 'PGRST116') return null;
      if (error) throw error;
      return data;
    }
    return ordersStore.find((order) => order.id === id) || null;
  },

  async createOrder(payload) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('orders').insert([payload]).select().single();
      if (error) throw error;
      return data;
    }
    const order = {
      ...payload,
      created_at: payload.created_at || new Date().toISOString()
    };
    ordersStore = [order, ...ordersStore];
    return order;
  },

  async updateOrderPayment(id, payload) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('orders')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    const index = ordersStore.findIndex((order) => order.id === id);
    if (index === -1) return null;
    ordersStore[index] = { ...ordersStore[index], ...payload };
    return ordersStore[index];
  },

  // AUDIT LOGS
  async getAuditLogs(orderId) {
    if (isSupabaseConfigured) {
      let query = supabase.from('audit_logs').select('*').order('timestamp', { ascending: true });
      if (orderId) query = query.eq('order_id', orderId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
    return auditLogsStore
      .filter((log) => !orderId || log.order_id === orderId)
      .sort((left, right) => new Date(left.timestamp) - new Date(right.timestamp));
  },

  async createAuditLog(payload) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('audit_logs').insert([payload]).select().single();
      if (error) throw error;
      return data;
    }
    const log = {
      ...payload,
      timestamp: payload.timestamp || new Date().toISOString()
    };
    auditLogsStore.push(log);
    return log;
  }
};
