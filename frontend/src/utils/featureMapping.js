/**
 * MLOps Documentation & Transparency Matrix (20 Model Features vs. 25 Assessment Questions)
 *
 * PURPOSE & ARCHITECTURAL BOUNDARY:
 * - This file serves strictly as an educational and MLOps documentation matrix.
 * - It is NOT a questionnaire-to-model conversion engine.
 * - Student responses from the 25-question check-in are preserved as an independent
 *   personal well-being reflection profile and are NEVER converted into numerical
 *   model inputs or submitted to the prediction endpoint.
 *
 * PROVENANCE & EMPIRICAL CONSTRAINTS:
 * - Dataset Source: Kaggle ("Student Stress Factors: A Comprehensive Analysis" by user rxnach).
 * - Primary Documentation: The original Kaggle publisher did not publish an original
 *   questionnaire, survey prompt text, scoring codebook, or data dictionary.
 * - Secondary Literature: Academic papers (e.g. arXiv:2508.01105) discuss possible
 *   structural matches with standardized clinical instruments (e.g., GAD-7, PHQ-9, RSES)
 *   due to matching integer bounds, but primary source verification remains undocumented.
 * - Conceptual vs. Numerical Distinction: The assessment questions explore conceptually
 *   related lifestyle domains for student awareness, but are NOT numerically equated
 *   with the legacy dataset's unverified encodings.
 */

