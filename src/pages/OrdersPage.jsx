import React, { useEffect, useState } from 'react';
import { AlertCircle, ArrowUpRight, CheckCircle2, Clock, FileText, Receipt, RefreshCw, Search, XCircle } from 'lucide-react';
import { fetchAuditLogs, fetchOrders } from '../services/api';

const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trace, setTrace] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [traceLoading, setTraceLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOrders();
      setOrders(data);
      if (selectedOrder) {
        const refreshed = data.find((order) => order.id === selectedOrder.id);
        if (refreshed) setSelectedOrder(refreshed);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, []);

  const showTrace = async (order) => {
    setSelectedOrder(order);
    setTraceLoading(true);
    try {
      setTrace(await fetchAuditLogs(order.id));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setTraceLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesFilter = filter === 'ALL' || order.status === filter;
    const search = searchTerm.toLowerCase();
    return matchesFilter && [order.id, order.product_name, order.customer_request].some((value) => value?.toLowerCase().includes(search));
  });

  return (
    <div className="space-y-8 pb-12">
      <div className="border-b border-slate-800 pb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2"><Receipt className="w-6 h-6 text-indigo-400" /><h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">AI Orders</h1></div>
          <p className="text-sm text-slate-400 mt-1">Backend order records created after deterministic policy evaluation.</p>
        </div>
        <button onClick={loadOrders} title="Refresh orders" className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="relative flex-1"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search order, product, or request..." className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500" /></div>
        <div className="flex flex-wrap items-center gap-2">{['ALL', 'APPROVED', 'BLOCKED', 'PENDING', 'PAYMENT_PENDING', 'PAID', 'PAYMENT_FAILED'].map((status) => <button key={status} onClick={() => setFilter(status)} className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold ${filter === status ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>{status}</button>)}</div>
      </div>

      {error && <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}
      {loading ? <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800 text-sm text-slate-400">Loading orders...</div> : (
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800/80 overflow-hidden shadow-xl">
          <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-950/80 text-slate-400 font-mono uppercase tracking-wider border-b border-slate-800"><tr><th className="px-5 py-3.5">Order ID & Timestamp</th><th className="px-5 py-3.5">Product</th><th className="px-5 py-3.5">Original</th><th className="px-5 py-3.5">Discount</th><th className="px-5 py-3.5">Final</th><th className="px-5 py-3.5">Status</th><th className="px-5 py-3.5 text-right">Trace</th></tr></thead><tbody className="divide-y divide-slate-800/60">
            {filteredOrders.map((order) => <tr key={order.id} className="hover:bg-slate-800/30"><td className="px-5 py-4"><div className="font-mono font-bold text-white">{order.id}</div><div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(order.created_at).toLocaleString('en-IN')}</div></td><td className="px-5 py-4"><div className="font-semibold text-slate-200">{order.product_name}</div><div className="text-[11px] text-indigo-400 font-mono">{order.quantity} units</div></td><td className="px-5 py-4 font-mono text-slate-400">{formatCurrency(order.original_price)}</td><td className="px-5 py-4 font-mono text-emerald-400">{order.discount_percentage}% ({formatCurrency(order.discount_amount)})</td><td className="px-5 py-4 font-mono text-sm font-bold text-white">{formatCurrency(order.final_price)}</td><td className="px-5 py-4"><span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${order.status === 'APPROVED' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20'}`}>{order.status === 'APPROVED' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}{order.status}</span></td><td className="px-5 py-4 text-right"><button onClick={() => showTrace(order)} className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1">View trace <ArrowUpRight className="w-3.5 h-3.5" /></button></td></tr>)}
          </tbody></table></div>
          {!filteredOrders.length && <div className="p-10 text-center text-sm text-slate-500">No orders match this filter.</div>}
        </div>
      )}

      {selectedOrder && <section className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-5"><div className="flex items-center justify-between border-b border-slate-800 pb-4"><div><div className="flex items-center gap-2"><FileText className="w-4 h-4 text-indigo-400" /><h2 className="text-base font-bold text-white">Decision Trace: {selectedOrder.id}</h2></div><p className="text-xs text-slate-400 mt-1">{selectedOrder.policy_reason}</p></div><button onClick={() => setSelectedOrder(null)} title="Close trace" className="p-1.5 text-slate-400 hover:text-white"><X className="w-4 h-4" /></button></div>{traceLoading ? <div className="text-sm text-slate-400">Loading trace...</div> : <div className="space-y-3">{trace.map((log) => <div key={log.id} className="flex gap-3"><div className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${log.decision === 'FAILED' || log.decision === 'BLOCKED' ? 'bg-rose-400' : 'bg-emerald-400'}`} /><div className="flex-1"><div className="flex flex-wrap justify-between gap-2"><span className="text-xs font-semibold text-slate-200">{log.step}</span><span className="text-[11px] font-mono text-slate-500">{new Date(log.timestamp).toLocaleString('en-IN')}</span></div><p className="text-xs text-slate-400 mt-1">{log.reason}</p></div></div>)}</div>}</section>}
    </div>
  );
}
