/**
 * MindScope Feature Mapping & MLOps Transparency Module (20 Questions <-> 20 Model Features)
 *
 * PURPOSE & ARCHITECTURAL BOUNDARY:
 * - Maps the 20 standardized student assessment questions (q1–q20) 1-to-1 to the
 *   20 input feature names expected by the Kaggle-trained model (`model/tuned_model.joblib`).
 * - Implements the linear range conversion formula for continuous/ordinal 1–5 questions:
 *     convertedValue = ((score - 1) / 4) * (maximum - minimum) + minimum
 *   preserving unrounded decimal values.
 * - Preserves "prefer_not_to_say" as null (missing) — NEVER coerced to zero.
 * - IMPORTANT PROVENANCE GUARDRAIL:
 *   All 1-to-5 conversions and categorical encodings (especially blood_pressure: No=1,
 *   Not sure=2, Yes=3) are PROPOSED encodings only and are NOT validated by the
 *   original Kaggle dataset publisher.
 * - Live student answers are NOT yet connected to FastAPI /predict; `benchmarkDemoPayload`
 *   remains the fixed schema-compliant payload submitted for technical ML demonstration.
 */

const FREQUENCY_FIVE_POINT_SCORES = {
  never: 1,
  rarely: 2,
  sometimes: 3,
  often: 4,
  almost_always: 5,
};

/**
 * Ordered 20-feature metadata matching `app/model_loader.py` and `model/tuning_metadata.json`.
 */