export const MODEL_FEATURES_METADATA = [
  {
    name: 'anxiety_level',
    category: 'Mind & Emotions',
    expectedRange: [0, 21],
    type: 'integer',
    contributingQuestions: ['q1'],
    status: 'pending_review',
    statusLabel: 'Secondary Match (0–21)',
    statusBadgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    rationale:
      'Secondary literature discusses a potential structural match with GAD-7 (7 items x 0–3 points = 21), but the original Kaggle author did not publish the survey questions or scoring rules. Question 1 captures worry coping for student reflection and is not converted into a numerical score.',
    defaultDemoValue: 14,
  },
  {
    name: 'self_esteem',
    category: 'Mind & Emotions',
    expectedRange: [0, 30],
    type: 'integer',
    contributingQuestions: ['q2'],
    status: 'pending_review',
    statusLabel: 'Secondary Match (0–30)',
    statusBadgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    rationale:
      'Secondary literature notes a possible structural match with the 10-item Rosenberg Self-Esteem Scale (0–30), but primary survey documentation is undocumented on Kaggle. Question 2 captures task confidence for self-awareness and is not converted into a numerical score.',
    defaultDemoValue: 20,
  },
  {
    name: 'mental_health_history',
    category: 'Mind & Emotions',
    expectedRange: [0, 1],
    type: 'binary',
    contributingQuestions: ['q3'],
    status: 'conceptual_alignment',
    statusLabel: 'Conceptually Aligned (Privacy Protected)',
    statusBadgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rationale:
      'Dataset indicates past mental health history (0 = No, 1 = Yes). Question 3 provides a confidential choice including "Prefer not to say". Answers remain strictly private and are not submitted to the prediction endpoint.',
    defaultDemoValue: 0,
  },
  {
    name: 'depression',
    category: 'Mind & Emotions',
    expectedRange: [0, 27],
    type: 'integer',
    contributingQuestions: ['q4'],
    status: 'pending_review',
    statusLabel: 'Secondary Match (0–27)',
    statusBadgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    rationale:
      'Secondary literature discusses a potential structural match with the clinical PHQ-9 scale (9 items x 0–3 points = 27), but the Kaggle source did not include a codebook. Question 4 is a multi-select mood checklist for student reflection and is not converted into a numerical score.',
    defaultDemoValue: 11,
  },
  {
    name: 'headache',
    category: 'Physical Well-being',
    expectedRange: [0, 5],
    type: 'integer',
    contributingQuestions: ['q7'],
    status: 'format_mismatch',
    statusLabel: 'Format Difference (0–5 vs Checklist)',
    statusBadgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    rationale:
      'Dataset uses a 0–5 frequency scale with undocumented verbal anchors. Question 7 records headaches as a physical experience checklist item for student awareness without calculating a numerical rating.',
    defaultDemoValue: 2,
  },
  {
    name: 'blood_pressure',
    category: 'Physical Well-being',
    expectedRange: [1, 3],
    type: 'categorical_integer',
    contributingQuestions: ['q11'],
    status: 'pending_review',
    statusLabel: 'Clinical Encoding Undocumented',
    statusBadgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    rationale:
      'Dataset encodes blood_pressure strictly as discrete categories {1, 2, 3}, but original clinical thresholds (such as mmHg readings or stages) are undocumented. Question 11 asks about healthcare consultations for reflection and is never converted to a numerical value.',
    defaultDemoValue: 2,
  },
  {
    name: 'sleep_quality',
    category: 'Physical Well-being',
    expectedRange: [0, 5],
    type: 'integer',
    contributingQuestions: ['q8'],
    status: 'conceptual_alignment',
    statusLabel: 'Conceptual Alignment (5 Choices vs 6 Levels)',
    statusBadgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    rationale:
      'Question 8 captures subjective sleep quality across 5 visual ratings, while the dataset contains 6 integer levels (0 to 5) with undocumented scale anchors. Responses are kept for self-reflection and not mapped numerically.',
    defaultDemoValue: 2,
  },
  {
    name: 'breathing_problem',
    category: 'Physical Well-being',
    expectedRange: [0, 5],
    type: 'integer',
    contributingQuestions: ['q7'],
    status: 'format_mismatch',
    statusLabel: 'Format Difference (0–5 vs Checklist)',
    statusBadgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    rationale:
      'Dataset features a 0–5 scale for breathing discomfort with undocumented anchors. Question 7 captures breathing discomfort presence as a checklist item for personal reflection.',
    defaultDemoValue: 4,
  },
  {
    name: 'noise_level',
    category: 'Physical Well-being',
    expectedRange: [0, 5],
    type: 'integer',
    contributingQuestions: ['q10'],
    status: 'format_mismatch',
    statusLabel: 'Format Difference (0–5 vs Checklist)',
    statusBadgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    rationale:
      'Dataset measures environmental noise on a 0–5 scale. Question 10 explores concentration distractions (including ambient noise) as a qualitative checklist rather than an environmental exposure score.',
    defaultDemoValue: 2,
  },
  {
    name: 'living_conditions',
    category: 'Living Environment',
    expectedRange: [0, 5],
    type: 'integer',
    contributingQuestions: ['q16'],
    status: 'conceptual_alignment',
    statusLabel: 'Conceptual Alignment (4 Choices vs 6 Levels)',
    statusBadgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    rationale:
      'Question 16 captures living space comfort across 4 descriptive tiers plus a privacy option. Conceptually aligned with residential stability, but not converted to the dataset 0–5 integer levels.',
    defaultDemoValue: 3,
  },
  {
    name: 'safety',
    category: 'Living Environment',
    expectedRange: [0, 5],
    type: 'integer',
    contributingQuestions: ['q17'],
    status: 'conceptual_alignment',
    statusLabel: 'Conceptual Alignment (4 Choices vs 6 Levels)',
    statusBadgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    rationale:
      'Question 17 captures surroundings comfort and safety across 4 options plus privacy option. Conceptually relates to the dataset safety domain, but kept independent without arbitrary integer assignment.',
    defaultDemoValue: 3,
  },
  {
    name: 'basic_needs',
    category: 'Living Environment',
    expectedRange: [0, 5],
    type: 'integer',
    contributingQuestions: ['q18'],
    status: 'format_mismatch',
    statusLabel: 'Format Difference (0–5 vs Checklist)',
    statusBadgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    rationale:
      'Dataset records basic needs on a 0–5 scale with undocumented scoring. Question 18 is a multi-select checklist of everyday necessities for reflection; items are never summed or converted to numerical scores.',
    defaultDemoValue: 2,
  },
  {
    name: 'academic_performance',
    category: 'Study & Academic Life',
    expectedRange: [0, 5],
    type: 'integer',
    contributingQuestions: ['q13'],
    status: 'conceptual_alignment',
    statusLabel: 'Conceptual Alignment (Satisfaction vs Metric)',
    statusBadgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    rationale:
      'Question 13 measures personal satisfaction with academic performance across 5 visual ratings, whereas the original dataset metric (GPA, grades, or self-report) is undocumented. Not converted to numerical values.',
    defaultDemoValue: 3,
  },
  {
    name: 'study_load',
    category: 'Study & Academic Life',
    expectedRange: [0, 5],
    type: 'integer',
    contributingQuestions: ['q12'],
    status: 'conceptual_alignment',
    statusLabel: 'Conceptual Alignment (Coping vs Workload)',
    statusBadgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    rationale:
      'Question 12 captures situational coping reactions when handling multiple approaching deadlines. Conceptually reflects workload strain, but 5 coping choices are not converted to the dataset 0–5 rating.',
    defaultDemoValue: 2,
  },
  {
    name: 'teacher_student_relationship',
    category: 'Study & Academic Life',
    expectedRange: [0, 5],
    type: 'integer',
    contributingQuestions: ['q14'],
    status: 'conceptual_alignment',
    statusLabel: 'Conceptual Alignment (Faculty Comfort)',
    statusBadgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    rationale:
      'Question 14 captures comfort approaching faculty members for guidance across 5 choices, conceptually matching faculty support quality without mapping into the 6 discrete levels (0–5).',
    defaultDemoValue: 3,
  },
  {
    name: 'future_career_concerns',
    category: 'Study & Academic Life',
    expectedRange: [0, 5],
    type: 'integer',
    contributingQuestions: ['q15'],
    status: 'conceptual_alignment',
    statusLabel: 'Conceptual Alignment (Career Outlook)',
    statusBadgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    rationale:
      'Question 15 captures career clarity and future anxiety across 5 choices, conceptually mirroring future career concerns without fabricating an offset into the 0–5 scale.',
    defaultDemoValue: 3,
  },
  {
    name: 'social_support',
    category: 'Living Environment & Campus',
    expectedRange: [0, 3],
    type: 'integer',
    contributingQuestions: ['q19'],
    status: 'format_mismatch',
    statusLabel: 'Format Difference (0–3 vs Checklist)',
    statusBadgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    rationale:
      'Dataset bounds social_support strictly within [0, 3]. Question 19 is a multi-select checklist of 6 confidant categories. Answers are kept qualitative and never converted to numerical values.',
    defaultDemoValue: 2,
  },
  {
    name: 'peer_pressure',
    category: 'Mind & Emotions',
    expectedRange: [0, 5],
    type: 'integer',
    contributingQuestions: ['q6'],
    status: 'conceptual_alignment',
    statusLabel: 'Conceptual Alignment (Peer Scenario)',
    statusBadgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    rationale:
      'Question 6 presents a situational scenario of peer academic comparison. Conceptually reflects peer pressure dynamics, but situational responses are not converted to a 0–5 integer score.',
    defaultDemoValue: 3,
  },
  {
    name: 'extracurricular_activities',
    category: 'Social & Campus Life',
    expectedRange: [0, 5],
    type: 'integer',
    contributingQuestions: ['q21'],
    status: 'format_mismatch',
    statusLabel: 'Format & Polarity Difference',
    statusBadgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    rationale:
      'Dataset correlates extracurriculars positively with stress (overburden/strain). Question 21 allows students to select restful leisure activities and clubs. Answers are kept qualitative for self-reflection.',
    defaultDemoValue: 3,
  },
  {
    name: 'bullying',
    category: 'Social & Campus Life',
    expectedRange: [0, 5],
    type: 'integer',
    contributingQuestions: ['q20'],
    status: 'conceptual_alignment',
    statusLabel: 'Conceptual Alignment (Frequency Tiers)',
    statusBadgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    rationale:
      'Question 20 captures frequency of bullying or exclusion across 4 frequency tiers plus privacy option. Conceptually aligned with interpersonal hostility, but not converted to 0–5 integers.',
    defaultDemoValue: 2,
  },
];

