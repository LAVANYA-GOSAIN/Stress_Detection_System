import React from 'react';
import { Check } from 'lucide-react';

/**
 * OptionCards Component (Single Selection & Scenario Answer Cards)
 *
 * Implements:
 * - Roomy, tactile cards where the answer choice is the primary content
 * - Clean radio circle indicator on the right with animated checkmark
 * - Consistent with the Q7 reference card styling across all questions
 */
export default function OptionCards({
  options = [],
  selectedOptionValue,
  onSelectOption,
  questionId,
}) {
  return (
    <div className="space-y-2 sm:space-y-2.5">
      {options.map((opt) => {
        const isSelected = selectedOptionValue === opt.value;
        const isPreferNotToSay = opt.value === 'prefer_not_to_say';

        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelectOption(questionId, opt.value)}
            className={`group relative w-full py-3.5 px-5 sm:py-4 sm:px-6 rounded-2xl text-left border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-400/50 flex items-center justify-between cursor-pointer min-h-[52px] sm:min-h-[58px] ${
              isSelected
                ? 'bg-violet-50/90 border-violet-600 shadow-md shadow-violet-500/10 ring-2 ring-violet-500/20 animate-quiz-option-pop'
                : isPreferNotToSay
                ? 'bg-slate-50/60 border-slate-200/70 hover:border-violet-300 hover:bg-slate-50'
                : 'bg-white border-slate-200/80 hover:border-violet-300 hover:bg-slate-50/80 hover:translate-x-1 hover:shadow-sm'
            }`}
          >
            {/* Left: Emoji (if present) & Answer Choice Label */}
            <div className="flex items-center gap-3.5 min-w-0">
              {opt.emoji && (
                <span className="text-2xl shrink-0 select-none group-hover:scale-110 transition-transform">
                  {opt.emoji}
                </span>
              )}
              <span
                className={`text-sm sm:text-base leading-snug transition-colors ${
                  isSelected
                    ? 'text-violet-950 font-bold'
                    : isPreferNotToSay
                    ? 'text-slate-500 font-medium italic'
                    : 'text-slate-800 font-medium group-hover:text-slate-900'
                }`}
              >
                {opt.label}
              </span>
            </div>

            {/* Right: Radio Check Circle */}
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ml-3 transition-all duration-200 ${
                isSelected
                  ? 'bg-violet-600 text-white border-2 border-violet-600 scale-100 shadow-sm'
                  : 'border-2 border-slate-300 group-hover:border-violet-400 bg-white'
              }`}
            >
              {isSelected && (
                <Check className="w-3 h-3 stroke-[3] animate-scale-check" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
