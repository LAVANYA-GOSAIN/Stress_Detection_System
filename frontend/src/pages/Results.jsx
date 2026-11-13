import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sparkles,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  HeartHandshake,
  RotateCcw,
  Home as HomeIcon,
  ArrowRight,
  Compass,
  Eye,
  Info,
  ShieldCheck,
  Building2,
  MessageSquareHeart,
  PhoneCall,
} from 'lucide-react';
import { SAMPLE_VIVA_RESPONSES } from '../data/questionnaire';
import { calculateReflectionScores } from '../utils/reflectionScoring';
import {
  buildFeatureAuditReport,
  buildLivePredictionRequest,
} from '../utils/featureMapping';
import {
  countAnsweredQuestions,
  buildPersonalInsights,
  buildNextSteps,
} from '../utils/reflectionInsights';
import { fetchModelInfo, submitStressPrediction } from '../services/api';
import ReflectionProfileSection from '../components/results/ReflectionProfileSection';
import PersonalInsightsSection from '../components/results/PersonalInsightsSection';
import NextStepsSection from '../components/results/NextStepsSection';
import MachineLearningSection from '../components/results/MachineLearningSection';
import ResponseReviewSection from '../components/results/ResponseReviewSection';

function formatCompletedTimestamp(isoString) {
  if (!isoString) return null;
  const parsed = new Date(isoString);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const SECTION_ANCHORS = [
  { href: '#reflection-profile', label: 'Reflection Profile' },
  { href: '#personal-insights', label: 'Personal Insights' },
  { href: '#next-steps', label: 'Next Steps' },
  { href: '#ml-analysis', label: 'ML Analysis' },
  { href: '#understanding-responses', label: 'Your Responses' },
  { href: '#support-resources', label: 'Support' },
];

export default function Results() {
  const location = useLocation();
  const routeState = location.state || null;

  const submittedAnswers = routeState?.rawAssessmentAnswers || null;
  const submittedMlInputs = routeState?.inputs || null;
  const submittedPrediction = routeState?.prediction || null;
  const submittedTimestamp = formatCompletedTimestamp(routeState?.completedAt);

  const hasSubmittedSession = Boolean(submittedAnswers);
  const [useSamplePreview, setUseSamplePreview] = useState(false);
  const [useBenchmarkFallback, setUseBenchmarkFallback] = useState(false);

  const isPreviewMode = !hasSubmittedSession && useSamplePreview;
  const hasActiveView = hasSubmittedSession || isPreviewMode;

  const effectiveAnswers = useMemo(() => {
    if (hasSubmittedSession) return submittedAnswers;
    if (isPreviewMode) return SAMPLE_VIVA_RESPONSES;
    return null;
  }, [hasSubmittedSession, isPreviewMode, submittedAnswers]);

  const liveEligibility = useMemo(() => {
    if (!hasActiveView || !effectiveAnswers) return null;
    return buildLivePredictionRequest(effectiveAnswers);
  }, [hasActiveView, effectiveAnswers]);

  const effectiveMlInputs = useMemo(() => {
    if (!hasActiveView) return null;
    if (useBenchmarkFallback) {
      return buildFeatureAuditReport(effectiveAnswers || {}).benchmarkDemoPayload;
    }
    if (liveEligibility) {
      return liveEligibility.canSubmit ? liveEligibility.payload : null;
    }
    if (hasSubmittedSession && submittedMlInputs) return submittedMlInputs;
    return null;
  }, [
    hasActiveView,
    useBenchmarkFallback,
    effectiveAnswers,
    liveEligibility,
    hasSubmittedSession,
    submittedMlInputs,
  ]);

  const isMlIneligible = Boolean(
    hasActiveView && !useBenchmarkFallback && liveEligibility && !liveEligibility.canSubmit,
  );

  const [mlStatus, setMlStatus] = useState(
    submittedPrediction && hasSubmittedSession ? 'success' : 'loading',
  );
  const [mlPrediction, setMlPrediction] = useState(
    submittedPrediction && hasSubmittedSession ? submittedPrediction : null,
  );
  const [mlModelName, setMlModelName] = useState('Gradient Boosting');
  const [mlError, setMlError] = useState('');
  const [retryNonce, setRetryNonce] = useState(0);

  // Scroll smoothly to top when arriving at results
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch live ML prediction from FastAPI /predict + /model-info
  useEffect(() => {
    if (!hasActiveView || isMlIneligible || !effectiveMlInputs) {
      return undefined;
    }

    if (hasSubmittedSession && submittedPrediction && retryNonce === 0 && !useBenchmarkFallback) {
      return undefined;
    }

    let cancelled = false;

    async function runPrediction() {
      setMlStatus('loading');
      setMlError('');

      const [infoResult, predictResult] = await Promise.allSettled([
        fetchModelInfo(),
        submitStressPrediction(effectiveMlInputs),
      ]);

      if (cancelled) return;

      if (infoResult.status === 'fulfilled' && infoResult.value) {
        const resolvedName =
          infoResult.value?.metadata?.model_name || infoResult.value?.model_type;
        if (resolvedName) {
          setMlModelName(resolvedName);
        }
      }

      if (predictResult.status === 'fulfilled' && predictResult.value) {
        setMlPrediction(predictResult.value);
        setMlStatus('success');
      } else {
        const reason =
          predictResult.status === 'rejected'
            ? predictResult.reason?.message
            : 'Unable to retrieve prediction from the backend service.';
        setMlPrediction(null);
        setMlError(
          reason ||
            'The FastAPI prediction server did not respond. Please make sure the backend is running.',
        );
        setMlStatus('error');
      }
    }

    runPrediction();

    return () => {
      cancelled = true;
    };
  }, [
    hasActiveView,
    isMlIneligible,
    effectiveMlInputs,
    hasSubmittedSession,
    submittedPrediction,
    retryNonce,
    useBenchmarkFallback,
  ]);

  const handleRetryMlPrediction = () => {
    setRetryNonce((prev) => prev + 1);
  };

  const handleUseBenchmarkFallback = () => {
    setMlStatus('loading');
    setMlError('');
    setMlPrediction(null);
    setUseBenchmarkFallback(true);
  };

  const handleStartSamplePreview = () => {
    setUseBenchmarkFallback(false);
    setMlStatus('loading');
    setMlError('');
    setMlPrediction(null);
    setUseSamplePreview(true);
  };

  // Compute client-side reflection scores, insights, and steps when answers exist
  const answeredCount = useMemo(
    () => (effectiveAnswers ? countAnsweredQuestions(effectiveAnswers) : 0),
    [effectiveAnswers],
  );

  const reflection = useMemo(
    () => (effectiveAnswers ? calculateReflectionScores(effectiveAnswers) : null),
    [effectiveAnswers],
  );

  const insights = useMemo(
    () =>
      effectiveAnswers && reflection
        ? buildPersonalInsights(effectiveAnswers, reflection)
        : { strengths: [], reflections: [], focusArea: null },
    [effectiveAnswers, reflection],
  );

  const nextSteps = useMemo(
    () => (effectiveAnswers ? buildNextSteps(effectiveAnswers) : { steps: [], weeklyPlan: [] }),
    [effectiveAnswers],
  );

  // Direct-visit / empty state when opening /results without an assessment submission
  if (!hasActiveView) {
    return (
      <div className="min-h-[82vh] bg-[#FAF9FE] relative overflow-hidden flex items-center justify-center px-4 py-16">
        <div
          aria-hidden="true"
          className="absolute -top-28 -left-24 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-28 -right-24 w-96 h-96 bg-blue-200/35 rounded-full blur-3xl pointer-events-none"
        />

        <div className="relative z-10 max-w-2xl w-full bg-white rounded-3xl border border-purple-100 shadow-lg shadow-purple-900/5 p-8 sm:p-12 text-center space-y-6 animate-fadeUp">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-700 flex items-center justify-center shadow-xs">
            <Compass className="w-7 h-7" />
          </div>

          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-violet-700 text-xs font-bold border border-purple-100">
              MindScope Self-Reflection
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              No Check-In Submitted Yet
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-lg mx-auto">
              Your reflection report is generated dynamically from your own 20-question check-in responses. Take a few quiet minutes to complete the check-in, or preview how the report layout works using sample student responses.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/assessment"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-sm font-bold shadow-md shadow-violet-600/20 transition-all"
            >
              <span>Start 20-Question Check-In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={handleStartSamplePreview}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white hover:bg-purple-50/70 text-slate-700 text-sm font-semibold border border-purple-200 transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4 text-violet-600" />
              <span>Explore With Sample Responses</span>
            </button>
          </div>

          <p className="text-xs text-slate-500 pt-2">
            Non-clinical self-reflection tool • Answers stay on your device for scoring
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9FE] relative overflow-hidden">
      {/* Soft Decorative Ambient Aura */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/4 w-[28rem] h-[28rem] bg-purple-200/30 rounded-full blur-3xl pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute top-64 right-0 w-[26rem] h-[26rem] bg-blue-200/25 rounded-full blur-3xl pointer-events-none"
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 sm:space-y-14">

        {/* Optional Opt-In Sample Preview Banner */}
        {isPreviewMode && (
          <div className="rounded-2xl bg-amber-50/90 border border-amber-200 px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-start sm:items-center gap-2.5 text-xs sm:text-sm text-amber-900">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5 sm:mt-0" />
              <span>
                <strong>Viewing Sample Preview:</strong> You are exploring sample demonstration answers because no assessment was submitted in this visit.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setUseSamplePreview(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-900 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer"
              >
                Exit Preview
              </button>
              <Link
                to="/assessment"
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white transition-colors"
              >
                Take Real Check-In
              </Link>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* SECTION A – Welcome & Introduction                               */}
        {/* ================================================================ */}
        <header className="relative overflow-hidden rounded-3xl bg-white border border-purple-100/90 shadow-lg shadow-purple-900/5 p-7 sm:p-10 animate-fadeUp">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-violet-500 via-purple-500 to-blue-500"
          />

          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-50 text-violet-700 text-xs font-bold border border-purple-100">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Personal Wellbeing Check-In Complete</span>
              </span>

              {submittedTimestamp && !isPreviewMode && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                  <CalendarClock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Completed {submittedTimestamp}</span>
                </span>
              )}
            </div>

            <div className="space-y-3 max-w-3xl">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Your MindScope Reflection
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                Take a moment to understand your responses, recognize your strengths, and explore areas where you may want to focus.
              </p>
            </div>

            {/* Completion Metadata Summary Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="rounded-2xl bg-[#FAF9FE] border border-purple-100/80 px-4 py-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                  <ClipboardCheck className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500">Check-In Progress</div>
                  <div className="text-sm font-extrabold text-slate-900">
                    {answeredCount} of {reflection?.totalQuestions || 20} answered
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-[#FAF9FE] border border-purple-100/80 px-4 py-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500">Generated Source</div>
                  <div className="text-sm font-extrabold text-slate-900">
                    {isPreviewMode ? 'Sample Responses' : 'Your Own Responses'}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-[#FAF9FE] border border-purple-100/80 px-4 py-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500">Approach</div>
                  <div className="text-sm font-extrabold text-slate-900">
                    Non-Clinical Reflection
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Section Jump Strip */}
            <nav
              aria-label="Results sections"
              className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100"
            >
              <span className="text-xs font-semibold text-slate-400 mr-1">Jump to:</span>
              {SECTION_ANCHORS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-violet-50 hover:text-violet-700 border border-slate-100 hover:border-purple-200 transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </header>

        {/* ================================================================ */}
        {/* SECTION B – Your Reflection Profile                              */}
        {/* ================================================================ */}
        <ReflectionProfileSection
          dimensions={reflection?.dimensions || []}
          answers={effectiveAnswers || {}}
        />

        {/* ================================================================ */}
        {/* SECTION C – Personal Insights                                    */}
        {/* ================================================================ */}
        <PersonalInsightsSection insights={insights} />

        {/* ================================================================ */}
        {/* SECTION D – Your Next Steps                                      */}
        {/* ================================================================ */}
        <NextStepsSection nextSteps={nextSteps} />

        {/* ================================================================ */}
        {/* SECTION E – Machine Learning Analysis (Strictly Separated)       */}
        {/* ================================================================ */}
        <MachineLearningSection
          status={isMlIneligible ? 'ineligible' : mlStatus}
          prediction={isMlIneligible ? null : mlPrediction}
          modelName={mlModelName}
          errorMessage={isMlIneligible ? '' : mlError}
          mlInputs={effectiveMlInputs}
          eligibilityReason={liveEligibility?.reason || ''}
          hasProvisionalBloodPressureNotSure={Boolean(
            !useBenchmarkFallback && liveEligibility?.hasProvisionalBloodPressureNotSure,
          )}
          usingBenchmarkFallback={useBenchmarkFallback}
          onRetry={handleRetryMlPrediction}
          onUseBenchmarkFallback={isMlIneligible ? handleUseBenchmarkFallback : null}
        />

        {/* ================================================================ */}
        {/* SECTION F – Understanding Your Responses                         */}
        {/* ================================================================ */}
        <ResponseReviewSection answers={effectiveAnswers || {}} />

        {/* ================================================================ */}
        {/* SECTION G – Support Is Always Available                          */}
        {/* ================================================================ */}
        <section
          id="support-resources"
          aria-labelledby="support-resources-heading"
          className="scroll-mt-24 animate-fadeUp"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-50 via-white to-blue-50/70 border border-purple-100/90 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-700">
                  <HeartHandshake className="w-4 h-4" />
                  <span>Care &amp; Community</span>
                </div>
                <h2
                  id="support-resources-heading"
                  className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight"
                >
                  Support Is Always Available
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  You do not need to wait for a particular check-in score or a difficult week to reach out. Talking things through early is one of the steadier ways students stay grounded during the term.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/90 border border-purple-100 text-xs font-semibold text-violet-800 shrink-0 self-start md:self-center">
                <ShieldCheck className="w-4 h-4 text-violet-600" />
                <span>Independent of any reflection score</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-white/90 border border-purple-100/80 p-5 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center">
                  <Building2 className="w-4.5 h-4.5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Campus Wellness &amp; Advisors
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your university&apos;s student counseling office, health center, or academic advising desk (listed in your campus portal) offers confidential spaces to discuss workload or personal balance.
                </p>
              </div>

              <div className="rounded-2xl bg-white/90 border border-purple-100/80 p-5 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-indigo-700 flex items-center justify-center">
                  <MessageSquareHeart className="w-4.5 h-4.5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Trusted Peers, Family &amp; Mentors
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sharing how your week is going with a friend, roommate, family member, or supportive faculty mentor can make heavy stretches feel less solitary.
                </p>
              </div>

              <div className="rounded-2xl bg-white/90 border border-purple-100/80 p-5 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <PhoneCall className="w-4.5 h-4.5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Regional &amp; Local Helplines
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  If you ever need immediate emotional support or someone trained to listen right away, please reach out to a local student helpline or your country&apos;s official health and support directory.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* SECTION H – Final Actions                                        */}
        {/* ================================================================ */}
        <footer className="rounded-3xl bg-white border border-purple-100/90 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5 animate-fadeUp">
          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-lg font-extrabold text-slate-900">
              Ready for your next check-in anytime
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
              MindScope is designed for student self-reflection and educational ML demonstration. It is not a clinical diagnosis or medical assessment.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto shrink-0">
            <Link
              to="/assessment"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-sm font-bold shadow-md shadow-violet-600/20 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Assessment</span>
            </Link>

            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-violet-700 text-sm font-semibold border border-slate-200 hover:border-purple-200 transition-colors"
            >
              <HomeIcon className="w-4 h-4" />
              <span>Return to Home</span>
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
