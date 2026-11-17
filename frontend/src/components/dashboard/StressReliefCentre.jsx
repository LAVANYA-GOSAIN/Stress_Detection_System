import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  Play,
  Square,
  RotateCcw,
  Wind,
  CheckCircle2,
  ArrowRight,
  Info,
} from 'lucide-react';

/**
 * 4-4-4 Equal Breathing (Box Breathing) Phases
 * Inhale 4s -> Hold 4s -> Exhale 4s (continuous loop across all cycles)
 */
const BREATHING_444_PHASES = [
  {
    name: 'Inhale',
    label: 'Inhale slowly through your nose',
    cue: 'Take a slow, gentle breath in through your nose.',
    duration: 4,
    scale: 'scale-125 bg-violet-200 border-violet-500',
    aura: 'scale-125 bg-violet-300 opacity-50',
  },
  {
    name: 'Hold',
    label: 'Gently hold your breath and relax your shoulders',
    cue: 'Gently hold your breath and relax your shoulders.',
    duration: 4,
    scale: 'scale-125 bg-indigo-200 border-indigo-500',
    aura: 'scale-125 bg-indigo-300 opacity-50',
  },
  {
    name: 'Exhale',
    label: 'Now slowly breathe out',
    cue: 'Now slowly breathe out.',
    duration: 4,
    scale: 'scale-90 bg-violet-100 border-violet-400',
    aura: 'scale-90 bg-violet-200 opacity-30',
  },
];

/**
 * 4-7-8 Relaxing Breath Phases
 * Inhale 4s -> Hold 7s -> Exhale 8s (continuous loop across all cycles)
 */
const BREATHING_478_PHASES = [
  {
    name: 'Inhale',
    label: 'Inhale quietly through your nose',
    cue: 'Take a slow, gentle breath in through your nose.',
    duration: 4,
    scale: 'scale-125 bg-violet-200 border-violet-500',
    aura: 'scale-125 bg-violet-300 opacity-50',
  },
  {
    name: 'Hold',
    label: 'Gently hold your breath and relax your shoulders',
    cue: 'Gently hold your breath and relax your shoulders.',
    duration: 7,
    scale: 'scale-125 bg-indigo-200 border-indigo-500',
    aura: 'scale-125 bg-indigo-300 opacity-50',
  },
  {
    name: 'Exhale',
    label: 'Now slowly breathe out and allow your body to settle',
    cue: 'Now slowly breathe out and allow your body to settle.',
    duration: 8,
    scale: 'scale-90 bg-emerald-100 border-emerald-400',
    aura: 'scale-90 bg-emerald-200 opacity-30',
  },
];

/**
 * 5-4-3-2-1 Sensory Grounding Technique Stages
 * 5 See (12s) -> 4 Feel (12s) -> 3 Hear (12s) -> 2 Smell (10s) -> 1 Taste (10s)
 */
const GROUNDING_STAGES = [
  {
    stage: 5,
    title: 'Things You Can See',
    cue: 'Take a moment to look around you. Slowly notice five things you can see.',
    description: 'Look around your room. Notice 5 distinct colors, shapes, light reflections, or objects nearby.',
    duration: 12,
    badgeColor: 'bg-violet-600 text-white',
    accentBg: 'bg-violet-50/80 border-violet-200/80',
    activeRing: 'ring-2 ring-violet-500 border-violet-400 bg-violet-50/90 shadow-md',
  },
  {
    stage: 4,
    title: 'Things You Can Feel',
    cue: 'Notice four things you can physically feel: feet on the floor, clothing, or your seat.',
    description: 'Bring gentle attention to physical touch: feet on the floor, clothing against your skin, or your chair supporting you.',
    duration: 12,
    badgeColor: 'bg-indigo-600 text-white',
    accentBg: 'bg-indigo-50/80 border-indigo-200/80',
    activeRing: 'ring-2 ring-indigo-500 border-indigo-400 bg-indigo-50/90 shadow-md',
  },
  {
    stage: 3,
    title: 'Things You Can Hear',
    cue: 'Listen carefully. Notice three sounds around you, whether near or far.',
    description: 'Listen closely. Notice 3 sounds: distant traffic, the hum of a fan, clock ticking, or your own breath.',
    duration: 12,
    badgeColor: 'bg-blue-600 text-white',
    accentBg: 'bg-blue-50/80 border-blue-200/80',
    activeRing: 'ring-2 ring-blue-500 border-blue-400 bg-blue-50/90 shadow-md',
  },
  {
    stage: 2,
    title: 'Things You Can Smell',
    cue: 'Take a gentle breath and notice two different scents around you.',
    description: 'Notice 2 scents around you: fresh air, coffee, clean laundry, or recall a comforting scent if none are present.',
    duration: 10,
    badgeColor: 'bg-purple-600 text-white',
    accentBg: 'bg-purple-50/80 border-purple-200/80',
    activeRing: 'ring-2 ring-purple-500 border-purple-400 bg-purple-50/90 shadow-md',
  },
  {
    stage: 1,
    title: 'Thing You Can Taste',
    cue: 'Finally, notice one taste in your mouth. Take a moment to appreciate being present.',
    description: 'Notice 1 taste: a sip of water, lingering tea, or simply the neutral resting state of your mouth.',
    duration: 10,
    badgeColor: 'bg-emerald-600 text-white',
    accentBg: 'bg-emerald-50/80 border-emerald-200/80',
    activeRing: 'ring-2 ring-emerald-500 border-emerald-400 bg-emerald-50/90 shadow-md',
  },
];

