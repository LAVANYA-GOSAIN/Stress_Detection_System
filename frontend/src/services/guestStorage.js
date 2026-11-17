/**
 * MindScope – Isolated Multi-Guest Storage Service
 *
 * Provides complete profile isolation in browser localStorage so that multiple
 * guests using the same browser do not share or see each other's assessments.
 *
 * Core Principles:
 * 1. Unique, collision-safe Guest IDs (format: MSG-XXXX-XXXX).
 * 2. Strictly isolated per-guest assessment histories.
 * 3. 100% browser-local persistence (no passwords, no cloud sync, no tracking).
 * 4. Idempotent one-time legacy data migration into a dedicated legacy profile.
 * 5. Full future compatibility for migrating to authenticated backend databases.
 */

const PROFILES_KEY = 'mindscope_guest_profiles_v1';
const ACTIVE_SESSION_KEY = 'mindscope_active_guest_v1';
const LEGACY_MIGRATION_KEY = 'mindscope_legacy_migrated_v1';
const LEGACY_HISTORY_KEY = 'mindscope_guest_history_v1';
const LEGACY_SESSION_KEY = 'mindscope_guest_session_v1';
const PER_GUEST_HISTORY_PREFIX = 'mindscope_history_';
const MAX_STORED_RECORDS = 50;

// Character pool for human-readable, unambiguous IDs (excludes 0, O, 1, I)
const ID_CHAR_POOL = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/**
 * Safely accesses localStorage. Returns null if unavailable.
 */
function getStorage() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    // Blocked by private browsing or SSR
  }
  return null;
}

/**
 * Dispatches a custom event to notify components that the guest session state changed.
 */
function notifySessionChange() {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(new Event('mindscope_session_change'));
    } catch {
      // Ignore if event dispatching fails in non-browser context
    }
  }
}

/**
 * Retrieves the registry of all guest profiles stored in this browser.
 *
 * @returns {Record<string, { guestId: string, name: string, createdAt: string, lastActiveAt: string }>}
 */
