import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Clock,
  ShieldCheck,
  FileText,
  RotateCcw
} from 'lucide-react';

// Questionnaire & Feature Data
import {
  SECTIONS,
  QUESTIONS_LIST,
  QUESTIONS_MAP
} from '../data/questionnaire';

// Assessment UI Components
import QuestionCard from '../components/assessment/QuestionCard';
import ChapterTransition from '../components/assessment/ChapterTransition';
import AssessmentReview from '../components/assessment/AssessmentReview';
import ResetConfirmModal from '../components/assessment/ResetConfirmModal';

/**
 * Assessment Page Component (MindScope Student Well-being Check-In)
 *
 * Implements:
 * 1. 22-question, 5-section specification using mixed interaction formats:
 *    - Visual emoji cards (Q2, Q7, Q11)
 *    - Multi-select cards with exclusive safeguards (Q4, Q6, Q8, Q16, Q17, Q19, Q21)
 *    - Scenario & single-choice cards (Q1, Q3, Q5, Q9, Q10, Q12, Q13, Q14, Q15, Q18, Q20, Q22)
 * 2. Hybrid progression: automatic advance on single-choice, Continue button on multi-select.
 * 3. Slim overall progress bar at the top with Question X of 22 and current section name beneath.
 * 4. Persisted answer state when navigating backwards.
 * 5. Full review screen with individual section editing.
 */
