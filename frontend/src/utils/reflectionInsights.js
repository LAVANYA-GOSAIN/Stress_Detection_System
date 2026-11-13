/**
 * MindScope – Dynamic Client-Side Reflection Insights & Next-Steps Generator (20-Question Edition)
 *
 * Generates supportive, strictly non-clinical narratives, personal observations,
 * and practical daily habits from the student's 20 check-in responses (`q1`–`q20`).
 *
 * Respects privacy choices: `'prefer_not_to_say'` or omitted responses never trigger
 * negative insights or fabricated assumptions.
 */

/**
 * Count how many of the 20 questionnaire items currently have a response.
 *
 * @param {Record<string, any>} answers
 * @returns {number} Count between 0 and 20
 */
export function countAnsweredQuestions(answers = {}) {
  if (!answers || typeof answers !== 'object') {
    return 0;
  }

  let count = 0;
  for (let i = 1; i <= 20; i += 1) {
    const key = `q${i}`;
    const val = answers[key];
    if (typeof val === 'string' && val.trim().length > 0) {
      count += 1;
    }
  }
  return count;
}

/**
 * Generate a plain-language supportive narrative for one reflection dimension card.
 *
 * @param {Object} dimension - Dimension result object from `calculateReflectionScores`
 * @param {Record<string, any>} answers - Student response map (`q1`–`q20`)
 * @returns {string} Concise, non-clinical summary narrative
 */
export function getDimensionNarrative(dimension, answers = {}) {
  if (!dimension) {
    return 'Check-in summary is currently unavailable for this area.';
  }

  if (!dimension.isCoverageMet || dimension.score === null) {
    return `Too few responses were shared in ${dimension.name} to summarize a pattern reliably (${dimension.validAnswerCount} of ${dimension.totalPossibleCount} scored items answered).`;
  }

  const { id, score } = dimension;

  if (id === 'mind_emotions') {
    if (score >= 75) {
      return 'Your emotional reflections point toward steady calm, healthy self-confidence, and balanced day-to-day mood.';
    }
    if (score >= 50) {
      if (answers?.q1 === 'often' || answers?.q1 === 'almost_always') {
        return 'Your overall emotional reflection sits in a middle range, though frequent worry or tension may be asking for gentler breathing room.';
      }
      return 'You show pockets of emotional steadiness alongside moments of strain — pausing for short mental resets can help keep balance.';
    }
    return 'Recent days appear to have felt emotionally heavy, with recurring worry, low mood, or shaken confidence worth treating gently.';
  }

  if (id === 'physical_wellbeing') {
    if (score >= 75) {
      return 'Your physical check-in reflects restorative sleep and relatively few stress-related bodily discomforts like headaches or shortness of breath.';
    }
    if (score >= 50) {
      if (answers?.q7 === 'very_poor' || answers?.q7 === 'poor') {
        return 'Some physical aspects feel manageable, though disrupted sleep may be making it harder for your body to recharge overnight.';
      }
      return 'Your physical wellbeing appears mixed — regular hydration, posture breaks, and consistent rest could give your energy a steadier floor.';
    }
    return 'Physical signs such as poor sleep, recurring headaches, or breathing tension seem noticeably active right now and deserve gentler rest.';
  }

  if (id === 'living_environment') {
    if (score >= 75) {
      return 'Your surroundings appear supportive — with comfortable living conditions, reliable basic needs, manageable noise, and a strong sense of safety.';
    }
    if (score >= 50) {
      if (answers?.q9 === 'very_much' || answers?.q9 === 'extremely') {
        return 'Parts of your daily environment feel workable, though frequent noise around where you live or study may be draining focus.';
      }
      return 'Your daily environment provides some stability alongside a few practical friction points around comfort, quiet, or routine needs.';
    }
    return 'Environmental stressors such as noise, uncomfortable living conditions, safety concerns, or unmet daily needs seem to be weighing on your ease.';
  }

  if (id === 'academics_future') {
    if (score >= 75) {
      return 'Your academic reflections highlight manageable workload, supportive faculty interactions, and grounded confidence about what comes next.';
    }
    if (score >= 50) {
      if (answers?.q14 === 'very_demanding' || answers?.q14 === 'extremely_demanding') {
        return 'Even with steady anchors, your current study load feels demanding — breaking coursework into smaller checkpoints may ease pressure.';
      }
      return 'Academic life looks moderately balanced, with room to reduce worry around future plans or heavy assignment weeks.';
    }
    return 'Academic workload, performance satisfaction, or career uncertainty appears particularly intense right now — smaller priorities can help lighten the load.';
  }

  if (id === 'social_campus_life') {
    if (score >= 75) {
      return 'You appear well-anchored socially, experiencing steady support and healthy peer boundaries on campus.';
    }
    if (score >= 50) {
      if (answers?.q17 === 'no_support' || answers?.q17 === 'very_little_support') {
        return 'Campus social friction stays moderate overall, though having someone reliable to lean on could make daily pressures easier to carry.';
      }
      return 'Your social environment shows a blend of connection and occasional peer strain — staying close to trusted friends can help steady things.';
    }
    return 'Social interactions or campus dynamics seem strained right now — leaning on trusted people or campus support services is worth prioritizing.';
  }

  return 'Thank you for reflecting on this dimension as part of your check-in.';
}