export const MODEL_FEATURES_METADATA = [
  {
    name: 'anxiety_level',
    category: 'Mind & Emotions',
    expectedRange: [0, 21],
    type: 'continuous_ordinal',
    contributingQuestions: ['q1'],
    questionId: 'q1',
    direction: '1 to 5, increasing anxiety',
    optionToScore: { ...FREQUENCY_FIVE_POINT_SCORES },
    status: 'proposed_rescaled',
    statusLabel: 'Proposed 1–5 → [0, 21] (Unverified)',
    statusBadgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    rationale:
      'Maps 1–5 anxiety frequency onto dataset range [0, 21] via ((score - 1) / 4) * 21. Proposed encoding only; original Kaggle survey items and weights remain undocumented.',
    defaultDemoValue: 14,
  },
  {
    name: 'self_esteem',
    category: 'Mind & Emotions',
    expectedRange: [0, 30],
    type: 'continuous_ordinal',
    contributingQuestions: ['q2'],
    questionId: 'q2',
    direction: '1 to 5, increasing self-esteem',
    optionToScore: {
      not_at_all_confident: 1,
      slightly_confident: 2,
      moderately_confident: 3,
      very_confident: 4,
      extremely_confident: 5,
    },
    status: 'proposed_rescaled',
    statusLabel: 'Proposed 1–5 → [0, 30] (Unverified)',
    statusBadgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    rationale:
      'Maps 1–5 confidence onto dataset range [0, 30] via ((score - 1) / 4) * 30. Proposed encoding only; original Kaggle item scoring is undocumented.',
    defaultDemoValue: 20,
  },
  {
    name: 'mental_health_history',
    category: 'Mind & Emotions',
    expectedRange: [0, 1],
    type: 'binary',
    contributingQuestions: ['q3'],
    questionId: 'q3',
    direction: 'No = 0, Yes = 1; Prefer not to say = missing (null)',
    optionToScore: {
      no: 0,
      yes: 1,
      prefer_not_to_say: null,
    },
    status: 'proposed_binary',
    statusLabel: 'Proposed Binary {0, 1} (Optional)',
    statusBadgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    rationale:
      'Direct binary mapping (No = 0, Yes = 1). "Prefer not to say" stays missing (null) and is never defaulted to zero. Proposed alignment; original Kaggle phrasing is undocumented.',
    defaultDemoValue: 0,
  },
  {
    name: 'depression',
    category: 'Mind & Emotions',
    expectedRange: [0, 27],
    type: 'continuous_ordinal',
    contributingQuestions: ['q4'],
    questionId: 'q4',
    direction: '1 to 5, increasing depression-related experiences',
    optionToScore: { ...FREQUENCY_FIVE_POINT_SCORES },
    status: 'proposed_rescaled',
    statusLabel: 'Proposed 1–5 → [0, 27] (Unverified)',
    statusBadgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    rationale:
      'Maps 1–5 low mood frequency onto dataset range [0, 27] via ((score - 1) / 4) * 27. Proposed encoding only; original Kaggle scale is undocumented.',
    defaultDemoValue: 11,
  },
  {
    name: 'headache',
    category: 'Physical Wellbeing',
    expectedRange: [0, 5],
    type: 'continuous_ordinal',
    contributingQuestions: ['q5'],
    questionId: 'q5',
    direction: '1 to 5, increasing frequency',
    optionToScore: { ...FREQUENCY_FIVE_POINT_SCORES },
    status: 'proposed_rescaled',
    statusLabel: 'Proposed 1–5 → [0, 5] (Unverified)',
    statusBadgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    rationale:
      'Maps 1–5 headache frequency onto observed range [0, 5] via ((score - 1) / 4) * 5. Proposed encoding only; original Kaggle scale anchors are undocumented.',
    defaultDemoValue: 2,
  },
  {
    name: 'blood_pressure',
    category: 'Physical Wellbeing',
    expectedRange: [1, 3],
    type: 'provisional_categorical',
    contributingQuestions: ['q6'],
    questionId: 'q6',
    direction: 'Provisional: No = 1, Not sure = 2, Yes = 3; Prefer not to say = missing (null)',
    optionToScore: {
      no: 1,
      not_sure: 2,
      yes: 3,
      prefer_not_to_say: null,
    },
    status: 'provisional_categorical',
    statusLabel: 'Provisional {1, 2, 3} (Unverified)',
    statusBadgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    rationale:
      'Provisional proposed encoding (No = 1, Not sure = 2, Yes = 3; Prefer not to say = null). NOT validated against original Kaggle clinical thresholds or non-monotonic class behavior.',
    defaultDemoValue: 2,
  },
  {
    name: 'sleep_quality',
    category: 'Physical Wellbeing',
    expectedRange: [0, 5],
    type: 'continuous_ordinal',
    contributingQuestions: ['q7'],
    questionId: 'q7',
    direction: '1 to 5, increasing sleep quality',
    optionToScore: {
      very_poor: 1,
      poor: 2,
      average: 3,
      good: 4,
      excellent: 5,
    },
    status: 'proposed_rescaled',
    statusLabel: 'Proposed 1–5 → [0, 5] (Unverified)',
    statusBadgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    rationale:
      'Maps 1–5 sleep quality onto observed range [0, 5] via ((score - 1) / 4) * 5. Proposed encoding only; original Kaggle anchors are undocumented.',
    defaultDemoValue: 2,
  },
  {
    name: 'breathing_problem',
    category: 'Physical Wellbeing',
    expectedRange: [0, 5],
    type: 'continuous_ordinal',
    contributingQuestions: ['q8'],
    questionId: 'q8',
    direction: '1 to 5, increasing frequency',
    optionToScore: { ...FREQUENCY_FIVE_POINT_SCORES },
    status: 'proposed_rescaled',
    statusLabel: 'Proposed 1–5 → [0, 5] (Unverified)',
    statusBadgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    rationale:
      'Maps 1–5 breathing difficulty frequency onto observed range [0, 5] via ((score - 1) / 4) * 5. Proposed encoding only.',
    defaultDemoValue: 4,
  },
  {
    name: 'noise_level',
    category: 'Living Environment',
    expectedRange: [0, 5],
    type: 'continuous_ordinal',
    contributingQuestions: ['q9'],
    questionId: 'q9',
    direction: '1 to 5, increasing disturbance',
    optionToScore: {
      not_at_all: 1,
      slightly: 2,
      moderately: 3,
      very_much: 4,
      extremely: 5,
    },
    status: 'proposed_rescaled',
    statusLabel: 'Proposed 1–5 → [0, 5] (Unverified)',
    statusBadgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    rationale:
      'Maps 1–5 noise disturbance onto observed range [0, 5] via ((score - 1) / 4) * 5. Proposed encoding only.',
    defaultDemoValue: 2,
  },
  {
    name: 'living_conditions',
    category: 'Living Environment',
    expectedRange: [0, 5],
    type: 'continuous_ordinal',
    contributingQuestions: ['q10'],
    questionId: 'q10',
    direction: '1 to 5, increasing comfort',
    optionToScore: {
      very_uncomfortable: 1,
      uncomfortable: 2,
      average: 3,
      comfortable: 4,
      very_comfortable: 5,
    },
    status: 'proposed_rescaled',
    statusLabel: 'Proposed 1–5 → [0, 5] (Unverified)',
    statusBadgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    rationale:
      'Maps 1–5 living comfort onto observed range [0, 5] via ((score - 1) / 4) * 5. Proposed encoding only.',
    defaultDemoValue: 3,
  },
  {
    name: 'safety',
    category: 'Living Environment',
    expectedRange: [0, 5],
    type: 'continuous_ordinal',
    contributingQuestions: ['q11'],
    questionId: 'q11',
    direction: '1 to 5, increasing perceived safety',
    optionToScore: {
      not_at_all_safe: 1,
      slightly_safe: 2,
      moderately_safe: 3,
      very_safe: 4,
      completely_safe: 5,
    },
    status: 'proposed_rescaled',
    statusLabel: 'Proposed 1–5 → [0, 5] (Unverified)',
    statusBadgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    rationale:
      'Maps 1–5 perceived safety onto observed range [0, 5] via ((score - 1) / 4) * 5. Proposed encoding only.',
    defaultDemoValue: 3,
  },
  {
    name: 'basic_needs',
    category: 'Living Environment',
    expectedRange: [0, 5],
    type: 'continuous_ordinal',
    contributingQuestions: ['q12'],
    questionId: 'q12',
    direction: '1 to 5, increasing fulfilment of basic needs',
    optionToScore: {
      never: 1,
      rarely: 2,
      sometimes: 3,
      often: 4,
      always: 5,
    },
    status: 'proposed_rescaled',
    statusLabel: 'Proposed 1–5 → [0, 5] (Unverified)',
    statusBadgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    rationale:
      'Maps 1–5 basic needs consistency onto observed range [0, 5] via ((score - 1) / 4) * 5. Proposed encoding only.',
    defaultDemoValue: 2,
  },
  {
    name: 'academic_performance',
    category: 'Academics & Future',
    expectedRange: [0, 5],
    type: 'continuous_ordinal',
    contributingQuestions: ['q13'],
    questionId: 'q13',
    direction: '1 to 5, increasing satisfaction',
    optionToScore: {
      very_dissatisfied: 1,
      dissatisfied: 2,
      neutral: 3,
      satisfied: 4,
      very_satisfied: 5,
    },
    status: 'proposed_rescaled',
    statusLabel: 'Proposed 1–5 → [0, 5] (Unverified)',
    statusBadgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    rationale:
      'Maps 1–5 academic satisfaction onto observed range [0, 5] via ((score - 1) / 4) * 5. Proposed encoding only.',
    defaultDemoValue: 3,
  },
  {
    name: 'study_load',
    category: 'Academics & Future',
    expectedRange: [0, 5],
    type: 'continuous_ordinal',
    contributingQuestions: ['q14'],
    questionId: 'q14',
    direction: '1 to 5, increasing workload',
    optionToScore: {
      not_demanding: 1,
      slightly_demanding: 2,
      moderately_demanding: 3,
      very_demanding: 4,
      extremely_demanding: 5,
    },
    status: 'proposed_rescaled',
    statusLabel: 'Proposed 1–5 → [0, 5] (Unverified)',
    statusBadgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    rationale:
      'Maps 1–5 study load onto observed range [0, 5] via ((score - 1) / 4) * 5. Proposed encoding only.',
    defaultDemoValue: 2,
  },
  {
    name: 'teacher_student_relationship',
    category: 'Academics & Future',
    expectedRange: [0, 5],
    type: 'continuous_ordinal',
    contributingQuestions: ['q15'],
    questionId: 'q15',
    direction: '1 to 5, increasing support',
    optionToScore: {
      not_at_all_supportive: 1,
      slightly_supportive: 2,
      moderately_supportive: 3,
      very_supportive: 4,
      extremely_supportive: 5,
    },
    status: 'proposed_rescaled',
    statusLabel: 'Proposed 1–5 → [0, 5] (Unverified)',
    statusBadgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    rationale:
      'Maps 1–5 teacher supportiveness onto observed range [0, 5] via ((score - 1) / 4) * 5. Proposed encoding only.',
    defaultDemoValue: 3,
  },
  {
    name: 'future_career_concerns',
    category: 'Academics & Future',
    expectedRange: [0, 5],
    type: 'continuous_ordinal',
    contributingQuestions: ['q16'],
    questionId: 'q16',
    direction: '1 to 5, increasing concern',
    optionToScore: {
      not_worried: 1,
      slightly_worried: 2,
      moderately_worried: 3,
      very_worried: 4,
      extremely_worried: 5,
    },
    status: 'proposed_rescaled',
    statusLabel: 'Proposed 1–5 → [0, 5] (Unverified)',
    statusBadgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    rationale:
      'Maps 1–5 future career worry onto observed range [0, 5] via ((score - 1) / 4) * 5. Proposed encoding only.',
    defaultDemoValue: 3,
  },
  {
    name: 'social_support',
    category: 'Social & Campus Life',
    expectedRange: [0, 3],
    type: 'continuous_ordinal',
    contributingQuestions: ['q17'],
    questionId: 'q17',
    direction: '1 to 5, increasing support',
    optionToScore: {
      no_support: 1,
      very_little_support: 2,
      some_support: 3,
      good_support: 4,
      great_deal_of_support: 5,
    },
    status: 'proposed_rescaled',
    statusLabel: 'Proposed 1–5 → [0, 3] (Unverified)',
    statusBadgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    rationale:
      'Maps 1–5 perceived social support onto observed dataset range [0, 3] via ((score - 1) / 4) * 3. Proposed encoding only; original Kaggle thresholds remain undocumented.',
    defaultDemoValue: 2,
  },
  {
    name: 'peer_pressure',
    category: 'Social & Campus Life',
    expectedRange: [0, 5],
    type: 'continuous_ordinal',
    contributingQuestions: ['q18'],
    questionId: 'q18',
    direction: '1 to 5, increasing peer pressure',
    optionToScore: { ...FREQUENCY_FIVE_POINT_SCORES },
    status: 'proposed_rescaled',
    statusLabel: 'Proposed 1–5 → [0, 5] (Unverified)',
    statusBadgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    rationale:
      'Maps 1–5 peer pressure onto observed range [0, 5] via ((score - 1) / 4) * 5. Proposed encoding only.',
    defaultDemoValue: 3,
  },
  {
    name: 'extracurricular_activities',
    category: 'Social & Campus Life',
    expectedRange: [0, 5],
    type: 'continuous_ordinal',
    contributingQuestions: ['q19'],
    questionId: 'q19',
    direction: '1 to 5, increasing participation',
    optionToScore: {
      never: 1,
      rarely: 2,
      sometimes: 3,
      often: 4,
      very_frequently: 5,
    },
    status: 'proposed_rescaled',
    statusLabel: 'Proposed 1–5 → [0, 5] (Unverified)',
    statusBadgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    rationale:
      'Maps 1–5 participation frequency onto observed range [0, 5] via ((score - 1) / 4) * 5. Proposed encoding only; original Kaggle dataset shows positive correlation with stress.',
    defaultDemoValue: 3,
  },
  {
    name: 'bullying',
    category: 'Social & Campus Life',
    expectedRange: [0, 5],
    type: 'continuous_ordinal',
    contributingQuestions: ['q20'],
    questionId: 'q20',
    direction: '1 to 5, increasing frequency; Prefer not to say = missing (null)',
    optionToScore: {
      ...FREQUENCY_FIVE_POINT_SCORES,
      prefer_not_to_say: null,
    },
    status: 'proposed_rescaled',
    statusLabel: 'Proposed 1–5 → [0, 5] (Optional)',
    statusBadgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    rationale:
      'Maps 1–5 bullying frequency onto observed range [0, 5] via ((score - 1) / 4) * 5. "Prefer not to say" stays missing (null). Proposed encoding only.',
    defaultDemoValue: 2,
  },
];

