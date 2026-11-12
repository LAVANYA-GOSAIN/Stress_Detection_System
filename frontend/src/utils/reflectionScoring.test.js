import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  scoreItem,
  calculateReflectionScores,
  DIMENSIONS_CONFIG,
  DESCRIPTIVE_QUESTION_IDS,
  SCORED_ITEM_VALUES,
} from './reflectionScoring.js';
import {
  QUESTIONS_MAP,
  QUESTIONS_LIST,
  SECTIONS,
  SAMPLE_VIVA_RESPONSES,
} from '../data/questionnaire.js';

const EXPECTED_ML_FEATURE_ORDER = [
  'anxiety_level',
  'self_esteem',
  'mental_health_history',
  'depression',
  'headache',
  'blood_pressure',
  'sleep_quality',
  'breathing_problem',
  'noise_level',
  'living_conditions',
  'safety',
  'basic_needs',
  'academic_performance',
  'study_load',
  'teacher_student_relationship',
  'future_career_concerns',
  'social_support',
  'peer_pressure',
  'extracurricular_activities',
  'bullying',
];

describe('MindScope 20-Question Assessment & Self-Reflection Scoring System', () => {
  // =========================================================================
  // A. QUESTIONNAIRE INTEGRITY
  // =========================================================================
  describe('A. Questionnaire Integrity', () => {
    test('Contains exactly 20 questions in sequential order q1–q20 aligned with 20 ML features', () => {
      const keys = Object.keys(QUESTIONS_MAP);
      assert.equal(keys.length, 20);
      assert.equal(QUESTIONS_LIST.length, 20);

      for (let i = 1; i <= 20; i += 1) {
        assert.equal(keys[i - 1], `q${i}`);
        assert.equal(QUESTIONS_LIST[i - 1].id, `q${i}`);
        assert.equal(QUESTIONS_MAP[`q${i}`].id, `q${i}`);
        assert.equal(QUESTIONS_MAP[`q${i}`].featureName, EXPECTED_ML_FEATURE_ORDER[i - 1]);
      }
    });

    test('Contains 5 sections with exactly 4 questions each (4, 4, 4, 4, 4)', () => {
      assert.equal(SECTIONS.length, 5);
      SECTIONS.forEach((section, index) => {
        assert.equal(section.sectionNumber, index + 1);
        assert.equal(section.questionIds.length, 4);
      });

      assert.deepEqual(SECTIONS.map((s) => s.id), [
        'mind_emotions',
        'physical_wellbeing',
        'living_environment',
        'academics_future',
        'social_campus_life',
      ]);

      const totalSectionQuestions = SECTIONS.reduce((sum, s) => sum + s.questionIds.length, 0);
      assert.equal(totalSectionQuestions, 20);
    });

    test('Sensitive items (q3, q6, q20) allow "prefer_not_to_say"', () => {
      ['q3', 'q6', 'q20'].forEach((qId) => {
        const values = QUESTIONS_MAP[qId].options.map((opt) => opt.value);
        assert.equal(values.includes('prefer_not_to_say'), true, `${qId} must include prefer_not_to_say`);
      });
    });
  });

  // =========================================================================
  // B. ITEM-LEVEL SCORING & DESCRIPTIVE EXCLUSIONS
  // =========================================================================
  describe('B. Item-Level Scoring & Descriptive Items', () => {
    test('Positive and reverse-coded items score on 0–100 scale', () => {
      // Distress frequency (higher distress = lower wellness score)
      assert.equal(scoreItem('q1', 'never'), 100);
      assert.equal(scoreItem('q1', 'rarely'), 75);
      assert.equal(scoreItem('q1', 'sometimes'), 50);
      assert.equal(scoreItem('q1', 'often'), 25);
      assert.equal(scoreItem('q1', 'almost_always'), 0);

      // Self-esteem (higher confidence = higher wellness score)
      assert.equal(scoreItem('q2', 'not_at_all_confident'), 0);
      assert.equal(scoreItem('q2', 'moderately_confident'), 50);
      assert.equal(scoreItem('q2', 'extremely_confident'), 100);

      // Sleep quality
      assert.equal(scoreItem('q7', 'very_poor'), 0);
      assert.equal(scoreItem('q7', 'good'), 75);
      assert.equal(scoreItem('q7', 'excellent'), 100);

      // Study load vs Academic performance
      assert.equal(scoreItem('q13', 'very_satisfied'), 100);
      assert.equal(scoreItem('q14', 'not_demanding'), 100);
      assert.equal(scoreItem('q14', 'extremely_demanding'), 0);
    });

    test('Descriptive-only questions (q3, q6, q19) always return null', () => {
      assert.deepEqual(DESCRIPTIVE_QUESTION_IDS, ['q3', 'q6', 'q19']);
      assert.equal(scoreItem('q3', 'yes'), null);
      assert.equal(scoreItem('q3', 'no'), null);
      assert.equal(scoreItem('q6', 'yes'), null);
      assert.equal(scoreItem('q6', 'not_sure'), null);
      assert.equal(scoreItem('q19', 'very_frequently'), null);
      assert.equal(scoreItem('q19', 'never'), null);
    });

    test('"prefer_not_to_say" never incurs a numeric penalty or zero score', () => {
      assert.equal(scoreItem('q3', 'prefer_not_to_say'), null);
      assert.equal(scoreItem('q6', 'prefer_not_to_say'), null);
      assert.equal(scoreItem('q20', 'prefer_not_to_say'), null);
    });

    test('Every non-descriptive question (17 items) is present in SCORED_ITEM_VALUES', () => {
      const scoredKeys = Object.keys(SCORED_ITEM_VALUES);
      assert.equal(scoredKeys.length, 17);
      DESCRIPTIVE_QUESTION_IDS.forEach((dId) => {
        assert.equal(scoredKeys.includes(dId), false);
      });
      // Confirm Q20 is scored, not descriptive-only
      assert.equal(scoredKeys.includes('q20'), true);
      assert.equal(DESCRIPTIVE_QUESTION_IDS.includes('q20'), false);
    });

    test('Every option value of a scored questionnaire question has a valid scoring mapping', () => {
      const nonDescriptiveQuestions = Object.values(QUESTIONS_MAP).filter(
        (q) => !DESCRIPTIVE_QUESTION_IDS.includes(q.id)
      );
      assert.equal(nonDescriptiveQuestions.length, 17);

      nonDescriptiveQuestions.forEach((q) => {
        const mapping = SCORED_ITEM_VALUES[q.id];
        assert.ok(mapping, `Missing SCORED_ITEM_VALUES mapping for question ${q.id}`);

        q.options.forEach((opt) => {
          if (q.id === 'q20' && opt.value === 'prefer_not_to_say') {
            assert.strictEqual(mapping[opt.value], null, 'q20 prefer_not_to_say must map to null');
          } else {
            const val = mapping[opt.value];
            assert.equal(typeof val, 'number', `Option ${opt.value} of ${q.id} must map to a number`);
            assert.ok(!Number.isNaN(val), `Option ${opt.value} of ${q.id} must not be NaN`);
            assert.ok(val >= 0 && val <= 100, `Option ${opt.value} of ${q.id} score ${val} out of 0–100 bounds`);
          }
        });
      });
    });
  });

  // =========================================================================
  // C. DIMENSION COVERAGE & AGGREGATION
  // =========================================================================
  describe('C. Dimension Coverage & Averaging', () => {
    test('All 5 dimensions match SECTIONS IDs and reach available status on complete responses', () => {
      assert.equal(DIMENSIONS_CONFIG.length, 5);
      const result = calculateReflectionScores(SAMPLE_VIVA_RESPONSES);

      assert.equal(result.dimensions.length, 5);
      result.dimensions.forEach((dim) => {
        assert.equal(dim.isCoverageMet, true, `${dim.id} should meet coverage`);
        assert.equal(dim.status, 'available');
        assert.equal(typeof dim.score, 'number');
        assert.ok(dim.score >= 0 && dim.score <= 100);
      });
    });

    test('prefer_not_to_say on q20 excludes q20 from denominator without lowering average', () => {
      const result = calculateReflectionScores({
        q17: 'great_deal_of_support', // 100
        q18: 'never', // 100
        q20: 'prefer_not_to_say', // null (excluded)
      });

      const social = result.dimensions.find((d) => d.id === 'social_campus_life');
      assert.equal(social.isCoverageMet, true);
      assert.equal(social.validAnswerCount, 2);
      assert.deepEqual(social.validQuestionIds, ['q17', 'q18']);
      assert.equal(social.score, 100);
      assert.equal(result.itemScores.q20, null);
    });

    test('Returns insufficient_responses and null score when fewer than required answers provided', () => {
      const result = calculateReflectionScores({
        q1: 'never', // only 1 of 3 in Mind & Emotions
      });

      const mind = result.dimensions.find((d) => d.id === 'mind_emotions');
      assert.equal(mind.isCoverageMet, false);
      assert.equal(mind.status, 'insufficient_responses');
      assert.equal(mind.score, null);
      assert.equal(mind.validAnswerCount, 1);
    });

    test('Calculates exact rounded dimension scores matching the benchmark table on SAMPLE_VIVA_RESPONSES', () => {
      const expectedScores = {
        mind_emotions: 75,
        physical_wellbeing: 83.3,
        living_environment: 75,
        academics_future: 68.8,
        social_campus_life: 83.3,
      };

      const result = calculateReflectionScores(SAMPLE_VIVA_RESPONSES);

      result.dimensions.forEach((dim) => {
        assert.strictEqual(
          dim.score,
          expectedScores[dim.id],
          `Score for ${dim.id} was expected to be ${expectedScores[dim.id]} but got ${dim.score}`
        );
      });
    });

    test('Zero is a valid numerical response, counts toward validAnswerCount, and satisfies minimum coverage', () => {
      // Item level confirms zero is a valid numeric score, not coerced to null
      assert.strictEqual(scoreItem('q1', 'almost_always'), 0);
      assert.strictEqual(scoreItem('q2', 'not_at_all_confident'), 0);
      assert.strictEqual(scoreItem('q4', 'almost_always'), 0);

      // Dimension level: 2 zero-scores satisfy the minimum two-response requirement
      const zeroResponses = {
        q1: 'almost_always', // 0
        q4: 'almost_always', // 0
      };
      const result = calculateReflectionScores(zeroResponses);
      const mind = result.dimensions.find((d) => d.id === 'mind_emotions');

      assert.strictEqual(mind.isCoverageMet, true);
      assert.strictEqual(mind.status, 'available');
      assert.strictEqual(mind.validAnswerCount, 2);
      assert.deepEqual(mind.validQuestionIds, ['q1', 'q4']);
      assert.strictEqual(mind.score, 0);
      assert.strictEqual(mind.unroundedScore, 0);
    });

    test('Invalid option values return null, are excluded from dimension averaging, and trigger insufficient_responses', () => {
      // Item level returns null for unrecognized option strings or non-string types
      assert.strictEqual(scoreItem('q1', 'invalid_option_xyz'), null);
      assert.strictEqual(scoreItem('q2', 'not_a_real_option'), null);
      assert.strictEqual(scoreItem('q1', 999), null);
      assert.strictEqual(scoreItem('q1', {}), null);
      assert.strictEqual(scoreItem('q1', true), null);

      // Dimension level: invalid options are excluded; when fewer than 2 valid remain, status is insufficient_responses
      const resultWithInvalid = calculateReflectionScores({
        q1: 'never', // 100 (valid)
        q2: 'invalid_option_xyz', // null (excluded)
        q4: 'bogus_value', // null (excluded)
      });
      const mind = resultWithInvalid.dimensions.find((d) => d.id === 'mind_emotions');

      assert.strictEqual(mind.score, null);
      assert.strictEqual(mind.unroundedScore, null);
      assert.strictEqual(mind.status, 'insufficient_responses');
      assert.strictEqual(mind.isCoverageMet, false);
      assert.strictEqual(mind.validAnswerCount, 1);
      assert.deepEqual(mind.validQuestionIds, ['q1']);
    });

    test('Descriptive-only questions (Q3, Q6, Q19) do not affect numerical dimension scores and are retained in descriptiveProfile', () => {
      const baseResult = calculateReflectionScores(SAMPLE_VIVA_RESPONSES);

      const modifiedResponses = {
        ...SAMPLE_VIVA_RESPONSES,
        q3: 'yes',
        q6: 'prefer_not_to_say',
        q19: 'never',
      };
      const modifiedResult = calculateReflectionScores(modifiedResponses);

      // Verify that changing Q3, Q6, Q19 does not affect any of the five numerical dimension scores
      baseResult.dimensions.forEach((baseDim) => {
        const modDim = modifiedResult.dimensions.find((d) => d.id === baseDim.id);
        assert.strictEqual(
          modDim.score,
          baseDim.score,
          `Dimension ${baseDim.id} score changed from ${baseDim.score} to ${modDim.score}`
        );
        assert.strictEqual(modDim.unroundedScore, baseDim.unroundedScore);
        assert.strictEqual(modDim.status, baseDim.status);
        assert.strictEqual(modDim.isCoverageMet, baseDim.isCoverageMet);
        assert.strictEqual(modDim.validAnswerCount, baseDim.validAnswerCount);
      });

      // Verify changed answers are still retained in descriptiveProfile
      assert.strictEqual(modifiedResult.descriptiveProfile.q3, 'yes');
      assert.strictEqual(modifiedResult.descriptiveProfile.q6, 'prefer_not_to_say');
      assert.strictEqual(modifiedResult.descriptiveProfile.q19, 'never');
    });
  });

  // =========================================================================
  // D. ARCHITECTURE GUARDRAILS (NO OVERALL SCORE & NO ML COUPLING)
  // =========================================================================
  describe('D. Architecture Guardrails', () => {
    test('overallScore is always suppressed (null) and counts equal 17 scored + 3 descriptive = 20', () => {
      const result = calculateReflectionScores(SAMPLE_VIVA_RESPONSES);
      assert.equal(result.overallScore, null);
      assert.equal(result.isNonClinical, true);
      assert.equal(result.totalQuestions, 20);
      assert.equal(result.scoredQuestionCount, 17);
      assert.equal(result.descriptiveQuestionCount, 3);
      assert.deepEqual(Object.keys(result.descriptiveProfile), ['q3', 'q6', 'q19']);
    });

    test('reflectionScoring.js remains isolated from featureMapping and ML payload builders', () => {
      const currentFilePath = fileURLToPath(import.meta.url);
      const scoringSourcePath = currentFilePath.replace('reflectionScoring.test.js', 'reflectionScoring.js');
      const sourceText = fs.readFileSync(scoringSourcePath, 'utf-8');

      assert.equal(sourceText.includes('featureMapping'), false);
      assert.equal(sourceText.includes('benchmarkDemoPayload'), false);
      assert.equal(sourceText.includes("'/predict'"), false);
    });
  });
});
