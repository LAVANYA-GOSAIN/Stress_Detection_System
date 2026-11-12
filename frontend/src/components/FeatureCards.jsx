import React from 'react';
import { 
  HeartHandshake, 
  Layers, 
  Sparkles, 
  ShieldCheck 
} from 'lucide-react';

/**
 * FeatureCards Component
 * Clean, user-focused presentation of the 3-step awareness process:
 * 1. Reflect on Yourself
 * 2. Understand Your Patterns
 * 3. Explore Your Insights
 */
export default function FeatureCards() {
  const coreFeatures = [
    {
      step: '01',
      title: 'Reflect on Yourself',
      description:
        'Explore different aspects of student life, from sleep and academic workload to social support.',
      icon: HeartHandshake,
      color: 'from-violet-500 to-purple-600',
      tag: 'Reflection',
    },
    {
      step: '02',
      title: 'Understand Your Patterns',
      description:
        'Discover how your responses come together to form a picture of your stress-related patterns.',
      icon: Layers,
      color: 'from-indigo-500 to-violet-600',
      tag: 'Understanding',
    },
    {
      step: '03',
      title: 'Explore Your Insights',
      description:
        'View your assessment outcome and understand the different factors represented in your responses.',
      icon: Sparkles,
      color: 'from-purple-500 to-indigo-600',
      tag: 'Insights',
    },
  ];

  return (
    <section id="features" className="py-20 bg-white/70 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100/80 text-violet-800 text-xs font-semibold tracking-wide">
            <span>A Mindful Journey</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How MindScope <span className="text-violet-700">Supports You</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            A calm, step-by-step reflection designed to help you notice and understand the rhythms of your everyday university life.
          </p>
        </div>

        {/* 3 User-Facing Feature Cards (Clean, Informational) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {coreFeatures.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group relative bg-white rounded-3xl p-8 border border-purple-100/90 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300"
              >
                {/* Step & Badge */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-100">
                    {item.tag}
                  </span>
                  <span className="text-3xl font-extrabold text-slate-200 group-hover:text-violet-200 transition-colors">
                    {item.step}
                  </span>
                </div>

                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white mb-6 shadow-md shadow-violet-500/20 group-hover:scale-105 transition-transform duration-300`}>
                  <Icon className="w-7 h-7 stroke-[2]" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-violet-700 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Reassurance Banner (Pure Informational Reassurance - No Aggressive CTA) */}
        <div className="bg-gradient-to-br from-violet-50/80 via-purple-50/40 to-indigo-50/80 rounded-3xl p-6 sm:p-7 border border-violet-100 flex items-center justify-center text-center">
          <div className="flex flex-col sm:flex-row items-center gap-3.5 max-w-2xl">
            <div className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-purple-100 flex items-center justify-center text-violet-700 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              <strong className="text-slate-800">100% Confidential & Supportive:</strong> No personal identities or account details are ever required. MindScope is designed solely for personal self-awareness.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
