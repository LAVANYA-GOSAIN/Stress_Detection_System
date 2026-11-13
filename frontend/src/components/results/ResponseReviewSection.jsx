import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Lock,
} from 'lucide-react';
import { SECTIONS, QUESTIONS_MAP } from '../../data/questionnaire';

/**
 * Formats a question answer safely into readable label(s) without exposing any numerical scores.
 */
function formatQualitativeAnswer(question, value) {
  if (value === undefined || value === null || value === '') {
    return { text: 'Skipped', isMuted: true };
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return { text: 'Skipped', isMuted: true };
    }
    const labels = value.map((v) => {
      const match = question?.options?.find((opt) => opt.value === v);
      if (!match) return v;
      return match.emoji ? `${match.emoji} ${match.label}` : match.label;
    });
    return { text: labels.join(', '), isMuted: value.includes('prefer_not_to_say') };
  }

  const match = question?.options?.find((opt) => opt.value === value);
  if (match) {
    return {
      text: match.emoji ? `${match.emoji} ${match.label}` : match.label,
      isMuted: value === 'prefer_not_to_say',
    };
  }

  return { text: String(value), isMuted: false };
}

/**
 * SECTION F – Understanding Your Responses
 * Optional expandable review organized by all five assessment categories.
 * Intentionally excludes internal numerical scoring weights.
 */
export default function ResponseReviewSection({ answers = {} }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section
      id="understanding-responses"
      aria-labelledby="understanding-responses-heading"
      className="scroll-mt-24 animate-fadeUp"
    >
      <div className="bg-white rounded-3xl border border-purple-100/90 shadow-sm overflow-hidden">

        {/* Expandable Accordion Header */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          className="w-full p-6 sm:p-8 flex items-center justify-between gap-4 text-left hover:bg-[#FAF9FE]/60 transition-colors cursor-pointer"
        >
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-violet-100/80 text-violet-700 flex items-center justify-center shrink-0">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-violet-700">
                Qualitative Record • All 5 Categories
              </div>
              <h2
                id="understanding-responses-heading"
                className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight"
              >
                Understanding Your Responses
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-normal">
                Review what you answered across all 20 questions, organized by section — no internal numbers exposed.
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-violet-50 text-violet-800 text-xs font-bold shrink-0 border border-violet-100">
            <span className="hidden sm:inline">{isExpanded ? 'Hide' : 'View All'}</span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </button>

        {/* Expandable Content Organized by the 5 Categories */}
        {isExpanded && (
          <div className="px-6 sm:px-8 pb-8 pt-2 border-t border-purple-100/80 space-y-6 animate-fadeIn">
            {SECTIONS.map((sec) => {
              const SectionIcon = sec.icon;
              const questionIds = sec.questionIds || [];
              const answeredInCategory = questionIds.filter((qId) => {
                const val = answers?.[qId];
                return Array.isArray(val) ? val.length > 0 : Boolean(val);
              }).length;

              return (
                <div
                  key={sec.id}
                  className="rounded-2xl bg-[#FAF9FE]/70 border border-purple-100/70 p-5 sm:p-6 space-y-4"
                >
                  {/* Category Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-purple-100/80">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white border border-purple-100 text-violet-700 flex items-center justify-center">
                        <SectionIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Category 0{sec.sectionNumber}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900">
                          {sec.title}
                        </h3>
                      </div>
                    </div>

                    <span className="text-xs font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-full border border-purple-100">
                      {answeredInCategory} of {questionIds.length} answered
                    </span>
                  </div>

                  {/* Questions List */}
                  <div className="divide-y divide-purple-100/60">
                    {questionIds.map((qId) => {
                      const question = QUESTIONS_MAP[qId];
                      if (!question) return null;

                      const { text, isMuted } = formatQualitativeAnswer(question, answers?.[qId]);

                      return (
                        <div
                          key={qId}
                          className="py-3 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-6"
                        >
                          <div className="space-y-0.5 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase text-violet-700 bg-violet-100/70 px-1.5 py-0.5 rounded">
                                {qId.toUpperCase()}
                              </span>
                              <span className="text-[11px] font-semibold text-slate-500">
                                {sec.title}
                              </span>
                              {question.isSensitive && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                                  <Lock className="w-2.5 h-2.5" />
                                  Confidential
                                </span>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm font-medium text-slate-800 leading-snug">
                              {question.question}
                            </p>
                          </div>

                          <div className="sm:text-right sm:max-w-xs shrink-0">
                            <span
                              className={`inline-block text-xs sm:text-sm leading-snug ${
                                isMuted
                                  ? 'text-slate-400 italic font-medium'
                                  : 'text-violet-950 font-semibold'
                              }`}
                            >
                              {text}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