/**
 * Compiles a transparent MLOps audit report comparing
 * user self-reflection domains to the 20 model features.
 *
 * NOTE: benchmarkDemoPayload contains fixed schema-compliant reference values
 * matching app/schemas.py for technical inspection and testing. It is NEVER
 * calculated or derived from student questionnaire answers.
 *
 * @param {Record<string, any>} answers - User responses for q1 to q25
 * @returns {{
 *   features: Array<any>,
 *   totalFeatures: number,
 *   conceptuallyAlignedCount: number,
 *   flaggedCount: number,
 *   benchmarkDemoPayload: Record<string, number>,
 *   safeDemoPayload: Record<string, number>
 * }}
 */
export function buildFeatureAuditReport(answers = {}) {
  let conceptuallyAlignedCount = 0;
  let flaggedCount = 0;

  const benchmarkDemoPayload = {};

  const mappedFeatures = MODEL_FEATURES_METADATA.map((feat) => {
    const isFlagged = feat.status === 'pending_review' || feat.status === 'format_mismatch';
    if (isFlagged) {
      flaggedCount += 1;
    } else {
      conceptuallyAlignedCount += 1;
    }

    // Fixed benchmark/demo values matching schema example; NEVER calculated from student answers
    benchmarkDemoPayload[feat.name] = feat.defaultDemoValue;

    // Collect answered status for contributing questions for UI transparency
    const answeredContributors = feat.contributingQuestions.map((qId) => {
      return {
        questionId: qId,
        hasAnswer: Boolean(answers[qId]),
        value: answers[qId] || 'Unanswered',
      };
    });

    return {
      ...feat,
      isFlagged,
      answeredContributors,
    };
  });

  return {
    features: mappedFeatures,
    totalFeatures: MODEL_FEATURES_METADATA.length,
    conceptuallyAlignedCount,
    verifiedCount: conceptuallyAlignedCount, // backward-compat alias
    flaggedCount,
    benchmarkDemoPayload,
    safeDemoPayload: benchmarkDemoPayload, // backward-compat alias for consumers
  };
}
