import React from 'react';
import { 
  Bot, 
  IndianRupee, 
  Percent, 
  ShieldAlert, 
  ArrowUpRight, 
  Sliders, 
  FileCode2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import StatCard from '../components/StatCard';
import FlowPipeline from '../components/FlowPipeline';
import { 
  mockDashboardStats, 
  mockRecentActivity, 
  mockDecisionTraceSample, 
  mockMerchantSettings 
} from '../data/mockData';

export default function DashboardPage({ setActiveTab }) {
  return (
    <div className="space-y-8 pb-12 ar-reveal">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900/70 to-lime-950/20 p-8 sm:p-10 border border-cyan-400/20 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="max-w-3xl space-y-4">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Your store is ready for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400">
              AI buyers.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            Let AI agents discover, negotiate and transact with your catalog — within boundaries you control.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('ai-buyer')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/30 hover:scale-[1.02]"
            >
              <Bot className="w-4 h-4" />
              <span>Launch AI Buyer Demo</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
            <button
              onClick={() => setActiveTab('merchant')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-medium text-sm transition-all"
            >
              <Sliders className="w-4 h-4 text-slate-400" />
              <span>Configure AI Limits</span>
            </button>
          </div>
        </div>

        {/* Visual Pipeline */}
        <FlowPipeline />
      </div>

      {/* 4 Core Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="AI Orders"
          value={mockDashboardStats.aiOrders.value}
          change={mockDashboardStats.aiOrders.change}
          isPositive={mockDashboardStats.aiOrders.isPositive}
          description={mockDashboardStats.aiOrders.description}
          icon={Bot}
          highlight={true}
        />
        <StatCard
          title="AI Revenue"
          value={mockDashboardStats.aiRevenue.value}
          change={mockDashboardStats.aiRevenue.change}
          isPositive={mockDashboardStats.aiRevenue.isPositive}
          description={mockDashboardStats.aiRevenue.description}
          icon={IndianRupee}
        />
        <StatCard
          title="Average Discount"
          value={mockDashboardStats.averageDiscount.value}
          change={mockDashboardStats.averageDiscount.change}
          isPositive={mockDashboardStats.averageDiscount.isPositive}
          description={mockDashboardStats.averageDiscount.description}
          icon={Percent}
        />
        <StatCard
          title="Blocked Transactions"
          value={mockDashboardStats.blockedTransactions.value}
          change={mockDashboardStats.blockedTransactions.change}
          isPositive={mockDashboardStats.blockedTransactions.isPositive}
          description={mockDashboardStats.blockedTransactions.description}
          icon={ShieldAlert}
        />
      </div>

      {/* Grid for: Recent AI Activity + Merchant Autonomy Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent AI Activity (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-400" />
              <h3 className="text-base font-bold text-white tracking-tight">Recent AI Activity</h3>
            </div>
            <button
              onClick={() => setActiveTab('audit')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
            >
              <span>View Full Audit</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-800/60">
            {mockRecentActivity.map((item) => (
              <div key={item.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-slate-800/20 px-2 rounded-lg transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      {item.agent}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {item.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-slate-200 font-medium">
                    {item.request}
                  </p>
                  <p className="text-xs text-slate-400">
                    {item.policyResult}
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0">
                  <span className="text-sm font-bold font-mono text-white">
                    {item.amount}
                  </span>
                  {item.status === 'APPROVED' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle className="w-3 h-3" />
                      Approved
                    </span>
                  )}
                  {item.status === 'BLOCKED' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                      <XCircle className="w-3 h-3" />
                      Blocked
                    </span>
                  )}
                  {item.status === 'HUMAN_APPROVAL' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      <AlertTriangle className="w-3 h-3" />
                      Review Required
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Merchant AI Autonomy Controls (1 col) */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <h3 className="text-base font-bold text-white tracking-tight">Merchant AI Autonomy</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ENFORCING
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-5">
              Deterministic boundaries governing autonomous agent purchases without human intervention.
            </p>

            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Max AI Transaction</span>
                  <div className="text-base font-bold font-mono text-white">₹10,00,000</div>
                </div>
                <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Strict Cap
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Max Auto Discount</span>
                  <div className="text-base font-bold font-mono text-white">10.0%</div>
                </div>
                <span className="text-[11px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  Volume-Based
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Human Approval Floor</span>
                  <div className="text-base font-bold font-mono text-white">₹8,00,000</div>
                </div>
                <span className="text-[11px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Dual Sign-Off
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={() => setActiveTab('merchant')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-2 border border-slate-700"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Modify Merchant Guardrails</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Decision Trace Preview Section */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-base font-bold text-white tracking-tight">AI Decision Trace — Live Micro-Audit</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Sample execution flow for: <code className="text-indigo-300 font-mono">"6 laptops under ₹6 lakh"</code> (Demo Scenario 1)
            </p>
          </div>
          <button
            onClick={() => setActiveTab('audit')}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
          >
            <span>Full Audit Trail</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {mockDecisionTraceSample.slice(0, 4).map((trace) => (
            <div key={trace.step} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/90 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[10px] text-slate-400 font-semibold">
                  STEP 0{trace.step}
                </span>
                <span className="font-mono text-[10px] text-indigo-400">
                  {trace.time}
                </span>
              </div>
              <h4 className="text-xs font-bold text-white">
                {trace.action}
              </h4>
              <p className="text-[11px] text-slate-400 leading-snug">
                {trace.details}
              </p>
              <div className="pt-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  <CheckCircle className="w-3 h-3" />
                  VERIFIED
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
