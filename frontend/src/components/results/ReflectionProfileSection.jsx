import React from 'react';
import {
  Brain,
  HeartPulse,
  GraduationCap,
  Home,
  Users,
  Compass,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { getDimensionNarrative } from '../../utils/reflectionInsights';

const DIMENSION_META = {
  mind_emotions: {
    icon: Brain,
    accentText: 'text-violet-700',
    iconBg: 'bg-violet-100/90 text-violet-700',
    barFill: 'from-violet-500 via-purple-500 to-indigo-500',
    surfaceTint: 'from-violet-50/50 to-white',
    dot: 'bg-violet-500',
  },
  physical_wellbeing: {
    icon: HeartPulse,
    accentText: 'text-indigo-700',
    iconBg: 'bg-blue-100/80 text-indigo-700',
    barFill: 'from-blue-500 to-indigo-500',
    surfaceTint: 'from-blue-50/40 to-white',
    dot: 'bg-blue-500',
  },
  academics_future: {
    icon: GraduationCap,
    accentText: 'text-purple-700',
    iconBg: 'bg-purple-100/90 text-purple-700',
    barFill: 'from-purple-500 to-violet-600',
    surfaceTint: 'from-purple-50/40 to-white',
    dot: 'bg-purple-500',
  },
  living_environment: {
    icon: Home,
    accentText: 'text-sky-700',
    iconBg: 'bg-sky-100/80 text-sky-700',
    barFill: 'from-sky-500 to-blue-500',
    surfaceTint: 'from-sky-50/40 to-white',
    dot: 'bg-sky-500',
  },
  social_campus_life: {
    icon: Users,
    accentText: 'text-indigo-700',
    iconBg: 'bg-indigo-100/80 text-indigo-700',
    barFill: 'from-indigo-500 to-violet-500',
    surfaceTint: 'from-indigo-50/40 to-white',
    dot: 'bg-indigo-500',
  },
};

/**
 * SECTION B – Your Reflection Profile
 * Displays the 5 independent reflection dimensions using a visual overview
 * strip plus asymmetric domain cards, strictly honoring coverage thresholds.
 */
export default function ReflectionProfileSection({ dimensions = [], answers = {} }) {
  const availableCount = dimensions.filter((d) => d.isCoverageMet && d.score !== null).length;

  return (
    <section
      id="reflection-profile"
      aria-labelledby="reflection-profile-heading"
      className="scroll-mt-24 space-y-6 animate-fadeUp"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 px-1">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-700">
            <Compass className="w-3.5 h-3.5" />
            <span>5 Reflection Dimensions</span>
          </div>
          <h2
            id="reflection-profile-heading"
            className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight"
          >
            Your Reflection Profile
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Each domain reflects your own answers independently on a 0–100 reflection scale — never combined into a single overall score or clinical label.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 self-start sm:self-auto px-3.5 py-1.5 rounded-full bg-white border border-purple-100 shadow-xs text-xs font-semibold text-slate-700">
          <span className="w-2 h-2 rounded-full bg-violet-500" />
          <span>{availableCount} of {dimensions.length} domains calculated</span>
        </div>
      </div>

      {/* Main Bento Surface: Overview Snapshot + 5 Asymmetric Dimension Panels */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100/90 shadow-sm space-y-6">

        {/* Compact Visual Snapshot Strip (All 5 at a Glance) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF9FE] border border-purple-100/80 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>At-a-Glance Domain Balance</span>
            <span>Reflection Scale: 0 – 100</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {dimensions.map((dim) => {
              const meta = DIMENSION_META[dim.id] || DIMENSION_META.mind_emotions;
              const isAvailable = dim.isCoverageMet && dim.score !== null;

              return (
                <div key={`snap-${dim.id}`} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-1 text-xs">
                    <span className="font-semibold text-slate-700 truncate" title={dim.name}>
                      {dim.name}
                    </span>
                    <span className={`font-bold shrink-0 ${isAvailable ? meta.accentText : 'text-slate-400'}`}>
                      {isAvailable ? dim.score : '—'}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-200/70 overflow-hidden">
                    {isAvailable && (
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${meta.barFill} transition-all duration-700`}
                        style={{ width: `${Math.max(dim.score, 4)}%` }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5 Dimension Breakdown Cards (Asymmetric Grid: First 2 featured + 3 lower) */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {dimensions.map((dim, idx) => {
            const meta = DIMENSION_META[dim.id] || DIMENSION_META.mind_emotions;
            const Icon = meta.icon;
            const isAvailable = dim.isCoverageMet && dim.score !== null;
            const narrative = getDimensionNarrative(dim, answers);
            // First 2 dimensions span 3 cols each (2-up), remaining 3 span 2 cols each (3-up) on md+
            const colSpanClass = idx < 2 ? 'md:col-span-3' : 'md:col-span-2';

            return (
              <article
                key={dim.id}
                className={`${colSpanClass} rounded-2xl p-5 sm:p-6 bg-gradient-to-br ${meta.surfaceTint} border border-purple-100/80 flex flex-col justify-between gap-4 transition-all duration-300 hover:shadow-md hover:shadow-violet-900/5`}
              >
                <div className="space-y-3">
                  {/* Top Row: Icon + Title + Score */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl ${meta.iconBg} flex items-center justify-center shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-slate-900 leading-snug">
                          {dim.name}
                        </h3>
                        <span className="text-[11px] font-medium text-slate-500">
                          {dim.validAnswerCount} of {dim.totalPossibleCount} valid responses
                        </span>
                      </div>
                    </div>

                    {isAvailable ? (
                      <div className="text-right shrink-0">
                        <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
                          {dim.score}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400 ml-0.5">/100</span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold shrink-0">
                        <Info className="w-3 h-3 text-slate-400" />
                        <span>Not enough responses</span>
                      </span>
                    )}
                  </div>

                  {/* Progress Indicator */}
                  {isAvailable ? (
                    <div className="space-y-1.5">
                      <div
                        className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden relative"
                        role="progressbar"
                        aria-valuenow={dim.score}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${dim.name} reflection score: ${dim.score} out of 100`}
                      >
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${meta.barFill} transition-all duration-700 ease-out`}
                          style={{ width: `${Math.max(dim.score, 4)}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full w-0 bg-slate-300 rounded-full" />
                    </div>
                  )}

                  {/* Supportive Narrative */}
                  <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
                    {narrative}
                  </p>
                </div>

                {/* Coverage Footer Meta */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    {isAvailable ? 'Coverage complete' : 'Insufficient coverage'}
                  </span>
                  <span className="text-slate-400 text-right">
                    {dim.coverageRequirementText}
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        {/* Calm Domain Independence Reminder */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-violet-50/50 border border-violet-100/80 text-xs text-slate-600 leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
          <p>
            <strong className="text-slate-800">Why there is no single overall score:</strong>{' '}
            Emotional steadiness, sleep recovery, academic load, surroundings, and social belonging each tell a distinct story. Keeping these five dimensions separate prevents one area from masking another and avoids misleading clinical grading.
          </p>
        </div>

      </div>
    </section>
  );
}
