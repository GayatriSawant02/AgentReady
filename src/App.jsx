import React, { useState } from 'react';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import MerchantPage from './pages/MerchantPage';
import AiBuyerPage from './pages/AiBuyerPage';
import OrdersPage from './pages/OrdersPage';
import AuditPage from './pages/AuditPage';
import { ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Global Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'dashboard' && <DashboardPage setActiveTab={setActiveTab} />}
        {activeTab === 'merchant' && <MerchantPage setActiveTab={setActiveTab} />}
        {activeTab === 'ai-buyer' && <AiBuyerPage setActiveTab={setActiveTab} />}
        {activeTab === 'orders' && <OrdersPage setActiveTab={setActiveTab} />}
        {activeTab === 'audit' && <AuditPage setActiveTab={setActiveTab} />}
      </main>

      {/* Global Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-300">AgentReady</span>
          </div>

          <div className="text-center sm:text-right text-[11px] text-slate-400">
            Prototype Agent-Readable Commerce Layer inspired by emerging agentic commerce protocols
          </div>
        </div>
      </footer>
    </div>
  );
}