const GROUNDING_COMPLETION = {
  cue: 'Well done. Take one more comfortable breath. You have taken a moment for yourself.',
  title: 'Grounding Session Complete',
  description: 'You have brought your awareness back to the present moment. Carry this calm clarity with you.',
};

export default function StressReliefCentre() {
  // 1. Paced Respiration State
  const [breathingExercise, setBreathingExercise] = useState('box'); // 'box' (4-4-4) or 'relax' (4-7-8)
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathingPhaseIndex, setBreathingPhaseIndex] = useState(0);
  const [breathingSecondsLeft, setBreathingSecondsLeft] = useState(4);
  const [breathingCue, setBreathingCue] = useState('');

  const breathingIntervalRef = useRef(null);
  const breathingPhaseIndexRef = useRef(0);
  const breathingSecondsLeftRef = useRef(4);

  const currentBreathingPhases =
    breathingExercise === 'box' ? BREATHING_444_PHASES : BREATHING_478_PHASES;
  const currentBreathingPhase =
    currentBreathingPhases[breathingPhaseIndex] || currentBreathingPhases[0];

  // 2. 5-4-3-2-1 Sensory Grounding State
  const [isGroundingActive, setIsGroundingActive] = useState(false);
  const [groundingStageIndex, setGroundingStageIndex] = useState(0);
  const [groundingSecondsLeft, setGroundingSecondsLeft] = useState(12);
  const [groundingCue, setGroundingCue] = useState('');
  const [isGroundingCompleted, setIsGroundingCompleted] = useState(false);

  const groundingIntervalRef = useRef(null);
  const groundingStageIndexRef = useRef(0);
  const groundingSecondsLeftRef = useRef(12);

  // Lifecycle cleanup
  useEffect(() => {
    return () => {
      if (breathingIntervalRef.current) {
        clearInterval(breathingIntervalRef.current);
        breathingIntervalRef.current = null;
      }
      if (groundingIntervalRef.current) {
        clearInterval(groundingIntervalRef.current);
        groundingIntervalRef.current = null;
      }
    };
  }, []);

  // =========================================================================
  // BREATHING EXERCISE HANDLERS
  // =========================================================================
  const handleStopBreathing = () => {
    setIsBreathingActive(false);
    if (breathingIntervalRef.current) {
      clearInterval(breathingIntervalRef.current);
      breathingIntervalRef.current = null;
    }
    setBreathingCue('');
    breathingPhaseIndexRef.current = 0;
    setBreathingPhaseIndex(0);
    const phases = breathingExercise === 'box' ? BREATHING_444_PHASES : BREATHING_478_PHASES;
    breathingSecondsLeftRef.current = phases[0].duration;
    setBreathingSecondsLeft(phases[0].duration);
  };

  const handleStartBreathing = () => {
    // If grounding was active, stop it
    if (isGroundingActive) {
      handleStopGrounding();
    }

    if (breathingIntervalRef.current) {
      clearInterval(breathingIntervalRef.current);
      breathingIntervalRef.current = null;
    }

    const phases = breathingExercise === 'box' ? BREATHING_444_PHASES : BREATHING_478_PHASES;
    breathingPhaseIndexRef.current = 0;
    setBreathingPhaseIndex(0);
    breathingSecondsLeftRef.current = phases[0].duration;
    setBreathingSecondsLeft(phases[0].duration);
    setIsBreathingActive(true);
    setBreathingCue(phases[0].cue);

    breathingIntervalRef.current = setInterval(() => {
      breathingSecondsLeftRef.current -= 1;
      const remaining = breathingSecondsLeftRef.current;
      setBreathingSecondsLeft(remaining);

      if (remaining <= 0) {
        const nextIndex = (breathingPhaseIndexRef.current + 1) % phases.length;
        breathingPhaseIndexRef.current = nextIndex;
        setBreathingPhaseIndex(nextIndex);

        const nextPhase = phases[nextIndex];
        breathingSecondsLeftRef.current = nextPhase.duration;
        setBreathingSecondsLeft(nextPhase.duration);
        setBreathingCue(nextPhase.cue);
      }
    }, 1000);
  };

  const handleRestartBreathing = () => {
    handleStopBreathing();
    setTimeout(() => {
      handleStartBreathing();
    }, 30);
  };

  const handleSwitchBreathing = (type) => {
    handleStopBreathing();
    setBreathingExercise(type);
    const phases = type === 'box' ? BREATHING_444_PHASES : BREATHING_478_PHASES;
    breathingPhaseIndexRef.current = 0;
    setBreathingPhaseIndex(0);
    breathingSecondsLeftRef.current = phases[0].duration;
    setBreathingSecondsLeft(phases[0].duration);
  };

  // =========================================================================
  // GROUNDING EXERCISE HANDLERS
  // =========================================================================
  const handleStopGrounding = () => {
    setIsGroundingActive(false);
    setIsGroundingCompleted(false);
    if (groundingIntervalRef.current) {
      clearInterval(groundingIntervalRef.current);
      groundingIntervalRef.current = null;
    }
    setGroundingCue('');
    groundingStageIndexRef.current = 0;
    setGroundingStageIndex(0);
    groundingSecondsLeftRef.current = GROUNDING_STAGES[0].duration;
    setGroundingSecondsLeft(GROUNDING_STAGES[0].duration);
  };

  const advanceGroundingStep = () => {
    const nextIdx = groundingStageIndexRef.current + 1;
    if (nextIdx < GROUNDING_STAGES.length) {
      groundingStageIndexRef.current = nextIdx;
      setGroundingStageIndex(nextIdx);
      const nextStage = GROUNDING_STAGES[nextIdx];
      groundingSecondsLeftRef.current = nextStage.duration;
      setGroundingSecondsLeft(nextStage.duration);
      setGroundingCue(nextStage.cue);
    } else {
      // Completed all 5 stages
      groundingStageIndexRef.current = GROUNDING_STAGES.length;
      setGroundingStageIndex(GROUNDING_STAGES.length);
      setIsGroundingCompleted(true);
      setIsGroundingActive(false);
      if (groundingIntervalRef.current) {
        clearInterval(groundingIntervalRef.current);
        groundingIntervalRef.current = null;
      }
      setGroundingCue(GROUNDING_COMPLETION.cue);
    }
  };

  const handleStartGrounding = () => {
    // If breathing was active, stop it
    if (isBreathingActive) {
      handleStopBreathing();
    }

    if (groundingIntervalRef.current) {
      clearInterval(groundingIntervalRef.current);
      groundingIntervalRef.current = null;
    }

    setIsGroundingCompleted(false);
    groundingStageIndexRef.current = 0;
    setGroundingStageIndex(0);
    const startStage = GROUNDING_STAGES[0];
    groundingSecondsLeftRef.current = startStage.duration;
    setGroundingSecondsLeft(startStage.duration);
    setIsGroundingActive(true);
    setGroundingCue(startStage.cue);

    groundingIntervalRef.current = setInterval(() => {
      groundingSecondsLeftRef.current -= 1;
      const remaining = groundingSecondsLeftRef.current;
      setGroundingSecondsLeft(remaining);

      if (remaining <= 0) {
        advanceGroundingStep();
      }
    }, 1000);
  };

  const handleRestartGrounding = () => {
    handleStopGrounding();
    setTimeout(() => {
      handleStartGrounding();
    }, 30);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-violet-700 uppercase tracking-wider">
          <Heart className="w-4 h-4 text-violet-600" />
          <span>Interactive Micro-Practices</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Stress Relief Centre
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
          Ground your nervous system in just 2 to 3 minutes using interactive paced respiration and sensory grounding exercises.
        </p>
      </div>

      {/* =========================================================================
          1. PACED BREATHING VISUALIZER (4-4-4 and 4-7-8)
         ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-purple-100 shadow-sm space-y-6">
        {/* Breathing Mode Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-50 pb-5">
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-slate-900">
              Paced Respiration Visualizer
            </h4>
            <p className="text-xs text-slate-500">
              Follow the expanding circle to regulate your heart rate across continuous cycles.
            </p>
          </div>

          <div className="inline-flex p-1 bg-slate-100 rounded-2xl self-start sm:self-center">
            <button
              type="button"
              onClick={() => handleSwitchBreathing('box')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                breathingExercise === 'box'
                  ? 'bg-white text-violet-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              4-4-4 Breathing
            </button>
            <button
              type="button"
              onClick={() => handleSwitchBreathing('relax')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                breathingExercise === 'relax'
                  ? 'bg-white text-violet-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              4-7-8 Relaxing Breath
            </button>
          </div>
        </div>

        {/* Breathing Animation Arena */}
        <div className="py-6 flex flex-col items-center justify-center space-y-6">
          <div className="relative flex items-center justify-center w-56 h-56">
            {/* Outer Pulsing Aura */}
            <div
              className={`absolute inset-0 rounded-full transition-transform duration-1000 ease-in-out blur-xl motion-reduce:transition-none motion-reduce:transform-none ${
                isBreathingActive ? currentBreathingPhase.aura : 'scale-100 bg-violet-100 opacity-40'
              }`}
            />

            {/* Main Interactive Circle (Expands on Inhale, Contracts on Exhale) */}
            <div
              className={`w-44 h-44 rounded-full border-4 flex flex-col items-center justify-center text-center shadow-md transition-all duration-1000 ease-in-out motion-reduce:transition-none motion-reduce:transform-none ${
                isBreathingActive
                  ? currentBreathingPhase.scale
                  : 'scale-100 bg-violet-50 border-violet-400'
              }`}
            >
              <Wind className="w-6 h-6 text-violet-600 mb-1" />
              <span className="text-3xl font-extrabold text-slate-900 font-mono">
                {breathingSecondsLeft}s
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-violet-700 px-3">
                {isBreathingActive ? currentBreathingPhase.name : 'Ready'}
              </span>
            </div>
          </div>

          {/* Phase Guidance Text */}
          <div className="text-center space-y-1">
            <p className="text-base font-bold text-slate-800">
              {isBreathingActive
                ? currentBreathingPhase.label
                : 'Click Start to begin continuous paced breathing'}
            </p>
            <p className="text-xs text-slate-500">
              {breathingExercise === 'box'
                ? '4-4-4 rhythm creates autonomic balance with equal 4s inhale, 4s hold, and 4s exhale.'
                : '4-7-8 technique extends exhalation to activate the parasympathetic relaxation response.'}
            </p>
          </div>

          {/* Visual Instruction Cue */}
          {isBreathingActive && breathingCue && (
            <div className="w-full max-w-lg mx-auto p-3 rounded-2xl bg-violet-50/90 border border-violet-200/90 text-center text-xs sm:text-sm text-violet-950 font-medium shadow-2xs animate-fadeIn">
              &ldquo;{breathingCue}&rdquo;
            </div>
          )}

          {/* Breathing Controls */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {!isBreathingActive ? (
              <button
                type="button"
                onClick={handleStartBreathing}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md shadow-violet-500/20 transition-all cursor-pointer focus:ring-2 focus:ring-violet-400 focus:outline-none"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Breathing</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleStopBreathing}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer focus:ring-2 focus:ring-rose-400 focus:outline-none"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Stop</span>
                </button>

                <button
                  type="button"
                  onClick={handleRestartBreathing}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300/80 transition-all cursor-pointer focus:ring-2 focus:ring-slate-400 focus:outline-none"
                  title="Restart breathing from phase 1"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restart</span>
                </button>
              </>
            )}
          </div>

          {/* Safety Disclaimer */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center max-w-md mx-auto pt-1 leading-normal">
            <Info className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span>
              Gentle reminder: If you feel lightheaded or uncomfortable, stop the exercise and return to your natural breathing rhythm.
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. 5-4-3-2-1 SENSORY GROUNDING TECHNIQUE
         ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm space-y-6">
        <div className="space-y-1">
          <h4 className="text-lg font-bold text-slate-900">
            5-4-3-2-1 Sensory Grounding Technique
          </h4>
          <p className="text-xs text-slate-500 max-w-xl">
            An interactive cognitive grounding exercise to pull focus out of racing thoughts and anchor awareness into the physical present.
          </p>
        </div>

        {/* Completion Card or Active Banner */}
        {isGroundingCompleted ? (
          <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h5 className="text-lg font-bold text-emerald-950">
              {GROUNDING_COMPLETION.title}
            </h5>
            <p className="text-xs sm:text-sm text-emerald-800 max-w-md mx-auto leading-relaxed">
              &ldquo;{GROUNDING_COMPLETION.cue}&rdquo;
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleRestartGrounding}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-emerald-950 bg-emerald-200 hover:bg-emerald-300 transition cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart Grounding</span>
              </button>
            </div>
          </div>
        ) : isGroundingActive && (
          <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/90 border border-indigo-200/90 space-y-2 text-center animate-fadeIn shadow-2xs">
            <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
              Step {5 - GROUNDING_STAGES[groundingStageIndex]?.stage + 1} of 5 &bull; {groundingSecondsLeft}s remaining
            </div>
            <p className="text-sm sm:text-base font-bold text-slate-900">
              &ldquo;{groundingCue}&rdquo;
            </p>
            <div className="w-full bg-indigo-200/70 h-1.5 rounded-full overflow-hidden max-w-xs mx-auto">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${
                    (groundingSecondsLeft /
                      (GROUNDING_STAGES[groundingStageIndex]?.duration || 12)) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>
        )}

        {/* 5 Stage Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {GROUNDING_STAGES.map((s, idx) => {
            const isCurrent = isGroundingActive && groundingStageIndex === idx;
            const isCompleted = isGroundingCompleted || (isGroundingActive && idx < groundingStageIndex);

            return (
              <div
                key={s.stage}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isCurrent
                    ? s.activeRing
                    : isCompleted
                    ? 'bg-emerald-50/50 border-emerald-200/80'
                    : `${s.accentBg} hover:border-slate-300`
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-7 h-7 rounded-xl font-extrabold text-xs flex items-center justify-center shrink-0 ${
                        isCompleted ? 'bg-emerald-600 text-white' : s.badgeColor
                      }`}
                    >
                      {isCompleted ? '✓' : s.stage}
                    </div>

                    {isCurrent && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-violet-700 bg-violet-100/90 px-1.5 py-0.5 rounded-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-pulse" />
                        <span>{groundingSecondsLeft}s</span>
                      </span>
                    )}
                  </div>

                  <div className="font-bold text-slate-900 text-xs">
                    {s.title}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {s.description}
                  </p>
                </div>

                {isCurrent && (
                  <div className="mt-3 pt-2 border-t border-violet-200/60 text-[10px] font-bold text-violet-700 text-center">
                    Observing now...
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Grounding Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {!isGroundingActive ? (
            <button
              type="button"
              onClick={handleStartGrounding}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md shadow-violet-500/20 transition-all cursor-pointer focus:ring-2 focus:ring-violet-400 focus:outline-none"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Grounding</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={advanceGroundingStep}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all cursor-pointer focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                title="Advance to next sensory stage immediately"
              >
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleStopGrounding}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer focus:ring-2 focus:ring-rose-400 focus:outline-none"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Stop</span>
              </button>

              <button
                type="button"
                onClick={handleRestartGrounding}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300/80 transition-all cursor-pointer focus:ring-2 focus:ring-slate-400 focus:outline-none"
                title="Restart grounding from 5 things you can see"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restart</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* =========================================================================
          3. PHYSICAL DESK-RESET PRACTICES
         ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm space-y-4">
        <h4 className="text-base font-bold text-slate-900">
          60-Second Physical Resets for Study Sessions
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
            <span className="font-bold text-slate-800 block">The 20-20-20 Screen Rule</span>
            <p>Every 20 minutes, look at an object 20 feet away for at least 20 seconds to prevent ocular fatigue.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
            <span className="font-bold text-slate-800 block">Shoulder & Neck Drops</span>
            <p>Inhale and shrug shoulders up to your ears; then forcefully drop them down as you exhale with relief.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
            <span className="font-bold text-slate-800 block">Hydration Anchor</span>
            <p>Drink a tall glass of cool water to replenish mental processing speed and rehydrate.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
