import React from 'react';
import { CheckCircle2, RotateCcw, Lock } from 'lucide-react';
import { SECTIONS } from '../../data/questionnaire';

/**
 * ChapterProgress Component (Quiz-Mode Section & Question Progress Tracker)
 *
 * Grounded in:
 * - Section-wise progress: "Section 1 of 5", "Question 1 of 5"
 * - Micro-segmented question indicators showing progress through the active section
 * - 5 Section tabs across the top/bottom for chapter navigation
 * - Clean, distraction-free styling matching MindScope lavender & navy aesthetic
 */
export default function ChapterProgress({
  currentSectionIndex,
  maxReachedSectionIndex = 0,
  onResetClick,
  onSectionSelect,
  questionIndexInSection = 0,
  totalQuestionsInSection = 5,
  isQuestionCompleted = () => false,
}) {
  const currentSection = SECTIONS[currentSectionIndex] || SECTIONS[0];
  const sectionQuestionIds = currentSection.questionIds || [];

  // Calculate section progress percentage based on questions answered in active section
  const sectionProgressPercent = Math.min(
    100,
    Math.round(((questionIndexInSection + 1) / totalQuestionsInSection) * 100)
  );

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm space-y-6">
      
      {/* Top Bar: Section Badge, Question Metric, Reset Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        {/* Current Section Info */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-base shadow-md shadow-violet-500/20">
            0{currentSection.sectionNumber}
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-violet-700">
              Section {currentSection.sectionNumber} of {SECTIONS.length}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {currentSection.title}
            </h1>
          </div>
        </div>

        {/* Question Counter (Section-wise: "1 of 5", "2 of 5"...) & Reset */}
        <div className="flex items-center gap-4 self-end sm:self-auto">
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-500 block">
              Section Progress
            </span>
            <span className="text-base font-extrabold text-violet-700">
              {questionIndexInSection + 1} of {totalQuestionsInSection}
            </span>
          </div>

          <button
            type="button"
            onClick={onResetClick}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer"
            title="Reset Assessment"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

      </div>

      {/* Segmented Question Progress Pills for Active Section */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Current Section Flow</span>
          <span className="text-violet-700 font-bold">{sectionProgressPercent}%</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {sectionQuestionIds.map((qId, qIdx) => {
            const isCurrent = qIdx === questionIndexInSection;
            const isDone = isQuestionCompleted(qId);

            return (
              <div
                key={qId}
                className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 ${
                  isCurrent
                    ? 'bg-violet-600 ring-2 ring-violet-400/40 shadow-sm'
                    : isDone
                    ? 'bg-emerald-500'
                    : 'bg-slate-200/80'
                }`}
                title={`Question ${qIdx + 1} (${isDone ? 'Answered' : isCurrent ? 'Current' : 'Upcoming'})`}
              />
            );
          })}
        </div>
      </div>

      {/* 5 Section Indicator Tabs (Navigation between chapters) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1 border-t border-purple-50">
        {SECTIONS.map((sec, idx) => {
          const isCurrent = idx === currentSectionIndex;
          const isPassed = idx < currentSectionIndex;
          const isAccessible = idx <= maxReachedSectionIndex;
          const SectionIcon = sec.icon;

          return (
            <button
              key={sec.id}
              type="button"
              disabled={!isAccessible}
              onClick={() => isAccessible && onSectionSelect && onSectionSelect(idx)}
              className={`flex items-center gap-2.5 p-2.5 sm:p-3 rounded-2xl text-left transition-all ${
                isCurrent
                  ? 'bg-violet-50/90 border-2 border-violet-500 shadow-sm'
                  : isPassed
                  ? 'bg-slate-50 border border-slate-200 hover:bg-violet-50/50 text-slate-700 cursor-pointer'
                  : 'bg-slate-50/50 border border-slate-100 text-slate-400 cursor-not-allowed opacity-60'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                  isCurrent
                    ? 'bg-violet-600 text-white shadow-sm'
                    : isPassed
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-200/70 text-slate-400'
                }`}
              >
                {isPassed ? (
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                ) : !isAccessible ? (
                  <Lock className="w-3 h-3 text-slate-400" />
                ) : (
                  <SectionIcon className="w-3.5 h-3.5" />
                )}
              </div>

              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
                  Sec 0{sec.sectionNumber}
                </div>
                <div
                  className={`text-xs font-bold truncate ${
                    isCurrent
                      ? 'text-violet-900'
                      : isPassed
                      ? 'text-slate-800'
                      : 'text-slate-400'
                  }`}
                >
                  {sec.title}
                </div>
              </div>
            </button>
          );
        })}
      </div>

    </div>
  );
}
