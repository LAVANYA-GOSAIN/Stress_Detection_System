import React from 'react';
import {
  Sparkles,
  Sun,
  Compass,
  Target,
  MessageCircleHeart,
} from 'lucide-react';

/**
 * SECTION C – Personal Insights
 * Translates the student's actual check-in answers into empathetic, conversational
 * strengths and gentle reflection observations — strictly non-diagnostic.
 */
export default function PersonalInsightsSection({ insights }) {
  const { strengths = [], reflections = [], focusArea = null } = insights || {};
  const hasAnyInsights = strengths.length > 0 || reflections.length > 0 || Boolean(focusArea);

  return (
    <section
      id="personal-insights"
      aria-labelledby="personal-insights-heading"
      className="scroll-mt-24 space-y-6 animate-fadeUp"
    >
      {/* Section Header */}
      <div className="space-y-1.5 px-1">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-700">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Based on Your Responses</span>
        </div>
        <h2
          id="personal-insights-heading"
          className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight"
        >
          Personal Insights
        </h2>
        <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
          Thoughtful patterns noticed in what you shared — pairing what already seems to support you with areas that might deserve gentle attention.
        </p>
      </div>

      {/* Main Content Surface */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100/90 shadow-sm space-y-6">

        {/* Highlighted Focus Area Callout */}
        {focusArea && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-50 via-purple-50/60 to-indigo-50/60 border border-violet-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-violet-100 flex items-center justify-center text-violet-700 shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-violet-700">
                  Your Selected Focus Area
                </div>
                <div className="text-base font-bold text-slate-900">
                  {focusArea.label}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {focusArea.encouragement}
                </p>
              </div>
            </div>
          </div>
        )}

        {!hasAnyInsights ? (
          <div className="p-6 rounded-2xl bg-[#FAF9FE] border border-purple-100 text-center space-y-2">
            <MessageCircleHeart className="w-6 h-6 text-violet-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-800">
              Share a few more responses to unlock tailored observations
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Your privacy choices are respected — when questions are skipped or left undisclosed, MindScope avoids guessing patterns on your behalf.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Column 1: Positive Response Patterns & Strengths */}
            <div className="rounded-2xl p-5 sm:p-6 bg-[#FAF9FE] border border-purple-100/80 space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-purple-100/80">
                <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Steady Patterns &amp; Strengths
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Helpful anchors reflected in your check-in
                  </p>
                </div>
              </div>

              {strengths.length > 0 ? (
                <ul className="space-y-4">
                  {strengths.map((item) => (
                    <li key={item.id} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                        <span className="text-sm font-bold text-slate-900">{item.title}</span>
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-violet-700 bg-violet-100/70 px-2 py-0.5 rounded-full">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed pl-3.5">
                        {item.description}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Taking a few minutes to pause and check in with yourself honestly is already a meaningful step toward self-awareness.
                </p>
              )}
            </div>

            {/* Column 2: Gentle Areas to Reflect On */}
            <div className="rounded-2xl p-5 sm:p-6 bg-blue-50/30 border border-blue-100/80 space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-blue-100/80">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Areas Worth Reflecting On
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Gentle observations — never a judgment or diagnosis
                  </p>
                </div>
              </div>

              {reflections.length > 0 ? (
                <ul className="space-y-4">
                  {reflections.map((item) => (
                    <li key={item.id} className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                        <span className="text-sm font-bold text-slate-900">{item.title}</span>
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed pl-3.5">
                        {item.description}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Your responses across emotional coping, daily habits, and surroundings look relatively settled right now. Staying mindful of sleep and personal breaks can help preserve that steadiness when semester demands pick up.
                </p>
              )}
            </div>

          </div>
        )}

      </div>
    </section>
  );
}
