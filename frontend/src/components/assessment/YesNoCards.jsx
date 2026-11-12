import React from 'react';
import { Check, CheckCircle2, XCircle, Shield } from 'lucide-react';

/**
 * YesNoCards Component (Friendly Binary / Screener Question Format)
 *
 * Grounded in:
 * - 2 Large, welcoming, non-clinical cards side-by-side
 * - Clear icons with gentle lavender/violet aesthetic
 * - Optional "Prefer not to say" discrete option for sensitive background questions
 */
export default function YesNoCards({
  options = [],
  selectedOptionValue,
  onSelectOption,
  questionId,
}) {
  const primaryOptions = options.filter((opt) => opt.value !== 'prefer_not_to_say');
  const preferNotToSayOpt = options.find((opt) => opt.value === 'prefer_not_to_say');

  return (
    <div className="space-y-3.5 pt-1">
      {/* 2 Large Primary Cards (Yes / No) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
        {primaryOptions.map((opt) => {
          const isSelected = selectedOptionValue === opt.value;
          const isYes = opt.value === 'yes';

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelectOption(questionId, opt.value)}
              className={`group relative p-5 sm:p-6 rounded-2xl text-left border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-400/50 flex flex-col justify-between min-h-[110px] cursor-pointer ${
                isSelected
                  ? 'bg-violet-50/90 border-violet-600 shadow-md shadow-violet-500/10 ring-2 ring-violet-500/20 animate-quiz-option-pop'
                  : 'bg-white border-slate-200/80 hover:border-violet-300 hover:bg-slate-50/80 hover:-translate-y-0.5 hover:shadow-sm'
              }`}
            >
              {/* Header: Icon & Selection indicator */}
              <div className="flex items-center justify-between w-full mb-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-violet-600 text-white shadow-sm'
                      : isYes
                      ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                  }`}
                >
                  {isYes ? (
                    <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
                  ) : (
                    <XCircle className="w-5 h-5 stroke-[2.2]" />
                  )}
                </div>

                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isSelected
                      ? 'bg-violet-600 text-white scale-100 shadow-sm'
                      : 'border-2 border-slate-300 group-hover:border-violet-400 bg-white'
                  }`}
                >
                  {isSelected && (
                    <Check className="w-3 h-3 stroke-[3] animate-scale-check" />
                  )}
                </div>
              </div>

              {/* Label */}
              <div
                className={`text-base font-bold transition-colors ${
                  isSelected
                    ? 'text-violet-950'
                    : 'text-slate-800 group-hover:text-slate-900'
                }`}
              >
                {opt.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Discreet "Prefer not to say" pill if provided */}
      {preferNotToSayOpt && (
        <div className="pt-1 text-center">
          <button
            type="button"
            onClick={() => onSelectOption(questionId, preferNotToSayOpt.value)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              selectedOptionValue === preferNotToSayOpt.value
                ? 'bg-violet-100 text-violet-800 border border-violet-300 ring-2 ring-violet-400/20'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/80 border border-transparent'
            }`}
          >
            <Shield className="w-3 h-3" />
            <span>{preferNotToSayOpt.label}</span>
          </button>
        </div>
      )}
    </div>
  );
}