export const FEATURE_METADATA_BY_QUESTION = Object.fromEntries(
  MODEL_FEATURES_METADATA.map((feat) => [feat.questionId, feat])
);

/**
 * Converts a 1-to-5 ordinal score into the observed dataset range without rounding:
 *   convertedValue = ((score - 1) / 4) * (maximum - minimum) + minimum
 *
 * @param {number|null|undefined} score - Score in [1, 5]
 * @param {number} minimum - Observed dataset minimum
 * @param {number} maximum - Observed dataset maximum
 * @returns {number|null} Exact unrounded conversion or null when missing/invalid
 */
export function convertFivePointToRange(score, minimum, maximum) {
  if (typeof score !== 'number' || !Number.isFinite(score) || score < 1 || score > 5) {
    return null;
  }
  if (
    typeof minimum !== 'number' ||
    !Number.isFinite(minimum) ||
    typeof maximum !== 'number' ||
    !Number.isFinite(maximum)
  ) {
    return null;
  }
  return ((score - 1) / 4) * (maximum - minimum) + minimum;
}

/**
 * Converts a single question's answer option into:
 * - `rawScore`: 1..5 for ordinal scales, 0/1 for binary q3, 1/2/3 for provisional q6, or null
 * - `convertedValue`: dataset-range scaled decimal (unrounded) for continuous/ordinal, exact
 *   discrete code for binary/categorical, or null for missing/"prefer_not_to_say"/invalid
 * - `isMissing`: true when unanswered, "prefer_not_to_say", or invalid
 * - `status`: 'valid' | 'unanswered' | 'prefer_not_to_say' | 'invalid'
 *
 * @param {string} questionId - 'q1'..'q20'
 * @param {any} answer - Selected option value
 * @returns {{
 *   featureName: string|null,
 *   rawScore: number|null,
 *   convertedValue: number|null,
 *   isMissing: boolean,
 *   status: 'valid'|'unanswered'|'prefer_not_to_say'|'invalid'
 * }}
 */
