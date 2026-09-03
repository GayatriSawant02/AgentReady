import React from 'react';
import { 
  Bot, 
  Store, 
  ShoppingBag, 
  Receipt, 
  History, 
  Cpu
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Bot },
    { id: 'merchant', label: 'Merchant', icon: Store },
    { id: 'ai-buyer', label: 'AI Buyer', icon: ShoppingBag },
    { id: 'orders', label: 'Orders', icon: Receipt },
    { id: 'audit', label: 'Audit', icon: History },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between min-h-16 py-2 gap-3">
          {/* Brand & Tagline */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
              <img src="/agentready-logo.svg" alt="AgentReady" className="w-9 h-9" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white font-sans">
                  Agent<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Ready</span>
                </span>
              </div>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="order-3 lg:order-none w-full lg:w-auto flex flex-wrap items-center justify-center gap-2 pb-1 lg:pb-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-inner'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Top-Right Status: AI Commerce ● ACTIVE */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>Policy: <strong className="text-slate-200">Deterministic</strong></span>
            </div>

            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-950/50 border border-emerald-500/30 shadow-sm shadow-emerald-500/10">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold tracking-wide text-emerald-400 font-mono">
                AI Commerce <span className="text-emerald-300">●</span> ACTIVE
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
