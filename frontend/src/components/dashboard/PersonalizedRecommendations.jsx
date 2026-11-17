import React from 'react';
import {
  Moon,
  BookOpen,
  Users,
  Heart,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Compass,
} from 'lucide-react';

/**
 * PersonalizedRecommendations Component
 *
 * Provides educational, non-clinical wellness and lifestyle suggestions based on
 * the student's latest assessment responses (sleep, academics, social support, and coping).
 */
export default function PersonalizedRecommendations({ latestAssessment }) {
  if (!latestAssessment || !latestAssessment.answers) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-purple-100 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mx-auto">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900">
          No Assessment Data for Recommendations
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Complete a 20-question wellness assessment to unlock tailored self-care habits, study pacing suggestions, and rest routines.
        </p>
      </div>
    );
  }

  const answers = latestAssessment.answers;

  // Generate dynamic recommendation cards based on specific responses
  const recommendations = [];

  // 1. Sleep & Physical Recovery (Q7 sleep_quality, Q5 headache)
  const sleepAnswer = answers.q7;
  const headacheAnswer = answers.q5;
  if (
    sleepAnswer === 'poor' ||
    sleepAnswer === 'very_poor' ||
    sleepAnswer === 'fair' ||
    headacheAnswer === 'often' ||
    headacheAnswer === 'always'
  ) {
    recommendations.push({
      category: 'Sleep & Physical Recovery',
      icon: Moon,
      color: 'from-amber-500/10 to-orange-500/10 border-amber-200 text-amber-800',
      iconColor: 'text-amber-600 bg-amber-100',
      title: 'Supportive Sleep Hygiene & Rest Windows',
      description:
        'Your responses indicated occasional sleep difficulties or physical fatigue. Establishing a predictable 30-minute wind-down routine can help steady your body’s circadian rhythm.',
      actions: [
        'Dim screens and active study materials 45 minutes before bedtime.',
        'Keep caffeine and high-energy drinks to the earlier half of your day.',
        'Keep your bedroom slightly cool and dark for deeper restorative sleep.',
      ],
    });
  } else {
    recommendations.push({
      category: 'Rest & Routine',
      icon: Moon,
      color: 'from-emerald-500/10 to-teal-500/10 border-emerald-200 text-emerald-800',
      iconColor: 'text-emerald-600 bg-emerald-100',
      title: 'Maintain Your Restorative Sleep Routine',
      description:
        'You reported relatively steady sleep. Continuing your consistent sleep-wake timing helps preserve daytime energy and concentration during exam periods.',
      actions: [
        'Aim for a consistent bedtime within a 30-minute window.',
        'Take short 10-minute daylight walks in the morning to anchor your alertness.',
      ],
    });
  }

  // 2. Academic Pacing & Study Load (Q14 study_load, Q13 academic_performance, Q16 career)
  const studyLoad = answers.q14;
  const careerConcerns = answers.q16;
  if (
    studyLoad === 'heavy' ||
    studyLoad === 'overwhelming' ||
    careerConcerns === 'often' ||
    careerConcerns === 'always'
  ) {
    recommendations.push({
      category: 'Academic Pacing',
      icon: BookOpen,
      color: 'from-indigo-500/10 to-violet-500/10 border-indigo-200 text-indigo-900',
      iconColor: 'text-indigo-600 bg-indigo-100',
      title: 'Sustainable Workload & Time-Boxing',
      description:
        'When academic deadlines or future career decisions feel concentrated, breaking tasks into bite-sized segments prevents cognitive overload.',
      actions: [
        'Use the 25/5 Pomodoro rhythm: 25 minutes focused study, 5 minutes physical break.',
        'List your top 2 priorities each morning; treat everything else as secondary.',
        'Schedule fixed "off-the-clock" hours where coursework is completely paused.',
      ],
    });
  } else {
    recommendations.push({
      category: 'Academic Wellness',
      icon: BookOpen,
      color: 'from-violet-500/10 to-purple-500/10 border-violet-200 text-violet-900',
      iconColor: 'text-violet-600 bg-violet-100',
      title: 'Balanced Study & Life Cadence',
      description:
        'Your academic pacing appears manageable. Continuing proactive planning will keep stress low as major assessment dates approach.',
      actions: [
        'Review upcoming milestones two weeks ahead to avoid last-minute rushes.',
        'Incorporate active recall and study buddies for collaborative learning.',
      ],
    });
  }

  // 3. Social Support & Campus Life (Q17 social_support, Q18 peer_pressure)
  const socialSupport = answers.q17;
  if (
    socialSupport === 'low' ||
    socialSupport === 'very_low' ||
    socialSupport === 'moderate'
  ) {
    recommendations.push({
      category: 'Social Support & Connection',
      icon: Users,
      color: 'from-blue-500/10 to-cyan-500/10 border-blue-200 text-blue-900',
      iconColor: 'text-blue-600 bg-blue-100',
      title: 'Nurturing Supportive Human Connections',
      description:
        'Feeling supported by peers, family, or mentors is one of the strongest protective factors against academic burnout.',
      actions: [
        'Reach out to one friend or classmate today for a low-pressure coffee or tea.',
        'Join a campus club, study group, or shared interest circle.',
        'Remember that asking for help from a tutor or advisor is a strength, not a deficit.',
      ],
    });
  } else {
    recommendations.push({
      category: 'Community & Peer Support',
      icon: Users,
      color: 'from-purple-500/10 to-pink-500/10 border-purple-200 text-purple-900',
      iconColor: 'text-purple-600 bg-purple-100',
      title: 'Leveraging Strong Social Support',
      description:
        'You indicated having healthy social connections. Continuing to invest time in meaningful friendships builds mutual resilience.',
      actions: [
        'Schedule regular downtime with friends that does not revolve around studying.',
        'Check in on peers who might be navigating high academic workloads.',
      ],
    });
  }

  // 4. Everyday Coping & Emotional Grounding (Q1 anxiety, Q4 depression/low mood)
  recommendations.push({
    category: 'Mindfulness & Grounding',
    icon: Compass,
    color: 'from-violet-500/10 to-indigo-500/10 border-violet-200 text-violet-900',
    iconColor: 'text-violet-600 bg-violet-100',
    title: 'Daily Micro-Breaks & Grounding Routines',
    description:
      'Taking 3 to 5 minutes between lectures or tasks to reset your nervous system creates sustainable mental endurance.',
    actions: [
      'Try the Box Breathing exercise in the Stress Relief Centre tab below.',
      'Take 3 intentional, deep exhales whenever transitioning between study tasks.',
      'Practice non-judgmental self-talk during challenging study days.',
    ],
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold text-violet-700 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-violet-600" />
          <span>Supportive Recommendations</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Personalized Wellness Suggestions
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
          Tailored daily practices grounded in your latest assessment check-in. These are educational self-care guidelines designed to promote healthy daily rhythms.
        </p>
      </div>

      {/* Grid of Recommendation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {recommendations.map((rec, idx) => {
          const RecIcon = rec.icon;
          return (
            <div
              key={idx}
              className={`bg-white rounded-3xl p-6 sm:p-7 border shadow-xs space-y-4 hover:shadow-md transition-shadow border-slate-200/80`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${rec.iconColor}`}
                >
                  <RecIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {rec.category}
                  </span>
                  <h4 className="text-base font-bold text-slate-900">
                    {rec.title}
                  </h4>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {rec.description}
              </p>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Recommended Daily Actions:
                </span>
                <ul className="space-y-2 text-xs text-slate-700">
                  {rec.actions.map((act, actIdx) => (
                    <li key={actIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Non-clinical Disclaimer */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Educational Notice: </strong>
          MindScope suggestions are designed for self-reflection and general student well-being. They do not constitute medical or clinical diagnoses. If you are experiencing persistent distress, we encourage speaking with your university’s health counseling service.
        </p>
      </div>
    </div>
  );
}