export function getProfilesRegistry() {
  const storage = getStorage();
  if (!storage) return {};

  // Run one-time legacy migration if not yet performed
  runLegacyMigration();

  try {
    const raw = storage.getItem(PROFILES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (err) {
    console.warn('Failed to read profiles registry:', err);
    return {};
  }
}

/**
 * Saves the profiles registry to localStorage.
 */
function saveProfilesRegistry(registry) {
  const storage = getStorage();
  if (!storage) return false;
  try {
    storage.setItem(PROFILES_KEY, JSON.stringify(registry));
    return true;
  } catch (err) {
    console.error('Failed to save profiles registry:', err);
    return false;
  }
}

/**
 * Generates a collision-safe Guest ID in the format MSG-XXXX-XXXX.
 * Verifies against the local registry to prevent duplicates.
 *
 * @returns {string} Unique Guest ID
 */
export function generateGuestId() {
  const registry = getProfilesRegistry();
  const maxAttempts = 50;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    let part1 = '';
    let part2 = '';
    for (let i = 0; i < 4; i += 1) {
      part1 += ID_CHAR_POOL.charAt(Math.floor(Math.random() * ID_CHAR_POOL.length));
      part2 += ID_CHAR_POOL.charAt(Math.floor(Math.random() * ID_CHAR_POOL.length));
    }
    const candidateId = `MSG-${part1}-${part2}`;
    if (!registry[candidateId]) {
      return candidateId;
    }
  }

  // Fallback timestamp-based collision safe ID
  return `MSG-${Date.now().toString(36).toUpperCase().slice(-4)}-${Math.random().toString(36).toUpperCase().slice(-4)}`;
}

/**
 * Performs a one-time migration of existing flat assessment records from v1 into
 * a dedicated legacy profile (MSG-LEGACY-0001).
 *
 * Ensures:
 * - Runs only once.
 * - Zero existing records are deleted or lost.
 * - Legacy records are NOT assigned to whichever new guest logs in first.
 */
export function runLegacyMigration() {
  const storage = getStorage();
  if (!storage) return;

  try {
    if (storage.getItem(LEGACY_MIGRATION_KEY)) {
      return; // Already migrated
    }

    const legacyRaw = storage.getItem(LEGACY_HISTORY_KEY);
    let legacyAssessments = [];
    if (legacyRaw) {
      try {
        const parsed = JSON.parse(legacyRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          legacyAssessments = parsed;
        }
      } catch {
        // Corrupted legacy data
      }
    }

    if (legacyAssessments.length > 0) {
      // Determine legacy profile name from old session if available
      let legacyName = 'Legacy Guest';
      try {
        const oldSessionRaw = storage.getItem(LEGACY_SESSION_KEY);
        if (oldSessionRaw) {
          const oldSession = JSON.parse(oldSessionRaw);
          if (oldSession?.name?.trim()) {
            legacyName = oldSession.name.trim();
          }
        }
      } catch {
        // Fall back to 'Legacy Guest'
      }

      const legacyGuestId = 'MSG-LEGACY-0001';

      // Read current registry directly
      const rawReg = storage.getItem(PROFILES_KEY);
      const registry = rawReg ? JSON.parse(rawReg) : {};

      if (!registry[legacyGuestId]) {
        registry[legacyGuestId] = {
          guestId: legacyGuestId,
          name: legacyName,
          createdAt: legacyAssessments[legacyAssessments.length - 1]?.completedAt || new Date().toISOString(),
          lastActiveAt: legacyAssessments[0]?.completedAt || new Date().toISOString(),
          isLegacy: true,
        };
        storage.setItem(PROFILES_KEY, JSON.stringify(registry));

        // Save legacy assessments into the legacy guest's dedicated storage key
        const taggedAssessments = legacyAssessments.map((item) => ({
          ...item,
          guestId: legacyGuestId,
          guestName: legacyName,
        }));
        storage.setItem(
          `${PER_GUEST_HISTORY_PREFIX}${legacyGuestId}`,
          JSON.stringify(taggedAssessments)
        );
      }
    }

    // Mark migration as complete
    storage.setItem(LEGACY_MIGRATION_KEY, 'true');
  } catch (err) {
    console.warn('Legacy migration check failed:', err);
  }
}

/**
 * Creates a new guest profile with a unique collision-safe Guest ID,
 * saves it in the registry, and sets it as the active session.
 *
 * @param {string} rawName - Guest's name or nickname
 * @returns {{ success: boolean, profile: Object|null, error: string|null }}
 */
export function createGuestProfile(rawName) {
  if (typeof rawName !== 'string') {
    return { success: false, profile: null, error: 'Please enter a valid name.' };
  }

  const trimmed = rawName.trim();
  if (trimmed.length === 0) {
    return { success: false, profile: null, error: 'Name cannot be empty or only spaces.' };
  }

  if (trimmed.length > 50) {
    return { success: false, profile: null, error: 'Name must be 50 characters or fewer.' };
  }

  const storage = getStorage();
  if (!storage) {
    return { success: false, profile: null, error: 'Local storage is unavailable in this browser.' };
  }

  try {
    const guestId = generateGuestId();
    const now = new Date().toISOString();

    const profile = {
      guestId,
      name: trimmed,
      createdAt: now,
      lastActiveAt: now,
    };

    const registry = getProfilesRegistry();
    registry[guestId] = profile;
    saveProfilesRegistry(registry);

    // Initialize an empty isolated history for this new guest
    storage.setItem(`${PER_GUEST_HISTORY_PREFIX}${guestId}`, JSON.stringify([]));

    // Set as active session
    setActiveGuestSession(profile);

    return { success: true, profile, error: null };
  } catch (err) {
    console.error('Failed to create guest profile:', err);
    return { success: false, profile: null, error: 'Failed to create profile in local storage.' };
  }
}

/**
 * Restores an existing guest profile by Guest ID on the same browser.
 *
 * @param {string} rawId - Candidate Guest ID to restore
 * @returns {{ success: boolean, profile: Object|null, error: string|null }}
 */
export function restoreGuestProfile(rawId) {
  if (typeof rawId !== 'string') {
    return { success: false, profile: null, error: 'Please enter a Guest ID.' };
  }

  const normalizedId = rawId.trim().toUpperCase();
  if (normalizedId.length === 0) {
    return { success: false, profile: null, error: 'Please enter your Guest ID.' };
  }

  const registry = getProfilesRegistry();
  const profile = registry[normalizedId];

  if (!profile) {
    return {
      success: false,
      profile: null,
      error: 'Guest ID not found on this browser. Note: Guest IDs can only restore profiles saved in this specific browser.',
    };
  }

  // Update lastActiveAt
  profile.lastActiveAt = new Date().toISOString();
  registry[normalizedId] = profile;
  saveProfilesRegistry(registry);

  // Set as active session
  setActiveGuestSession(profile);

  return { success: true, profile, error: null };
}

/**
 * Internal helper to set the active guest session.
 */
function setActiveGuestSession(profile) {
  const storage = getStorage();
  if (!storage || !profile) return;

  const session = {
    guestId: profile.guestId,
    name: profile.name,
    sessionId: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
  };

  storage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
  notifySessionChange();
}

/**
 * Retrieves the current active guest session.
 *
 * @returns {Object|null} Session object { guestId, name, sessionId, createdAt } or null
 */
export function getGuestSession() {
  const storage = getStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(ACTIVE_SESSION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && typeof parsed.guestId === 'string' && typeof parsed.name === 'string') {
      return {
        guestId: parsed.guestId,
        name: parsed.name.trim(),
        sessionId: parsed.sessionId || `session_${Date.now()}`,
        createdAt: parsed.createdAt || new Date().toISOString(),
      };
    }
    return null;
  } catch (err) {
    console.warn('Failed to read active guest session:', err);
    return null;
  }
}

