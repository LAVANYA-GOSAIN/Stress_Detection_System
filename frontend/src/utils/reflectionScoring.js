/**
 * MindScope – Client-Side Self-Reflection Scoring Engine (20-Question Edition)
 *
 * Pure, deterministic, frontend-only scoring system aligned with the 20-question,
 * 5-section student check-in (`questionnaire.js`).
 *
 * Strictly decoupled from the trained ML model and FastAPI `/predict`:
 * - Evaluates subjective student reflections (0–100 wellness scale, higher = healthier/more supportive).
 * - Never converts questionnaire answers into ML dataset encodings.
 * - Descriptive / sensitive contextual items (`q3`, `q6`, `q19`) and `'prefer_not_to_say'`
 *   responses (`q20`) never contribute numerical penalties or arbitrary defaults.
 * - Produces NO clinical diagnosis and suppresses any `overallScore` (`null`).
 */

/**
 * Approved client-side self-reflection scoring lookup (0–100 wellness scale).
 * Higher score always reflects more positive wellbeing, comfort, or lower distress.
 */
export const SCORED_ITEM_VALUES = {
  // Section 1: Mind & Emotions
  q1: {
    never: 100,
    rarely: 75,
    sometimes: 50,
    often: 25,
    almost_always: 0,
  },
  q2: {
    not_at_all_confident: 0,
    slightly_confident: 25,
    moderately_confident: 50,
    very_confident: 75,
    extremely_confident: 100,
  },
  // q3 (mental_health_history) is intentionally descriptive-only
  q4: {
    never: 100,
    rarely: 75,
    sometimes: 50,
    often: 25,
    almost_always: 0,
  },

  // Section 2: Physical Wellbeing
  q5: {
    never: 100,
    rarely: 75,
    sometimes: 50,
    often: 25,
    almost_always: 0,
  },
  // q6 (blood_pressure) is intentionally descriptive-only
  q7: {
    very_poor: 0,
    poor: 25,
    average: 50,
    good: 75,
    excellent: 100,
  },
  q8: {
    never: 100,
    rarely: 75,
    sometimes: 50,
    often: 25,
    almost_always: 0,
  },

  // Section 3: Living Environment
  q9: {
    not_at_all: 100,
    slightly: 75,
    moderately: 50,
    very_much: 25,
    extremely: 0,
  },
  q10: {
    very_uncomfortable: 0,
    uncomfortable: 25,
    average: 50,
    comfortable: 75,
    very_comfortable: 100,
  },
  q11: {
    not_at_all_safe: 0,
    slightly_safe: 25,
    moderately_safe: 50,
    very_safe: 75,
    completely_safe: 100,
  },
  q12: {
    never: 0,
    rarely: 25,
    sometimes: 50,
    often: 75,
    always: 100,
  },

  // Section 4: Academics & Future
  q13: {
    very_dissatisfied: 0,
    dissatisfied: 25,
    neutral: 50,
    satisfied: 75,
    very_satisfied: 100,
  },
  q14: {
    not_demanding: 100,
    slightly_demanding: 75,
    moderately_demanding: 50,
    very_demanding: 25,
    extremely_demanding: 0,
  },
  q15: {
    not_at_all_supportive: 0,
    slightly_supportive: 25,
    moderately_supportive: 50,
    very_supportive: 75,
    extremely_supportive: 100,
  },
  q16: {
    not_worried: 100,
    slightly_worried: 75,
    moderately_worried: 50,
    very_worried: 25,
    extremely_worried: 0,
  },

  // Section 5: Social & Campus Life
  q17: {
    no_support: 0,
    very_little_support: 25,
    some_support: 50,
    good_support: 75,
    great_deal_of_support: 100,
  },
  q18: {
    never: 100,
    rarely: 75,
    sometimes: 50,
    often: 25,
    almost_always: 0,
  },
  // q19 (extracurricular_activities) is intentionally descriptive-only
  q20: {
    never: 100,
    rarely: 75,
    sometimes: 50,
    often: 25,
    almost_always: 0,
    prefer_not_to_say: null,
  },
};

/**
 * 5 Reflection Dimensions aligned 1-to-1 with the 5 assessment sections.
 */
