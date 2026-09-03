import React from 'react';
import { ArrowUpRight, ArrowDownRight, ShieldAlert, Sparkles } from 'lucide-react';

export default function StatCard({ title, value, change, isPositive, description, icon: Icon, highlight = false }) {
  return (
    <div className={`p-6 rounded-xl border transition-all duration-300 relative overflow-hidden group ${
      highlight 
        ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border-indigo-500/30 shadow-lg shadow-indigo-500/10' 
        : 'bg-slate-900/60 hover:bg-slate-900/90 border-slate-800/80 hover:border-slate-700'
    }`}>
      {/* Background radial accent */}
      <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors pointer-events-none" />

      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider font-mono">
          {title}
        </span>
        <div className={`p-2.5 rounded-lg border ${
          highlight 
            ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' 
            : 'bg-slate-800/80 border-slate-700 text-slate-300'
        }`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4">
        <div className="text-3xl font-extrabold tracking-tight text-white font-sans">
          {value}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          {isPositive === true && (
            <span className="inline-flex items-center text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              {change}
            </span>
          )}
          {isPositive === false && (
            <span className="inline-flex items-center text-rose-400 font-semibold bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              {change}
            </span>
          )}
          {isPositive === null && (
            <span className="inline-flex items-center text-amber-400 font-semibold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
              <ShieldAlert className="w-3.5 h-3.5 mr-0.5" />
              {change}
            </span>
          )}
        </div>
        <span className="text-slate-400 text-right truncate max-w-[170px]">
          {description}
        </span>
      </div>
    </div>
  );
}
