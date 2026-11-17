import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  createGuestProfile,
  restoreGuestProfile,
  getGuestSession,
  clearGuestSession,
  isGuestSessionActive,
  getGuestHistory,
  saveGuestAssessment,
  getGuestAssessmentById,
  deleteGuestAssessment,
  clearGuestHistory,
  getGuestSummaryStats,
  generateGuestId,
  getProfilesRegistry,
  runLegacyMigration,
} from './guestStorage.js';

// In-memory mock for localStorage in Node.js test environment
class LocalStorageMock {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

describe('guestStorage multi-profile service', () => {
  beforeEach(() => {
    globalThis.localStorage = new LocalStorageMock();
    globalThis.window = {
      localStorage: globalThis.localStorage,
      dispatchEvent: () => {},
    };
  });

  it('generates collision-safe Guest IDs in MSG-XXXX-XXXX format', () => {
    const id1 = generateGuestId();
    const id2 = generateGuestId();

    assert.match(id1, /^MSG-[2-9A-Z]{4}-[2-9A-Z]{4}$/);
    assert.match(id2, /^MSG-[2-9A-Z]{4}-[2-9A-Z]{4}$/);
    assert.notEqual(id1, id2);
  });

  it('creates a new guest profile with name validation and sets active session', () => {
    const invalidRes = createGuestProfile('   ');
    assert.equal(invalidRes.success, false);
    assert.match(invalidRes.error, /cannot be empty/);

    const validRes = createGuestProfile('  Lavanya Gosain  ');
    assert.equal(validRes.success, true);
    assert.equal(validRes.profile.name, 'Lavanya Gosain');
    assert.match(validRes.profile.guestId, /^MSG-/);

    const session = getGuestSession();
    assert.ok(session);
    assert.equal(session.guestId, validRes.profile.guestId);
    assert.equal(session.name, 'Lavanya Gosain');
    assert.equal(isGuestSessionActive(), true);
  });

  it('isolates assessment histories between two different guests on the same browser', () => {
    // 1. Guest A enters
    const guestA = createGuestProfile('Lavanya').profile;
    assert.equal(getGuestHistory().length, 0);

    // Guest A takes 2 assessments
    saveGuestAssessment({ id: 'asmt-a-1', predictedClass: 0 });
    saveGuestAssessment({ id: 'asmt-a-2', predictedClass: 1 });

    const historyA = getGuestHistory();
    assert.equal(historyA.length, 2);
    assert.equal(historyA[0].id, 'asmt-a-2');
    assert.equal(historyA[1].id, 'asmt-a-1');

    // 2. Guest B enters as a new guest
    const guestB = createGuestProfile('Krish').profile;
    assert.notEqual(guestB.guestId, guestA.guestId);

    // Guest B must see an EMPTY history (never Guest A's records!)
    const historyB = getGuestHistory();
    assert.equal(historyB.length, 0);
    assert.equal(getGuestSummaryStats().totalAssessments, 0);

    // Guest B takes 1 assessment
    saveGuestAssessment({ id: 'asmt-b-1', predictedClass: 2 });
    assert.equal(getGuestHistory().length, 1);
    assert.equal(getGuestHistory()[0].id, 'asmt-b-1');

    // 3. Switch back to Guest A using restoreGuestProfile
    const restoredA = restoreGuestProfile(guestA.guestId);
    assert.equal(restoredA.success, true);
    assert.equal(getGuestSession().guestId, guestA.guestId);

    // Guest A's history is completely intact with exactly their 2 assessments
    const reloadedHistoryA = getGuestHistory();
    assert.equal(reloadedHistoryA.length, 2);
    assert.equal(reloadedHistoryA[0].id, 'asmt-a-2');
    assert.equal(reloadedHistoryA[1].id, 'asmt-a-1');
  });

  it('restores an existing profile by Guest ID with case-insensitivity and error handling', () => {
    const profile = createGuestProfile('Sam').profile;
    clearGuestSession();
    assert.equal(isGuestSessionActive(), false);

    // Test restoring with lowercase
    const restoreLower = restoreGuestProfile(profile.guestId.toLowerCase());
    assert.equal(restoreLower.success, true);
    assert.equal(restoreLower.profile.name, 'Sam');
    assert.equal(isGuestSessionActive(), true);

    // Test non-existent ID
    const notFound = restoreGuestProfile('MSG-9999-9999');
    assert.equal(notFound.success, false);
    assert.match(notFound.error, /not found on this browser/i);
  });

  it('exiting guest session clears only active session without deleting saved profiles or histories', () => {
    const profile = createGuestProfile('Alex').profile;
    saveGuestAssessment({ id: 'asmt-alex-1', predictedClass: 1 });

    assert.equal(isGuestSessionActive(), true);

    const exited = clearGuestSession();
    assert.equal(exited, true);
    assert.equal(isGuestSessionActive(), false);
    assert.equal(getGuestSession(), null);

    // Profile and history remain safely in localStorage
    const registry = getProfilesRegistry();
    assert.ok(registry[profile.guestId]);
    assert.equal(registry[profile.guestId].name, 'Alex');

    // Can be restored anytime
    restoreGuestProfile(profile.guestId);
    assert.equal(getGuestHistory().length, 1);
    assert.equal(getGuestHistory()[0].id, 'asmt-alex-1');
  });

  it('deleting an assessment or clearing history affects ONLY the active guest', () => {
    const guest1 = createGuestProfile('User 1').profile;
    saveGuestAssessment({ id: 'rec-1', predictedClass: 0 });
    saveGuestAssessment({ id: 'rec-2', predictedClass: 1 });

    const guest2 = createGuestProfile('User 2').profile;
    saveGuestAssessment({ id: 'rec-3', predictedClass: 2 });

    // Active is User 2
    assert.equal(getGuestHistory().length, 1);
    clearGuestHistory();
    assert.equal(getGuestHistory().length, 0);

    // User 1's history is completely preserved
    restoreGuestProfile(guest1.guestId);
    assert.equal(getGuestHistory().length, 2);

    // Delete single item for User 1
    deleteGuestAssessment('rec-1');
    assert.equal(getGuestHistory().length, 1);
    assert.equal(getGuestHistory()[0].id, 'rec-2');
  });

  it('performs one-time legacy migration into a dedicated legacy profile without assigning to new guests', () => {
    // Simulate pre-existing legacy assessments from v1
    const oldAssessments = [
      { id: 'old-asmt-1', completedAt: '2026-11-15T10:00:00.000Z', predictedClass: 0 },
      { id: 'old-asmt-2', completedAt: '2026-11-15T11:00:00.000Z', predictedClass: 1 },
    ];
    globalThis.localStorage.setItem('mindscope_guest_history_v1', JSON.stringify(oldAssessments));
    globalThis.localStorage.setItem(
      'mindscope_guest_session_v1',
      JSON.stringify({ name: 'Original User' })
    );

    // Run migration
    runLegacyMigration();

    // Check registry: dedicated legacy profile was created
    const registry = getProfilesRegistry();
    assert.ok(registry['MSG-LEGACY-0001']);
    assert.equal(registry['MSG-LEGACY-0001'].name, 'Original User');

    // Legacy assessments are isolated under MSG-LEGACY-0001
    const legacyHistory = getGuestHistory('MSG-LEGACY-0001');
    assert.equal(legacyHistory.length, 2);
    assert.equal(legacyHistory[0].id, 'old-asmt-1');

    // A newly created guest profile starts with 0 assessments and does NOT inherit legacy records!
    const newGuest = createGuestProfile('New Student').profile;
    assert.equal(getGuestHistory().length, 0);
  });
});
