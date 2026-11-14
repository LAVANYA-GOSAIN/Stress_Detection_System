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
  ChevronUp,
} from 'lucide-react';
import { getDimensionNarrative } from '../../utils/reflectionInsights';
import { calculateReflectionScores } from '../../utils/reflectionScoring';

const DIMENSION_META = {
  mind_emotions: {
    domainName: 'Emotional Steadiness',
    sectionTitle: 'Mind & Emotions',
    sectionNumber: 1,
    icon: Brain,
    accentText: 'text-violet-700',
    iconBg: 'bg-violet-100 text-violet-700',
    barFill: 'from-violet-500 via-purple-500 to-indigo-500',
    surfaceTint: 'from-violet-50/40 via-white to-purple-50/20',
    borderTint: 'border-purple-100',
    badgeBg: 'bg-violet-50 text-violet-700 border-violet-200/60',
    dot: 'bg-violet-500',
  },
  physical_wellbeing: {
    domainName: 'Sleep Recovery',
    sectionTitle: 'Physical Wellbeing',
    sectionNumber: 2,
    icon: HeartPulse,
    accentText: 'text-indigo-700',
    iconBg: 'bg-indigo-100 text-indigo-700',
    barFill: 'from-blue-500 via-indigo-500 to-purple-500',
    surfaceTint: 'from-blue-50/30 via-white to-indigo-50/20',
    borderTint: 'border-indigo-100',
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
    dot: 'bg-indigo-500',
  },
  living_environment: {
    domainName: 'Surroundings',
    sectionTitle: 'Living Environment',
    sectionNumber: 3,
    icon: Home,
    accentText: 'text-sky-700',
    iconBg: 'bg-sky-100 text-sky-700',
    barFill: 'from-sky-500 via-cyan-500 to-blue-500',
    surfaceTint: 'from-sky-50/30 via-white to-blue-50/20',
    borderTint: 'border-sky-100',
    badgeBg: 'bg-sky-50 text-sky-700 border-sky-200/60',
    dot: 'bg-sky-500',
  },
  academics_future: {
    domainName: 'Academic Load',
    sectionTitle: 'Academics & Future',
    sectionNumber: 4,
    icon: GraduationCap,
    accentText: 'text-purple-700',
    iconBg: 'bg-purple-100 text-purple-700',
    barFill: 'from-purple-500 via-violet-500 to-indigo-600',
    surfaceTint: 'from-purple-50/30 via-white to-violet-50/20',
    borderTint: 'border-purple-100',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200/60',
    dot: 'bg-purple-500',
  },
  social_campus_life: {
    domainName: 'Social Belonging',
    sectionTitle: 'Social & Campus Life',
    sectionNumber: 5,
    icon: Users,
    accentText: 'text-indigo-700',
    iconBg: 'bg-indigo-100 text-indigo-700',
    barFill: 'from-indigo-500 via-purple-500 to-violet-500',
    surfaceTint: 'from-indigo-50/30 via-white to-purple-50/20',
    borderTint: 'border-indigo-100',
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
    dot: 'bg-indigo-500',
  },
};

/**
 * SECTION B – Your Reflection Profile
 * Displays the 5 independent reflection dimensions using a visual overview
 * strip plus asymmetric domain cards, strictly honoring coverage thresholds.
 *
 * Supported domains:
 * - Emotional Steadiness (Mind & Emotions)
 * - Sleep Recovery (Physical Wellbeing)
 * - Surroundings (Living Environment)
 * - Academic Load (Academics & Future)
 * - Social Belonging (Social & Campus Life)
 */
