/**
 * MindScope Client-Side Self-Reflection Scoring Engine (25-Question Architecture)
 *
 * ARCHITECTURAL BOUNDARY & ETHICAL GUARANTEES:
 * 1. Independent Client-Side Reflection: Operates entirely on the browser client.
 *    No answers or scores are ever converted to ML features or submitted to FastAPI /predict.
 * 2. 5 Reflection Dimensions:
 *    - Mind & Emotions (Q1, Q4, Q5)
 *    - Physical Well-being (Q8, Q9)
 *    - Academics & Future (Q2, Q6, Q12, Q13, Q14, Q15)
 *    - Living Environment & Safety (Q16, Q17)
 *    - Campus & Social Life (Q20, Q22, Q23)
 * 3. 16 Scored Questions; 9 Descriptive-Only Questions (Q3, Q7, Q10, Q11, Q18, Q19, Q21, Q24, Q25).
 * 4. Missing / Privacy Preservation: "prefer_not_to_say", unanswered, or invalid questions evaluate to null
 *    and are NEVER treated as zero.
 * 5. Dimension Coverage Validation: Dimensions must satisfy minimum valid response thresholds:
 *    - Mind & Emotions: valid Q1, valid Q4, and at least 2 of 3 valid answers (Q5 is optional).
 *    - Physical Well-being: at least 1 of 2 valid answers (Q8, Q9).
 *    - Academics & Future: at least 5 of 6 valid answers (Q2, Q6, Q12, Q13, Q14, Q15).
 *    - Living Environment & Safety: at least 1 of 2 valid answers (Q16, Q17).
 *    - Campus & Social Life: valid Q20, valid Q22, and at least 2 of 3 valid answers (Q23 is optional).
 * 6. NO Overall Score: The overall composite score is deliberately suppressed (overallScore: null)
 *    to prevent misleading aggregation across disparate life domains.
 * 7. Non-Clinical: Purely educational self-reflection; not a clinical or psychological diagnosis.
 */

// Item-level scoring dictionary for single-choice and rating questions
export const SCORED_ITEM_VALUES = {
  // Dimension 1: Mind & Emotions
  q1: {
    stay_calm: 100,
    depends_on_situation: 55,
    avoid_thinking: 40,
    think_repeatedly: 25,
    feel_overwhelmed: 0,
  },
  q5: {
    // Emotional Balance & Recovery (NEW)
    very_easily: 100,
    fairly_easily: 75,
    sometimes: 50,
    with_difficulty: 25,
    very_difficultly: 0,
  },

  // Dimension 2: Physical Well-being
  q8: {
    // Sleep Quality (Original Q7)
    very_good: 100,
    good: 75,
    average: 50,
    poor: 25,
    very_poor: 0,
  },
  q9: {
    // Physical Energy & Restfulness (NEW)
    almost_always: 100,
    often: 75,
    sometimes: 50,
    rarely: 25,
    almost_never: 0,
  },

  // Dimension 3: Academics & Future
  q2: {
    // Task Confidence (Original Q2)
    very_confident: 100,
    confident: 75,
    somewhat_confident: 50,
    not_very_confident: 25,
    not_confident_at_all: 0,
  },
  q6: {
    // Peer Academic Dynamics (Original Q5)
    happy_for_them: 100,
    motivated_improve: 90,
    try_not_to_think: 50,
    compare_myself: 25,
    pressured_inadequate: 0,
  },
  q12: {
    // Multiple Deadlines Scenario (Original Q10)
    create_plan: 100,
    feel_pressured_manage: 70,
    struggle_decide: 40,
    feel_overwhelmed: 15,
    postpone_last_moment: 0,
  },
  q13: {
    // Academic Satisfaction (Original Q11)
    very_satisfied: 100,
    satisfied: 75,
    neutral: 50,
    dissatisfied: 25,
    very_dissatisfied: 0,
  },
  q14: {
    // Approaching Instructors (Original Q12)
    very_comfortable: 100,
    somewhat_comfortable: 75,
    prefer_manage_own: 60,
    not_sure: 50,
    uncomfortable: 0,
  },
  q15: {
    // Career & Future Thoughts (Original Q13)
    excited_opportunities: 100,
    hopeful_uncertain: 75,
    confused_direction: 45,
    worried_opportunity: 20,
    very_anxious_future: 0,
  },

  // Dimension 4: Living Environment & Safety
  q16: {
    // Living Environment (Original Q14)
    comfortable_peaceful: 100,
    mostly_comfortable: 75,
    sometimes_distracting: 40,
    often_stressful_uncomfortable: 0,
    prefer_not_to_say: null,
  },
  q17: {
    // Surroundings Safety (Original Q15)
    completely_comfortable: 100,
    mostly_comfortable: 75,
    sometimes_uncomfortable: 40,
    often_uncomfortable: 0,
    prefer_not_to_say: null,
  },

  // Dimension 5: Campus & Social Life
  q20: {
    // Interpersonal Respect / Bullying (Original Q18)
    never: 100,
    once_or_twice: 65,
    sometimes: 30,
    frequently: 0,
    prefer_not_to_say: null,
  },
  q22: {
    // Student Life Routine (Original Q20)
    healthy_balance: 100,
    routine_changes_frequently: 55,
    academics_most_time: 50,
    struggle_manage_time: 20,
    rarely_time_myself: 10,
  },
  q23: {
    // Campus Community Connection (NEW)
    very_connected: 100,
    somewhat_connected: 75,
    neutral: 50,
    slightly_disconnected: 25,
    very_disconnected: 0,
  },
};

