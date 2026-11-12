import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  MODEL_FEATURES_METADATA,
  convertFivePointToRange,
  mapAnswerToFeatureValue,
  mapAssessmentAnswersToFeatures,
  buildFeatureAuditReport,
} from './featureMapping.js';
import { SAMPLE_VIVA_RESPONSES } from '../data/questionnaire.js';

const EXPECTED_FEATURE_ORDER = [
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

describe('MindScope 20-Feature Mapping & Proposed Dataset Range Conversion (Hardened Stage 1)', () => {
  test('Preserves the exact 20-feature sequence required by the trained ML model', () => {
    assert.equal(MODEL_FEATURES_METADATA.length, 20);
    assert.deepEqual(
      MODEL_FEATURES_METADATA.map((f) => f.name),
      EXPECTED_FEATURE_ORDER,
    );
    MODEL_FEATURES_METADATA.forEach((f, idx) => {
      assert.equal(f.questionId, `q${idx + 1}`);
    });
  });

  test('Converts 1–5 ordinal scores using exact linear rescaling without silent rounding', () => {
    // [0, 21] (anxiety_level)
    assert.deepEqual(
      [1, 2, 3, 4, 5].map((s) => convertFivePointToRange(s, 0, 21)),
      [0, 5.25, 10.5, 15.75, 21],
    );

    // [0, 30] (self_esteem)
    assert.deepEqual(
      [1, 2, 3, 4, 5].map((s) => convertFivePointToRange(s, 0, 30)),
      [0, 7.5, 15, 22.5, 30],
    );

    // [0, 27] (depression)
    assert.deepEqual(
      [1, 2, 3, 4, 5].map((s) => convertFivePointToRange(s, 0, 27)),
      [0, 6.75, 13.5, 20.25, 27],
    );

    // [0, 5] (standard ordinal items)
    assert.deepEqual(
      [1, 2, 3, 4, 5].map((s) => convertFivePointToRange(s, 0, 5)),
      [0, 1.25, 2.5, 3.75, 5],
    );

    // [0, 3] (social_support)
    assert.deepEqual(
      [1, 2, 3, 4, 5].map((s) => convertFivePointToRange(s, 0, 3)),
      [0, 0.75, 1.5, 2.25, 3],
    );

    // Out-of-range and non-finite inputs remain null
    assert.equal(convertFivePointToRange(0, 0, 5), null);
    assert.equal(convertFivePointToRange(6, 0, 5), null);
    assert.equal(convertFivePointToRange(Number.NaN, 0, 5), null);
    assert.equal(convertFivePointToRange(Number.POSITIVE_INFINITY, 0, 5), null);
  });

  test('Handles binary q3 (mental_health_history) and missing Prefer not to say', () => {
    const noRes = mapAnswerToFeatureValue('q3', 'no');
    assert.equal(noRes.convertedValue, 0);
    assert.equal(noRes.isMissing, false);
    assert.equal(noRes.status, 'valid');

    const yesRes = mapAnswerToFeatureValue('q3', 'yes');
    assert.equal(yesRes.convertedValue, 1);
    assert.equal(yesRes.isMissing, false);
    assert.equal(yesRes.status, 'valid');

    const preferNot = mapAnswerToFeatureValue('q3', 'prefer_not_to_say');
    assert.equal(preferNot.convertedValue, null);
    assert.equal(preferNot.rawScore, null);
    assert.equal(preferNot.isMissing, true);
    assert.equal(preferNot.status, 'prefer_not_to_say');
  });

  test('Handles provisional q6 (blood_pressure) encoding: not_sure remains 2 and prefer_not_to_say remains null', () => {
    const bpMeta = MODEL_FEATURES_METADATA.find((f) => f.questionId === 'q6');
    assert.equal(bpMeta.status, 'provisional_categorical');

    const noRes = mapAnswerToFeatureValue('q6', 'no');
    assert.equal(noRes.convertedValue, 1);
    assert.equal(noRes.isMissing, false);
    assert.equal(noRes.status, 'valid');

    const notSureRes = mapAnswerToFeatureValue('q6', 'not_sure');
    assert.equal(notSureRes.rawScore, 2);
    assert.equal(notSureRes.convertedValue, 2);
    assert.equal(notSureRes.isMissing, false);
    assert.equal(notSureRes.status, 'valid');

    const yesRes = mapAnswerToFeatureValue('q6', 'yes');
    assert.equal(yesRes.convertedValue, 3);
    assert.equal(yesRes.isMissing, false);
    assert.equal(yesRes.status, 'valid');

    const preferNot = mapAnswerToFeatureValue('q6', 'prefer_not_to_say');
    assert.equal(preferNot.convertedValue, null);
    assert.equal(preferNot.rawScore, null);
    assert.equal(preferNot.isMissing, true);
    assert.equal(preferNot.status, 'prefer_not_to_say');
  });

  test('Handles sensitive q20 (bullying) decimal mapping and null for Prefer not to say', () => {
    const mid = mapAnswerToFeatureValue('q20', 'sometimes');
    assert.equal(mid.rawScore, 3);
    assert.equal(mid.convertedValue, 2.5);
    assert.equal(mid.isMissing, false);
    assert.equal(mid.status, 'valid');

    const rarely = mapAnswerToFeatureValue('q20', 'rarely');
    assert.equal(rarely.rawScore, 2);
    assert.equal(rarely.convertedValue, 1.25);
    assert.equal(rarely.isMissing, false);
    assert.equal(rarely.status, 'valid');

    const preferNot = mapAnswerToFeatureValue('q20', 'prefer_not_to_say');
    assert.equal(preferNot.rawScore, null);
    assert.equal(preferNot.convertedValue, null);
    assert.equal(preferNot.isMissing, true);
    assert.equal(preferNot.status, 'prefer_not_to_say');
  });

  test('Rejects Object prototype properties (toString, constructor, valueOf) on options and questionId', () => {
    const protoKeys = ['toString', 'constructor', 'valueOf', '__proto__', 'hasOwnProperty'];
    const questionIdsToTest = ['q1', 'q3', 'q6', 'q20'];

    for (const qId of questionIdsToTest) {
      for (const protoKey of protoKeys) {
        const res = mapAnswerToFeatureValue(qId, protoKey);
        assert.equal(res.rawScore, null, `${qId} with ${protoKey} must return rawScore null`);
        assert.equal(res.convertedValue, null, `${qId} with ${protoKey} must return convertedValue null`);
        assert.equal(res.isMissing, true, `${qId} with ${protoKey} must mark isMissing true`);
        assert.equal(res.status, 'invalid', `${qId} with ${protoKey} must mark status invalid`);
      }
    }

    for (const badQId of ['toString', 'constructor', 'valueOf']) {
      const res = mapAnswerToFeatureValue(badQId, 'no');
      assert.equal(res.featureName, null);
      assert.equal(res.rawScore, null);
      assert.equal(res.convertedValue, null);
      assert.equal(res.isMissing, true);
      assert.equal(res.status, 'invalid');
    }
  });

  test('Rejects numbers, arrays, objects, unsupported strings, and distinguishes null/undefined/empty as unanswered', () => {
    const invalidInputs = [1, 0, true, false, ['no'], ['never'], { value: 'no' }, 'unsupported_option'];
    for (const badInput of invalidInputs) {
      for (const qId of ['q1', 'q3', 'q6', 'q20']) {
        const res = mapAnswerToFeatureValue(qId, badInput);
        assert.equal(res.rawScore, null);
        assert.equal(res.convertedValue, null);
        assert.equal(res.isMissing, true);
        assert.equal(res.status, 'invalid');
      }
    }

    // Unsupported prefer_not_to_say on non-optional question must be treated as invalid
    const unsupportedPreferNot = mapAnswerToFeatureValue('q1', 'prefer_not_to_say');
    assert.equal(unsupportedPreferNot.convertedValue, null);
    assert.equal(unsupportedPreferNot.isMissing, true);
    assert.equal(unsupportedPreferNot.status, 'invalid');

    // Unanswered inputs remain distinct from invalid inputs and never coerce to zero
    for (const missingInput of [null, undefined, '']) {
      const res = mapAnswerToFeatureValue('q3', missingInput);
      assert.equal(res.rawScore, null);
      assert.equal(res.convertedValue, null);
      assert.equal(res.isMissing, true);
      assert.equal(res.status, 'unanswered');
    }
  });

  test('mapAssessmentAnswersToFeatures handles completely unanswered and malformed assessments cleanly', () => {
    for (const emptyLike of [undefined, {}, null, [], 'bad_payload']) {
      const mapped = mapAssessmentAnswersToFeatures(emptyLike);
      assert.equal(mapped.isProposedEncodingValidated, false);
      assert.deepEqual(mapped.missingFeatures, EXPECTED_FEATURE_ORDER);
      assert.deepEqual(mapped.unansweredFeatures, EXPECTED_FEATURE_ORDER);
      assert.deepEqual(mapped.preferNotToSayFeatures, []);
      assert.deepEqual(mapped.invalidFeatures, []);

      for (const featName of EXPECTED_FEATURE_ORDER) {
        assert.equal(mapped.rawScores[featName], null);
        assert.equal(mapped.convertedFeatures[featName], null);
        assert.equal(mapped.answerStatuses[featName], 'unanswered');
      }
    }
  });

  test('mapAssessmentAnswersToFeatures handles partial assessments, valid/missing/invalid distinctions, and unrounded decimals', () => {
    const mapped = mapAssessmentAnswersToFeatures({
      q1: 'rarely', // score 2 -> 5.25
      q2: 'very_confident', // score 4 -> 22.5
      q3: 'prefer_not_to_say', // prefer_not_to_say -> null
      q4: 'often', // score 4 -> 20.25
      q6: 'not_sure', // valid provisional category -> 2
      q9: 'toString', // invalid prototype property -> null
      q17: 'some_support', // score 3 -> 1.5
      q20: 'prefer_not_to_say', // prefer_not_to_say -> null
    });

    assert.equal(mapped.isProposedEncodingValidated, false);
    assert.equal(mapped.rawScores.anxiety_level, 2);
    assert.equal(mapped.convertedFeatures.anxiety_level, 5.25);
    assert.equal(mapped.convertedFeatures.self_esteem, 22.5);
    assert.equal(mapped.convertedFeatures.mental_health_history, null);
    assert.equal(mapped.convertedFeatures.depression, 20.25);
    assert.equal(mapped.convertedFeatures.blood_pressure, 2);
    assert.equal(mapped.convertedFeatures.noise_level, null);
    assert.equal(mapped.convertedFeatures.social_support, 1.5);
    assert.equal(mapped.convertedFeatures.bullying, null);

    // Distinct tracking without coercion to 0
    assert.deepEqual(mapped.preferNotToSayFeatures, ['mental_health_history', 'bullying']);
    assert.deepEqual(mapped.invalidFeatures, ['noise_level']);
    assert.equal(mapped.unansweredFeatures.length, 12);
    assert.equal(mapped.missingFeatures.length, 15);
    assert.equal(mapped.answerStatuses.anxiety_level, 'valid');
    assert.equal(mapped.answerStatuses.blood_pressure, 'valid');
    assert.equal(mapped.answerStatuses.mental_health_history, 'prefer_not_to_say');
    assert.equal(mapped.answerStatuses.noise_level, 'invalid');
    assert.equal(mapped.answerStatuses.headache, 'unanswered');
  });

  test('buildFeatureAuditReport keeps benchmarkDemoPayload separate from live or invalid answers', () => {
    const reportEmpty = buildFeatureAuditReport({});
    const reportFilled = buildFeatureAuditReport(SAMPLE_VIVA_RESPONSES);
    const reportInvalid = buildFeatureAuditReport({ q1: 'toString', q3: 'prefer_not_to_say' });

    assert.equal(reportFilled.totalFeatures, 20);
    assert.deepEqual(Object.keys(reportFilled.benchmarkDemoPayload), EXPECTED_FEATURE_ORDER);
    assert.deepEqual(reportEmpty.benchmarkDemoPayload, reportFilled.benchmarkDemoPayload);
    assert.deepEqual(reportInvalid.benchmarkDemoPayload, reportFilled.benchmarkDemoPayload);
  });
});
