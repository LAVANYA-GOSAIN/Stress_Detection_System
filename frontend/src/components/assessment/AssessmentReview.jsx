import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardCheck, 
  ArrowLeft, 
  ArrowRight, 
  Edit3, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Cpu, 
  Info
} from 'lucide-react';
import { SECTIONS, QUESTIONS_MAP } from '../../data/questionnaire';
import { buildFeatureAuditReport } from '../../utils/featureMapping';

/**
 * AssessmentReview Component (25-Question Architecture)
 *
 * Final review and submission-ready screen:
 * 1. Comprehensive breakdown of all 25 responses across the 5 sections.
 * 2. Ability to jump back and edit any section.
 * 3. Transparent MLOps mapping audit for all 20 model features with clinical/psychometric flags.
 * 4. Boundary-respecting handoff to Krish's results dashboard without duplicating API or prediction code.
 */
export default function AssessmentReview({
  answers = {},
  onEditChapter,
}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'model_mapping'
  const [expandedSections, setExpandedSections] = useState({
    mind_emotions: true,
    physical_wellbeing: true,
    academics_future: true,
    environment_support: true,
    campus_social_life: true,
  });

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const auditReport = buildFeatureAuditReport(answers);

  const getAnswerDisplay = (qId) => {
    const val = answers[qId];
    if (!val) return <span className="text-amber-600 italic">Not answered</span>;

    const q = QUESTIONS_MAP[qId];

    if (Array.isArray(val)) {
      if (val.length === 0) return <span className="text-amber-600 italic">Not answered</span>;
      if (q && q.options) {
        const labels = val.map((v) => {
          const match = q.options.find((opt) => opt.value === v);
          return match ? match.label : v;
        });
        return labels.join(', ');
      }
      return val.join(', ');
    }

    if (q && q.options) {
      const match = q.options.find((opt) => opt.value === val);
      if (match) return match.label;
    }

    return String(val);
  };

  const handleProceedToResults = () => {
    // Navigate to Krish's Results page with benchmark inputs structure
    navigate('/results', {
      state: {
        inputs: auditReport.benchmarkDemoPayload,
        rawAssessmentAnswers: answers,
      },
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Review Header Banner */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-purple-100 shadow-sm space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold tracking-wide border border-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>All 25 Questions Completed</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Review Your Wellness Assessment
        </h1>

        <p className="text-slate-600 text-base sm:text-lg max-w-3xl leading-relaxed font-normal">
          You have completed all five sections. Take a moment to verify your responses, explore how they map to our 20-feature machine learning model, or make any adjustments before finalizing.
        </p>

        {/* Tab Switcher: Questionnaire Summary vs Model Mapping */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setActiveTab('summary')}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'summary'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Questionnaire Responses (25 Questions)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('model_mapping')}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'model_mapping'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>20 Model Features & Technical Audit</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-amber-950">
              MLOps
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: Questionnaire Summary Accordions */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          {SECTIONS.map((sec, secIdx) => {
            const isExpanded = expandedSections[sec.id];
            const SectionIcon = sec.icon;

            // Collect questions belonging to this section
            const sectionQuestions = Object.values(QUESTIONS_MAP).filter(
              (q) => q.section === sec.sectionNumber
            );

            return (
              <div
                key={sec.id}
                className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden transition-all"
              >
                {/* Section Accordion Header */}
                <div className="p-6 sm:p-8 flex items-center justify-between gap-4 bg-slate-50/50">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold">
                      <SectionIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Section 0{sec.sectionNumber}
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                        {sec.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onEditChapter(secIdx)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-violet-700 hover:text-violet-800 bg-violet-50 hover:bg-violet-100 border border-violet-200 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Section</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleSection(sec.id)}
                      className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
                      aria-label="Toggle Section"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Section Question List */}
                {isExpanded && (
                  <div className="p-6 sm:p-8 border-t border-slate-100 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sectionQuestions.map((q) => (
                        <div
                          key={q.id}
                          className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-2 text-left"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                              {q.id.toUpperCase()}{q.title ? ` • ${q.title}` : ''}
                            </span>
                            {q.isSensitive && (
                              <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                                Confidential
                              </span>
                            )}
                          </div>

                          <div className="text-xs font-bold text-slate-800 leading-snug line-clamp-2">
                            {q.question}
                          </div>

                          <div className="pt-1 border-t border-slate-200/60">
                            <span className="text-[11px] text-slate-500 font-medium block">
                              Selected response:
                            </span>
                            <span className="text-xs font-bold text-violet-900 block">
                              {getAnswerDisplay(q.id)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: 20 Model Features Mapping Transparency */}
      {activeTab === 'model_mapping' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Model Feature Reference & Transparency Matrix
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed max-w-3xl font-normal">
              Your 25 check-in responses are saved as your personal student self-reflection profile. This section documents the 20 numerical parameters required by the Kaggle-trained machine learning model. To protect your privacy and ensure scientific accuracy, your responses are <strong>not converted into model features</strong> and are <strong>not submitted to the prediction endpoint</strong>.
            </p>
          </div>

          {/* Audit Metrics Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-violet-50 border border-violet-100 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-700">
                Total Model Features
              </span>
              <div className="text-2xl font-extrabold text-violet-950">
                {auditReport.totalFeatures} Features
              </div>
              <p className="text-[11px] text-violet-600">Strict Pydantic v2 Contract</p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                Conceptually Related Domains
              </span>
              <div className="text-2xl font-extrabold text-blue-950">
                {auditReport.conceptuallyAlignedCount} Features
              </div>
              <p className="text-[11px] text-blue-600">Lifestyle & Environment Topics</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Format & Review Items
              </span>
              <div className="text-2xl font-extrabold text-amber-950">
                {auditReport.flaggedCount} Features
              </div>
              <p className="text-[11px] text-amber-700">Kept as Qualitative Reflection</p>
            </div>
          </div>

          {/* 20-Feature Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">#</th>
                  <th className="p-3.5">Feature Name</th>
                  <th className="p-3.5">Allowed Range</th>
                  <th className="p-3.5">Contributing Questions</th>
                  <th className="p-3.5">Mapping Status</th>
                  <th className="p-3.5">MLOps Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditReport.features.map((feat, idx) => (
                  <tr key={feat.name} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 font-mono text-slate-400 font-bold">
                      {idx + 1}
                    </td>
                    <td className="p-3.5 font-bold font-mono text-slate-900">
                      {feat.name}
                    </td>
                    <td className="p-3.5 font-mono text-violet-700 font-semibold">
                      [{feat.expectedRange[0]}, {feat.expectedRange[1]}]
                    </td>
                    <td className="p-3.5 font-semibold text-slate-700">
                      {feat.contributingQuestions.map((q) => q.toUpperCase()).join(', ')}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${feat.statusBadgeColor}`}
                      >
                        {feat.statusLabel}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600 text-[11px] max-w-xs leading-relaxed">
                      {feat.rationale}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Student Privacy & Data Integrity Notice */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-950 flex items-start gap-3">
            <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold">Student Privacy & Assessment Independence:</div>
              <p className="leading-relaxed">
                MindScope keeps your conversational check-in independent from automated machine learning scoring. Because the original Kaggle dataset did not publish survey questions or scoring keys, converting your answers into numbers would produce unverified estimates. Your responses remain confidential and dedicated solely to your self-reflection.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Action Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => onEditChapter(0)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Edit From Section 1</span>
        </button>

        <button
          type="button"
          onClick={handleProceedToResults}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base font-bold text-white bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/35 hover:-translate-y-0.5 transition-all"
        >
          <span>Proceed to Results Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