/**
 * Build personalized positive anchors and gentle reflection prompts from `q1`–`q20`.
 *
 * @param {Record<string, any>} answers - Student response map
 * @param {Object|null} reflection - Optional output from `calculateReflectionScores`
 * @returns {{ strengths: Array, reflections: Array, focusArea: null }}
 */
export function buildPersonalInsights(answers = {}, reflection = null) {
  const strengths = [];
  const reflections = [];
  const dimensions = Array.isArray(reflection?.dimensions) ? reflection.dimensions : [];
  const dimById = Object.fromEntries(dimensions.map((d) => [d.id, d]));

  // --- Positive Patterns & Strengths ---

  if (
    (answers.q1 === 'never' || answers.q1 === 'rarely') &&
    (answers.q4 === 'never' || answers.q4 === 'rarely')
  ) {
    strengths.push({
      id: 'str_emotional_calm',
      category: 'Mind & Emotions',
      title: 'Steady Emotional Baseline',
      description: 'You reported infrequent worry and rare low mood recently, which provides a strong emotional buffer during busy weeks.',
    });
  } else if (answers.q2 === 'very_confident' || answers.q2 === 'extremely_confident') {
    strengths.push({
      id: 'str_self_esteem',
      category: 'Mind & Emotions',
      title: 'Grounded Self-Confidence',
      description: 'Feeling confident in yourself helps you stay anchored and recover perspective even when academic deadlines pile up.',
    });
  }

  if (answers.q7 === 'good' || answers.q7 === 'excellent') {
    strengths.push({
      id: 'str_sleep_recovery',
      category: 'Physical Wellbeing',
      title: 'Supportive Sleep Quality',
      description: 'Quality rest gives your mind and body reliable overnight recovery, helping sustain concentration and mood.',
    });
  }

  if (
    (answers.q10 === 'comfortable' || answers.q10 === 'very_comfortable') &&
    (answers.q11 === 'very_safe' || answers.q11 === 'completely_safe')
  ) {
    strengths.push({
      id: 'str_safe_living',
      category: 'Living Environment',
      title: 'Comfortable & Safe Living Space',
      description: 'Having a comfortable and safe place to return to creates helpful stability outside class hours.',
    });
  } else if (answers.q12 === 'often' || answers.q12 === 'always') {
    strengths.push({
      id: 'str_basic_needs',
      category: 'Living Environment',
      title: 'Consistent Basic Needs Support',
      description: 'Having reliable access to meals, rest space, and health essentials removes a major source of day-to-day friction.',
    });
  }

  if (answers.q13 === 'satisfied' || answers.q13 === 'very_satisfied') {
    strengths.push({
      id: 'str_academic_satisfaction',
      category: 'Academics & Future',
      title: 'Encouraging Academic Progress',
      description: 'Feeling satisfied with how your studies are going suggests your current learning approach is working in your favor.',
    });
  } else if (answers.q15 === 'very_supportive' || answers.q15 === 'extremely_supportive') {
    strengths.push({
      id: 'str_faculty_support',
      category: 'Academics & Future',
      title: 'Supportive Academic Relationships',
      description: 'Approachable and supportive instructors make it much easier to clarify doubts early and ask for help when needed.',
    });
  }

  if (answers.q17 === 'good_support' || answers.q17 === 'great_deal_of_support') {
    strengths.push({
      id: 'str_social_support',
      category: 'Social & Campus Life',
      title: 'Reliable Support Network',
      description: 'Knowing you have friends, family, or peers you can count on is one of the strongest everyday protectors against burnout.',
    });
  }

  if (
    strengths.length < 4 &&
    (answers.q19 === 'often' || answers.q19 === 'very_frequently')
  ) {
    strengths.push({
      id: 'str_extracurricular_rhythm',
      category: 'Social & Campus Life',
      title: 'Active Campus Engagement',
      description: 'Regular involvement in clubs, sports, or campus activities can offer healthy variety and connection beyond coursework.',
    });
  }

  // --- Gentle Attention Reflections (respecting 'prefer_not_to_say') ---

  if (
    answers.q1 === 'often' ||
    answers.q1 === 'almost_always' ||
    answers.q4 === 'often' ||
    answers.q4 === 'almost_always'
  ) {
    reflections.push({
      id: 'ref_emotional_load',
      category: 'Mind & Emotions',
      title: 'Frequent Worry or Heavy Mood',
      description: 'Noticeable worry or feeling down recently suggests you may be carrying more internal pressure than usual — brief pauses or talking with someone trusted can help.',
    });
  } else if (
    answers.q2 === 'not_at_all_confident' ||
    answers.q2 === 'slightly_confident'
  ) {
    reflections.push({
      id: 'ref_confidence_dip',
      category: 'Mind & Emotions',
      title: 'Shaken Day-to-Day Confidence',
      description: 'When confidence dips under pressure, tracking one small completed task each day can help rebuild momentum without perfectionism.',
    });
  }

  if (answers.q7 === 'very_poor' || answers.q7 === 'poor') {
    reflections.push({
      id: 'ref_sleep_strain',
      category: 'Physical Wellbeing',
      title: 'Disrupted Sleep Recovery',
      description: 'Poor sleep often makes academic demands and everyday worries feel sharper the next morning.',
    });
  } else if (
    answers.q5 === 'often' ||
    answers.q5 === 'almost_always' ||
    answers.q8 === 'often' ||
    answers.q8 === 'almost_always'
  ) {
    reflections.push({
      id: 'ref_physical_tension',
      category: 'Physical Wellbeing',
      title: 'Physical Signs of Tension',
      description: 'Recurring headaches or shortness of breath are gentle signals to step back from screens, hydrate, and check in with campus health if they persist.',
    });
  }

  if (
    answers.q9 === 'very_much' ||
    answers.q9 === 'extremely' ||
    answers.q10 === 'very_uncomfortable' ||
    answers.q10 === 'uncomfortable' ||
    answers.q11 === 'not_at_all_safe' ||
    answers.q11 === 'slightly_safe' ||
    answers.q12 === 'never' ||
    answers.q12 === 'rarely'
  ) {
    reflections.push({
      id: 'ref_environment_friction',
      category: 'Living Environment',
      title: 'Everyday Environment Friction',
      description: 'Noise, discomfort, safety unease, or stretched basic needs make it harder to settle and focus — identifying one quieter campus spot or resource may ease daily strain.',
    });
  }

  if (
    answers.q14 === 'very_demanding' ||
    answers.q14 === 'extremely_demanding' ||
    answers.q16 === 'very_worried' ||
    answers.q16 === 'extremely_worried' ||
    answers.q13 === 'very_dissatisfied' ||
    answers.q13 === 'dissatisfied'
  ) {
    reflections.push({
      id: 'ref_academic_pressure',
      category: 'Academics & Future',
      title: 'Heavy Study & Future Pressure',
      description: 'High study demands or strong worry about future career steps can build quickly; separating today’s top task from long-term unknowns can restore breathing space.',
    });
  }

  if (
    answers.q17 === 'no_support' ||
    answers.q17 === 'very_little_support' ||
    answers.q18 === 'often' ||
    answers.q18 === 'almost_always' ||
    answers.q20 === 'sometimes' ||
    answers.q20 === 'often' ||
    answers.q20 === 'almost_always'
  ) {
    reflections.push({
      id: 'ref_social_strain',
      category: 'Social & Campus Life',
      title: 'Social Strain or Low Support',
      description: 'Feeling short on support, pushed by peer pressure, or dealing with unwanted mistreatment deserves attentive care — consider leaning on trusted allies or campus advisors.',
    });
  }

  // Fallback dimension observation if reflection list is empty despite low dimension score
  if (reflections.length === 0) {
    const strainedDim = dimensions.find(
      (dim) => dim.isCoverageMet && typeof dim.score === 'number' && dim.score < 50
    );
    if (strainedDim) {
      reflections.push({
        id: `ref_dim_${strainedDim.id}`,
        category: strainedDim.name,
        title: `Extra Care Needed in ${strainedDim.name}`,
        description: `Your responses in ${dimById[strainedDim.id]?.name || strainedDim.name} suggest this area felt heavier than others recently.`,
      });
    }
  }

  return {
    strengths: strengths.slice(0, 4),
    reflections: reflections.slice(0, 4),
    focusArea: null,
  };
}