/**
 * Clears the active guest session without deleting the guest's saved profile
 * or assessment history.
 *
 * @returns {boolean} True if cleared successfully
 */
export function clearGuestSession() {
  const storage = getStorage();
  if (!storage) return false;

  try {
    storage.removeItem(ACTIVE_SESSION_KEY);
    notifySessionChange();
    return true;
  } catch (err) {
    console.error('Failed to clear guest session:', err);
    return false;
  }
}

/**
 * Checks whether an active guest session exists.
 *
 * @returns {boolean}
 */
export function isGuestSessionActive() {
  return getGuestSession() !== null;
}

/**
 * Helper to get the active guest's ID, or null.
 */
export function getActiveGuestId() {
  const session = getGuestSession();
  return session ? session.guestId : null;
}

/**
 * Retrieves all assessments belonging STRICTLY to the specified Guest ID (or active session).
 * Enforces profile isolation: a guest never sees another guest's records.
 *
 * @param {string} [guestId] - Optional explicit Guest ID (defaults to active session's Guest ID)
 * @returns {Array<Object>} List of assessments in reverse chronological order
 */
export function getGuestHistory(guestId = getActiveGuestId()) {
  if (!guestId) return [];

  const storage = getStorage();
  if (!storage) return [];

  try {
    const raw = storage.getItem(`${PER_GUEST_HISTORY_PREFIX}${guestId}`);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item) => item && typeof item === 'object' && typeof item.id === 'string'
    );
  } catch (err) {
    console.warn(`Failed to read assessment history for guest ${guestId}:`, err);
    return [];
  }
}

/**
 * Retrieves a single assessment record by its unique ID for the specified Guest ID.
 *
 * @param {string} id - Unique assessment ID
 * @param {string} [guestId] - Optional explicit Guest ID (defaults to active session)
 * @returns {Object|null}
 */
export function getGuestAssessmentById(id, guestId = getActiveGuestId()) {
  if (!id || !guestId) return null;
  const history = getGuestHistory(guestId);
  return history.find((record) => record.id === id) || null;
}

/**
 * Saves a completed assessment record to localStorage, strictly associated with
 * the active Guest ID. Prevents duplicates and maintains strict guest isolation.
 *
 * @param {Object} record - Assessment data object to store
 * @param {string} [guestId] - Optional explicit Guest ID (defaults to active session)
 * @returns {{ success: boolean, record: Object|null, isDuplicate: boolean }}
 */