export default function ReflectionProfileSection({
  reflection = null,
  reflectionScores = null,
  dimensions: directDimensions = null,
  answers = {},
  onHide = null,
}) {
  const activeReflection = reflection || reflectionScores;

  // Resolve dimensions robustly: directDimensions -> reflection.dimensions -> answers -> canonical empty fallback
  let dimensions = null;
  if (Array.isArray(directDimensions) && directDimensions.length > 0) {
    dimensions = directDimensions;
  } else if (Array.isArray(activeReflection?.dimensions) && activeReflection.dimensions.length > 0) {
    dimensions = activeReflection.dimensions;
  } else if (answers && Object.keys(answers).length > 0) {
    dimensions = calculateReflectionScores(answers).dimensions;
  } else {
    // Canonical baseline: 5 dimensions with insufficient coverage state (guarantees "0 of 5", never "0 of 0")
    dimensions = calculateReflectionScores({}).dimensions;
  }

  const effectiveAnswers =
    (answers && Object.keys(answers).length > 0)
      ? answers
      : activeReflection?.answers || {};

  const availableCount = dimensions.filter(
    (d) => d && d.isCoverageMet && d.score !== null,
  ).length;
  const totalCount = dimensions.length || 5;

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

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-purple-100 shadow-2xs text-xs font-semibold text-slate-700">
            <span
              className={`w-2 h-2 rounded-full ${
                availableCount === totalCount
                  ? 'bg-emerald-500'
                  : availableCount > 0
                  ? 'bg-amber-500'
                  : 'bg-slate-400'
              }`}
            />
            <span>
              {availableCount} of {totalCount} domains calculated
            </span>
          </div>

          {typeof onHide === 'function' && (
            <button
              type="button"
              onClick={onHide}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-purple-100/90 text-slate-600 hover:text-slate-900 text-xs font-semibold shadow-2xs transition cursor-pointer"
              title="Hide Detailed Report"
            >
              <span>Hide Report</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Bento Surface: Overview Snapshot + 5 Asymmetric Dimension Panels */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100/90 shadow-sm space-y-6">

        {/* Compact Visual Snapshot Strip (All 5 at a Glance) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF9FE] border border-purple-100/90 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-bold text-slate-700">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-600" />
              At-a-Glance Domain Balance
            </span>
            <span className="text-slate-400 font-medium">Independent Reflection Scale: 0 – 100</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-1">
            {dimensions.map((dim) => {
              const meta = DIMENSION_META[dim.id] || DIMENSION_META.mind_emotions;
              const domainName = meta.domainName || dim.domainName || dim.name;
              const isAvailable = dim.isCoverageMet && dim.score !== null;

              return (
                <div
                  key={`snap-${dim.id}`}
                  className="p-3 rounded-xl bg-white border border-purple-100/70 shadow-2xs space-y-2 hover:border-purple-200 transition-colors"
                >
                  <div className="flex items-center justify-between gap-1 text-xs">
                    <span className="font-bold text-slate-800 truncate" title={`${domainName} (${meta.sectionTitle})`}>
                      {domainName}
                    </span>
                    <span className={`font-black shrink-0 ${isAvailable ? meta.accentText : 'text-slate-400'}`}>
                      {isAvailable ? `${dim.score}` : '—'}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden relative">
                    {isAvailable ? (
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${meta.barFill} transition-all duration-700 ease-out`}
                        style={{ width: `${Math.max(dim.score, 4)}%` }}
                      />
                    ) : (
                      <div className="h-full w-0 bg-slate-200" />
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {meta.sectionTitle}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5 Dimension Breakdown Cards (Asymmetric Grid: First 2 featured + 3 lower) */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 sm:gap-5">
          {dimensions.map((dim, idx) => {
            const meta = DIMENSION_META[dim.id] || DIMENSION_META.mind_emotions;
            const Icon = meta.icon;
            const domainName = meta.domainName || dim.domainName || dim.name;
            const isAvailable = dim.isCoverageMet && dim.score !== null;
            const narrative = getDimensionNarrative(dim, effectiveAnswers);
            const colSpanClass = idx < 2 ? 'md:col-span-3' : 'md:col-span-2';

            return (
              <article
                key={dim.id}
                className={`${colSpanClass} rounded-2xl p-5 sm:p-6 bg-gradient-to-br ${meta.surfaceTint} border ${meta.borderTint} flex flex-col justify-between gap-4 transition-all duration-300 hover:shadow-md hover:shadow-violet-900/5`}
              >
                <div className="space-y-3.5">
                  {/* Top Row: Icon + Title + Score */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-11 h-11 rounded-2xl ${meta.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}>
                        <Icon className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                          {domainName}
                        </h3>
                        <span className="text-[11px] font-medium text-slate-500">
                          {meta.sectionTitle} (Section {meta.sectionNumber}) • {dim.validAnswerCount} of {dim.totalPossibleCount} valid responses
                        </span>
                      </div>
                    </div>

                    {isAvailable ? (
                      <div className="text-right shrink-0">
                        <span className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
                          {dim.score}
                        </span>
                        <span className="text-xs font-bold text-violet-600 ml-0.5">/100</span>
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
                    <div className="space-y-1">
                      <div
                        className="h-2.5 w-full bg-slate-200/70 rounded-full overflow-hidden relative"
                        role="progressbar"
                        aria-valuenow={dim.score}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${domainName} reflection score: ${dim.score} out of 100`}
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
                <div className="pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span className={`font-semibold ${isAvailable ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {isAvailable ? 'Coverage complete' : 'Insufficient coverage'}
                  </span>
                  <span className="text-slate-400 text-right truncate ml-2">
                    {dim.coverageRequirementText}
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        {/* Calm Domain Independence Reminder */}
        <div className="flex items-start gap-3 p-4 sm:p-5 rounded-2xl bg-violet-50/50 border border-violet-100/80 text-xs sm:text-[13px] text-slate-600 leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
          <p>
            <strong className="text-slate-800 font-bold">Why there is no single overall score:</strong>{' '}
            Emotional steadiness, sleep recovery, academic load, surroundings, and social belonging each tell a distinct story. Keeping these five dimensions separate prevents one area from masking another and avoids misleading clinical grading.
          </p>
        </div>

      </div>
    </section>
  );
}