export const DIMENSIONS_CONFIG = [
  {
    id: 'mind_emotions',
    name: 'Mind & Emotions',
    sectionNumber: 1,
    scoredQuestionIds: ['q1', 'q2', 'q4'],
    requiredCount: 2,
    requiredQuestionIds: [],
    coverageRequirementText: 'Requires at least 2 of 3 scored responses in Mind & Emotions (Q1, Q2, Q4).',
  },
  {
    id: 'physical_wellbeing',
    name: 'Physical Wellbeing',
    sectionNumber: 2,
    scoredQuestionIds: ['q5', 'q7', 'q8'],
    requiredCount: 2,
    requiredQuestionIds: [],
    coverageRequirementText: 'Requires at least 2 of 3 scored responses in Physical Wellbeing (Q5, Q7, Q8).',
  },
  {
    id: 'living_environment',
    name: 'Living Environment',
    sectionNumber: 3,
    scoredQuestionIds: ['q9', 'q10', 'q11', 'q12'],
    requiredCount: 2,
    requiredQuestionIds: [],
    coverageRequirementText: 'Requires at least 2 of 4 scored responses in Living Environment (Q9–Q12).',
  },
  {
    id: 'academics_future',
    name: 'Academics & Future',
    sectionNumber: 4,
    scoredQuestionIds: ['q13', 'q14', 'q15', 'q16'],
    requiredCount: 2,
    requiredQuestionIds: [],
    coverageRequirementText: 'Requires at least 2 of 4 scored responses in Academics & Future (Q13–Q16).',
  },
  {
    id: 'social_campus_life',
    name: 'Social & Campus Life',
    sectionNumber: 5,
    scoredQuestionIds: ['q17', 'q18', 'q20'],
    requiredCount: 2,
    requiredQuestionIds: [],
    coverageRequirementText: 'Requires at least 2 of 3 scored responses in Social & Campus Life (Q17, Q18, Q20).',
  },
];

/**
 * Descriptive-only questions that never contribute to numerical reflection dimension averages:
 * - q3: mental health support history (sensitive binary/contextual check)
 * - q6: blood pressure concern check (sensitive health indicator)
 * - q19: extracurricular activity frequency (participation context, not assumed stressful/healthy)
 */
export const DESCRIPTIVE_QUESTION_IDS = ['q3', 'q6', 'q19'];

/**
 * Score a single question on the 0–100 self-reflection scale.
 * Returns null if unanswered, descriptive-only, unrecognized, or `'prefer_not_to_say'`.
 *
 * @param {string} questionId - e.g. 'q1'
 * @param {any} answer - Student's selected option value
 * @returns {number|null} Score between 0 and 100, or null
 */
export function scoreItem(questionId, answer) {
  if (answer === null || answer === undefined) {
    return null;
  }

  if (typeof answer !== 'string') {
    return null;
  }

  const mapping = SCORED_ITEM_VALUES[questionId];
  if (!mapping) {
    return null;
  }

  const val = mapping[answer];
  return typeof val === 'number' && !Number.isNaN(val) ? val : null;
}

/**
 * Calculate client-side reflection dimension scores from student responses.
 *
 * @param {Record<string, any>} answers - Student response map (e.g. { q1: 'rarely', ... })
 * @returns {Object} Calculated dimensions, item-level scores, descriptive profile, and metadata
 */
export function calculateReflectionScores(answers = {}) {
  const itemScores = {};

  DIMENSIONS_CONFIG.forEach((dim) => {
    dim.scoredQuestionIds.forEach((qId) => {
      itemScores[qId] = scoreItem(qId, answers ? answers[qId] : undefined);
    });
  });

  const dimensionResults = DIMENSIONS_CONFIG.map((dim) => {
    const validAnswers = {};
    const validQuestionIds = [];
    const validScoresList = [];

    dim.scoredQuestionIds.forEach((qId) => {
      const score = itemScores[qId];
      if (typeof score === 'number' && !Number.isNaN(score)) {
        validAnswers[qId] = score;
        validQuestionIds.push(qId);
        validScoresList.push(score);
      }
    });

    const missingRequiredQuestionIds = (dim.requiredQuestionIds || []).filter(
      (reqQId) => validAnswers[reqQId] === undefined
    );

    const isCoverageMet =
      missingRequiredQuestionIds.length === 0 &&
      validScoresList.length >= dim.requiredCount;

    let dimensionScore = null;
    let unroundedScore = null;

    if (isCoverageMet && validScoresList.length > 0) {
      const sum = validScoresList.reduce((acc, curr) => acc + curr, 0);
      unroundedScore = sum / validScoresList.length;
      dimensionScore = Math.round(unroundedScore * 10) / 10;
    }

    return {
      id: dim.id,
      name: dim.name,
      sectionNumber: dim.sectionNumber,
      score: dimensionScore,
      unroundedScore,
      status: isCoverageMet ? 'available' : 'insufficient_responses',
      isCoverageMet,
      validAnswerCount: validScoresList.length,
      requiredCount: dim.requiredCount,
      totalPossibleCount: dim.scoredQuestionIds.length,
      contributingQuestionIds: dim.scoredQuestionIds,
      validQuestionIds,
      missingRequiredQuestionIds,
      coverageRequirementText: dim.coverageRequirementText,
    };
  });

  const descriptiveProfile = {};
  DESCRIPTIVE_QUESTION_IDS.forEach((qId) => {
    const val = answers ? answers[qId] : undefined;
    descriptiveProfile[qId] = val !== undefined ? val : null;
  });

  const scoredQuestionCount = DIMENSIONS_CONFIG.reduce(
    (sum, dim) => sum + dim.scoredQuestionIds.length,
    0
  );

  return {
    dimensions: dimensionResults,
    itemScores,
    descriptiveProfile,
    overallScore: null, // Deliberately suppressed — never compute an overall stress/wellness grade
    isNonClinical: true,
    totalQuestions: 20,
    scoredQuestionCount,
    descriptiveQuestionCount: DESCRIPTIVE_QUESTION_IDS.length,
  };
}
