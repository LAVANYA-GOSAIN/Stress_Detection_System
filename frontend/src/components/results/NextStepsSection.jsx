import React, { useState } from 'react';
import {
  Check,
  Calendar,
  ListChecks,
  Sparkles,
  Clock,
} from 'lucide-react';

/**
 * SECTION D – Your Next Steps ("Small Steps, Meaningful Changes")
 * Interactive checklist tailored strictly to the student's responses,
 * plus an optional clean 7-Day Gentle Rhythm tab.
 */
export default function NextStepsSection({ nextSteps }) {
  const { steps = [], weeklyPlan = [] } = nextSteps || {};
  const [viewTab, setViewTab] = useState('steps'); // 'steps' | 'seven_day'
  const [completedIds, setCompletedIds] = useState({});

  const toggleItem = (id) => {
    setCompletedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const activeList = viewTab === 'steps' ? steps : weeklyPlan;
  const completedCount = activeList.filter((item) => completedIds[item.id]).length;
  const progressPercent = activeList.length > 0 ? Math.round((completedCount / activeList.length) * 100) : 0;

  return (
    <section
      id="next-steps"
      aria-labelledby="next-steps-heading"
      className="scroll-mt-24 space-y-6 animate-fadeUp"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-1">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-700">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Practical &amp; Interactive</span>
          </div>
          <h2
            id="next-steps-heading"
            className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight"
          >
            Small Steps, Meaningful Changes
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Gentle, practical habits selected around what stood out in your check-in. Check off anything you decide to try.
          </p>
        </div>

        {/* View Toggle Pills: Tailored Steps vs Optional 7-Day Rhythm */}
        <div className="inline-flex p-1 rounded-xl bg-white border border-purple-100 shadow-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewTab('steps')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewTab === 'steps'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListChecks className="w-3.5 h-3.5" />
            <span>Action Steps</span>
          </button>

          <button
            type="button"
            onClick={() => setViewTab('seven_day')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewTab === 'seven_day'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>7-Day Rhythm</span>
          </button>
        </div>
      </div>

      {/* Interactive Surface */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100/90 shadow-sm space-y-5">

        {/* Interactive Progress Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span>
              {completedCount} of {activeList.length} marked as done
            </span>
            {completedCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 text-[11px] font-bold">
                Nice momentum
              </span>
            )}
          </div>
          <div className="w-full sm:w-44 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Tab 1: Tailored Action Steps Checklist */}
        {viewTab === 'steps' && (
          <div className="space-y-3">
            {steps.map((step) => {
              const isDone = Boolean(completedIds[step.id]);

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => toggleItem(step.id)}
                  aria-pressed={isDone}
                  className={`group w-full text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex items-start gap-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-400/50 ${
                    isDone
                      ? 'bg-violet-50/70 border-violet-200'
                      : 'bg-[#FAF9FE]/70 border-purple-100/80 hover:border-violet-300 hover:bg-violet-50/30'
                  }`}
                >
                  {/* Animated Check Circle */}
                  <div
                    className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-200 ${
                      isDone
                        ? 'bg-violet-600 border-violet-600 text-white shadow-xs'
                        : 'bg-white border-slate-300 group-hover:border-violet-400'
                    }`}
                  >
                    {isDone && <Check className="w-3.5 h-3.5 stroke-[3] animate-scale-check" />}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={`text-sm sm:text-base font-bold transition-colors ${
                          isDone ? 'text-violet-950 line-through decoration-violet-400/70' : 'text-slate-900'
                        }`}
                      >
                        {step.title}
                      </span>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-white px-2.5 py-0.5 rounded-full border border-slate-200/70">
                          <Clock className="w-3 h-3 text-violet-500" />
                          {step.timeframe}
                        </span>
                      </div>
                    </div>

                    <p
                      className={`text-xs sm:text-sm leading-relaxed transition-colors ${
                        isDone ? 'text-slate-500' : 'text-slate-600'
                      }`}
                    >
                      {step.action}
                    </p>

                    <div className="text-[11px] text-violet-700/80 font-medium">
                      {step.category} • {step.reason}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Tab 2: Lightweight Optional 7-Day Rhythm */}
        {viewTab === 'seven_day' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {weeklyPlan.map((dayItem) => {
              const isDone = Boolean(completedIds[dayItem.id]);

              return (
                <button
                  key={dayItem.id}
                  type="button"
                  onClick={() => toggleItem(dayItem.id)}
                  aria-pressed={isDone}
                  className={`text-left p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-400/50 ${
                    isDone
                      ? 'bg-violet-50/80 border-violet-300'
                      : 'bg-[#FAF9FE]/70 border-purple-100 hover:border-violet-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-violet-700 uppercase tracking-wide">
                      {dayItem.day}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                        isDone
                          ? 'bg-violet-600 border-violet-600 text-white'
                          : 'bg-white border-slate-300'
                      }`}
                    >
                      {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold text-slate-400">
                      {dayItem.focus}
                    </div>
                    <div
                      className={`text-xs font-bold leading-snug ${
                        isDone ? 'text-violet-950 line-through decoration-violet-400/70' : 'text-slate-800'
                      }`}
                    >
                      {dayItem.microAction}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Ethical Non-Medical Clarification */}
        <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
          These gentle day-to-day habit suggestions are offered purely for personal organization and reflection — they are not intended to diagnose, treat, or replace professional healthcare guidance.
        </p>

      </div>
    </section>
  );
}
