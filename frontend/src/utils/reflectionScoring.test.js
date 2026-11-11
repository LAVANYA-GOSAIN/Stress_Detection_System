import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  scoreItem,
  scoreRecentEmotions,
  calculateReflectionScores,
  DIMENSIONS_CONFIG,
  DESCRIPTIVE_QUESTION_IDS,
  SCORED_ITEM_VALUES,
} from './reflectionScoring.js';
import { QUESTIONS_MAP, SECTIONS, SAMPLE_VIVA_RESPONSES } from '../data/questionnaire.js';

describe('MindScope 25-Question Assessment & Self-Reflection Scoring System', () => {
  // =========================================================================
  // A. QUESTIONNAIRE INTEGRITY
  // =========================================================================
  describe('A. Questionnaire Integrity', () => {
    test('Contains exactly 25 questions in sequential order q1–q25', () => {
      const keys = Object.keys(QUESTIONS_MAP);
      assert.equal(keys.length, 25);
      for (let i = 1; i <= 25; i++) {
        assert.equal(keys[i - 1], `q${i}`);
        assert.equal(QUESTIONS_MAP[`q${i}`].id, `q${i}`);
      }
    });

    test('Contains 5 categories with exact question counts: 6, 5, 4, 4, 6', () => {
      assert.equal(SECTIONS.length, 5);
      assert.equal(SECTIONS[0].questionIds.length, 6); // Mind & Emotions: q1–q6
      assert.equal(SECTIONS[1].questionIds.length, 5); // Physical Well-being: q7–q11
      assert.equal(SECTIONS[2].questionIds.length, 4); // Academics & Future: q12–q15
      assert.equal(SECTIONS[3].questionIds.length, 4); // Living Environment & Safety: q16–q19
      assert.equal(SECTIONS[4].questionIds.length, 6); // Campus & Social Life: q20–q25

      const totalSectionQuestions = SECTIONS.reduce((sum, s) => sum + s.questionIds.length, 0);
      assert.equal(totalSectionQuestions, 25);
    });

    test('All three new questions remain inside their intended categories', () => {
      // Q5: Emotional Balance & Recovery in Category 1
      assert.equal(QUESTIONS_MAP.q5.section, 1);
      assert.ok(SECTIONS[0].questionIds.includes('q5'));
      assert.equal(
        QUESTIONS_MAP.q5.question,
        'When something stressful happens, how easily are you able to regain your emotional balance?'
      );

      // Q9: Physical Energy & Restfulness in Category 2
      assert.equal(QUESTIONS_MAP.q9.section, 2);
      assert.ok(SECTIONS[1].questionIds.includes('q9'));
      assert.equal(
        QUESTIONS_MAP.q9.question,
        'How often do you feel physically rested and energetic during the day?'
      );

      // Q23: Campus Community Connection in Category 5
      assert.equal(QUESTIONS_MAP.q23.section, 5);
      assert.ok(SECTIONS[4].questionIds.includes('q23'));
      assert.equal(
        QUESTIONS_MAP.q23.question,
        'How connected do you currently feel to your college community?'
      );
    });

    test('All 16 scored questions and 9 descriptive questions account for all 25 questions without overlap', () => {
      const assignedScoredIds = [];
      DIMENSIONS_CONFIG.forEach((dim) => {
        dim.scoredQuestionIds.forEach((qId) => {
          assert.ok(!assignedScoredIds.includes(qId), `Question ${qId} duplicated across dimensions`);
          assignedScoredIds.push(qId);
        });
      });
      assert.equal(assignedScoredIds.length, 16);
      assert.equal(DESCRIPTIVE_QUESTION_IDS.length, 9);

      const combined = [...assignedScoredIds, ...DESCRIPTIVE_QUESTION_IDS];
      assert.equal(new Set(combined).size, 25);
      for (let i = 1; i <= 25; i++) {
        assert.ok(combined.includes(`q${i}`), `Missing q${i} from scoring/descriptive classification`);
      }
    });
  });

  // =========================================================================
  // B. EVERY INDIVIDUAL SCORING MAPPING (ALL 16 SCORED QUESTIONS)
  // =========================================================================
  describe('B. Every Individual Scoring Mapping', () => {
    const expectedSingleSelectMappings = {
      q1: {
        stay_calm: 100,
        think_repeatedly: 25,
        feel_overwhelmed: 0,
        avoid_thinking: 40,
        depends_on_situation: 55,
      },
      q2: {
        very_confident: 100,
        confident: 75,
        somewhat_confident: 50,
        not_very_confident: 25,
        not_confident_at_all: 0,
      },
      q5: {
        very_easily: 100,
        fairly_easily: 75,
        sometimes: 50,
        with_difficulty: 25,
        very_difficultly: 0,
      },
      q6: {
        happy_for_them: 100,
        motivated_improve: 90,
        try_not_to_think: 50,
        compare_myself: 25,
        pressured_inadequate: 0,
      },
      q8: {
        very_good: 100,
        good: 75,
        average: 50,
        poor: 25,
        very_poor: 0,
      },
      q9: {
        almost_always: 100,
        often: 75,
        sometimes: 50,
        rarely: 25,
        almost_never: 0,
      },
      q12: {
        create_plan: 100,
        feel_pressured_manage: 70,
        struggle_decide: 40,
        feel_overwhelmed: 15,
        postpone_last_moment: 0,
      },
      q13: {
        very_satisfied: 100,
        satisfied: 75,
        neutral: 50,
        dissatisfied: 25,
        very_dissatisfied: 0,
      },
      q14: {
        very_comfortable: 100,
        somewhat_comfortable: 75,
        not_sure: 50,
        uncomfortable: 0,
        prefer_manage_own: 60,
      },
      q15: {
        excited_opportunities: 100,
        hopeful_uncertain: 75,
        confused_direction: 45,
        worried_opportunity: 20,
        very_anxious_future: 0,
      },
      q16: {
        comfortable_peaceful: 100,
        mostly_comfortable: 75,
        sometimes_distracting: 40,
        often_stressful_uncomfortable: 0,
        prefer_not_to_say: null,
      },
      q17: {
        completely_comfortable: 100,
        mostly_comfortable: 75,
        sometimes_uncomfortable: 40,
        often_uncomfortable: 0,
        prefer_not_to_say: null,
      },
      q20: {
        never: 100,
        once_or_twice: 65,
        sometimes: 30,
        frequently: 0,
        prefer_not_to_say: null,
      },
      q22: {
        healthy_balance: 100,
        academics_most_time: 50,
        struggle_manage_time: 20,
        rarely_time_myself: 10,
        routine_changes_frequently: 55,
      },
      q23: {
        very_connected: 100,
        somewhat_connected: 75,
        neutral: 50,
        slightly_disconnected: 25,
        very_disconnected: 0,
      },
    };

    Object.entries(expectedSingleSelectMappings).forEach(([qId, optionScores]) => {
      test(`${qId}: every questionnaire option matches exact expected score`, () => {
        const question = QUESTIONS_MAP[qId];
        assert.ok(question, `${qId} should exist in QUESTIONS_MAP`);

        // Ensure every option in questionnaire.js is covered by our expected table
        const actualOptionValues = question.options.map((o) => o.value);
        const expectedOptionValues = Object.keys(optionScores);
        assert.deepEqual(
          new Set(actualOptionValues),
          new Set(expectedOptionValues),
          `Option set mismatch for ${qId}`
        );

        // Verify exact score for every single option
        Object.entries(optionScores).forEach(([optValue, expectedScore]) => {
          assert.equal(
            scoreItem(qId, optValue),
            expectedScore,
            `${qId}.${optValue} should score ${expectedScore}`
          );
        });
      });
    });

    test('All 15 single-select scored keys exist in SCORED_ITEM_VALUES', () => {
      assert.equal(Object.keys(SCORED_ITEM_VALUES).length, 15);
    });
  });

  // =========================================================================
  // C. Q4 EXHAUSTIVE TESTS (ALL 64 SUBSETS + EDGE CASES)
  // =========================================================================
  describe('C. Q4 Exhaustive Multi-Select Tests', () => {
    const posOptions = ['happy_positive', 'calm_relaxed'];
    const chalOptions = ['emotionally_exhausted', 'low_sad', 'anxious_worried', 'unmotivated'];
    const allOptions = [...posOptions, ...chalOptions];

    test('Tests all 64 (2^6) subsets of Q4 options against independent formula verification', () => {
      let subsetsTested = 0;
      for (let mask = 0; mask < 64; mask++) {
        const subset = [];
        for (let bit = 0; bit < 6; bit++) {
          if (mask & (1 << bit)) {
            subset.push(allOptions[bit]);
          }
        }

        const p = subset.filter((opt) => posOptions.includes(opt)).length;
        const c = subset.filter((opt) => chalOptions.includes(opt)).length;

        let expectedScore = null;
        if (p > 0 || c > 0) {
          expectedScore = Math.round(((p / 2) * 50 + (1 - c / 4) * 50) * 10) / 10;
        }

        assert.equal(
          scoreRecentEmotions(subset),
          expectedScore,
          `Failed for subset [${subset.join(', ')}] (P=${p}, C=${c})`
        );
        assert.equal(
          scoreItem('q4', subset),
          expectedScore,
          `scoreItem failed for subset [${subset.join(', ')}]`
        );
        subsetsTested++;
      }
      assert.equal(subsetsTested, 64);
    });

    test('Verify explicit documented Q4 examples', () => {
      assert.equal(scoreRecentEmotions(['happy_positive', 'calm_relaxed']), 100); // P=2, C=0
      assert.equal(
        scoreRecentEmotions(['emotionally_exhausted', 'low_sad', 'anxious_worried', 'unmotivated']),
        0
      ); // P=0, C=4
      assert.equal(scoreRecentEmotions(['happy_positive']), 75); // P=1, C=0
      assert.equal(scoreRecentEmotions(['emotionally_exhausted', 'low_sad']), 25); // P=0, C=2
      assert.equal(scoreRecentEmotions(['happy_positive', 'emotionally_exhausted', 'low_sad']), 50); // P=1, C=2
      assert.equal(
        scoreRecentEmotions([
          'happy_positive',
          'calm_relaxed',
          'emotionally_exhausted',
          'low_sad',
          'anxious_worried',
          'unmotivated',
        ]),
        50
      ); // P=2, C=4
      assert.equal(
        scoreRecentEmotions(['happy_positive', 'calm_relaxed', 'emotionally_exhausted', 'low_sad']),
        75
      ); // P=2, C=2
    });

    test('Q4 handles empty, invalid, and duplicate selections safely', () => {
      assert.equal(scoreRecentEmotions([]), null);
      assert.equal(scoreRecentEmotions(null), null);
      assert.equal(scoreRecentEmotions(undefined), null);
      assert.equal(scoreRecentEmotions('happy_positive'), null); // Not an array
      assert.equal(scoreRecentEmotions(['invalid_option']), null);
      assert.equal(scoreRecentEmotions(['prefer_not_to_say']), null);

      // Deduplication check: ['happy_positive', 'happy_positive'] should treat P=1 (score 75), not P=2
      assert.equal(scoreRecentEmotions(['happy_positive', 'happy_positive']), 75);
      // Duplicate challenging: P=1, C=1 -> 25 + 37.5 = 62.5
      assert.equal(scoreRecentEmotions(['happy_positive', 'anxious_worried', 'anxious_worried']), 62.5);
      // Mix of valid and unknown -> counts only valid
      assert.equal(scoreRecentEmotions(['happy_positive', 'unknown_junk']), 75);
    });
  });

  // =========================================================================
  // D. DIMENSION CALCULATION & COVERAGE TESTS
  // =========================================================================
  describe('D. Dimension Calculation & Coverage Tests', () => {
    const getDim = (res, id) => res.dimensions.find((d) => d.id === id);

    describe('Dimension 1: Mind & Emotions (q1, q4, q5)', () => {
      test('All 3 answered -> available with arithmetic mean', () => {
        const res = calculateReflectionScores({
          q1: 'stay_calm', // 100
          q4: ['happy_positive'], // 75
          q5: 'fairly_easily', // 75
        });
        const dim = getDim(res, 'mind_emotions');
        assert.equal(dim.status, 'available');
        assert.equal(dim.isCoverageMet, true);
        assert.equal(dim.validAnswerCount, 3);
        assert.equal(dim.requiredCount, 2);
        assert.equal(dim.totalPossibleCount, 3);
        assert.equal(dim.score, 83.3); // (100+75+75)/3 = 83.333... -> 83.3
        assert.deepEqual(dim.missingRequiredQuestionIds, []);
      });

      test('q1 and q4 answered, q5 missing -> available', () => {
        const res = calculateReflectionScores({
          q1: 'depends_on_situation', // 55
          q4: ['happy_positive', 'calm_relaxed'], // 100
        });
        const dim = getDim(res, 'mind_emotions');
        assert.equal(dim.status, 'available');
        assert.equal(dim.isCoverageMet, true);
        assert.equal(dim.validAnswerCount, 2);
        assert.equal(dim.score, 77.5); // (55+100)/2 = 77.5
      });

      test('q1 missing, q4 and q5 answered -> unavailable', () => {
        const res = calculateReflectionScores({
          q4: ['happy_positive', 'calm_relaxed'],
          q5: 'very_easily',
        });
        const dim = getDim(res, 'mind_emotions');
        assert.equal(dim.status, 'insufficient_responses');
        assert.equal(dim.isCoverageMet, false);
        assert.equal(dim.score, null);
        assert.deepEqual(dim.missingRequiredQuestionIds, ['q1']);
      });

      test('q4 missing, q1 and q5 answered -> unavailable', () => {
        const res = calculateReflectionScores({
          q1: 'stay_calm',
          q5: 'very_easily',
        });
        const dim = getDim(res, 'mind_emotions');
        assert.equal(dim.status, 'insufficient_responses');
        assert.equal(dim.isCoverageMet, false);
        assert.equal(dim.score, null);
        assert.deepEqual(dim.missingRequiredQuestionIds, ['q4']);
      });

      test('Zero-valued responses yield score 0 cleanly', () => {
        const res = calculateReflectionScores({
          q1: 'feel_overwhelmed', // 0
          q4: ['emotionally_exhausted', 'low_sad', 'anxious_worried', 'unmotivated'], // 0
          q5: 'very_difficultly', // 0
        });
        const dim = getDim(res, 'mind_emotions');
        assert.equal(dim.status, 'available');
        assert.equal(dim.isCoverageMet, true);
        assert.equal(dim.score, 0);
      });
    });

    describe('Dimension 2: Physical Well-being (q8, q9)', () => {
      test('q8 only answered -> available with q8 score', () => {
        const res = calculateReflectionScores({ q8: 'good' }); // 75
        const dim = getDim(res, 'physical_wellbeing');
        assert.equal(dim.status, 'available');
        assert.equal(dim.isCoverageMet, true);
        assert.equal(dim.validAnswerCount, 1);
        assert.equal(dim.score, 75);
      });

      test('q9 only answered -> available with q9 score', () => {
        const res = calculateReflectionScores({ q9: 'often' }); // 75
        const dim = getDim(res, 'physical_wellbeing');
        assert.equal(dim.status, 'available');
        assert.equal(dim.isCoverageMet, true);
        assert.equal(dim.validAnswerCount, 1);
        assert.equal(dim.score, 75);
      });

      test('Both q8 and q9 answered -> available with arithmetic mean', () => {
        const res = calculateReflectionScores({
          q8: 'very_good', // 100
          q9: 'sometimes', // 50
        });
        const dim = getDim(res, 'physical_wellbeing');
        assert.equal(dim.status, 'available');
        assert.equal(dim.isCoverageMet, true);
        assert.equal(dim.validAnswerCount, 2);
        assert.equal(dim.score, 75);
      });

      test('Neither answered -> unavailable', () => {
        const res = calculateReflectionScores({});
        const dim = getDim(res, 'physical_wellbeing');
        assert.equal(dim.status, 'insufficient_responses');
        assert.equal(dim.isCoverageMet, false);
        assert.equal(dim.score, null);
      });

      test('Zero-valued answers yield score 0', () => {
        const res = calculateReflectionScores({ q8: 'very_poor', q9: 'almost_never' });
        const dim = getDim(res, 'physical_wellbeing');
        assert.equal(dim.status, 'available');
        assert.equal(dim.score, 0);
      });
    });

    describe('Dimension 3: Academics & Future (q2, q6, q12, q13, q14, q15)', () => {
      test('6 valid responses -> available', () => {
        const res = calculateReflectionScores({
          q2: 'very_confident', // 100
          q6: 'happy_for_them', // 100
          q12: 'create_plan', // 100
          q13: 'satisfied', // 75
          q14: 'very_comfortable', // 100
          q15: 'hopeful_uncertain', // 75
        });
        const dim = getDim(res, 'academics_future');
        assert.equal(dim.status, 'available');
        assert.equal(dim.validAnswerCount, 6);
        assert.equal(dim.score, 91.7); // 550 / 6 = 91.666...
      });

      test('Exactly 5 valid responses (with q2 included) -> available', () => {
        const res = calculateReflectionScores({
          q2: 'confident', // 75
          q6: 'motivated_improve', // 90
          q12: 'create_plan', // 100
          q13: 'neutral', // 50
          q14: 'not_sure', // 50
          // q15 omitted
        });
        const dim = getDim(res, 'academics_future');
        assert.equal(dim.status, 'available');
        assert.equal(dim.validAnswerCount, 5);
        assert.equal(dim.score, 73); // 365 / 5 = 73
      });

      test('q2 is treated as mandatory participant in item count (4 others + q2 = 5 -> available; 4 others without q2 -> unavailable)', () => {
        const baseFour = {
          q6: 'happy_for_them', // 100
          q12: 'create_plan', // 100
          q13: 'very_satisfied', // 100
          q14: 'very_comfortable', // 100
        };

        // Without q2 -> only 4 valid -> unavailable
        const res4 = calculateReflectionScores(baseFour);
        const dim4 = getDim(res4, 'academics_future');
        assert.equal(dim4.status, 'insufficient_responses');
        assert.equal(dim4.isCoverageMet, false);
        assert.equal(dim4.validAnswerCount, 4);
        assert.equal(dim4.score, null);

        // Adding q2 -> 5 valid -> available
        const res5 = calculateReflectionScores({ ...baseFour, q2: 'very_confident' });
        const dim5 = getDim(res5, 'academics_future');
        assert.equal(dim5.status, 'available');
        assert.equal(dim5.isCoverageMet, true);
        assert.equal(dim5.validAnswerCount, 5);
        assert.equal(dim5.score, 100);
      });

      test('All zeros in Academics & Future yields 0', () => {
        const res = calculateReflectionScores({
          q2: 'not_confident_at_all',
          q6: 'pressured_inadequate',
          q12: 'postpone_last_moment',
          q13: 'very_dissatisfied',
          q14: 'uncomfortable',
          q15: 'very_anxious_future',
        });
        const dim = getDim(res, 'academics_future');
        assert.equal(dim.status, 'available');
        assert.equal(dim.score, 0);
      });
    });

    describe('Dimension 4: Living Environment & Safety (q16, q17)', () => {
      test('q16 only answered -> available', () => {
        const res = calculateReflectionScores({ q16: 'sometimes_distracting' }); // 40
        const dim = getDim(res, 'living_environment_safety');
        assert.equal(dim.status, 'available');
        assert.equal(dim.validAnswerCount, 1);
        assert.equal(dim.score, 40);
      });

      test('q17 only answered -> available', () => {
        const res = calculateReflectionScores({ q17: 'mostly_comfortable' }); // 75
        const dim = getDim(res, 'living_environment_safety');
        assert.equal(dim.status, 'available');
        assert.equal(dim.validAnswerCount, 1);
        assert.equal(dim.score, 75);
      });

      test('Both answered -> arithmetic mean', () => {
        const res = calculateReflectionScores({
          q16: 'comfortable_peaceful', // 100
          q17: 'sometimes_uncomfortable', // 40
        });
        const dim = getDim(res, 'living_environment_safety');
        assert.equal(dim.status, 'available');
        assert.equal(dim.validAnswerCount, 2);
        assert.equal(dim.score, 70);
      });

      test('prefer_not_to_say on one question allows the other to score independently', () => {
        const res = calculateReflectionScores({
          q16: 'prefer_not_to_say',
          q17: 'completely_comfortable', // 100
        });
        const dim = getDim(res, 'living_environment_safety');
        assert.equal(dim.status, 'available');
        assert.equal(dim.validAnswerCount, 1);
        assert.equal(dim.score, 100);
      });

      test('prefer_not_to_say on BOTH questions renders dimension unavailable', () => {
        const res = calculateReflectionScores({
          q16: 'prefer_not_to_say',
          q17: 'prefer_not_to_say',
        });
        const dim = getDim(res, 'living_environment_safety');
        assert.equal(dim.status, 'insufficient_responses');
        assert.equal(dim.isCoverageMet, false);
        assert.equal(dim.validAnswerCount, 0);
        assert.equal(dim.score, null);
      });

      test('Neither answered -> unavailable', () => {
        const res = calculateReflectionScores({});
        const dim = getDim(res, 'living_environment_safety');
        assert.equal(dim.status, 'insufficient_responses');
        assert.equal(dim.score, null);
      });

      test('Zero-valued answers yield score 0 and are NOT treated as missing', () => {
        const res = calculateReflectionScores({
          q16: 'often_stressful_uncomfortable', // 0
          q17: 'often_uncomfortable', // 0
        });
        const dim = getDim(res, 'living_environment_safety');
        assert.equal(dim.status, 'available');
        assert.equal(dim.validAnswerCount, 2);
        assert.equal(dim.score, 0);
      });
    });

    describe('Dimension 5: Campus & Social Life (q20, q22, q23)', () => {
      test('All 3 answered -> available with arithmetic mean and exact unroundedScore', () => {
        const res = calculateReflectionScores({
          q20: 'never', // 100
          q22: 'routine_changes_frequently', // 55
          q23: 'neutral', // 50
        });
        const dim = getDim(res, 'campus_social_life');
        assert.equal(dim.status, 'available');
        assert.equal(dim.validAnswerCount, 3);
        assert.ok(Math.abs(dim.unroundedScore - 205 / 3) < 1e-9);
        assert.equal(dim.score, 68.3); // 205 / 3 = 68.333...
      });

      test('q20 and q22 answered, q23 missing -> available', () => {
        const res = calculateReflectionScores({
          q20: 'once_or_twice', // 65
          q22: 'struggle_manage_time', // 20
        });
        const dim = getDim(res, 'campus_social_life');
        assert.equal(dim.status, 'available');
        assert.equal(dim.validAnswerCount, 2);
        assert.equal(dim.score, 42.5); // 85 / 2 = 42.5
      });

      test('q20 missing or prefer_not_to_say -> unavailable', () => {
        const res1 = calculateReflectionScores({
          q22: 'healthy_balance',
          q23: 'very_connected',
        });
        const dim1 = getDim(res1, 'campus_social_life');
        assert.equal(dim1.status, 'insufficient_responses');
        assert.equal(dim1.score, null);
        assert.deepEqual(dim1.missingRequiredQuestionIds, ['q20']);

        const res2 = calculateReflectionScores({
          q20: 'prefer_not_to_say',
          q22: 'healthy_balance',
          q23: 'very_connected',
        });
        const dim2 = getDim(res2, 'campus_social_life');
        assert.equal(dim2.status, 'insufficient_responses');
        assert.equal(dim2.score, null);
        assert.deepEqual(dim2.missingRequiredQuestionIds, ['q20']);
      });

      test('q22 missing -> unavailable', () => {
        const res = calculateReflectionScores({
          q20: 'never',
          q23: 'very_connected',
        });
        const dim = getDim(res, 'campus_social_life');
        assert.equal(dim.status, 'insufficient_responses');
        assert.equal(dim.score, null);
        assert.deepEqual(dim.missingRequiredQuestionIds, ['q22']);
      });

      test('Minimum/zero scores (frequently=0, rarely_time_myself=10, very_disconnected=0) handled validly', () => {
        const res = calculateReflectionScores({
          q20: 'frequently', // 0
          q22: 'rarely_time_myself', // 10
          q23: 'very_disconnected', // 0
        });
        const dim = getDim(res, 'campus_social_life');
        assert.equal(dim.status, 'available');
        assert.equal(dim.validAnswerCount, 3);
        assert.equal(dim.score, 3.3); // 10 / 3 = 3.333...
      });

      test('All dimension scores stay strictly bounded within [0, 100] at max and min extremes', () => {
        const maxAnswers = {
          q1: 'stay_calm', q4: ['happy_positive', 'calm_relaxed'], q5: 'very_easily',
          q8: 'very_good', q9: 'almost_always',
          q2: 'very_confident', q6: 'happy_for_them', q12: 'create_plan', q13: 'very_satisfied', q14: 'very_comfortable', q15: 'excited_opportunities',
          q16: 'comfortable_peaceful', q17: 'completely_comfortable',
          q20: 'never', q22: 'healthy_balance', q23: 'very_connected',
        };
        const minAnswers = {
          q1: 'feel_overwhelmed', q4: ['emotionally_exhausted', 'low_sad', 'anxious_worried', 'unmotivated'], q5: 'very_difficultly',
          q8: 'very_poor', q9: 'almost_never',
          q2: 'not_confident_at_all', q6: 'pressured_inadequate', q12: 'postpone_last_moment', q13: 'very_dissatisfied', q14: 'uncomfortable', q15: 'very_anxious_future',
          q16: 'often_stressful_uncomfortable', q17: 'often_uncomfortable',
          q20: 'frequently', q22: 'rarely_time_myself', q23: 'very_disconnected',
        };

        const maxRes = calculateReflectionScores(maxAnswers);
        maxRes.dimensions.forEach((dim) => {
          assert.equal(dim.score, 100);
          assert.ok(dim.score >= 0 && dim.score <= 100);
        });

        const minRes = calculateReflectionScores(minAnswers);
        minRes.dimensions.forEach((dim) => {
          assert.ok(dim.score >= 0 && dim.score <= 100);
        });
      });
    });
  });

  // =========================================================================
  // E. DESCRIPTIVE-ONLY ISOLATION
  // =========================================================================
  describe('E. Descriptive-Only Question Isolation', () => {
    const descriptiveIds = ['q3', 'q7', 'q10', 'q11', 'q18', 'q19', 'q21', 'q24', 'q25'];

    test('All 9 descriptive questions return null from scoreItem', () => {
      assert.deepEqual(DESCRIPTIVE_QUESTION_IDS, descriptiveIds);
      descriptiveIds.forEach((qId) => {
        assert.equal(scoreItem(qId, 'yes'), null);
        assert.equal(scoreItem(qId, 'no'), null);
        assert.equal(scoreItem(qId, ['headaches', 'physical_tiredness']), null);
        assert.equal(scoreItem(qId, ['regular_meals']), null);
        assert.equal(scoreItem(qId, 'prefer_not_to_say'), null);
        assert.equal(scoreItem(qId, 'time_management'), null);
      });
    });

    test('Supplying descriptive answers leaves all dimension scores completely identical', () => {
      const scoredOnlyAnswers = {
        q1: 'stay_calm',
        q2: 'confident',
        q4: ['happy_positive'],
        q5: 'fairly_easily',
        q6: 'motivated_improve',
        q8: 'good',
        q9: 'often',
        q12: 'create_plan',
        q13: 'satisfied',
        q14: 'somewhat_comfortable',
        q15: 'hopeful_uncertain',
        q16: 'comfortable_peaceful',
        q17: 'mostly_comfortable',
        q20: 'never',
        q22: 'healthy_balance',
        q23: 'somewhat_connected',
      };

      const withDescriptiveAnswers = {
        ...scoredOnlyAnswers,
        q3: 'yes',
        q7: ['headaches', 'difficulty_sleeping'],
        q10: ['background_noise', 'personal_worries'],
        q11: 'yes',
        q18: ['struggle_some_needs'],
        q19: ['no_one_currently'],
        q21: ['mostly_resting_alone'],
        q24: ['academic_exams', 'financial_concerns'],
        q25: 'sleep_daily_routine',
      };

      const resWithout = calculateReflectionScores(scoredOnlyAnswers);
      const resWith = calculateReflectionScores(withDescriptiveAnswers);

      assert.deepEqual(resWith.dimensions, resWithout.dimensions);
      assert.deepEqual(resWith.itemScores, resWithout.itemScores);
    });
  });

  // =========================================================================
  // F. MISSING, UNDISCLOSED, AND INVALID RESPONSES
  // =========================================================================
  describe('F. Missing, Undisclosed, and Invalid Responses', () => {
    test('Missing or invalid inputs never become zero and do not crash scoring', () => {
      const badValues = [undefined, null, '', [], 'prefer_not_to_say', 'not_a_real_option', 42, {}, true];

      badValues.forEach((badVal) => {
        assert.equal(scoreItem('q1', badVal), null, `q1 should return null for ${String(badVal)}`);
        assert.equal(scoreItem('q4', badVal), null, `q4 should return null for ${String(badVal)}`);
        assert.equal(scoreItem('q16', badVal), null, `q16 should return null for ${String(badVal)}`);
        assert.equal(scoreItem('q20', badVal), null, `q20 should return null for ${String(badVal)}`);
      });

      // Whole invalid/null answer maps should not throw
      const emptyRes = calculateReflectionScores({});
      const nullRes = calculateReflectionScores(null);
      const undefRes = calculateReflectionScores(undefined);

      [emptyRes, nullRes, undefRes].forEach((res) => {
        res.dimensions.forEach((d) => {
          assert.equal(d.score, null);
          assert.equal(d.status, 'insufficient_responses');
          assert.equal(d.validAnswerCount, 0);
        });
      });
    });

    test('Valid 0-score answer is strictly distinct from unanswered (null)', () => {
      assert.strictEqual(scoreItem('q1', 'feel_overwhelmed'), 0);
      assert.strictEqual(scoreItem('q1', undefined), null);
      assert.strictEqual(scoreItem('q1', ''), null);
      assert.strictEqual(scoreItem('q20', 'frequently'), 0);
      assert.strictEqual(scoreItem('q20', 'prefer_not_to_say'), null);
    });
  });

  // =========================================================================
  // G. OVERALL SCORE SUPPRESSION
  // =========================================================================
  describe('G. Overall Score Suppression', () => {
    test('overallScore is strictly null across complete, partial, zero, and empty assessments', () => {
      assert.strictEqual(calculateReflectionScores(SAMPLE_VIVA_RESPONSES).overallScore, null);
      assert.strictEqual(calculateReflectionScores({}).overallScore, null);
      assert.strictEqual(calculateReflectionScores({ q1: 'stay_calm' }).overallScore, null);
      assert.strictEqual(
        calculateReflectionScores({
          q1: 'feel_overwhelmed',
          q4: ['emotionally_exhausted', 'low_sad', 'anxious_worried', 'unmotivated'],
        }).overallScore,
        null
      );
    });
  });

  // =========================================================================
  // H. ML / BACKEND ISOLATION VERIFICATION
  // =========================================================================
  describe('H. ML / Backend Isolation', () => {
    test('Scoring engine contains zero network calls, FastAPI endpoints, or ML feature mappings', () => {
      const scoringSourcePath = fileURLToPath(new URL('./reflectionScoring.js', import.meta.url));
      const rawSource = fs.readFileSync(scoringSourcePath, 'utf8');
      // Strip block and line comments so documentation explaining isolation doesn't false-trigger
      const codeOnly = rawSource.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');

      // Ensure no active imports or fetch/axios calls
      assert.equal(/\bfetch\s*\(/i.test(codeOnly), false, 'Must not use fetch()');
      assert.equal(/\baxios\b/i.test(codeOnly), false, 'Must not reference axios');
      assert.equal(/\/predict\b/i.test(codeOnly), false, 'Must not reference /predict endpoint');
      assert.equal(/127\.0\.0\.1|localhost:8000/i.test(codeOnly), false, 'Must not reference backend host');
      assert.equal(/\bimport\s+.*from\b/i.test(codeOnly), false, 'Scoring engine must remain self-contained with zero imports');
      assert.equal(/benchmarkDemoPayload|featureMapping/i.test(codeOnly), false, 'Must not reference ML feature mappings or demo payloads');
      assert.equal(/anxiety_level|stress_level|blood_pressure/i.test(codeOnly), false, 'Must not reference dataset feature names');
    });
  });
});
