import React from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck,
  Info
} from 'lucide-react';

import OptionCards from './OptionCards';
import VisualEmojiCards from './VisualEmojiCards';
import MultiSelectCards from './MultiSelectCards';

/**
 * QuestionCard Component (Unified Wellness Check-in Card)
 *
 * Implements:
 * - Dynamically renders the appropriate answer interaction format:
 *   1. Visual emoji cards (`format === 'visual_rating'` or `'visual_selection'`)
 *   2. Multi-select cards with exclusive safeguards (`format === 'multi_select'`)
 *   3. Scenario & single-choice cards (`format === 'single_select'`)
 * - Sensitive question safeguarding badges
 * - Clean integrated Previous and Continue bottom navigation
 */
export default function QuestionCard({
  question,
  answer,
  onAnswerChange,
  animationDirection = 'next',
  onPrev,
  onNext,
  isComplete = false,
  isFirst = false,
  isLastInSection = false,
  isLastOverall = false,
  sectionNumber = 1,
}) {
  const animationClass =
    animationDirection === 'prev'
      ? 'animate-quiz-slide-left'
      : 'animate-quiz-slide-right';

  const isVisualFormat =
    question.format === 'visual_rating' || question.format === 'visual_selection';
  const isMultiSelectFormat = question.format === 'multi_select';

  return (
    <div
      key={question.id}
      className={`bg-white rounded-3xl p-6 sm:p-8 sm:py-6 border border-purple-100 shadow-sm space-y-4 sm:space-y-5 ${animationClass}`}
    >
      {/* Header Tag & Prompt */}
      <div className="space-y-1.5 sm:space-y-2">
        
        {/* Sensitive Tag or Question Identifier */}
        <div className="flex items-center justify-between pb-0.5">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{question.id.toUpperCase()}</span>
          </div>

          {question.isSensitive && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Confidential Question</span>
            </div>
          )}
        </div>

        {/* Conversational Question Prompt */}
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
          {question.question}
        </h2>

        {/* Gentle Context / Helper Guidance */}
        {question.helper && (
          <p className="text-xs sm:text-[13px] text-slate-500 font-normal leading-normal">
            {question.helper}
          </p>
        )}

        {/* Optional Research / Clarification Notice (e.g. Q6) */}
        {(question.notice || question.noticeTitle) && (
          <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200/90 text-xs text-amber-900 flex items-start gap-2.5 leading-relaxed">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              {question.noticeTitle && (
                <div className="font-bold text-amber-950">{question.noticeTitle}</div>
              )}
              {question.notice && <div>{question.notice}</div>}
            </div>
          </div>
        )}

      </div>

      {/* Varied Interactive Answer Area */}
      <div>
        {isVisualFormat ? (
          <VisualEmojiCards
            options={question.options}
            selectedOptionValue={answer}
            onSelectOption={onAnswerChange}
            questionId={question.id}
          />
        ) : isMultiSelectFormat ? (
          <MultiSelectCards
            options={question.options}
            selectedOptionValue={answer}
            onSelectOption={onAnswerChange}
            questionId={question.id}
            instruction={question.instruction}
          />
        ) : (
          <OptionCards
            options={question.options}
            selectedOptionValue={answer}
            onSelectOption={onAnswerChange}
            questionId={question.id}
          />
        )}
      </div>

      {/* Seamless Integrated Bottom Navigation Bar with compact spacing */}
      <div className="border-t border-purple-100/70 pt-3 flex items-center justify-between gap-4">
        
        {/* Previous Button */}
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isFirst ? 'Overview' : 'Previous'}</span>
        </button>

        {/* Continue / Complete Section Button */}
        <button
          type="button"
          onClick={onNext}
          disabled={!isComplete}
          className={`inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
            isComplete
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md shadow-violet-500/20 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer'
              : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
          }`}
        >
          <span>
            {isLastOverall
              ? 'Review Assessment'
              : isLastInSection
              ? `Complete Section ${sectionNumber} ✨`
              : 'Continue'}
          </span>
          {isLastOverall ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}
        </button>

      </div>

    </div>
  );
}
