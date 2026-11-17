import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  Calendar,
  Clock,
  Trash2,
  Eye,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Info,
  CheckCircle2,
  X,
  PlusCircle,
  FileText,
  UserCheck,
  Cpu,
  Heart,
  TrendingUp,
  Compass,
  Smile,
  Copy,
  Check,
  KeyRound,
  Users,
  LogOut,
} from 'lucide-react';
import {
  getGuestHistory,
  deleteGuestAssessment,
  clearGuestHistory,
  getGuestSummaryStats,
  getGuestSession,
  clearGuestSession,
} from '../services/guestStorage';
import { QUESTIONS_MAP, SECTIONS } from '../data/questionnaire';

// Dashboard Sub-components
import HistoryTrendChart from '../components/dashboard/HistoryTrendChart';
import PersonalizedRecommendations from '../components/dashboard/PersonalizedRecommendations';
import StressReliefCentre from '../components/dashboard/StressReliefCentre';
import WellnessInsights from '../components/dashboard/WellnessInsights';
import GuestEntryModal from '../components/GuestEntryModal';

/**
 * Helper to format ISO timestamps into user-friendly strings.
 */
function formatTimestamp(isoString) {
  if (!isoString) return 'Unknown date';
  try {
    const d = new Date(isoString);
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

/**
 * Helper to display human-readable answer label for a given question ID.
 */
function getAnswerLabel(questionId, rawValue) {
  if (!rawValue) return <span className="text-slate-400 italic">Unanswered</span>;
  const q = QUESTIONS_MAP[questionId];
  if (!q || !Array.isArray(q.options)) return String(rawValue);

  const matched = q.options.find((opt) => opt.value === rawValue);
  return matched ? matched.label : String(rawValue);
}

/**
 * Main Guest User Dashboard Component
 */
export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'recommendations' | 'relief' | 'insights'
  const [session, setSession] = useState(getGuestSession());
  const [history, setHistory] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Load history & session strictly scoped to current active Guest ID
  const loadHistory = () => {
    const active = getGuestSession();
    setSession(active);
    if (active?.guestId) {
      const records = getGuestHistory(active.guestId);
      setHistory(records);
    } else {
      setHistory([]);
    }
  };

  useEffect(() => {
    loadHistory();

    const handleSessionUpdate = () => {
      loadHistory();
    };

    window.addEventListener('mindscope_session_change', handleSessionUpdate);
    window.addEventListener('storage', handleSessionUpdate);

    return () => {
      window.removeEventListener('mindscope_session_change', handleSessionUpdate);
      window.removeEventListener('storage', handleSessionUpdate);
    };
  }, []);

  // Summary statistics strictly scoped to active guest
  const stats = useMemo(() => {
    return getGuestSummaryStats(session?.guestId);
  }, [history, session]);

  // Handle single record deletion (strictly scoped to active guest)
  const confirmDeleteItem = () => {
    if (itemToDelete && session?.guestId) {
      deleteGuestAssessment(itemToDelete, session.guestId);
      setItemToDelete(null);
      loadHistory();
      if (selectedAssessment?.id === itemToDelete) {
        setSelectedAssessment(null);
      }
    }
  };

  // Handle clearing all records for this specific guest
  const confirmClearAll = () => {
    if (session?.guestId) {
      clearGuestHistory(session.guestId);
      setShowClearModal(false);
      setSelectedAssessment(null);
      loadHistory();
    }
  };

  // Copy Guest ID to clipboard
  const handleCopyGuestId = () => {
    if (session?.guestId && navigator.clipboard) {
      navigator.clipboard.writeText(session.guestId).then(() => {
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
      });
    }
  };

  // Exit guest session without deleting records
  const handleExitGuest = () => {
    clearGuestSession();
    navigate('/');
  };

  return (
    <main className="min-h-screen bg-[#FAF9FE] text-slate-800 antialiased selection:bg-violet-200 selection:text-violet-900 pb-20">
      {/* Top Gradient Stripe */}
      <div className="w-full h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 space-y-8 animate-fadeIn">
        
        {/* =========================================================================
            1. DASHBOARD HEADER & GUEST IDENTITY BANNER
           ========================================================================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-bold tracking-wide border border-violet-200">
                <UserCheck className="w-3.5 h-3.5 text-violet-600" />
                <span>{session?.name ? `Guest Profile: ${session.name}` : 'Guest User Session'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {session?.name ? `Welcome, ${session.name}!` : 'Guest Wellness Dashboard'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
                {session?.name 
                  ? `Welcome back, ${session.name}. Track your self-reflection records, machine learning outputs, and wellness practices locally in this browser.`
                  : 'Track your self-reflection records, machine learning outputs, and wellness practices locally in this browser. No account or password required.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/assessment"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md shadow-violet-500/20 hover:shadow-lg hover:shadow-violet-500/30 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Take New Assessment</span>
              </Link>

              {history.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowClearModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear History</span>
                </button>
              )}
            </div>
          </div>

          {/* Guest Profile ID Badge Card with 1-Click Copy */}
          {session?.guestId ? (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-50/80 to-indigo-50/80 border border-violet-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-xs">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-violet-800">
                      Your Unique Guest ID
                    </span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-violet-200 text-violet-900">
                      Isolated Profile
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 pt-0.5">
                    <span className="font-mono text-base sm:text-lg font-black text-slate-900 tracking-wider">
                      {session.guestId}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyGuestId}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-white hover:bg-violet-100 text-violet-700 border border-violet-200 transition-colors shadow-2xs cursor-pointer"
                      title="Copy your Guest ID to clipboard"
                    >
                      {copiedId ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy ID</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => setShowSwitchModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                  title="Switch to another guest profile or restore via Guest ID"
                >
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Switch Guest</span>
                </button>
                <button
                  type="button"
                  onClick={handleExitGuest}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                  title="Exit this session without deleting your saved profile or history"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Exit Session</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>No active guest session detected. Create a profile or enter a Guest ID to track your personal history.</span>
              </div>
              <button
                type="button"
                onClick={() => setShowSwitchModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700 transition-colors shrink-0 cursor-pointer"
              >
                Enter as Guest
              </button>
            </div>
          )}

          {/* Browser-Local Storage & Limitation Privacy Notice */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2.5 leading-relaxed">
            <Info className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800">Browser-Local Storage &amp; Privacy Notice: </strong>
              Your profile and assessment history are saved exclusively in this browser&apos;s unencrypted localStorage. Each Guest ID maintains its own separate history on this computer. Guest IDs are lightweight local restoration keys, not secure passwords, and cannot recover data from another device or incognito window.
            </div>
          </div>
        </div>

        {/* =========================================================================
            2. SUMMARY KPI STAT CARDS (Strictly Scoped to Active Guest)
           ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Card 1: Total Assessments */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>Total Assessments</span>
              <Activity className="w-4 h-4 text-violet-600" />
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              {stats.totalAssessments}
            </div>
            <p className="text-xs text-slate-500">
              {stats.totalAssessments === 1
                ? '1 record stored for this guest'
                : `${stats.totalAssessments} records stored for this guest`}
            </p>
          </div>

          {/* Card 2: Latest Model Output */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>Latest Model Output</span>
              <Cpu className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {stats.latestAssessment?.predictedClass !== null &&
              stats.latestAssessment?.predictedClass !== undefined
                ? `Class ${stats.latestAssessment.predictedClass}`
                : 'No Data Yet'}
            </div>
            <p className="text-xs text-slate-500">
              {stats.latestAssessment?.probabilities
                ? `${(
                    (stats.latestAssessment.probabilities[stats.latestAssessment.predictedClass] ?? 0) *
                    100
                  ).toFixed(1)}% model probability`
                : 'Take an assessment to generate output'}
            </p>
          </div>

          {/* Card 3: Most Recent Check-in */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>Most Recent Check-in</span>
              <Calendar className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-sm sm:text-base font-bold text-slate-800">
              {stats.latestAssessmentDate
                ? formatTimestamp(stats.latestAssessmentDate)
                : 'None recorded'}
            </div>
            <p className="text-xs text-slate-500">
              {stats.latestAssessment ? 'Saved for this profile' : 'Awaiting your first check-in'}
            </p>
          </div>
        </div>

        {/* =========================================================================
            3. DASHBOARD NAVIGATION TABS
           ========================================================================= */}
        <div className="flex items-center gap-2 border-b border-purple-100 pb-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'history'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Stress History &amp; Trends</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('recommendations')}
            className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'recommendations'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Personalized Recommendations</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('relief')}
            className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'relief'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Stress Relief Centre</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('insights')}
            className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'insights'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Overall Wellness Insights</span>
          </button>
        </div>

        {/* =========================================================================
            TAB 1: ASSESSMENT HISTORY & TIMELINE
           ========================================================================= */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            {/* Timeline SVG Trend Chart */}
            <HistoryTrendChart history={history} />

            {/* Assessment History Cards */}
            <section className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="space-y-0.5">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    Assessment History
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Assessments recorded strictly under your Guest ID ({session?.guestId || 'None'}).
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  {history.length} {history.length === 1 ? 'Entry' : 'Entries'}
                </span>
              </div>

              {/* EMPTY STATE */}
              {history.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 sm:p-14 border border-purple-100 text-center space-y-5 shadow-sm">
                  <div className="w-16 h-16 rounded-3xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto shadow-inner">
                    <FileText className="w-8 h-8 stroke-[1.8]" />
                  </div>
                  <div className="space-y-2 max-w-md mx-auto">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                      No Assessments Recorded for {session?.name || 'This Profile'}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                      Take your 20-question wellness reflection to analyze your lifestyle patterns and explore machine learning outputs. Your results will automatically appear here under your unique Guest ID.
                    </p>
                  </div>
                  <Link
                    to="/assessment"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md shadow-violet-500/25 transition-all"
                  >
                    <span>Start Your First Assessment</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                /* POPULATED HISTORY LIST */
                <div className="space-y-3">
                  {history.map((record, index) => {
                    const predictedClass = record.predictedClass;
                    const probability =
                      record.probabilities && predictedClass !== null
                        ? (record.probabilities[predictedClass] ?? 0) * 100
                        : null;
                    const answerCount = record.answers ? Object.keys(record.answers).length : 0;

                    return (
                      <div
                        key={record.id || index}
                        className="bg-white rounded-2xl p-5 sm:p-6 border border-purple-100 shadow-xs hover:border-violet-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-start sm:items-center gap-4">
                          <div className="w-11 h-11 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-sm shrink-0">
                            #{history.length - index}
                          </div>
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2.5">
                              <span className="text-sm font-bold text-slate-900">
                                {formatTimestamp(record.completedAt)}
                              </span>

                              {/* Model Class Identifier Badge (neutral, non-clinical) */}
                              {predictedClass !== null && predictedClass !== undefined && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                  <Cpu className="w-3 h-3" />
                                  <span>Class {predictedClass}</span>
                                  {probability !== null && (
                                    <span className="text-[11px] font-semibold text-indigo-500">
                                      ({probability.toFixed(1)}%)
                                    </span>
                                  )}
                                </span>
                              )}

                              {index === 0 && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-100 text-emerald-800">
                                  Latest
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                              {record.guestName && (
                                <>
                                  <span className="font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md">
                                    {record.guestName}
                                  </span>
                                  <span>•</span>
                                </>
                              )}
                              <span>Model: {record.modelName || 'Gradient Boosting'}</span>
                              <span>•</span>
                              <span>{answerCount} of 20 questions answered</span>
                              {record.dimensionScores && record.dimensionScores.length > 0 && (
                                <>
                                  <span>•</span>
                                  <span>{record.dimensionScores.length} reflection dimensions</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => setSelectedAssessment(record)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 transition-colors cursor-pointer"
                            title="View complete assessment details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Details</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setItemToDelete(record.id)}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete this assessment record from your profile"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        {/* =========================================================================
            TAB 2: PERSONALIZED RECOMMENDATIONS
           ========================================================================= */}
        {activeTab === 'recommendations' && (
          <PersonalizedRecommendations latestAssessment={stats.latestAssessment} />
        )}

        {/* =========================================================================
            TAB 3: STRESS RELIEF CENTRE
           ========================================================================= */}
        {activeTab === 'relief' && <StressReliefCentre />}

        {/* =========================================================================
            TAB 4: OVERALL WELLNESS INSIGHTS
           ========================================================================= */}
        {activeTab === 'insights' && (
          <WellnessInsights latestAssessment={stats.latestAssessment} />
        )}

      </div>

      {/* =========================================================================
          4. ASSESSMENT DETAIL VIEW MODAL
         ========================================================================= */}
      {selectedAssessment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-purple-100 overflow-hidden animate-scaleUp">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-purple-100 flex items-center justify-between bg-slate-50/70">
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-violet-700 uppercase tracking-wider">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Assessment Record Details {selectedAssessment.guestName ? `• ${selectedAssessment.guestName}` : ''}</span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  {formatTimestamp(selectedAssessment.completedAt)}
                </h3>
                <p className="text-[11px] font-mono text-slate-400">
                  ID: {selectedAssessment.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAssessment(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Model Output & Probabilities */}
              <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 uppercase tracking-wider">
                    <Cpu className="w-4 h-4 text-indigo-600" />
                    <span>Model Output: {selectedAssessment.modelName || 'Gradient Boosting'}</span>
                  </div>
                  {selectedAssessment.predictedClass !== null && (
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-600 text-white">
                      Predicted Class {selectedAssessment.predictedClass}
                    </span>
                  )}
                </div>

                {selectedAssessment.probabilities && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Probability Distribution across Discrete Classes
                    </span>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[0, 1, 2].map((cls) => {
                        const prob = selectedAssessment.probabilities[cls] ?? 0;
                        const isSelected = selectedAssessment.predictedClass === cls;
                        return (
                          <div
                            key={cls}
                            className={`p-3 rounded-xl border text-center space-y-1 ${
                              isSelected
                                ? 'bg-white border-indigo-400 shadow-xs'
                                : 'bg-white/60 border-indigo-100 text-slate-600'
                            }`}
                          >
                            <span className="text-xs font-bold block text-slate-800">
                              Class {cls}
                            </span>
                            <span className="text-sm font-extrabold text-indigo-700 block">
                              {(prob * 100).toFixed(1)}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedAssessment.imputedFeatures && selectedAssessment.imputedFeatures.length > 0 && (
                  <div className="text-[11px] text-slate-600 pt-1">
                    <strong className="text-slate-800">Imputed Features: </strong>
                    {selectedAssessment.imputedFeatures.join(', ')} (median training-split imputation).
                  </div>
                )}
              </div>

              {/* Reflection Dimension Scores */}
              {selectedAssessment.dimensionScores && selectedAssessment.dimensionScores.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                    Client-Side Self-Reflection Profile
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedAssessment.dimensionScores.map((dim) => (
                      <div
                        key={dim.id}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1"
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                          <span>{dim.name}</span>
                          <span className="text-violet-700 font-extrabold">
                            {dim.score !== null ? `${dim.score} / 100` : 'Coverage not met'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {dim.validAnswerCount} of {dim.totalPossibleCount} scored items answered
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Complete 20 Questionnaire Responses */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                  Recorded Questionnaire Responses (20 Questions)
                </h4>
                <div className="space-y-2 border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
                  {Object.keys(QUESTIONS_MAP).map((qId, idx) => {
                    const q = QUESTIONS_MAP[qId];
                    const rawVal = selectedAssessment.answers?.[qId];
                    const label = getAnswerLabel(qId, rawVal);

                    return (
                      <div
                        key={qId}
                        className="p-3.5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div className="space-y-0.5 max-w-md">
                          <span className="font-bold text-slate-800">
                            Q{idx + 1}. {q.title}
                          </span>
                          <p className="text-slate-500 text-[11px]">{q.question}</p>
                        </div>
                        <div className="font-semibold text-violet-800 bg-violet-50 px-3 py-1.5 rounded-lg shrink-0">
                          {label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-purple-100 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setItemToDelete(selectedAssessment.id);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete This Record</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedAssessment(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          5. DELETE CONFIRMATION MODAL (SINGLE ITEM)
         ========================================================================= */}
      {itemToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-purple-100 animate-scaleUp">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">
                  Delete Assessment Record?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to remove this assessment from your personal history? Other guests&apos; histories will not be affected. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteItem}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm cursor-pointer"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          6. CLEAR ALL HISTORY CONFIRMATION MODAL
         ========================================================================= */}
      {showClearModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-purple-100 animate-scaleUp">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">
                  Clear History for {session?.name || 'this Guest'}?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  This will delete all {history.length} assessment records under Guest ID <strong className="font-mono text-slate-800">{session?.guestId}</strong>. Other guest profiles on this browser will not be affected.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmClearAll}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm cursor-pointer"
              >
                Confirm Clear History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Switch Guest Modal */}
      <GuestEntryModal
        isOpen={showSwitchModal}
        onClose={() => setShowSwitchModal(false)}
        initialStep="choice"
        targetDestination="/dashboard"
      />

    </main>
  );
}