export function saveGuestAssessment(record, guestId = getActiveGuestId()) {
  if (!record || typeof record !== 'object') {
    return { success: false, record: null, isDuplicate: false };
  }

  if (!guestId) {
    return { success: false, record: null, isDuplicate: false };
  }

  const storage = getStorage();
  if (!storage) {
    return { success: false, record: null, isDuplicate: false };
  }

  try {
    const history = getGuestHistory(guestId);
    const activeSession = getGuestSession();

    // Generate or validate unique assessment ID
    const id = record.id || `asmt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Check for duplicate in this guest's history
    const existingIndex = history.findIndex((item) => item.id === id);
    if (existingIndex !== -1) {
      return { success: true, record: history[existingIndex], isDuplicate: true };
    }

    // Build sanitized record strictly bounded to this guest
    const sanitized = {
      id,
      guestId,
      guestName:
        typeof record.guestName === 'string' && record.guestName.trim().length > 0
          ? record.guestName.trim()
          : activeSession?.name || 'Guest',
      completedAt: record.completedAt || new Date().toISOString(),
      predictedClass:
        typeof record.predictedClass === 'number' && [0, 1, 2].includes(record.predictedClass)
          ? record.predictedClass
          : null,
      probabilities:
        record.probabilities && typeof record.probabilities === 'object'
          ? {
              0: Number(record.probabilities[0] ?? record.probabilities['0'] ?? 0),
              1: Number(record.probabilities[1] ?? record.probabilities['1'] ?? 0),
              2: Number(record.probabilities[2] ?? record.probabilities['2'] ?? 0),
            }
          : null,
      modelName: typeof record.modelName === 'string' ? record.modelName : 'Gradient Boosting',
      imputedFeatures: Array.isArray(record.imputedFeatures) ? record.imputedFeatures : [],
      dimensionScores: Array.isArray(record.dimensionScores)
        ? record.dimensionScores.map((dim) => ({
            id: dim.id,
            name: dim.name,
            score: typeof dim.score === 'number' ? dim.score : null,
            totalPossibleCount: dim.totalPossibleCount,
            validAnswerCount: dim.validAnswerCount,
            isCoverageMet: Boolean(dim.isCoverageMet),
          }))
        : [],
      answers:
        record.answers && typeof record.answers === 'object'
          ? Object.fromEntries(
              Object.entries(record.answers).filter(
                ([key, val]) => typeof key === 'string' && typeof val === 'string'
              )
            )
          : {},
    };

    // Prepend newest assessment first
    const updated = [sanitized, ...history].slice(0, MAX_STORED_RECORDS);
    storage.setItem(`${PER_GUEST_HISTORY_PREFIX}${guestId}`, JSON.stringify(updated));

    // Update profile lastActiveAt
    const registry = getProfilesRegistry();
    if (registry[guestId]) {
      registry[guestId].lastActiveAt = new Date().toISOString();
      saveProfilesRegistry(registry);
    }

    return { success: true, record: sanitized, isDuplicate: false };
  } catch (err) {
    console.error('Failed to save assessment to guest storage:', err);
    return { success: false, record: null, isDuplicate: false };
  }
}

/**
 * Deletes a single assessment by ID from the specified guest's history only.
 *
 * @param {string} id - Assessment ID
 * @param {string} [guestId] - Optional explicit Guest ID (defaults to active session)
 * @returns {boolean}
 */
export function deleteGuestAssessment(id, guestId = getActiveGuestId()) {
  if (!id || !guestId) return false;
  const storage = getStorage();
  if (!storage) return false;

  try {
    const history = getGuestHistory(guestId);
    const updated = history.filter((item) => item.id !== id);
    storage.setItem(`${PER_GUEST_HISTORY_PREFIX}${guestId}`, JSON.stringify(updated));
    return true;
  } catch (err) {
    console.error('Failed to delete guest assessment:', err);
    return false;
  }
}

/**
 * Clears ALL assessment history for the specified Guest ID only.
 * All other guests' profiles and histories remain untouched.
 *
 * @param {string} [guestId] - Optional explicit Guest ID (defaults to active session)
 * @returns {boolean}
 */
export function clearGuestHistory(guestId = getActiveGuestId()) {
  if (!guestId) return false;
  const storage = getStorage();
  if (!storage) return false;

  try {
    storage.setItem(`${PER_GUEST_HISTORY_PREFIX}${guestId}`, JSON.stringify([]));
    return true;
  } catch (err) {
    console.error('Failed to clear guest history:', err);
    return false;
  }
}

/**
 * Computes summary statistics strictly for the specified Guest ID.
 *
 * @param {string} [guestId] - Optional explicit Guest ID (defaults to active session)
 * @returns {Object} Statistics summary
 */
export function getGuestSummaryStats(guestId = getActiveGuestId()) {
  const history = getGuestHistory(guestId);
  const totalAssessments = history.length;

  if (totalAssessments === 0) {
    return {
      totalAssessments: 0,
      latestAssessment: null,
      classCounts: { 0: 0, 1: 0, 2: 0 },
      firstAssessmentDate: null,
      latestAssessmentDate: null,
    };
  }

  const latestAssessment = history[0];
  const classCounts = { 0: 0, 1: 0, 2: 0 };

  for (const item of history) {
    if (item.predictedClass === 0 || item.predictedClass === 1 || item.predictedClass === 2) {
      classCounts[item.predictedClass] += 1;
    }
  }

  return {
    totalAssessments,
    latestAssessment,
    classCounts,
    firstAssessmentDate: history[history.length - 1].completedAt,
    latestAssessmentDate: latestAssessment.completedAt,
  };
}

/**
 * Backward compatibility alias for legacy callers.
 */
export const setGuestSession = createGuestProfile;