/**
 * Score Q4 (Recent Emotional State, Multi-Select)
 * Normalizes 2 positive vs 4 challenging emotions into [0, 100].
 * Formula: Q4 Score = (P / 2 * 50) + (1 - C / 4) * 50
 *
 * @param {string[]} selectedValues - Array of selected option keys
 * @returns {number|null} Score between 0 and 100, or null if empty/no valid option selected
 */
export function scoreRecentEmotions(selectedValues) {
  if (!Array.isArray(selectedValues) || selectedValues.length === 0) {
    return null;
  }

  const positiveOptions = ['happy_positive', 'calm_relaxed'];
  const challengingOptions = [
    'emotionally_exhausted',
    'low_sad',
    'anxious_worried',
    'unmotivated',
  ];

  // Deduplicate entries to prevent duplicate selection anomalies
  const uniqueValues = [...new Set(selectedValues)];

  const posCount = uniqueValues.filter((v) => positiveOptions.includes(v)).length;
  const chalCount = uniqueValues.filter((v) => challengingOptions.includes(v)).length;

  // If no recognized positive or challenging options were chosen, treat as unanswered (null)
  if (posCount === 0 && chalCount === 0) {
    return null;
  }

  const posPart = (posCount / 2) * 50;
  const chalPart = (1 - chalCount / 4) * 50;
  const rawScore = posPart + chalPart;

  return Math.round(rawScore * 10) / 10;
}

/**
 * Dimension Configurations & Coverage Rules
 */
export const DIMENSIONS_CONFIG = [
  {
    id: 'mind_emotions',
    name: 'Mind & Emotions',
    sectionNumber: 1,
    scoredQuestionIds: ['q1', 'q4', 'q5'],
    requiredQuestionIds: ['q1', 'q4'],
    requiredCount: 2,
    coverageRequirementText: 'At least 2 of 3 valid answers, including Q1 and Q4.',
  },
  {
    id: 'physical_wellbeing',
    name: 'Physical Well-being',
    sectionNumber: 2,
    scoredQuestionIds: ['q8', 'q9'],
    requiredQuestionIds: [],
    requiredCount: 1,
    coverageRequirementText: 'At least 1 of 2 valid answers.',
  },
  {
    id: 'academics_future',
    name: 'Academics & Future',
    sectionNumber: 3,
    scoredQuestionIds: ['q2', 'q6', 'q12', 'q13', 'q14', 'q15'],
    requiredQuestionIds: [],
    requiredCount: 5,
    coverageRequirementText: 'At least 5 of 6 valid answers.',
  },
  {
    id: 'living_environment_safety',
    name: 'Living Environment & Safety',
    sectionNumber: 4,
    scoredQuestionIds: ['q16', 'q17'],
    requiredQuestionIds: [],
    requiredCount: 1,
    coverageRequirementText: 'At least 1 of 2 valid answers.',
  },
  {
    id: 'campus_social_life',
    name: 'Campus & Social Life',
    sectionNumber: 5,
    scoredQuestionIds: ['q20', 'q22', 'q23'],
    requiredQuestionIds: ['q20', 'q22'],
    requiredCount: 2,
    coverageRequirementText: 'At least 2 of 3 valid answers, including Q20 and Q22.',
  },
];

/**
 * 9 Strictly Descriptive Questions (Unscored)
 */
export const DESCRIPTIVE_QUESTION_IDS = [
  'q3',  // Mental Health Background
  'q7',  // Physical Discomfort
  'q10', // Concentration Distractions
  'q11', // Blood Pressure History
  'q18', // Everyday Needs
  'q19', // Support Network
  'q21', // Time Outside Academics
  'q24', // Sources of Pressure
  'q25', // Priority for Improvement
];

/**
 * Score a single question
 * Returns numerical score (0–100) or null if omitted, undisclosed, or invalid.
 *
 * @param {string} questionId - e.g. 'q1'
 * @param {any} answer - Student's answer string or array
 * @returns {number|null} Score between 0 and 100, or null
 */
export function scoreItem(questionId, answer) {
  if (answer === null || answer === undefined) {
    return null;
  }

  // Handle Q4 special multi-select
  if (questionId === 'q4') {
    return scoreRecentEmotions(answer);
  }

  // Lookup in scored item values dictionary
  const mapping = SCORED_ITEM_VALUES[questionId];
  if (!mapping) {
    // If not in scored dictionary (e.g. descriptive items or unrecognized IDs), return null
    return null;
  }

  if (typeof answer !== 'string') {
    return null;
  }

  const val = mapping[answer];
  return (val !== undefined && val !== null) ? val : null;
}

/**
 * Calculate reflection dimension scores from student responses
 *
 * @param {Record<string, any>} answers - Student response map (e.g. { q1: 'stay_calm', ... })
 * @returns {Object} Calculated dimensions, item-level scores, descriptive summaries, and coverage states.
 */
export function calculateReflectionScores(answers = {}) {
  const itemScores = {};

  // 1. Calculate individual scores for all 16 scored questions
  DIMENSIONS_CONFIG.forEach((dim) => {
    dim.scoredQuestionIds.forEach((qId) => {
      itemScores[qId] = scoreItem(qId, answers ? answers[qId] : undefined);
    });
  });

  // 2. Calculate each of the 5 dimension scores with strict coverage validation
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

  // 3. Extract descriptive items without numerical scoring
  const descriptiveProfile = {};
  DESCRIPTIVE_QUESTION_IDS.forEach((qId) => {
    const val = answers ? answers[qId] : undefined;
    descriptiveProfile[qId] = val !== undefined ? val : null;
  });

  // 4. Guarantee NO overall score is generated
  return {
    dimensions: dimensionResults,
    itemScores,
    descriptiveProfile,
    overallScore: null, // Deliberately suppressed per specification
    isNonClinical: true,
    totalQuestions: 25,
    scoredQuestionCount: 16,
    descriptiveQuestionCount: 9,
  };
}
