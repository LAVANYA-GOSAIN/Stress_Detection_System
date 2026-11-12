import React from 'react';
import { 
  Check, 
  Star, 
  Sparkles, 
  Moon, 
  Sun, 
  SunMedium, 
  CloudMoon, 
  VolumeX, 
  Volume1, 
  Volume2, 
  Volume, 
  AlertCircle,
  GraduationCap,
  BookOpen,
  BookMinus,
  AlertTriangle,
  Leaf,
  Sprout,
  TreePine
} from 'lucide-react';

const ICON_MAP = {
  Star,
  Sparkles,
  Moon,
  Sun,
  SunMedium,
  CloudMoon,
  VolumeX,
  Volume1,
  Volume2,
  Volume,
  AlertCircle,
  GraduationCap,
  BookOpen,
  BookMinus,
  AlertTriangle,
  Leaf,
  Sprout,
  TreePine,
};

/**
 * VisualScale Component (Stepped Visual Rating Format)
 *
 * Grounded in:
 * - 5-Step interactive visual scale with relevant micro-icons and stepped numbers (1-5)
 * - Clear primary anchor labels and supportive sublabels
 * - Smooth hover and active scale animations
 */
export default function VisualScale({
  options = [],
  selectedOptionValue,
  onSelectOption,
  questionId,
}) {
  return (
    <div className="space-y-2.5 pt-1">
      {options.map((opt, idx) => {
        const isSelected = selectedOptionValue === opt.value;
        const IconComponent = ICON_MAP[opt.iconName] || Star;
        const stepNumber = idx + 1;

        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelectOption(questionId, opt.value)}
            className={`group relative w-full p-3.5 sm:p-4 rounded-2xl text-left border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-400/50 flex items-center justify-between cursor-pointer ${
              isSelected
                ? 'bg-violet-50/90 border-violet-600 shadow-md shadow-violet-500/10 ring-2 ring-violet-500/20 animate-quiz-option-pop'
                : 'bg-white border-slate-200/80 hover:border-violet-300 hover:bg-slate-50/80 hover:translate-x-1 hover:shadow-sm'
            }`}
          >
            {/* Left: Stepped Number Badge & Icon & Labels */}
            <div className="flex items-center gap-3.5 min-w-0">
              
              {/* Step Number + Icon Badge */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                  isSelected
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-violet-50 text-violet-700 group-hover:bg-violet-100'
                }`}
              >
                <IconComponent className="w-4 h-4" />
              </div>

              {/* Text: Primary Label & Sublabel */}
              <div className="min-w-0">
                <div
                  className={`text-sm sm:text-base leading-snug transition-colors ${
                    isSelected
                      ? 'text-violet-950 font-bold'
                      : 'text-slate-800 font-semibold group-hover:text-slate-900'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-400 mr-2">
                    Step {stepNumber}
                  </span>
                  {opt.label}
                </div>

                {opt.sublabel && (
                  <div className="text-xs text-slate-500 font-normal leading-tight pt-0.5">
                    {opt.sublabel}
                  </div>
                )}
              </div>

            </div>

            {/* Right: Radio Circle & Animated Checkmark */}
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ml-3 transition-all duration-200 ${
                isSelected
                  ? 'bg-violet-600 text-white scale-100 shadow-sm'
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

