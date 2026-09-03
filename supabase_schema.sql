-- =========================================================================
-- AgentReady — Supabase & PostgreSQL Schema
-- Track 1: AI Growth & Agentic Commerce (Razorpay AI Hackathon)
-- Tagline: Make Your Store Ready for AI Buyers
-- =========================================================================

-- Drop existing tables if re-running
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS pricing_rules CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS merchant_settings CASCADE;

-- 1. PRODUCTS TABLE
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'General',
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    minimum_price NUMERIC(12, 2) NOT NULL CHECK (minimum_price >= 0 AND minimum_price <= price),
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRICING RULES (Bulk Discount Tiers)
CREATE TABLE pricing_rules (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    minimum_quantity INT NOT NULL CHECK (minimum_quantity > 1),
    discount_percentage NUMERIC(5, 2) NOT NULL CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MERCHANT SETTINGS (Autonomous AI Boundaries & Policies)
CREATE TABLE merchant_settings (
    id BIGSERIAL PRIMARY KEY,
    maximum_transaction_amount NUMERIC(12, 2) NOT NULL DEFAULT 1000000 CHECK (maximum_transaction_amount > 0),
    maximum_discount_percentage NUMERIC(5, 2) NOT NULL DEFAULT 10 CHECK (maximum_discount_percentage >= 0 AND maximum_discount_percentage <= 100),
    human_approval_amount NUMERIC(12, 2) NOT NULL DEFAULT 800000 CHECK (human_approval_amount > 0),
    currency VARCHAR(10) DEFAULT 'INR',
    store_name TEXT DEFAULT 'Apex Tech Enterprise Store',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ORDERS TABLE (For AI Transactable Phase)
CREATE TABLE orders (
    id VARCHAR(50) PRIMARY KEY,
    customer_request TEXT,
    product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    original_price NUMERIC(12, 2) NOT NULL,
    discount_percentage NUMERIC(5, 2) DEFAULT 0,
    discount_amount NUMERIC(12, 2) DEFAULT 0,
    final_price NUMERIC(12, 2) NOT NULL,
    status VARCHAR(30) NOT NULL, -- 'APPROVED', 'BLOCKED', 'HUMAN_APPROVAL', 'FAILED'
    policy_reason TEXT,
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. AUDIT LOGS TABLE (Chronological Decision Trace)
CREATE TABLE audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(id) ON DELETE SET NULL,
    step VARCHAR(50) NOT NULL,
    decision VARCHAR(50) NOT NULL,
    reason TEXT,
    metadata JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_pricing_rules_product_id ON pricing_rules(product_id);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_audit_logs_order_id ON audit_logs(order_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

-- =========================================================================
-- SEED DATA
-- =========================================================================

-- Seed Merchant Settings
INSERT INTO merchant_settings (
    maximum_transaction_amount,
    maximum_discount_percentage,
    human_approval_amount,
    currency,
    store_name
) VALUES (
    1000000, -- ₹10,00,000 maximum AI spending cap
    10,      -- 10% maximum discount cap
    800000,  -- ₹8,00,000 human review trigger threshold
    'INR',
    'Apex Tech Enterprise Store'
);

-- Seed Products
INSERT INTO products (id, name, description, category, price, minimum_price, stock, image_url) VALUES
(1, 'MacBook Air M4', 'Apple M4 chip, 16GB Unified Memory, 512GB SSD, 13.6-inch Liquid Retina Display', 'Laptops', 100000, 90000, 20, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80'),
(2, 'Dell XPS 14', 'Intel Core Ultra 7, 32GB RAM, 1TB SSD, 3.2K OLED Touch Display, CNC Aluminum', 'Laptops', 120000, 108000, 15, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80'),
(3, 'Lenovo ThinkPad X1', 'Carbon Gen 12, Intel Core Ultra 7 165H, 32GB LPDDR5X, Enterprise Security Engine', 'Laptops', 110000, 99000, 25, 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80'),
(4, 'HP Spectre x360', '2-in-1 convertible, 14-inch 2.8K OLED, Intel Core Ultra 7, Nightfall Black with Gem Cut', 'Laptops', 95000, 85000, 12, 'https://images.unsplash.com/photo-1544731612-de2f96407ad9?auto=format&fit=crop&w=600&q=80'),
(5, 'Logitech MX Master 3S', 'Performance wireless ergonomic mouse, 8K DPI sensor, Quiet Clicks, MagSpeed Wheel', 'Accessories', 9500, 8500, 50, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80');

-- Reset product primary key sequence to max id
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));

-- Seed Pricing Rules (Bulk Discounts)
-- MacBook Air M4: 5+ -> 5%, 10+ -> 8%
INSERT INTO pricing_rules (product_id, minimum_quantity, discount_percentage) VALUES
(1, 5, 5),
(1, 10, 8);

-- Dell XPS 14: 5+ -> 6%
INSERT INTO pricing_rules (product_id, minimum_quantity, discount_percentage) VALUES
(2, 5, 6);

-- Lenovo ThinkPad X1: 5+ -> 5%, 10+ -> 8%
INSERT INTO pricing_rules (product_id, minimum_quantity, discount_percentage) VALUES
(3, 5, 5),
(3, 10, 8);

-- HP Spectre x360: 4+ -> 5%
INSERT INTO pricing_rules (product_id, minimum_quantity, discount_percentage) VALUES
(4, 4, 5);

-- Logitech MX Master 3S: 10+ -> 5%
INSERT INTO pricing_rules (product_id, minimum_quantity, discount_percentage) VALUES
(5, 10, 5);