/**
 * Generate 3–5 tailored next steps and a lightweight 7-day rhythm aligned with `q1`–`q20`.
 *
 * @param {Record<string, any>} answers
 * @returns {{ steps: Array, weeklyPlan: Array }}
 */
export function buildNextSteps(answers = {}) {
  const steps = [];

  // 1. Mind & Emotions
  if (
    answers.q1 === 'often' ||
    answers.q1 === 'almost_always' ||
    answers.q4 === 'often' ||
    answers.q4 === 'almost_always'
  ) {
    steps.push({
      id: 'step_grounding_pause',
      title: 'Take a 3-minute physiological sigh or box-breathing pause',
      timeframe: 'Daily • 3 min',
      category: 'Mind & Emotions',
      reason: 'Based on frequent anxiety or heavy mood check-ins',
      action: 'Inhale slowly, add one short top-up breath, and exhale longer than you inhaled between classes or study blocks.',
    });
  }

  // 2. Physical Wellbeing
  if (answers.q7 === 'very_poor' || answers.q7 === 'poor' || answers.q7 === 'average') {
    steps.push({
      id: 'step_sleep_winddown',
      title: 'Set a 20-minute screen-free wind-down before bed',
      timeframe: 'Tonight • 20 min',
      category: 'Physical Wellbeing',
      reason: 'Aligned with supporting steadier sleep quality',
      action: 'Dim bright screens 20 minutes before sleep and keep next-morning reminders on paper so your mind can settle.',
    });
  }

  if (
    answers.q5 === 'often' ||
    answers.q5 === 'almost_always' ||
    answers.q8 === 'often' ||
    answers.q8 === 'almost_always'
  ) {
    steps.push({
      id: 'step_body_reset',
      title: 'Schedule micro eye, shoulder, and hydration breaks',
      timeframe: 'Every 60–90 min',
      category: 'Physical Wellbeing',
      reason: 'Helpful when headaches or physical tension show up',
      action: 'Look 20 feet away from your screen, drop your shoulders, drink water, and walk briefly between long study sessions.',
    });
  }

  // 3. Living Environment
  if (
    answers.q9 === 'very_much' ||
    answers.q9 === 'extremely' ||
    answers.q10 === 'very_uncomfortable' ||
    answers.q10 === 'uncomfortable'
  ) {
    steps.push({
      id: 'step_quiet_zone',
      title: 'Pick one reliable quiet study spot away from home noise',
      timeframe: 'This week',
      category: 'Living Environment',
      reason: 'Responds to noise or room comfort friction',
      action: 'Reserve an hour in a quiet library corner, empty classroom, or headphones-friendly zone for focused work.',
    });
  }

  // 4. Academics & Future
  if (
    answers.q14 === 'very_demanding' ||
    answers.q14 === 'extremely_demanding' ||
    answers.q16 === 'very_worried' ||
    answers.q16 === 'extremely_worried'
  ) {
    steps.push({
      id: 'step_next_small_task',
      title: 'Narrow today’s academic list to 2 concrete priorities',
      timeframe: 'Morning • 5 min',
      category: 'Academics & Future',
      reason: 'Helps lighten heavy study load and future worry',
      action: 'Write down only two finishable milestones for today — and reach out during office hours if anything feels unclear.',
    });
  }

  // 5. Social & Campus Life
  if (
    answers.q17 === 'no_support' ||
    answers.q17 === 'very_little_support' ||
    answers.q18 === 'often' ||
    answers.q18 === 'almost_always' ||
    answers.q20 === 'sometimes' ||
    answers.q20 === 'often' ||
    answers.q20 === 'almost_always'
  ) {
    steps.push({
      id: 'step_trusted_reachout',
      title: 'Check in with one trusted person or campus support desk',
      timeframe: 'This week • 10 min',
      category: 'Social & Campus Life',
      reason: 'Encourages steady connection and safe support',
      action: 'Send a brief message to a supportive friend, family member, mentor, or student counselor — you do not have to carry strain alone.',
    });
  }

  // Top up with gentle universal habits so students always receive 3–5 actionable ideas
  const defaultSteps = [
    {
      id: 'step_sunlight_walk',
      title: 'Get 10 minutes of daylight movement after class',
      timeframe: 'Daily • 10 min',
      category: 'Physical Wellbeing',
      reason: 'Supports daytime alertness and evening sleep rhythm',
      action: 'Take a relaxed walk outside without rushing through messages to help reset attention between tasks.',
    },
    {
      id: 'step_small_win_log',
      title: 'Note one small win at the end of the day',
      timeframe: 'Evening • 2 min',
      category: 'Mind & Emotions',
      reason: 'Reinforces balanced perspective and self-confidence',
      action: 'Jot down one thing you handled reasonably well today before wrapping up schoolwork.',
    },
    {
      id: 'step_weekly_reset',
      title: 'Protect a 1-hour unstructured recharge block',
      timeframe: 'Weekend • 60 min',
      category: 'Social & Campus Life',
      reason: 'Keeps academic and extracurricular commitments sustainable',
      action: 'Block off an hour with zero deadlines — whether for rest, hobbies, or relaxed company.',
    },
  ];

  for (const fallback of defaultSteps) {
    if (steps.length >= 4) break;
    if (!steps.some((s) => s.id === fallback.id)) {
      steps.push(fallback);
    }
  }

  const finalSteps = steps.slice(0, 5);

  const weeklyPlan = [
    {
      id: 'day_1',
      day: 'Day 1',
      focus: 'Mind & Breath',
      microAction: 'Pause for 3 slow exhales before starting your first study block.',
    },
    {
      id: 'day_2',
      day: 'Day 2',
      focus: 'Body & Hydration',
      microAction: 'Drink water and stretch your neck and shoulders mid-afternoon.',
    },
    {
      id: 'day_3',
      day: 'Day 3',
      focus: 'Focused Space',
      microAction: 'Spend 45 minutes working in the quietest, most comfortable spot available.',
    },
    {
      id: 'day_4',
      day: 'Day 4',
      focus: 'Study Clarity',
      microAction: 'Pick just 2 priority tasks for today and pause perfectionism on the rest.',
    },
    {
      id: 'day_5',
      day: 'Day 5',
      focus: 'Friendly Connection',
      microAction: 'Share a casual chat, walk, or message with someone supportive.',
    },
    {
      id: 'day_6',
      day: 'Day 6',
      focus: 'Unplug & Recharge',
      microAction: 'Protect an hour away from coursework notifications for genuine rest.',
    },
    {
      id: 'day_7',
      day: 'Day 7',
      focus: 'Evening Wind-Down',
      microAction: 'Dim screens 20 minutes early and prepare Monday’s first tiny step on paper.',
    },
  ];

  return {
    steps: finalSteps,
    weeklyPlan,
  };
}