export function mapAnswerToFeatureValue(questionId, answer) {
  if (typeof questionId !== 'string' || !Object.hasOwn(FEATURE_METADATA_BY_QUESTION, questionId)) {
    return {
      featureName: null,
      rawScore: null,
      convertedValue: null,
      isMissing: true,
      status: 'invalid',
    };
  }

  const feat = FEATURE_METADATA_BY_QUESTION[questionId];

  if (answer === undefined || answer === null || answer === '') {
    return {
      featureName: feat.name,
      rawScore: null,
      convertedValue: null,
      isMissing: true,
      status: 'unanswered',
    };
  }

  if (typeof answer !== 'string' || !Object.hasOwn(feat.optionToScore, answer)) {
    return {
      featureName: feat.name,
      rawScore: null,
      convertedValue: null,
      isMissing: true,
      status: 'invalid',
    };
  }

  if (answer === 'prefer_not_to_say') {
    return {
      featureName: feat.name,
      rawScore: null,
      convertedValue: null,
      isMissing: true,
      status: 'prefer_not_to_say',
    };
  }

  const mappedScore = feat.optionToScore[answer];
  if (typeof mappedScore !== 'number' || !Number.isFinite(mappedScore)) {
    return {
      featureName: feat.name,
      rawScore: null,
      convertedValue: null,
      isMissing: true,
      status: 'invalid',
    };
  }

  if (feat.type === 'binary' || feat.type === 'provisional_categorical') {
    return {
      featureName: feat.name,
      rawScore: mappedScore,
      convertedValue: mappedScore,
      isMissing: false,
      status: 'valid',
    };
  }

  const [minimum, maximum] = feat.expectedRange;
  const convertedValue = convertFivePointToRange(mappedScore, minimum, maximum);

  return {
    featureName: feat.name,
    rawScore: mappedScore,
    convertedValue,
    isMissing: convertedValue === null,
    status: convertedValue === null ? 'invalid' : 'valid',
  };
}

