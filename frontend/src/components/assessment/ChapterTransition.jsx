import React from 'react';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { SECTIONS } from '../../data/questionnaire';

/**
 * ChapterTransition Component
 * Renders an encouraging, gentle completion interstitial between sections.
 */
export default function ChapterTransition({
  completedChapterIndex,
  onProceed,
  onReviewChapter,
}) {
  const completedSection = SECTIONS[completedChapterIndex] || SECTIONS[0];
  const nextSection = SECTIONS[completedChapterIndex + 1];
  const isFinalSection = completedChapterIndex === SECTIONS.length - 1;

  return (
    <div className="bg-white rounded-3xl p-8 sm:p-12 border border-purple-100 shadow-md text-center w-full space-y-8 animate-fadeIn">
      
      {/* Celebration Icon */}
      <div className="relative inline-flex items-center justify-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-violet-500/25">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>
        <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center shadow-md animate-bounce">
          <Sparkles className="w-4 h-4 fill-amber-950" />
        </div>
      </div>

      {/* Completion Text */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold tracking-wide">
          <span>Section {completedSection.sectionNumber} of {SECTIONS.length} Complete</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Great Job Completing {completedSection.title}!
        </h2>

        <p className="text-slate-600 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
          {isFinalSection
            ? "You've successfully answered all 25 questions across all five sections. Take a moment to review your responses before proceeding."
            : `Take a gentle breath. You're making steady progress. Next up is Section ${nextSection.sectionNumber}: ${nextSection.title}.`}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onReviewChapter}
          className="w-full sm:w-auto px-5 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          Review This Section
        </button>

        <button
          type="button"
          onClick={onProceed}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md shadow-violet-500/25 hover:shadow-lg transition-all"
        >
          <span>
            {isFinalSection
              ? 'Proceed to Final Review'
              : `Continue to Section ${nextSection.sectionNumber}`}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
