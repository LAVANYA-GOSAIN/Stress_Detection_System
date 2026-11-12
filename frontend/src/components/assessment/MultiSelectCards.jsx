import React from 'react';
import { Check } from 'lucide-react';

/**
 * MultiSelectCards Component (Multi-Select Experience Cards)
 *
 * Implements:
 * - Full-width stacked cards matching the Q7 reference design
 * - Circular indicator on the right with animated checkmark
 * - Displays active selection counter & handles mutually exclusive options
 */
export default function MultiSelectCards({
  options = [],
  selectedOptionValue = [],
  onSelectOption,
  questionId,
  instruction = 'Select all that apply.',
}) {
  const currentSelected = Array.isArray(selectedOptionValue)
    ? selectedOptionValue
    : selectedOptionValue
    ? [selectedOptionValue]
    : [];

  const handleToggle = (opt) => {
    const val = opt.value;
    const isExclusive = Boolean(opt.isExclusive);
    let nextSelected = [];

    if (isExclusive) {
      nextSelected = currentSelected.includes(val) ? [] : [val];
    } else {
      const exclusiveValues = options
        .filter((o) => o.isExclusive)
        .map((o) => o.value);
      const filtered = currentSelected.filter((v) => !exclusiveValues.includes(v));

      if (filtered.includes(val)) {
        nextSelected = filtered.filter((v) => v !== val);
      } else {
        nextSelected = [...filtered, val];
      }
    }

    onSelectOption(questionId, nextSelected);
  };

  return (
    <div className="space-y-1.5 sm:space-y-2">
      {/* Header Helper Instruction & Active Counter */}
      <div className="flex items-center justify-between text-xs pb-1 px-0.5">
        <span className="font-semibold text-violet-700 tracking-wide">
          {instruction}
        </span>
        {currentSelected.length > 0 && (
          <span className="px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-800 font-bold text-[11px]">
            {currentSelected.length} selected
          </span>
        )}
      </div>

      {/* Cards Stack (Full-width vertical stack matching Q7) */}
      <div className="space-y-2 sm:space-y-2.5">
        {options.map((opt) => {
          const isSelected = currentSelected.includes(opt.value);

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleToggle(opt)}
              className={`group relative w-full py-3.5 px-5 sm:py-4 sm:px-6 rounded-2xl text-left border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-400/50 flex items-center justify-between cursor-pointer min-h-[52px] sm:min-h-[58px] ${
                isSelected
                  ? 'bg-violet-50/90 border-violet-600 shadow-md shadow-violet-500/10 ring-2 ring-violet-500/20 animate-quiz-option-pop'
                  : 'bg-white border-slate-200/80 hover:border-violet-300 hover:bg-slate-50/80 hover:translate-x-1 hover:shadow-sm'
              }`}
            >
              {/* Left: Emoji (if present) & Label */}
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
                      : opt.isExclusive
                      ? 'text-slate-600 font-medium italic'
                      : 'text-slate-800 font-medium group-hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </span>
              </div>

              {/* Right: Checkbox / Radio Circle matching Q7 */}
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
    </div>
  );
}
