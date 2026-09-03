import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Plus, 
  Edit3, 
  Trash2, 
  Sliders, 
  ShieldCheck, 
  Package, 
  Tag, 
  Sparkles,
  Layers,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  PlusCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { 
  fetchProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  fetchSettings, 
  updateSettings 
} from '../services/api';

export default function MerchantPage() {
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState({
    maximum_transaction_amount: 1000000,
    maximum_discount_percentage: 10,
    human_approval_amount: 800000,
    currency: 'INR'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals & UI States
  const [modalMode, setModalMode] = useState(null); // 'add' | 'edit' | null
  const [activeProduct, setActiveProduct] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Laptops',
    price: '',
    minimum_price: '',
    stock: '',
    image_url: '',
    bulk_rules: []
  });
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Banner Notification
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Load initial data from backend
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodsData, settingsData] = await Promise.all([
        fetchProducts(),
        fetchSettings()
      ]);
      setProducts(prodsData);
      if (settingsData) {
        setSettings(settingsData);
      }
    } catch (err) {
      console.error('Failed to load merchant data:', err);
      setError(err.message || 'Unable to connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save AI Commerce Rules Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateSettings({
        maximum_transaction_amount: Number(settings.maximum_transaction_amount),
        maximum_discount_percentage: Number(settings.maximum_discount_percentage),
        human_approval_amount: Number(settings.human_approval_amount),
        currency: settings.currency || 'INR'
      });
      setSettings(updated);
      showNotification('Merchant AI spending and policy rules successfully saved to database!');
    } catch (err) {
      showNotification(err.message || 'Failed to update settings', 'error');
    }
  };

  // Open Add Product Modal
  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      description: '',
      category: 'Laptops',
      price: '',
      minimum_price: '',
      stock: '',
      image_url: '',
      bulk_rules: [{ minimum_quantity: 5, discount_percentage: 5 }]
    });
    setFormError(null);
    setModalMode('add');
  };

  // Open Edit Product Modal
  const handleOpenEditModal = (product) => {
    setActiveProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      category: product.category || 'Laptops',
      price: product.price,
      minimum_price: product.minimum_price,
      stock: product.stock,
      image_url: product.image_url || '',
      bulk_rules: Array.isArray(product.bulk_rules) 
        ? product.bulk_rules.map(r => ({ minimum_quantity: r.minimum_quantity, discount_percentage: r.discount_percentage }))
        : []
    });
    setFormError(null);
    setModalMode('edit');
  };

  // Add / Remove Bulk Rule Rows in Modal Form
  const handleAddBulkRule = () => {
    setFormData(prev => ({
      ...prev,
      bulk_rules: [...prev.bulk_rules, { minimum_quantity: 10, discount_percentage: 8 }]
    }));
  };

  const handleRemoveBulkRule = (index) => {
    setFormData(prev => ({
      ...prev,
      bulk_rules: prev.bulk_rules.filter((_, i) => i !== index)
    }));
  };

  const handleBulkRuleChange = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.bulk_rules];
      updated[index] = { ...updated[index], [field]: Number(value) };
      return { ...prev, bulk_rules: updated };
    });
  };

  // Submit Product Form
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Basic Validations
    if (!formData.name.trim()) {
      setFormError('Product name is required');
      return;
    }
    if (Number(formData.price) <= 0) {
      setFormError('Price must be greater than 0');
      return;
    }
    if (Number(formData.minimum_price) > Number(formData.price)) {
      setFormError('Minimum price cannot exceed list price');
      return;
    }
    if (Number(formData.stock) < 0) {
      setFormError('Stock cannot be negative');
      return;
    }

    setIsSubmitting(true);
    try {
      if (modalMode === 'add') {
        const created = await createProduct({
          ...formData,
          price: Number(formData.price),
          minimum_price: Number(formData.minimum_price),
          stock: Number(formData.stock)
        });
        setProducts(prev => [...prev, created]);
        showNotification(`Product "${created.name}" created and added to agent-readable catalog!`);
      } else if (modalMode === 'edit') {
        const updated = await updateProduct(activeProduct.id, {
          ...formData,
          price: Number(formData.price),
          minimum_price: Number(formData.minimum_price),
          stock: Number(formData.stock)
        });
        setProducts(prev => prev.map(p => p.id === activeProduct.id ? updated : p));
        showNotification(`Product "${updated.name}" updated successfully!`);
      }
      setModalMode(null);
    } catch (err) {
      setFormError(err.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id, name) => {
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      setDeleteConfirmId(null);
      showNotification(`Product "${name}" removed from catalog`);
    } catch (err) {
      showNotification(err.message || 'Failed to delete product', 'error');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md transition-all ${
          notification.type === 'error'
            ? 'bg-rose-950/90 text-rose-200 border-rose-500/50'
            : 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50'
        }`}>
          {notification.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span className="text-xs font-medium">{notification.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Store className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Merchant Catalog & AI Guardrails
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Configure catalog inventory, floor pricing, bulk discount tiers, and autonomous AI spending limits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            title="Refresh from Backend"
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* AI COMMERCE RULES INTERFACE */}
      <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">AI Commerce Rules & Boundaries</h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Active in Backend
                </span>
              </div>
              <p className="text-xs text-slate-400">Deterministic thresholds enforced against incoming AI buyer requests</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveSettings} className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Max AI Transaction */}
          <div className="space-y-1.5 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Maximum AI Transaction</span>
              <span className="text-[10px] font-mono text-indigo-400">Hard Cap</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-mono">₹</span>
              <input
                type="number"
                value={settings.maximum_transaction_amount}
                onChange={(e) => setSettings({ ...settings, maximum_transaction_amount: e.target.value })}
                className="w-full pl-8 pr-3 py-2 bg-slate-900/80 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <p className="text-[11px] text-slate-500">Autonomous purchases above this trigger immediate block.</p>
          </div>

          {/* Max Allowed Discount */}
          <div className="space-y-1.5 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Maximum Allowed Discount</span>
              <span className="text-[10px] font-mono text-indigo-400">Cap</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={settings.maximum_discount_percentage}
                onChange={(e) => setSettings({ ...settings, maximum_discount_percentage: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900/80 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                required
                min="0"
                max="100"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-mono">%</span>
            </div>
            <p className="text-[11px] text-slate-500">Max cumulative discount any AI negotiation or rule can reach.</p>
          </div>

          {/* Human Approval Threshold */}
          <div className="space-y-1.5 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Human Approval Above</span>
              <span className="text-[10px] font-mono text-amber-400">Review Floor</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-mono">₹</span>
              <input
                type="number"
                value={settings.human_approval_amount}
                onChange={(e) => setSettings({ ...settings, human_approval_amount: e.target.value })}
                className="w-full pl-8 pr-3 py-2 bg-slate-900/80 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <p className="text-[11px] text-slate-500">Orders exceeding this require merchant manual confirmation.</p>
          </div>

          <div className="sm:col-span-3 flex justify-end pt-1">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save AI Commerce Rules</span>
            </button>
          </div>
        </form>
      </div>

      {/* PRODUCT CATALOG SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">Active Product Catalog</h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {products.length} Products
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            Endpoint: <code className="text-indigo-400">GET /api/products</code>
          </span>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-400 mx-auto mb-2" />
            <span className="text-xs text-slate-400">Fetching products from backend...</span>
          </div>
        )}

        {error && (
          <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400" />
              <span>Error loading catalog: {error}</span>
            </div>
            <button
              onClick={loadData}
              className="px-3 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-900 text-white font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-indigo-500/40 transition-all duration-200 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                          ID #{product.id}
                        </span>
                        <span className="text-xs text-slate-400">{product.category}</span>
                      </div>
                      <h4 className="text-base font-bold text-white mt-1 group-hover:text-indigo-300 transition-colors">
                        {product.name}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(product)}
                        title="Edit Product"
                        className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(product.id)}
                        title="Delete Product"
                        className="p-2 rounded-lg bg-slate-800/80 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {product.description || 'No description provided.'}
                  </p>

                  {/* Price, Floor, & Stock Badges */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] uppercase font-mono text-slate-400 block">List Price</span>
                      <span className="text-sm font-bold font-mono text-white">
                        ₹{Number(product.price).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] uppercase font-mono text-amber-400/80 block">Min Floor</span>
                      <span className="text-sm font-bold font-mono text-amber-300">
                        ₹{Number(product.minimum_price).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] uppercase font-mono text-slate-400 block">In Stock</span>
                      <span className={`text-sm font-bold font-mono ${product.stock > 10 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {product.stock} units
                      </span>
                    </div>
                  </div>

                  {/* Bulk Pricing Rules */}
                  <div className="pt-2">
                    <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1.5">
                      <Tag className="w-3 h-3 text-indigo-400" />
                      Bulk Pricing Rules (Agent-Negotiable):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(product.bulk_rules) && product.bulk_rules.length > 0 ? (
                        product.bulk_rules.map((rule, idx) => (
                          <span
                            key={idx}
                            className="text-xs font-mono px-2.5 py-1 rounded-lg bg-indigo-950/50 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5"
                          >
                            <span>{rule.minimum_quantity}+ units</span>
                            <span className="text-indigo-400 font-bold">→ {rule.discount_percentage}% OFF</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500 italic">No bulk rules configured</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delete Confirmation In-Card Prompt */}
                {deleteConfirmId === product.id && (
                  <div className="mt-3 p-3 rounded-xl bg-rose-950/50 border border-rose-500/30 flex items-center justify-between gap-2 animate-fade-in">
                    <span className="text-xs text-rose-200">Delete this product from catalog?</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2.5 py-1 text-xs rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id, product.name)}
                        className="px-2.5 py-1 text-xs rounded bg-rose-600 hover:bg-rose-500 text-white font-semibold"
                      >
                        Confirm Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-xl p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                {modalMode === 'add' ? 'Add New Product to Catalog' : `Edit Product: ${activeProduct?.name}`}
              </h3>
              <button
                onClick={() => setModalMode(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleProductSubmit} className="space-y-4 text-xs">
              {/* Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 mb-1 font-semibold">Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. MacBook Pro M4"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-sans focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-sans focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Laptops">Laptops</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Audio">Audio</option>
                    <option value="Servers">Servers</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Price, Floor Price, Stock */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">List Price (₹) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="100000"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Floor Price (₹) *</label>
                  <input
                    type="number"
                    value={formData.minimum_price}
                    onChange={(e) => setFormData({ ...formData, minimum_price: e.target.value })}
                    placeholder="90000"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Initial Stock *</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="20"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
                    required
                    min="0"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Specs, architecture, configuration..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-sans focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Bulk Pricing Rules Manager */}
              <div className="space-y-2 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-indigo-400" />
                    Bulk Pricing Rules (Discount Tiers)
                  </span>
                  <button
                    type="button"
                    onClick={handleAddBulkRule}
                    className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add Tier</span>
                  </button>
                </div>

                {formData.bulk_rules.length === 0 ? (
                  <p className="text-slate-500 text-[11px] italic">No bulk tiers added yet. Click 'Add Tier' to configure volume discounts.</p>
                ) : (
                  formData.bulk_rules.map((rule, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="flex-1 flex items-center gap-2">
                        <span className="text-slate-400">Min Qty:</span>
                        <input
                          type="number"
                          value={rule.minimum_quantity}
                          onChange={(e) => handleBulkRuleChange(idx, 'minimum_quantity', e.target.value)}
                          className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white font-mono"
                          min="2"
                        />
                      </div>
                      <div className="flex-1 flex items-center gap-2">
                        <span className="text-slate-400">Discount:</span>
                        <div className="relative">
                          <input
                            type="number"
                            value={rule.discount_percentage}
                            onChange={(e) => handleBulkRuleChange(idx, 'discount_percentage', e.target.value)}
                            className="w-20 px-2 py-1 pr-6 bg-slate-900 border border-slate-700 rounded text-white font-mono"
                            min="1"
                            max="100"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-[11px]">%</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveBulkRule(idx)}
                        className="p-1 text-slate-500 hover:text-rose-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting && <RefreshCw className="w-3 h-3 animate-spin" />}
                  <span>{modalMode === 'add' ? 'Create Product' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
