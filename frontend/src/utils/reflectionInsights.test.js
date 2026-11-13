import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  countAnsweredQuestions,
  getDimensionNarrative,
  buildPersonalInsights,
  buildNextSteps,
} from './reflectionInsights.js';
import { calculateReflectionScores } from './reflectionScoring.js';
import { SAMPLE_VIVA_RESPONSES } from '../data/questionnaire.js';

const FORBIDDEN_CLINICAL_TERMS = [
  'depressed',
  'depression',
  'anxious',
  'unhealthy',
  'clinically stressed',
  'mental illness',
  'disorder',
  'diagnosed',
  'cure',
];

function assertNonClinicalCopy(text, contextLabel) {
  const lower = String(text || '').toLowerCase();
  for (const term of FORBIDDEN_CLINICAL_TERMS) {
    assert.equal(
      lower.includes(term),
      false,
      `Forbidden clinical term "${term}" found in ${contextLabel}: ${text}`,
    );
  }
}

describe('MindScope 20-Question Personal Reflection Insights & Next Steps Utility', () => {
  describe('countAnsweredQuestions', () => {
    test('returns 0 for empty, null, or malformed answers', () => {
      assert.equal(countAnsweredQuestions({}), 0);
      assert.equal(countAnsweredQuestions(null), 0);
      assert.equal(countAnsweredQuestions(undefined), 0);
      assert.equal(countAnsweredQuestions({ q1: '', q2: null, q3: undefined }), 0);
    });

    test('counts valid responses among q1–q20 including prefer_not_to_say, ignoring stale q21+', () => {
      const count = countAnsweredQuestions({
        q1: 'rarely',
        q3: 'prefer_not_to_say',
        q20: 'prefer_not_to_say',
        q21: 'ignored_legacy_field',
      });
      assert.equal(count, 3);
    });

    test('counts all 20 questions on SAMPLE_VIVA_RESPONSES', () => {
      assert.equal(countAnsweredQuestions(SAMPLE_VIVA_RESPONSES), 20);
    });
  });

  describe('getDimensionNarrative', () => {
    const dimIds = [
      'mind_emotions',
      'physical_wellbeing',
      'living_environment',
      'academics_future',
      'social_campus_life',
    ];

    test('returns tailored non-clinical narratives across score tiers for all 5 dimensions', () => {
      dimIds.forEach((id) => {
        const high = getDimensionNarrative({ id, name: id, isCoverageMet: true, score: 85 }, {});
        const mid = getDimensionNarrative(
          { id, name: id, isCoverageMet: true, score: 60 },
          { q1: 'often', q7: 'poor', q9: 'extremely', q14: 'very_demanding', q17: 'no_support' },
        );
        const low = getDimensionNarrative({ id, name: id, isCoverageMet: true, score: 30 }, {});
        const insuf = getDimensionNarrative(
          { id, name: id, isCoverageMet: false, score: null, validAnswerCount: 1, totalPossibleCount: 3 },
          {},
        );

        [high, mid, low, insuf].forEach((text) => {
          assert.equal(typeof text, 'string');
          assert.ok(text.length > 20);
          assertNonClinicalCopy(text, `${id} narrative`);
        });
      });
    });
  });

  describe('buildPersonalInsights', () => {
    test('highlights positive patterns without inventing deficits on supportive check-ins', () => {
      const answers = {
        q1: 'never',
        q2: 'extremely_confident',
        q3: 'no',
        q4: 'never',
        q5: 'never',
        q6: 'no',
        q7: 'excellent',
        q8: 'never',
        q9: 'not_at_all',
        q10: 'very_comfortable',
        q11: 'completely_safe',
        q12: 'always',
        q13: 'very_satisfied',
        q14: 'not_demanding',
        q15: 'extremely_supportive',
        q16: 'not_worried',
        q17: 'great_deal_of_support',
        q18: 'never',
        q19: 'very_frequently',
        q20: 'never',
      };

      const reflection = calculateReflectionScores(answers);
      const { strengths, reflections, focusArea } = buildPersonalInsights(answers, reflection);

      assert.ok(strengths.length >= 3 && strengths.length <= 4);
      assert.equal(reflections.length, 0);
      assert.equal(focusArea, null);

      strengths.forEach((item) => {
        assertNonClinicalCopy(item.title, 'strength title');
        assertNonClinicalCopy(item.description, 'strength description');
      });
    });

    test('surfaces gentle reflections on strained answers and respects prefer_not_to_say', () => {
      const answers = {
        q1: 'almost_always',
        q3: 'prefer_not_to_say',
        q6: 'prefer_not_to_say',
        q7: 'very_poor',
        q9: 'extremely',
        q14: 'extremely_demanding',
        q17: 'no_support',
        q20: 'prefer_not_to_say',
      };

      const reflection = calculateReflectionScores(answers);
      const { reflections, focusArea } = buildPersonalInsights(answers, reflection);

      assert.equal(focusArea, null);
      assert.ok(reflections.length >= 3 && reflections.length <= 4);

      const ids = reflections.map((r) => r.id);
      assert.ok(ids.includes('ref_emotional_load'));
      assert.ok(ids.includes('ref_sleep_strain'));
      assert.ok(ids.includes('ref_environment_friction'));
      assert.ok(ids.includes('ref_academic_pressure'));

      reflections.forEach((item) => {
        assertNonClinicalCopy(item.title, 'reflection title');
        assertNonClinicalCopy(item.description, 'reflection description');
      });

      // Sensitive undisclosed items alone must not generate negative reflections
      const privacyOnly = buildPersonalInsights(
        { q3: 'prefer_not_to_say', q6: 'prefer_not_to_say', q20: 'prefer_not_to_say' },
        calculateReflectionScores({ q3: 'prefer_not_to_say', q6: 'prefer_not_to_say', q20: 'prefer_not_to_say' }),
      );
      assert.equal(privacyOnly.reflections.length, 0);
    });
  });

  describe('buildNextSteps', () => {
    test('generates 3–5 actionable steps and a 7-day rhythm with non-clinical phrasing', () => {
      const { steps, weeklyPlan } = buildNextSteps(SAMPLE_VIVA_RESPONSES);

      assert.ok(steps.length >= 3 && steps.length <= 5);
      assert.equal(weeklyPlan.length, 7);

      steps.forEach((step) => {
        assert.ok(step.id && step.title && step.timeframe && step.action && step.category && step.reason);
        assertNonClinicalCopy(step.title, 'step title');
        assertNonClinicalCopy(step.action, 'step action');
      });

      weeklyPlan.forEach((day) => {
        assert.ok(day.id && day.day && day.focus && day.microAction);
        assertNonClinicalCopy(day.microAction, 'weekly plan microAction');
      });
    });
  });
});