/**
 * Maps a full or partial 20-question response object into proposed feature representations.
 * Does NOT submit to FastAPI /predict; keeps missing/prefer_not_to_say/invalid values strictly as null.
 *
 * @param {Record<string, any>} answers
 * @returns {{
 *   rawScores: Record<string, number|null>,
 *   convertedFeatures: Record<string, number|null>,
 *   missingFeatures: string[],
 *   unansweredFeatures: string[],
 *   preferNotToSayFeatures: string[],
 *   invalidFeatures: string[],
 *   answerStatuses: Record<string, 'valid'|'unanswered'|'prefer_not_to_say'|'invalid'>,
 *   isProposedEncodingValidated: false
 * }}
 */
export function mapAssessmentAnswersToFeatures(answers = {}) {
  const safeAnswers = answers && typeof answers === 'object' && !Array.isArray(answers) ? answers : {};
  const rawScores = {};
  const convertedFeatures = {};
  const missingFeatures = [];
  const unansweredFeatures = [];
  const preferNotToSayFeatures = [];
  const invalidFeatures = [];
  const answerStatuses = {};

  MODEL_FEATURES_METADATA.forEach((feat) => {
    const hasOwnAnswer = Object.hasOwn(safeAnswers, feat.questionId);
    const rawAnswer = hasOwnAnswer ? safeAnswers[feat.questionId] : undefined;
    const { rawScore, convertedValue, isMissing, status } = mapAnswerToFeatureValue(
      feat.questionId,
      rawAnswer
    );
    rawScores[feat.name] = rawScore;
    convertedFeatures[feat.name] = convertedValue;
    answerStatuses[feat.name] = status;

    if (isMissing) {
      missingFeatures.push(feat.name);
      if (status === 'unanswered') {
        unansweredFeatures.push(feat.name);
      } else if (status === 'prefer_not_to_say') {
        preferNotToSayFeatures.push(feat.name);
      } else {
        invalidFeatures.push(feat.name);
      }
    }
  });

  return {
    rawScores,
    convertedFeatures,
    missingFeatures,
    unansweredFeatures,
    preferNotToSayFeatures,
    invalidFeatures,
    answerStatuses,
    isProposedEncodingValidated: false,
  };
}

