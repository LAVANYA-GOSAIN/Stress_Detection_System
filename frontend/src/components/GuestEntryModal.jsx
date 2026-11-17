import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  UserCheck,
  Lock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  ChevronLeft,
  AlertCircle,
  KeyRound,
  RotateCcw,
} from 'lucide-react';
import { createGuestProfile, restoreGuestProfile } from '../services/guestStorage';

/**
 * GuestEntryModal Component
 *
 * Provides a guided, polished entry flow supporting isolated guest profiles:
 * 1. Choice screen:
 *    - "New Guest Profile" (generates unique Guest ID)
 *    - "Returning Guest" (restore profile via Guest ID)
 *    - "Login / Sign Up" (Coming Soon)
 * 2. New Guest Name entry screen ("What should we call you?").
 * 3. Returning Guest ID entry screen with validation and error messaging.
 */
export default function GuestEntryModal({
  isOpen = false,
  onClose,
  initialStep = 'choice', // 'choice' | 'name' | 'returning'
  targetDestination = '/dashboard',
}) {
  const navigate = useNavigate();
  const [step, setStep] = useState(initialStep);
  const [guestName, setGuestName] = useState('');
  const [guestIdInput, setGuestIdInput] = useState('');
  const [error, setError] = useState('');
  const nameInputRef = useRef(null);
  const idInputRef = useRef(null);

  // Sync step with initialStep prop when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(initialStep);
      setGuestName('');
      setGuestIdInput('');
      setError('');
    }
  }, [isOpen, initialStep]);

  // Auto-focus input according to active step
  useEffect(() => {
    if (!isOpen) return;

    if (step === 'name' && nameInputRef.current) {
      setTimeout(() => nameInputRef.current?.focus(), 100);
    } else if (step === 'returning' && idInputRef.current) {
      setTimeout(() => idInputRef.current?.focus(), 100);
    }
  }, [isOpen, step]);

  if (!isOpen) return null;

  // Handle New Guest profile creation
  const handleNewGuestSubmit = (e) => {
    if (e) e.preventDefault();

    const trimmed = guestName.trim();
    if (!trimmed) {
      setError('Please enter your name or nickname to continue.');
      return;
    }

    if (trimmed.length > 50) {
      setError('Name must be 50 characters or fewer.');
      return;
    }

    const result = createGuestProfile(trimmed);
    if (!result.success) {
      setError(result.error || 'Failed to create profile. Please try again.');
      return;
    }

    if (typeof onClose === 'function') {
      onClose();
    }

    navigate(targetDestination || '/dashboard');
  };

  // Handle Returning Guest restoration
  const handleRestoreSubmit = (e) => {
    if (e) e.preventDefault();

    const trimmed = guestIdInput.trim();
    if (!trimmed) {
      setError('Please enter your Guest ID.');
      return;
    }

    const result = restoreGuestProfile(trimmed);
    if (!result.success) {
      setError(result.error || 'Guest ID not found on this browser.');
      return;
    }

    if (typeof onClose === 'function') {
      onClose();
    }

    navigate(targetDestination || '/dashboard');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-purple-100 overflow-hidden animate-scaleUp">
        
        {/* Modal Top Header */}
        <div className="p-6 border-b border-purple-50 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            {step !== 'choice' && (
              <button
                type="button"
                onClick={() => {
                  setStep('choice');
                  setError('');
                }}
                className="p-1.5 -ml-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
                title="Go back"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-violet-700">
                <Sparkles className="w-3.5 h-3.5" />
                <span>MindScope Guest Experience</span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">
                {step === 'choice' && 'Welcome to MindScope'}
                {step === 'name' && 'New Guest Profile'}
                {step === 'returning' && 'Restore Existing Profile'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">

          {/* ===================================================================
              STEP 1: ENTRY SELECTION (NEW GUEST / RETURNING / LOGIN)
             =================================================================== */}
          {step === 'choice' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                Choose how you would like to continue. Each guest profile maintains its own separate assessment history on this browser.
              </p>

              <div className="space-y-3 pt-1">
                {/* OPTION 1: Continue as New Guest */}
                <button
                  type="button"
                  onClick={() => setStep('name')}
                  className="w-full text-left p-5 rounded-2xl border-2 border-violet-500 bg-violet-50/50 hover:bg-violet-100/60 hover:border-violet-600 transition-all flex items-start justify-between gap-4 group cursor-pointer shadow-xs"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-slate-900">
                          Create New Guest Profile
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-violet-200 text-violet-900 uppercase tracking-wide">
                          Recommended
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Get your own unique Guest ID and a fresh, isolated history on this browser.
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-violet-600 shrink-0 mt-1 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* OPTION 2: Returning Guest (Enter ID) */}
                <button
                  type="button"
                  onClick={() => setStep('returning')}
                  className="w-full text-left p-4.5 rounded-2xl border border-slate-200 hover:border-indigo-400 bg-white hover:bg-indigo-50/40 transition-all flex items-start justify-between gap-4 group cursor-pointer shadow-xs"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm sm:text-base font-bold text-slate-900 block">
                        Returning Guest? Enter Guest ID
                      </span>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Switch back to your existing profile using your saved Guest ID.
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 shrink-0 mt-1 transition-colors" />
                </button>

                {/* OPTION 3: Login / Sign Up (Coming Soon) */}
                <div className="p-4.5 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-2 opacity-90">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center shrink-0">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-sm sm:text-base font-bold text-slate-700 block">
                          Login / Sign Up
                        </span>
                        <span className="text-xs text-slate-500">
                          Account sync &amp; multi-device history
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                      Coming Soon
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed pl-13">
                    Cloud account authentication will be available in a future update. For now, enjoy full private access via your local Guest profile.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
              STEP 2: NEW GUEST NAME COLLECTION
             =================================================================== */}
          {step === 'name' && (
            <form onSubmit={handleNewGuestSubmit} className="space-y-5">
              <div className="space-y-1">
                <label
                  htmlFor="new-guest-name-input"
                  className="block text-base font-extrabold text-slate-900"
                >
                  What should we call you?
                </label>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Enter your name or preferred nickname. You will receive a unique Guest ID to restore your history anytime on this browser.
                </p>
              </div>

              <div className="space-y-1.5">
                <input
                  id="new-guest-name-input"
                  ref={nameInputRef}
                  type="text"
                  value={guestName}
                  onChange={(e) => {
                    setGuestName(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="e.g. Alex, Sam, Lavanya"
                  maxLength={50}
                  className={`w-full px-4 py-3 rounded-2xl border text-base text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all ${
                    error
                      ? 'border-rose-400 focus:ring-2 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-violet-600 focus:ring-3 focus:ring-violet-100'
                  }`}
                />

                {error && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 pt-1">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {/* Local Storage Transparency Notice */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/70 text-xs text-indigo-950 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Browser-Local Storage: </strong>
                  Your Guest ID and assessments are stored only in this browser&apos;s localStorage (not encrypted). No email, password, or cloud accounts are involved.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep('choice');
                    setError('');
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md shadow-violet-500/25 transition-all cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ===================================================================
              STEP 3: RETURNING GUEST ID ENTRY
             =================================================================== */}
          {step === 'returning' && (
            <form onSubmit={handleRestoreSubmit} className="space-y-5">
              <div className="space-y-1">
                <label
                  htmlFor="guest-id-restore-input"
                  className="block text-base font-extrabold text-slate-900"
                >
                  Enter Your Guest ID
                </label>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Enter the unique Guest ID previously assigned to your profile (e.g. <span className="font-mono text-violet-700 font-bold">MSG-8B42-7K19</span>).
                </p>
              </div>

              <div className="space-y-1.5">
                <input
                  id="guest-id-restore-input"
                  ref={idInputRef}
                  type="text"
                  value={guestIdInput}
                  onChange={(e) => {
                    setGuestIdInput(e.target.value.toUpperCase());
                    if (error) setError('');
                  }}
                  placeholder="MSG-XXXX-XXXX"
                  maxLength={25}
                  className={`w-full px-4 py-3 rounded-2xl border text-base font-mono uppercase tracking-wider text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all ${
                    error
                      ? 'border-rose-400 focus:ring-2 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-indigo-600 focus:ring-3 focus:ring-indigo-100'
                  }`}
                />

                {error && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 pt-1">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {/* Recovery Limitation Disclosure */}
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-950 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Device Notice: </strong>
                  Guest profiles exist only inside this specific browser&apos;s localStorage. A Guest ID cannot recover data from another computer, smartphone, or after clearing browser history.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep('choice');
                    setError('');
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restore Profile</span>
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
