import { Router } from 'express';
import { db } from '../db/supabaseClient.js';

const router = Router();

// GET /api/products — Retrieve all products with bulk pricing rules
router.get('/', async (req, res) => {
  try {
    const products = await db.getProducts();
    res.json({ success: true, data: products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch products' });
  }
});

// GET /api/products/:id — Retrieve single product
router.get('/:id', async (req, res) => {
  try {
    const product = await db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch product' });
  }
});

// POST /api/products — Create a new product with optional bulk rules
router.post('/', async (req, res) => {
  try {
    const { name, price, minimum_price, stock } = req.body;
    if (!name || price === undefined || minimum_price === undefined || stock === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, price, minimum_price, and stock are required'
      });
    }

    if (Number(minimum_price) > Number(price)) {
      return res.status(400).json({
        success: false,
        error: 'Minimum price cannot exceed list price'
      });
    }

    const created = await db.createProduct(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to create product' });
  }
});

// PUT /api/products/:id — Update an existing product
router.put('/:id', async (req, res) => {
  try {
    const { price, minimum_price } = req.body;
    if (price !== undefined && minimum_price !== undefined && Number(minimum_price) > Number(price)) {
      return res.status(400).json({
        success: false,
        error: 'Minimum price cannot exceed list price'
      });
    }

    const updated = await db.updateProduct(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to update product' });
  }
});

// DELETE /api/products/:id — Delete a product
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await db.deleteProduct(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, message: `Product ${req.params.id} deleted successfully` });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to delete product' });
  }
});

export default router;
