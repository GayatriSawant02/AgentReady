import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  Info,
  Layers,
  PackageSearch,
  Send,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { createOrder, createPaymentOrder, evaluatePolicy, fetchAgentReadableCatalog, verifyPayment } from '../services/api';

const demoRequest = 'I need 5 laptops for my startup. My budget is ₹5 lakh. Get me the best possible deal.';

const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

export default function AiBuyerPage() {
  const [query, setQuery] = useState(demoRequest);
  const [catalog, setCatalog] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    fetchAgentReadableCatalog()
      .then(setCatalog)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setCatalogLoading(false));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await evaluatePolicy(query);
      setResult(response);
      setCreatedOrder(null);
    } catch (requestError) {
      setError(requestError.message || 'Unable to create recommendation');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    setCreatingOrder(true);
    setError(null);
    try {
      const response = await createOrder(query);
      setCreatedOrder(response.order);
    } catch (requestError) {
      if (requestError.data?.order) setCreatedOrder(requestError.data.order);
      setError(requestError.message || 'Unable to create order record');
    } finally {
      setCreatingOrder(false);
    }
  };

  const handleStartPayment = async (order = createdOrder) => {
    if (!order) return;
    setPaymentLoading(true);
    setError(null);
    try {
      const response = await createPaymentOrder(order.id);
      setPaymentData(response);
      if (response.checkout.demo_mode) return;

      if (!window.Razorpay) throw new Error('Razorpay Checkout failed to load');
      const checkout = new window.Razorpay({
        key: response.checkout.key_id,
        amount: response.checkout.amount,
        currency: response.checkout.currency,
        name: 'AgentReady',
        description: `Order ${order.id}`,
        order_id: response.checkout.razorpay_order_id,
        handler: async (payment) => {
          try {
            const verified = await verifyPayment({ order_id: order.id, ...payment });
            setCreatedOrder(verified.order);
            setPaymentData(null);
          } catch (verificationError) {
            setError(verificationError.message || 'Payment verification failed');
          }
        },
        theme: { color: '#4f46e5' }
      });
      checkout.open();
    } catch (paymentError) {
      setError(paymentError.message || 'Unable to start payment');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleRunDemo = async (demoQuery) => {
    setQuery(demoQuery);
    setLoading(true);
    setError(null);
    setResult(null);
    setCreatedOrder(null);
    setPaymentData(null);
    try {
      const policyResult = await evaluatePolicy(demoQuery);
      setResult(policyResult);
      const orderResult = await createOrder(demoQuery).catch((orderError) => {
        if (orderError.data?.order) setCreatedOrder(orderError.data.order);
        throw orderError;
      });
      setCreatedOrder(orderResult.order);
      if (orderResult.order.status === 'APPROVED') {
        await handleStartPayment(orderResult.order);
      }
    } catch (demoError) {
      setError(demoError.message || 'Demo could not complete. Check the backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoPayment = async () => {
    if (!paymentData?.checkout) return;
    setPaymentLoading(true);
    setError(null);
    try {
      const verified = await verifyPayment({
        order_id: createdOrder.id,
        razorpay_order_id: paymentData.checkout.razorpay_order_id
      });
      setCreatedOrder(verified.order);
      setPaymentData(null);
    } catch (paymentError) {
      setError(paymentError.message || 'Demo payment failed');
    } finally {
      setPaymentLoading(false);
    }
  };

  const recommendation = result?.recommendation;

  return (
    <div className="space-y-8 pb-12">
      <div className="border-b border-slate-800 pb-6">
        <div className="flex items-center gap-2">
          <PackageSearch className="w-6 h-6 text-indigo-400" />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">AI Buyer</h1>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Explore the merchant catalog and receive a catalog-backed purchase recommendation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 p-2 rounded-2xl bg-slate-900/90 border border-slate-700 shadow-xl focus-within:border-indigo-500 transition-all">
          <div className="p-2 text-indigo-400"><Bot className="w-5 h-5" /></div>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tell the AI what you need to buy..."
            className="flex-1 min-w-0 bg-transparent border-none text-white text-sm focus:outline-none placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold transition-all"
          >
            {loading ? <Sparkles className="w-3.5 h-3.5 animate-pulse" /> : <Send className="w-3.5 h-3.5" />}
            <span>{loading ? 'Thinking...' : 'Get Recommendation'}</span>
          </button>
        </form>
        <button
          type="button"
          onClick={() => setQuery(demoRequest)}
          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700"
        >
          Load demo request
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-500">Reliable demo scenarios</span>
        <button type="button" onClick={() => handleRunDemo(demoRequest)} disabled={loading || paymentLoading} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold">
          <CheckCircle2 className="w-3.5 h-3.5" /> Try Successful Demo
        </button>
        <button type="button" onClick={() => handleRunDemo('I need 20 MacBook Air M4 laptops.')} disabled={loading || paymentLoading} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold">
          <AlertCircle className="w-3.5 h-3.5" /> Try Blocked Demo
        </button>
      </div>

      <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <span className="font-bold text-indigo-300 uppercase tracking-wider">Recommendation only</span>
          <p className="text-slate-300 leading-relaxed">
            The shopping assistant uses the backend agent-readable catalog. It cannot authorize payments or make final approval decisions. Prices, inventory, and discount estimates are calculated from backend catalog data.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {catalogLoading ? (
        <div className="p-10 text-center rounded-2xl bg-slate-900/50 border border-slate-800 text-sm text-slate-400">
          Loading agent-readable catalog...
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>Backend catalog connected: {catalog?.products?.length || 0} products and merchant pricing rules available.</span>
        </div>
      )}

      {recommendation && (
        <>
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          <section className="lg:col-span-4 p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h2 className="text-base font-bold text-white">AI Recommendation</h2>
              </div>
              <span className="text-[10px] font-mono px-2 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">NOT APPROVED</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-slate-400 font-mono">RECOMMENDED PRODUCT</span>
                <h3 className="text-lg font-bold text-white mt-1">{recommendation.product.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{formatCurrency(recommendation.product.unit_price)} per unit</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-mono">QUANTITY</span>
                <div className="text-2xl font-black font-mono text-indigo-400">× {recommendation.quantity}</div>
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between text-slate-300"><span>Original price</span><strong>{formatCurrency(recommendation.original_amount)}</strong></div>
              <div className="flex justify-between text-emerald-400"><span>Discount ({recommendation.discount_percentage}%)</span><strong>- {formatCurrency(recommendation.savings)}</strong></div>
              <div className="flex justify-between text-white text-sm font-bold pt-3 border-t border-slate-700"><span className="font-sans">Estimated final price</span><strong className="text-indigo-300">{formatCurrency(recommendation.estimated_final_amount)}</strong></div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs space-y-1">
              <span className="font-semibold text-slate-300 flex items-center gap-1"><Info className="w-3.5 h-3.5 text-indigo-400" />Explanation</span>
              <p className="text-slate-400 leading-relaxed">{recommendation.explanation}</p>
            </div>
          </section>

          <aside className="lg:col-span-3 p-6 rounded-2xl bg-slate-900/80 border border-emerald-500/30 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h2 className="text-base font-bold text-white">Catalog Facts</h2>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between"><span className="text-slate-400">Inventory</span><span className={recommendation.stock_available ? 'text-emerald-400' : 'text-rose-400'}>{recommendation.product.stock} units available</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Minimum price</span><span className="font-mono text-white">{formatCurrency(recommendation.product.minimum_price)}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">User budget</span><span className="font-mono text-white">{recommendation.budget ? formatCurrency(recommendation.budget) : 'Not specified'}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Approval status</span><span className={result.policy.allowed ? 'text-emerald-400' : 'text-rose-400'}>{result.policy.allowed ? 'Policy passed' : 'Blocked'}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Payment</span><span className="text-slate-300">{createdOrder?.status === 'PAID' ? 'Paid' : createdOrder?.status === 'PAYMENT_PENDING' ? 'Pending' : 'Not started'}</span></div>
            </div>
            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 leading-relaxed">
              {recommendation.security_notice}
            </div>
          </aside>
        </div>

        <section className={`p-6 rounded-2xl border space-y-5 ${result.policy.allowed ? 'bg-slate-900/80 border-emerald-500/30' : 'bg-slate-900/80 border-rose-500/30'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className={result.policy.allowed ? 'w-4 h-4 text-emerald-400' : 'w-4 h-4 text-rose-400'} />
              <h2 className="text-base font-bold text-white">Deterministic Policy Engine</h2>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold">
              <span className={`px-2.5 py-1 rounded-full border ${result.policy.allowed ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'}`}>
                {result.policy.allowed ? (result.policy.requiresHumanApproval ? 'HUMAN APPROVAL REQUIRED' : 'ALLOWED') : 'BLOCKED'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {result.policy.policyChecks.map((policyCheck) => (
              <div key={policyCheck.key} className={`p-3 rounded-xl border flex items-start gap-2.5 ${policyCheck.passed ? 'bg-slate-950/60 border-slate-800' : 'bg-rose-950/40 border-rose-500/30'}`}>
                {policyCheck.passed ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
                <div>
                  <div className="text-xs font-semibold text-slate-200">{policyCheck.label}</div>
                  <div className="text-[11px] text-slate-400 leading-relaxed mt-0.5">{policyCheck.detail}</div>
                </div>
              </div>
            ))}
          </div>

          <div className={`p-3.5 rounded-xl text-xs ${result.policy.allowed ? 'bg-emerald-950/30 border border-emerald-500/20 text-emerald-200' : 'bg-rose-950/40 border border-rose-500/30 text-rose-200'}`}>
            <strong>{result.policy.allowed ? (result.policy.requiresHumanApproval ? 'Human approval required.' : 'Policy checks passed.') : 'Transaction blocked.'}</strong>
            <span className="ml-1">{result.policy.reason}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-[11px] text-slate-500">Order creation repeats catalog pricing and policy checks on the backend.</span>
            <button
              type="button"
              onClick={handleCreateOrder}
              disabled={creatingOrder}
              className={`px-4 py-2 rounded-xl text-xs font-semibold text-white disabled:opacity-50 ${result.policy.allowed ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'}`}
            >
              {creatingOrder ? 'Recording...' : result.policy.allowed ? 'Create Approved Order' : 'Record Blocked Order'}
            </button>
          </div>
          {createdOrder && (
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
              Order <span className="font-mono text-indigo-300">{createdOrder.id}</span> recorded with status <strong className={createdOrder.status === 'APPROVED' || createdOrder.status === 'PAID' ? 'text-emerald-400' : 'text-rose-400'}>{createdOrder.status}</strong>.
            </div>
          )}
          {createdOrder?.status === 'APPROVED' && !paymentData && (
            <button type="button" onClick={handleStartPayment} disabled={paymentLoading} className="w-full px-4 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-sm font-bold">
              {paymentLoading ? 'Preparing secure checkout...' : 'Start Razorpay Test Checkout'}
            </button>
          )}
          {paymentData?.checkout?.demo_mode && (
            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-3">
              <div className="text-xs font-bold text-amber-300">DEMO PAYMENT MODE</div>
              <p className="text-xs text-amber-100/80">Razorpay test credentials are unavailable. This local demonstration still uses the server-verified order amount.</p>
              <button type="button" onClick={handleDemoPayment} disabled={paymentLoading} className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold">{paymentLoading ? 'Recording demo payment...' : 'Complete Demo Payment'}</button>
            </div>
          )}
        </section>
        </>
      )}
    </div>
  );
}
