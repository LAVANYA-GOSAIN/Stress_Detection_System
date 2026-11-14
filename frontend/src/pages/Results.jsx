import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Check,
  Info,
  Heart,
  Brain,
  Star,
  Lightbulb,
  Sprout,
  FileText,
  ChevronDown,
  ChevronUp,
  BarChart3,
  BarChart2,
  Shield,
  ArrowRight,
  X,
  Sparkles,
  RotateCcw,
} from 'lucide-react';

import heroMeditation from '../assets/hero-meditation.png';
import { SAMPLE_VIVA_RESPONSES } from '../data/questionnaire';
import { calculateReflectionScores } from '../utils/reflectionScoring';
import {
  buildFeatureAuditReport,
  buildLivePredictionRequest,
} from '../utils/featureMapping';
import {
  buildPersonalInsights,
  buildNextSteps,
} from '../utils/reflectionInsights';
import { fetchModelInfo, submitStressPrediction } from '../services/api';

import ReflectionProfileSection from '../components/results/ReflectionProfileSection';
import PersonalInsightsSection from '../components/results/PersonalInsightsSection';
import NextStepsSection from '../components/results/NextStepsSection';
import ResponseReviewSection from '../components/results/ResponseReviewSection';

/**
 * Circular Donut Gauge displaying predicted class probability
 */
