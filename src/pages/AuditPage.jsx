import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, Database, FileText, History, RefreshCw, XCircle } from 'lucide-react';
import { fetchAuditLogs, fetchOrders } from '../services/api';

export default function AuditPage() {
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async (orderId) => {
    setLoading(true);
    setError(null);
    try {
      const [orderData, logData] = await Promise.all([fetchOrders(), fetchAuditLogs(orderId)]);
      setOrders(orderData);
      setLogs(logData);
      if (!orderId && orderData[0]) {
        setSelectedOrderId(orderData[0].id);
        setLogs(await fetchAuditLogs(orderData[0].id));
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleOrderChange = (event) => {
    const orderId = event.target.value;
    setSelectedOrderId(orderId);
    loadData(orderId);
  };

  const selectedOrder = orders.find((order) => order.id === selectedOrderId);

  return (
    <div className="space-y-8 pb-12">
      <div className="border-b border-slate-800 pb-6">
        <div className="flex items-center justify-between gap-4"><div><div className="flex items-center gap-2"><History className="w-6 h-6 text-indigo-400" /><h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Audit Trail</h1></div><p className="text-sm text-slate-400 mt-1">Chronological record of every AI purchase decision and order outcome.</p></div><button onClick={() => loadData(selectedOrderId || undefined)} title="Refresh audit trail" className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button></div>
      </div>

      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div className="flex items-center gap-2"><FileText className="w-4 h-4 text-indigo-400" /><span className="text-xs font-semibold text-slate-300">Order decision trace</span></div><select value={selectedOrderId} onChange={handleOrderChange} className="sm:min-w-72 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"><option value="">All audit events</option>{orders.map((order) => <option key={order.id} value={order.id}>{order.id} · {order.product_name} · {order.status}</option>)}</select></div>

      {error && <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}
      {selectedOrder && <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex flex-wrap items-center justify-between gap-3"><span className="font-mono text-white">{selectedOrder.id} · {selectedOrder.product_name} × {selectedOrder.quantity}</span><span className={selectedOrder.status === 'APPROVED' ? 'text-emerald-400' : 'text-rose-400'}>{selectedOrder.status} · ₹{Number(selectedOrder.final_price).toLocaleString('en-IN')}</span></div>}

      <section className="p-6 sm:p-8 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-xl"><div className="flex items-center gap-2 border-b border-slate-800 pb-4"><Database className="w-4 h-4 text-indigo-400" /><h2 className="text-base font-bold text-white">Chronological Decision Timeline</h2><span className="text-[11px] text-slate-500 ml-auto">{logs.length} events</span></div>{loading ? <div className="py-12 text-center text-sm text-slate-400">Loading audit events...</div> : logs.length ? <div className="relative mt-6 pl-7 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">{logs.map((log) => { const failed = log.decision === 'FAILED' || log.decision === 'BLOCKED'; return <div key={log.id} className="relative"><div className={`absolute -left-7 top-1 w-4 h-4 rounded-full border-2 bg-slate-950 ${failed ? 'border-rose-500' : 'border-emerald-500'}`}>{failed ? <XCircle className="w-3 h-3 text-rose-400" /> : <CheckCircle2 className="w-3 h-3 text-emerald-400" />}</div><div className={`p-4 rounded-xl border ${failed ? 'bg-rose-950/20 border-rose-500/30' : 'bg-slate-950/50 border-slate-800'}`}><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1"><div className="flex items-center gap-2"><span className="text-xs font-bold text-white">{log.step}</span><span className={`text-[10px] font-mono px-2 py-0.5 rounded ${failed ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/15 text-emerald-300'}`}>{log.decision}</span></div><span className="text-[11px] font-mono text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(log.timestamp).toLocaleString('en-IN')}</span></div><p className="text-xs text-slate-400 mt-2 leading-relaxed">{log.reason}</p></div></div>; })}</div> : <div className="py-12 text-center text-sm text-slate-500">No audit events recorded yet.</div>}</section>
    </div>
  );
}