/**
 * Compiles the MLOps audit report for AssessmentReview & Results.
 *
 * NOTE: `benchmarkDemoPayload` remains fixed schema-compliant reference values matching
 * `app/schemas.py`. Student answers are NOT sent to FastAPI `/predict` in this task.
 *
 * @param {Record<string, any>} answers - User responses for q1 to q20
 */
export function buildFeatureAuditReport(answers = {}) {
  let alignedReadyCount = 0;
  let flaggedCount = 0;

  const benchmarkDemoPayload = {};
  const { rawScores, convertedFeatures, missingFeatures } = mapAssessmentAnswersToFeatures(answers);

  const mappedFeatures = MODEL_FEATURES_METADATA.map((feat) => {
    const isFlagged = feat.status === 'provisional_categorical' || feat.expectedRange[1] > 5;
    if (isFlagged) {
      flaggedCount += 1;
    } else {
      alignedReadyCount += 1;
    }

    // Fixed schema-compliant benchmark payload; student answers are not sent to /predict
    benchmarkDemoPayload[feat.name] = feat.defaultDemoValue;

    const answeredContributors = feat.contributingQuestions.map((qId) => ({
      questionId: qId,
      hasAnswer: Boolean(answers?.[qId]),
      value: answers?.[qId] || 'Unanswered',
    }));

    return {
      ...feat,
      isFlagged,
      proposedRawScore: rawScores[feat.name],
      proposedConvertedValue: convertedFeatures[feat.name],
      isMissing: convertedFeatures[feat.name] === null,
      answeredContributors,
    };
  });

  return {
    features: mappedFeatures,
    totalFeatures: MODEL_FEATURES_METADATA.length,
    conceptuallyAlignedCount: alignedReadyCount,
    verifiedCount: alignedReadyCount,
    flaggedCount,
    proposedRawScores: rawScores,
    proposedConvertedFeatures: convertedFeatures,
    missingFeatures,
    benchmarkDemoPayload,
    safeDemoPayload: benchmarkDemoPayload,
  };
}
