import React from 'react';
import {
  Brain,
  HeartPulse,
  Home,
  GraduationCap,
  Users,
  Compass,
  Sparkles,
  Info,
} from 'lucide-react';

const DIMENSION_ICONS = {
  mind_emotions: Brain,
  physical_wellbeing: HeartPulse,
  living_environment: Home,
  academic_future: GraduationCap,
  social_relationships: Users,
};

export default function WellnessInsights({ latestAssessment }) {
  if (
    !latestAssessment ||
    !latestAssessment.dimensionScores ||
    latestAssessment.dimensionScores.length === 0
  ) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-purple-100 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mx-auto">
          <Compass className="w-6 h-6" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900">
          No Self-Reflection Data Recorded
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Complete an assessment to explore how your daily habits distribute across your five key wellness dimensions.
        </p>
      </div>
    );
  }

  const dimensions = latestAssessment.dimensionScores;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold text-violet-700 uppercase tracking-wider">
          <Compass className="w-4 h-4 text-violet-600" />
          <span>Multi-Dimensional Profile</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Client-Side Wellness Reflection Breakdown
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
          These five scores are computed independently inside your browser from your questionnaire responses. They provide a balanced look across your physical, academic, emotional, and social context.
        </p>
      </div>

      {/* Grid of Dimension Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {dimensions.map((dim) => {
          const Icon = DIMENSION_ICONS[dim.id] || Compass;
          const score = dim.score;
          const isCoverageMet = dim.isCoverageMet && score !== null;

          return (
            <div
              key={dim.id}
              className="bg-white rounded-3xl p-6 border border-purple-100 shadow-xs space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
                    Score
                  </span>
                  <span className="text-lg font-extrabold text-violet-700">
                    {isCoverageMet ? `${score} / 100` : 'Coverage Met'}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900">{dim.name}</h4>
                <p className="text-xs text-slate-500 pt-1">
                  {dim.validAnswerCount} of {dim.totalPossibleCount} scored items answered
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-violet-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${isCoverageMet ? Math.min(score, 100) : 0}%` }}
                />
              </div>

              <div className="text-[11px] text-slate-500">
                {isCoverageMet
                  ? score >= 70
                    ? 'Reflects higher demands or strain in this dimension.'
                    : score <= 30
                    ? 'Reflects steady, supportive factors in this dimension.'
                    : 'Reflects moderate everyday fluctuations.'
                  : 'Sufficient responses shared to summarize patterns.'}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-xs text-indigo-950 flex items-start gap-3">
        <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Privacy &amp; Architecture Independence: </strong>
          Your self-reflection dimension scores are calculated purely in your client browser. They are not fed as input features to the machine learning model, ensuring that psychological reflection remains independent from automated classification.
        </p>
      </div>
    </div>
  );
}