export default function Assessment() {
  // viewMode: 'intro' | 'questionnaire' | 'section_complete' | 'review'
  const [viewMode, setViewMode] = useState('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [completedSectionIndex, setCompletedSectionIndex] = useState(0);
  const [animationDirection, setAnimationDirection] = useState('next'); // 'next' | 'prev'
  const [showResetModal, setShowResetModal] = useState(false);

  // Questionnaire Answers State (persisted across all backwards/forwards navigation)
  const [answers, setAnswers] = useState({});

  // Auto-advance timer ref
  const autoAdvanceTimerRef = useRef(null);

  // Clear timer on unmount or question change
  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
    };
  }, [currentQuestionIndex]);

  // Scroll to top whenever question or view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [viewMode, currentQuestionIndex]);

  // Current Question & Current Section references
  const currentQuestion = QUESTIONS_LIST[currentQuestionIndex] || QUESTIONS_LIST[0];
  const currentSectionIndex = Math.max(0, (currentQuestion.section || 1) - 1);
  const currentSection = SECTIONS[currentSectionIndex] || SECTIONS[0];
  const sectionQuestionIds = currentSection.questionIds || [];
  const questionIndexInSection = sectionQuestionIds.indexOf(currentQuestion.id);
  const totalQuestionsInSection = sectionQuestionIds.length;
  const SectionIcon = currentSection.icon || Sparkles;

  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestionOverall = currentQuestionIndex === QUESTIONS_LIST.length - 1;
  const isLastQuestionInSection = questionIndexInSection === totalQuestionsInSection - 1;

  // Overall progress percentage across all 22 questions
  const overallProgressPercent = Math.min(
    100,
    Math.round(((currentQuestionIndex + 1) / QUESTIONS_LIST.length) * 100)
  );

  // Check if current question is completed
  const isQuestionComplete = useCallback(
    (qId) => {
      const val = answers[qId];
      if (Array.isArray(val)) {
        return val.length > 0;
      }
      return Boolean(val);
    },
    [answers]
  );

  const isCurrentQuestionComplete = isQuestionComplete(currentQuestion.id);

  // Navigation: Next Question / Complete Section
  const handleNextQuestion = useCallback(() => {
    if (!isCurrentQuestionComplete) return;

    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }

    if (isLastQuestionInSection) {
      setCompletedSectionIndex(currentSectionIndex);
      setViewMode('section_complete');
    } else {
      setAnimationDirection('next');
      setCurrentQuestionIndex((prev) => Math.min(prev + 1, QUESTIONS_LIST.length - 1));
    }
  }, [isCurrentQuestionComplete, isLastQuestionInSection, currentSectionIndex]);

  // Navigation: Previous Question
  const handlePrevQuestion = useCallback(() => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }

    if (isFirstQuestion) {
      setViewMode('intro');
    } else {
      setAnimationDirection('prev');
      setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0));
    }
  }, [isFirstQuestion]);

  // Answer change handler (Hybrid: auto-advance for single selection, manual Continue for multi-select)
  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));

    const q = QUESTIONS_MAP[questionId];
    // Automatically advance for simple single-choice and visual answers; use Continue for multi-select
    if (q && q.format !== 'multi_select') {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
      autoAdvanceTimerRef.current = setTimeout(() => {
        if (isLastQuestionInSection) {
          setCompletedSectionIndex(currentSectionIndex);
          setViewMode('section_complete');
        } else {
          setAnimationDirection('next');
          setCurrentQuestionIndex((prev) => Math.min(prev + 1, QUESTIONS_LIST.length - 1));
        }
      }, 380);
    }
  };

  // Keyboard navigation support (ArrowRight/Enter to advance, ArrowLeft to go back)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (viewMode !== 'questionnaire') return;

      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (isCurrentQuestionComplete) {
          e.preventDefault();
          handleNextQuestion();
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevQuestion();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, isCurrentQuestionComplete, handleNextQuestion, handlePrevQuestion]);

  // Confirm Reset
  const handleConfirmReset = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setViewMode('intro');
    setShowResetModal(false);
  };

  // Interstitial: Proceed after section celebration
  const handleProceedFromSectionComplete = () => {
    if (completedSectionIndex < SECTIONS.length - 1) {
      const nextSection = SECTIONS[completedSectionIndex + 1];
      const firstQId = nextSection.questionIds[0];
      const nextQIndex = QUESTIONS_LIST.findIndex((q) => q.id === firstQId);
      setAnimationDirection('next');
      setCurrentQuestionIndex(nextQIndex >= 0 ? nextQIndex : currentQuestionIndex + 1);
      setViewMode('questionnaire');
    } else {
      setViewMode('review');
    }
  };

  // Interstitial: Review just-completed section
  const handleReviewCurrentSection = () => {
    const firstQId = currentSection.questionIds[0];
    const targetIdx = QUESTIONS_LIST.findIndex((q) => q.id === firstQId);
    setAnimationDirection('prev');
    setCurrentQuestionIndex(targetIdx >= 0 ? targetIdx : 0);
    setViewMode('questionnaire');
  };

  // Jump to specific section (from Review screen)
  const handleJumpToSection = (sectionIdx) => {
    const targetSection = SECTIONS[sectionIdx];
    if (!targetSection) return;
    const firstQId = targetSection.questionIds[0];
    const targetIdx = QUESTIONS_LIST.findIndex((q) => q.id === firstQId);
    setAnimationDirection(targetIdx >= currentQuestionIndex ? 'next' : 'prev');
    setCurrentQuestionIndex(targetIdx >= 0 ? targetIdx : 0);
    setViewMode('questionnaire');
  };

  return (
    <main className="flex-1 pt-3 sm:pt-4 pb-6 bg-[#FAF9FE] relative">
      {/* Decorative ambient background glows for warmth and personality */}
      <div
        className="absolute top-10 left-1/2 -translate-x-1/2 w-[960px] h-[360px] bg-gradient-to-tr from-violet-200/30 via-purple-200/20 to-indigo-100/30 blur-3xl -z-10 rounded-full pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-3.5 sm:space-y-4">

        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-sm sm:text-base text-slate-500 font-medium">
          <div className="flex items-center gap-2.5">
            <Link to="/" className="hover:text-violet-700 flex items-center gap-1.5 transition-colors font-semibold">
              <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
              Home
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-violet-700 font-bold">Well-being Check-In</span>
          </div>

          <span className="text-xs sm:text-sm text-slate-400 hidden sm:inline font-medium">
            MindScope Student Awareness
          </span>
        </div>

        {/* ----------------------------------------------------------- */}
        {/* VIEW 1: WELCOME INTRODUCTION SCREEN                         */}
        {/* ----------------------------------------------------------- */}
        {viewMode === 'intro' && (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-purple-100 shadow-sm space-y-8 animate-fadeIn">

            {/* Header Tag & Title */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-100 text-violet-800 text-xs font-bold tracking-wide">
                <Sparkles className="w-4 h-4 text-violet-600" />
                <span>5 Sections • 22 Guided Reflections</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Take a Moment to Check In With <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Yourself</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
                University life comes with changing routines, study pressures, and everyday challenges. MindScope offers a gentle, private space to reflect on what you&apos;ve been feeling and experiencing lately.
              </p>
            </div>

            {/* Assessment Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <Clock className="w-4 h-4 text-violet-600" />
                  <span>3 to 5 Minutes</span>
                </div>
                <p className="text-xs text-slate-500">22 thoughtful questions presented one at a time</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>5 Well-being Areas</span>
                </div>
                <p className="text-xs text-slate-500">From emotions & confidence to campus life</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Private & Gentle</span>
                </div>
                <p className="text-xs text-slate-500">No medical judgment or clinical score</p>
              </div>
            </div>

            {/* The 5 Sections Preview */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Your Reflection Journey in 5 Areas:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {SECTIONS.map((sec) => {
                  const Icon = sec.icon;
                  return (
                    <div
                      key={sec.id}
                      className="p-4 rounded-2xl bg-violet-50/50 border border-violet-100 flex items-center gap-3.5 text-left"
                    >
                      <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold uppercase text-slate-500">
                          Section 0{sec.sectionNumber} ({sec.questionIds.length} Qs)
                        </div>
                        <div className="text-sm font-bold text-slate-900">
                          {sec.title}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setViewMode('questionnaire')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/35 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <span>Begin Check-In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* VIEW 2: UNIFIED WELLNESS CHECK-IN (1 Question at a time)     */}
        {/* ----------------------------------------------------------- */}
        {viewMode === 'questionnaire' && (
          <div className="space-y-3 animate-fadeIn">

            {/* Top Slim Overall Progress & Section Name */}
            <div className="space-y-2">

              {/* 1. Slim Animated Overall Progress Bar */}
              <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${overallProgressPercent}%` }}
                />
              </div>

              {/* 2. Question Number & Section Name Beneath */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 text-left">
                  <div className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                    Question {currentQuestionIndex + 1} of {QUESTIONS_LIST.length}
                  </div>
                  <div className="text-xs font-semibold text-violet-700 flex items-center gap-1.5">
                    <SectionIcon className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                    <span>Section {currentSection.sectionNumber}: {currentSection.title}</span>
                  </div>
                </div>

                {/* Subtle Reset Icon Button */}
                <button
                  type="button"
                  onClick={() => setShowResetModal(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200/80 hover:border-rose-200 transition-colors cursor-pointer"
                  title="Reset Assessment"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              </div>

            </div>

            {/* UNIFIED SINGLE CARD (Question prompt + Varied answer control + Bottom navigation) */}
            <QuestionCard
              question={currentQuestion}
              answer={answers[currentQuestion.id]}
              onAnswerChange={handleAnswerChange}
              animationDirection={animationDirection}
              onPrev={handlePrevQuestion}
              onNext={handleNextQuestion}
              isComplete={isCurrentQuestionComplete}
              isFirst={isFirstQuestion}
              isLastInSection={isLastQuestionInSection}
              isLastOverall={isLastQuestionOverall}
              sectionNumber={currentSection.sectionNumber}
            />

          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* VIEW 3: SECTION COMPLETION CELEBRATION                      */}
        {/* ----------------------------------------------------------- */}
        {viewMode === 'section_complete' && (
          <ChapterTransition
            completedChapterIndex={completedSectionIndex}
            onProceed={handleProceedFromSectionComplete}
            onReviewChapter={handleReviewCurrentSection}
          />
        )}

        {/* ----------------------------------------------------------- */}
        {/* VIEW 4: FINAL ASSESSMENT REVIEW SCREEN                      */}
        {/* ----------------------------------------------------------- */}
        {viewMode === 'review' && (
          <AssessmentReview
            answers={answers}
            onEditChapter={handleJumpToSection}
          />
        )}

        {/* Confirmation Modal for Reset */}
        <ResetConfirmModal
          isOpen={showResetModal}
          onCancel={() => setShowResetModal(false)}
          onConfirm={handleConfirmReset}
        />

      </div>
    </main>
  );
}
