import React from 'react';
import { 
  Database, 
  Bot, 
  ShieldCheck, 
  CreditCard, 
  ScrollText, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export default function FlowPipeline() {
  const steps = [
    {
      id: 'catalog',
      title: 'CATALOG',
      desc: 'Machine-readable inventory & pricing',
      icon: Database,
      badge: 'Dynamic Schema',
      color: 'from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30'
    },
    {
      id: 'ai-buyer',
      title: 'AI BUYER',
      desc: 'Autonomous agent discovers & queries',
      icon: Bot,
      badge: 'Unconstrained AI',
      color: 'from-indigo-500/20 to-violet-500/20 text-indigo-400 border-indigo-500/30'
    },
    {
      id: 'policy-engine',
      title: 'POLICY ENGINE',
      desc: 'Zero-trust deterministic verification',
      icon: ShieldCheck,
      badge: 'Non-LLM Guardrail',
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/40 shadow-emerald-500/10'
    },
    {
      id: 'razorpay',
      title: 'RAZORPAY',
      desc: 'Authenticated test settlement order',
      icon: CreditCard,
      badge: 'Test Mode',
      color: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30'
    },
    {
      id: 'audit-trail',
      title: 'AUDIT TRAIL',
      desc: 'Immutable decision logs & signatures',
      icon: ScrollText,
      badge: '100% Traceable',
      color: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30'
    }
  ];

  return (
    <div className="w-full py-6 ar-reveal-delay">
      <div className="relative p-5 sm:p-8 rounded-2xl bg-slate-950/75 border border-cyan-500/20 shadow-2xl backdrop-blur-xl">
        {/* Glow backdrop */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-r from-indigo-500/15 via-emerald-500/15 to-purple-500/15 blur-3xl -z-10 pointer-events-none" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400 font-semibold">
              The AgentReady Commerce Architecture
            </span>
          </div>
          <span className="text-xs font-medium text-emerald-400/90 flex items-center gap-1.5 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Deterministic Policy Gate Active
          </span>
        </div>

        {/* Steps Grid / Flex */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="relative group">
                <div className={`h-full p-4 rounded-xl border bg-gradient-to-b ${step.color} transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/50 flex flex-col justify-between`}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-lg bg-slate-950/60 border border-white/5">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-900/80 text-slate-300 border border-white/5">
                        0{idx + 1}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold tracking-wide text-white font-mono mt-1">
                      {step.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-white/5">
                    <span className="text-[10px] font-semibold text-slate-300 font-mono">
                      {step.badge}
                    </span>
                  </div>
                </div>

                {/* Arrow connector for large screens */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-4 h-4 items-center justify-center text-slate-500">
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