function DonutGauge({ percentage = 0, predictedClass = 1, loading = false, isError = false }) {
  const radius = 54;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const validPct = Math.min(Math.max(percentage, 0), 100);
  const strokeDashoffset = circumference - (validPct / 100) * circumference;

  return (
    <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center shrink-0">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 136 136">
        <circle
          cx="68"
          cy="68"
          r={radius}
          fill="transparent"
          stroke="#EDE9FE"
          strokeWidth={strokeWidth}
        />
        <circle
          cx="68"
          cy="68"
          r={radius}
          fill="transparent"
          stroke="#7C3AED"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={loading ? circumference * 0.75 : strokeDashoffset}
          strokeLinecap="round"
          className={loading ? "animate-spin origin-center" : "transition-all duration-1000 ease-out"}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {loading ? (
          <span className="text-xs font-bold text-violet-600 animate-pulse">
            Calculating...
          </span>
        ) : isError ? (
          <span className="text-xs font-bold text-slate-500">
            Offline
          </span>
        ) : (
          <>
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
              {percentage.toFixed(2)}%
            </span>
            <span className="text-xs font-bold text-slate-600 mt-1">
              Class {predictedClass}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Decorative Clipboard Illustration for Personal Insights
 */
function ClipboardIllustration() {
  return (
    <div className="hidden sm:flex items-center justify-center w-24 h-28 relative shrink-0">
      <svg
        className="w-full h-full drop-shadow-xs"
        width="100"
        height="120"
        viewBox="0 0 100 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="14"
          y="16"
          width="72"
          height="96"
          rx="10"
          fill="white"
          stroke="#8B5CF6"
          strokeWidth="2.5"
        />
        <rect x="36" y="8" width="28" height="15" rx="4" fill="#8B5CF6" />
        <line
          x1="34"
          y1="40"
          x2="74"
          y2="40"
          stroke="#8B5CF6"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="34"
          y1="54"
          x2="68"
          y2="54"
          stroke="#8B5CF6"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="34"
          y1="68"
          x2="74"
          y2="68"
          stroke="#8B5CF6"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="34"
          y1="82"
          x2="60"
          y2="82"
          stroke="#8B5CF6"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="25" cy="40" r="2.5" fill="#8B5CF6" />
        <circle cx="25" cy="54" r="2.5" fill="#8B5CF6" />
        <circle cx="25" cy="68" r="2.5" fill="#8B5CF6" />
        <circle cx="25" cy="82" r="2.5" fill="#8B5CF6" />
        <g transform="translate(62, 80)">
          <circle cx="12" cy="12" r="14" fill="#EDE9FE" />
          <path
            d="M12 18s-5.5-3.5-5.5-7a3.5 3.5 0 0 1 5.5-2.8A3.5 3.5 0 0 1 17.5 11c0 3.5-5.5 7-5.5 7z"
            fill="#8B5CF6"
          />
        </g>
      </svg>
    </div>
  );
}

export default function Results() {
  const location = useLocation();
  const routeState = location.state || null;

  const submittedAnswers = routeState?.rawAssessmentAnswers || null;
  const submittedMlInputs = routeState?.inputs || null;
  const submittedPrediction = routeState?.prediction || null;

  const hasSubmittedSession = Boolean(submittedAnswers);

  // Fallback cleanly to sample answers if accessed directly without submission
  const effectiveAnswers = useMemo(() => {
    if (hasSubmittedSession) return submittedAnswers;
    return SAMPLE_VIVA_RESPONSES;
  }, [hasSubmittedSession, submittedAnswers]);

  // Compute live client-side reflection scores & insights
  const reflectionScores = useMemo(() => {
    return calculateReflectionScores(effectiveAnswers);
  }, [effectiveAnswers]);

  const insights = useMemo(() => {
    return buildPersonalInsights(effectiveAnswers, reflectionScores);
  }, [effectiveAnswers, reflectionScores]);

  const nextSteps = useMemo(() => {
    return buildNextSteps(effectiveAnswers);
  }, [effectiveAnswers]);

  // Evaluate ML payload and live eligibility
  const liveEligibility = useMemo(() => {
    return buildLivePredictionRequest(effectiveAnswers);
  }, [effectiveAnswers]);

  const effectiveMlInputs = useMemo(() => {
    if (liveEligibility && liveEligibility.canSubmit) {
      return liveEligibility.payload;
    }
    if (hasSubmittedSession && submittedMlInputs) {
      return submittedMlInputs;
    }
    return buildFeatureAuditReport(effectiveAnswers).benchmarkDemoPayload;
  }, [liveEligibility, hasSubmittedSession, submittedMlInputs, effectiveAnswers]);

  // ML State (Live inference from FastAPI backend)
  const [mlStatus, setMlStatus] = useState(
    submittedPrediction ? 'success' : 'loading',
  );
  const [mlPrediction, setMlPrediction] = useState(submittedPrediction || null);
  const [retryNonce, setRetryNonce] = useState(0);

  const retryPrediction = () => {
    setRetryNonce((prev) => prev + 1);
  };

  useEffect(() => {
    let cancelled = false;

    async function runPrediction() {
      if (!effectiveMlInputs) return;
      setMlStatus('loading');
      try {
        const [, predictResult] = await Promise.allSettled([
          fetchModelInfo(),
          submitStressPrediction(effectiveMlInputs),
        ]);

        if (cancelled) return;

        if (predictResult.status === 'fulfilled' && predictResult.value) {
          setMlPrediction(predictResult.value);
          setMlStatus('success');
        } else {
          setMlStatus('error');
        }
      } catch (err) {
        console.warn('Prediction request fallback used:', err);
        setMlStatus('error');
      }
    }

    runPrediction();

    return () => {
      cancelled = true;
    };
  }, [effectiveMlInputs, retryNonce]);

  // Scroll smoothly to top on arrival
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Compute primary predicted class and probability percentage from live ML prediction
  const predictedClass = mlPrediction?.predicted_class ?? 1;
  const probabilityPercentage = useMemo(() => {
    if (!mlPrediction?.probabilities) return 0;
    const rawProb =
      mlPrediction.probabilities[predictedClass] ??
      mlPrediction.probabilities[String(predictedClass)] ??
      0;
    return rawProb * 100;
  }, [mlPrediction, predictedClass]);

  // Dynamic summary texts derived from live prediction & reflection data
  const stressLevelSummary = useMemo(() => {
    if (mlStatus === 'loading') {
      return 'Analyzing your lifestyle patterns with the trained Gradient Boosting model...';
    }
    if (predictedClass === 0) {
      return 'Your responses indicate lower everyday stress patterns based on the ML analysis.';
    }
    if (predictedClass === 2) {
      return 'Your responses indicate elevated stress patterns based on current demands.';
    }
    return 'Your stress levels appear to be moderate based on the analysis.';
  }, [predictedClass, mlStatus]);

  const emotionalAwarenessSummary = useMemo(() => {
    const mindDim = reflectionScores?.dimensions?.find((d) => d.id === 'mind_emotions');
    if (mindDim && mindDim.score !== null) {
      if (mindDim.score >= 75) {
        return 'You demonstrate strong emotional resilience and mindful grounding.';
      }
      if (mindDim.score < 50) {
        return 'You have taken a valuable first step in acknowledging current emotional strain.';
      }
    }
    return 'You show good emotional awareness and self-reflection.';
  }, [reflectionScores]);

  const personalInsightSummary = useMemo(() => {
    const primaryReflection = insights?.reflections?.[0]?.description;
    const primaryStrength = insights?.strengths?.[0]?.description;
    if (primaryReflection && primaryStrength) {
      return `${primaryReflection} On the positive side, ${primaryStrength.toLowerCase()}`;
    }
    if (primaryReflection) return primaryReflection;
    if (primaryStrength) return primaryStrength;
    return 'You tend to feel anxious sometimes, but you also have strong coping skills and a supportive outlook.';
  }, [insights]);

  // Dynamic actions from student's personalized next steps
  const actionItems = useMemo(() => {
    if (nextSteps?.steps && nextSteps.steps.length > 0) {
      return nextSteps.steps.slice(0, 3).map((s, idx) => ({
        id: s.id || `step_${idx}`,
        label: s.title || s.action,
      }));
    }
    return [
      { id: 'breathing', label: 'Practice deep breathing for 5 minutes daily' },
      { id: 'connected', label: 'Stay connected with friends and family' },
      { id: 'sleep', label: 'Get 7–8 hours of sleep' },
    ];
  }, [nextSteps]);

  const [completedItems, setCompletedItems] = useState({});

  const toggleAction = (id) => {
    setCompletedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const completedCount = Object.values(completedItems).filter(Boolean).length;
  const totalActionCount = actionItems.length;

  // Accordion Expand/Collapse State
  const [expandedRows, setExpandedRows] = useState({
    responses: false,
    model: false,
    notes: false,
  });

  const toggleRow = (key) => {
    setExpandedRows((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const allExpanded =
    expandedRows.responses && expandedRows.model && expandedRows.notes;

  const toggleAll = () => {
    if (allExpanded) {
      setExpandedRows({ responses: false, model: false, notes: false });
    } else {
      setExpandedRows({ responses: true, model: true, notes: true });
    }
  };

  // Detailed report toggle & modals
  const [showDetailedReport, setShowDetailedReport] = useState(false);
  const [showDetailedModal, setShowDetailedModal] = useState(false);
  const [showActionPlanModal, setShowActionPlanModal] = useState(false);

  return (
    <main className="min-h-screen bg-[#FAF9FE] text-slate-800 antialiased selection:bg-violet-200 selection:text-violet-900 pb-16">
      {/* Top Accent Line */}
      <div className="w-full h-1 bg-gradient-to-r from-violet-400 via-purple-500 to-indigo-500" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 space-y-6 sm:space-y-7 animate-fadeIn">
        {/* =========================================================================
            HEADER: "Your Results are Ready!"
           ========================================================================= */}
        <header className="flex items-center gap-3.5 sm:gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 shadow-xs border border-emerald-200/60">
            <Check className="w-6 h-6 stroke-[3]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Your Results are Ready!
              </h1>
              {/* Playful violet sparkles rays */}
              <span className="text-violet-500 inline-block shrink-0">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#7C3AED"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="12" y1="2" x2="12" y2="6" />
                  <line x1="19" y1="7" x2="16" y2="9" />
                  <line x1="21" y1="14" x2="17" y2="13" />
                </svg>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
              Here&apos;s your mental wellness overview and personalized insights.
            </p>
          </div>
        </header>

        {/* =========================================================================
            ROW 1: TWO MAIN STAT CARDS
            - Card 1: Your Stress Profile (Circular Donut Gauge)
            - Card 2: Quick Insights (List + Meditating Girl Illustration)
           ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* CARD 1: Your Stress Profile */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-purple-100 shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-5">
                Your Stress Profile
              </h2>

              <div className="flex items-center gap-6 sm:gap-7">
                {/* Donut Chart Gauge */}
                <DonutGauge
                  percentage={probabilityPercentage}
                  predictedClass={predictedClass}
                  loading={mlStatus === 'loading' || (!mlPrediction && mlStatus !== 'error')}
                  isError={mlStatus === 'error'}
                />

                {/* Info Text */}
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-bold border border-violet-100">
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>ML Prediction</span>
                  </span>

                  {mlStatus === 'loading' || (!mlPrediction && mlStatus !== 'error') ? (
                    <div className="pt-2 text-xs text-slate-500 font-medium animate-pulse">
                      Evaluating 20 features against model...
                    </div>
                  ) : mlStatus === 'error' ? (
                    <div className="pt-1.5 space-y-1">
                      <div className="text-xs font-semibold text-rose-600">
                        Unable to connect to backend
                      </div>
                      <button
                        type="button"
                        onClick={retryPrediction}
                        className="text-[11px] font-bold text-violet-700 hover:text-violet-900 underline cursor-pointer"
                      >
                        Click to retry
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="text-base sm:text-lg font-bold text-slate-900 pt-1.5 leading-snug">
                        Predicted Class: {predictedClass}
                      </div>
                      <div className="text-xs sm:text-sm font-medium text-slate-600">
                        ({probabilityPercentage.toFixed(2)}% probability)
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 flex items-start gap-1.5 mt-5 pt-3 border-t border-slate-100 leading-normal">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>
                This prediction is based on your responses and may not be a clinical diagnosis.
              </span>
            </div>
          </div>

          {/* CARD 2: Quick Insights */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-purple-100 shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
                Quick Insights
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-center">
                {/* 3 Bullet Points with circular icon pills */}
                <div className="space-y-3.5">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Heart className="w-3.5 h-3.5 fill-purple-600" />
                    </div>
                    <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-normal">
                      {stressLevelSummary}
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Brain className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-normal">
                      {emotionalAwarenessSummary}
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                    </div>
                    <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-normal">
                      Keep going! Small steps can make a big difference.
                    </p>
                  </div>
                </div>

                {/* Right Illustration: Meditating girl */}
                <div className="relative flex items-center justify-center shrink-0 mx-auto sm:mx-0">
                  <div className="absolute inset-0 bg-violet-100/50 rounded-full filter blur-md transform scale-90" />
                  <img
                    src={heroMeditation}
                    alt="Mindful Meditation"
                    className="relative w-32 h-32 sm:w-36 sm:h-36 object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            ROW 2: TWO CARDS
            - Card 3: Your Personal Insights (with Clipboard illustration)
            - Card 4: Small Steps, Meaningful Changes (with interactive checklist)
           ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* CARD 3: Your Personal Insights */}
          <div id="personal-insights-card" className="bg-[#FAF8FF] rounded-3xl p-6 sm:p-7 border border-purple-100 shadow-xs flex flex-col justify-between scroll-mt-20">
            <div>
              <div className="flex items-center gap-2.5 mb-3.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Your Personal Insights
                </h3>
              </div>

              <div className="flex items-center justify-between gap-4">
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                  {personalInsightSummary}
                </p>
                <ClipboardIllustration />
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowDetailedReport((prev) => {
                  const nextState = !prev;
                  if (nextState) {
                    setTimeout(() => {
                      document.getElementById('reflection-profile')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 50);
                  }
                  return nextState;
                });
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-violet-700 bg-purple-100/90 hover:bg-purple-200 transition cursor-pointer self-start mt-4 shadow-2xs"
            >
              <span>{showDetailedReport ? 'Hide Detailed Report' : 'View Detailed Report'}</span>
              {showDetailedReport ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* CARD 4: Small Steps, Meaningful Changes */}
          <div className="bg-[#F8FCF9] rounded-3xl p-6 sm:p-7 border border-emerald-100 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Sprout className="w-4 h-4" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Small Steps, Meaningful Changes
                  </h3>
                </div>

                <span className="px-2.5 py-0.5 rounded-full bg-white border border-emerald-200 text-slate-600 text-xs font-semibold">
                  {completedCount} of {totalActionCount} completed
                </span>
              </div>

              <p className="text-xs text-slate-600 mb-3.5 font-normal">
                Start with these simple, personalised actions:
              </p>

              {/* 3 Interactive Checklist Items */}
              <div className="space-y-2.5">
                {actionItems.map((item) => {
                  const isChecked = Boolean(completedItems[item.id]);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleAction(item.id)}
                      className="w-full text-left flex items-center gap-2.5 group cursor-pointer transition-transform active:scale-[0.99]"
                    >
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                          isChecked
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-200'
                        }`}
                      >
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span
                        className={`text-xs sm:text-[13px] leading-snug transition-colors ${
                          isChecked
                            ? 'line-through text-slate-400 font-normal'
                            : 'text-slate-700 font-normal group-hover:text-slate-900'
                        }`}
                      >
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowActionPlanModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 transition cursor-pointer self-end mt-4 shadow-xs"
            >
              <span>View Action Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* =========================================================================
            SECTION B: 5 INDEPENDENT REFLECTION DOMAINS (Your Reflection Profile)
           ========================================================================= */}
        {showDetailedReport && (
          <div className="space-y-4 animate-fadeIn">
            <ReflectionProfileSection
              dimensions={reflectionScores?.dimensions || []}
              answers={effectiveAnswers}
              reflection={reflectionScores}
              onHide={() => {
                setShowDetailedReport(false);
                document.getElementById('personal-insights-card')?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
            <div className="flex justify-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowDetailedReport(false);
                  document.getElementById('personal-insights-card')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 transition cursor-pointer shadow-2xs"
              >
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Hide Detailed Report</span>
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            ROW 3: ACCORDION CARD: "Understanding Your Results"
           ========================================================================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-purple-100 shadow-xs space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Understanding Your Results
              </h3>
            </div>

            <button
              type="button"
              onClick={toggleAll}
              className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700 hover:text-violet-800 transition cursor-pointer"
            >
              <span>{allExpanded ? 'Collapse All' : 'View All'}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  allExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>

          {/* Accordion 1: How your responses were analyzed */}
          <div className="rounded-2xl border border-slate-100 overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => toggleRow('responses')}
              className="w-full p-4 flex items-center justify-between bg-white hover:bg-slate-50/70 transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                  <BarChart2 className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-slate-800">
                  How your responses were analyzed
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  expandedRows.responses ? 'rotate-180' : ''
                }`}
              />
            </button>
            {expandedRows.responses && (
              <div className="px-4 pb-4 pt-1 bg-slate-50/50 text-xs sm:text-[13px] text-slate-600 space-y-2 border-t border-slate-100 leading-relaxed">
                <p>
                  Your 20 assessment check-in responses were linearly scaled into the empirical bounds expected by the trained classification model using MindScope&apos;s proposed continuous encoding formula.
                </p>
                {Array.isArray(mlPrediction?.imputed_features) &&
                  mlPrediction.imputed_features.length > 0 && (
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs">
                      <strong>Privacy Imputation:</strong> You chose not to disclose{' '}
                      {mlPrediction.imputed_features.length} optional item(s) (
                      <code>{mlPrediction.imputed_features.join(', ')}</code>
                      ). The backend safely filled these using deterministic training-split statistics.
                    </div>
                  )}
              </div>
            )}
          </div>

          {/* Accordion 2: About the model & predictions */}
          <div className="rounded-2xl border border-slate-100 overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => toggleRow('model')}
              className="w-full p-4 flex items-center justify-between bg-white hover:bg-slate-50/70 transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-slate-800">
                  About the model &amp; predictions
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  expandedRows.model ? 'rotate-180' : ''
                }`}
              />
            </button>
            {expandedRows.model && (
              <div className="px-4 pb-4 pt-1 bg-slate-50/50 text-xs sm:text-[13px] text-slate-600 space-y-2 border-t border-slate-100 leading-relaxed">
                <p>
                  Predictions are generated by a tuned <strong>Gradient Boosting Classifier</strong> trained on 1,100 student lifestyle and stress observations. Outputs are discrete target classes (<code>0</code>, <code>1</code>, <code>2</code>) accompanied by calibrated probability distributions.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {Object.entries(mlPrediction?.probabilities || {}).map(
                    ([cls, prob]) => (
                      <span
                        key={cls}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-mono font-medium text-slate-700"
                      >
                        Class {cls}: {(prob * 100).toFixed(1)}%
                      </span>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Accordion 3: Important note */}
          <div className="rounded-2xl border border-slate-100 overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => toggleRow('notes')}
              className="w-full p-4 flex items-center justify-between bg-white hover:bg-slate-50/70 transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                  <Info className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-slate-800">
                  Important note
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  expandedRows.notes ? 'rotate-180' : ''
                }`}
              />
            </button>
            {expandedRows.notes && (
              <div className="px-4 pb-4 pt-1 bg-slate-50/50 text-xs sm:text-[13px] text-slate-600 space-y-2 border-t border-slate-100 leading-relaxed">
                <p>
                  MindScope provides educational pattern recognition to foster mindful self-awareness. It is not an instrument for psychological diagnosis. If stress or anxiety interferes with your daily activities, please consult campus counseling services or a healthcare professional.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            ROW 4: BOTTOM DISCLAIMER BANNER
           ========================================================================= */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-purple-100/60 border border-purple-200/70 flex items-center justify-between text-xs text-purple-950">
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 text-purple-700 shrink-0" />
            <span>
              MindScope is for educational and awareness purposes only. It is not a substitute for professional medical advice.
            </span>
          </div>
          <Heart className="w-4 h-4 text-purple-400 shrink-0 hidden sm:block" />
        </div>

        {/* Retake Assessment Action */}
        <div className="text-center pt-2">
          <Link
            to="/assessment"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-violet-700 bg-white hover:bg-violet-50 border border-violet-200 transition-all cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Assessment</span>
          </Link>
        </div>
      </div>

      {/* =========================================================================
          MODAL 1: VIEW DETAILED REPORT (5 Dimensions Reflection Profile)
         ========================================================================= */}
      {showDetailedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-violet-600" />
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  Detailed Reflection Report
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailedModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 5-Dimension Reflection Breakdown */}
            <ReflectionProfileSection
              dimensions={reflectionScores?.dimensions || []}
              answers={effectiveAnswers}
              reflection={reflectionScores}
            />

            {/* Personal Insights Narrative Breakdown */}
            <div className="pt-4 border-t border-slate-100">
              <PersonalInsightsSection insights={insights} />
            </div>

            {/* Full 20-Question Response Review */}
            <div className="pt-4 border-t border-slate-100">
              <ResponseReviewSection answers={effectiveAnswers} />
            </div>

            <div className="text-right pt-2">
              <button
                type="button"
                onClick={() => setShowDetailedModal(false)}
                className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: VIEW ACTION PLAN (Interactive 7-Day Gentle Rhythm)
         ========================================================================= */}
      {showActionPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Sprout className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  Your 7-Day Gentle Rhythm Action Plan
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowActionPlanModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <NextStepsSection nextSteps={nextSteps} />

            <div className="text-right pt-2">
              <button
                type="button"
                onClick={() => setShowActionPlanModal(false)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
