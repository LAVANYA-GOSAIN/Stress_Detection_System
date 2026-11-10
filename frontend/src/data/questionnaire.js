/**
 * MindScope Assessment Questionnaire Data (Final 22-Question Specification)
 *
 * Grounded in:
 * - 5 Well-being Sections (Mind & Emotions, Physical Well-being, Academics & Future, Environment & Support, Campus & Social Life)
 * - 22 Conversational, experience-based questions using mixed interaction formats:
 *   1. Visual answer cards with emojis (Q2, Q7, Q11)
 *   2. Multi-select cards with contradictory option safeguards (Q4, Q6, Q8, Q16, Q17, Q19, Q21)
 *   3. Scenario / Situational cards (Q1, Q5, Q10, Q20, Q22)
 *   4. Sensitive & frequency single-choice cards (Q3, Q9, Q12, Q13, Q14, Q15, Q18)
 * - Full alignment with all 20 Scikit-learn model parameters while keeping answer storage separate from ML inputs.
 */

import { 
  Brain, 
  HeartPulse, 
  GraduationCap, 
  Home, 
  Users 
} from 'lucide-react';

export const SECTIONS = [
  {
    id: 'mind_emotions',
    sectionNumber: 1,
    title: 'Mind & Emotions',
    subtitle: 'Understanding emotional experiences, confidence and peer pressure.',
    icon: Brain,
    questionIds: ['q1', 'q2', 'q3', 'q4', 'q5'],
  },
  {
    id: 'physical_wellbeing',
    sectionNumber: 2,
    title: 'Physical Well-being',
    subtitle: 'Understanding physical discomfort and sleep.',
    icon: HeartPulse,
    questionIds: ['q6', 'q7', 'q8', 'q9'],
  },
  {
    id: 'academics_future',
    sectionNumber: 3,
    title: 'Academics & Future',
    subtitle: 'Academic pressure, performance and future concerns.',
    icon: GraduationCap,
    questionIds: ['q10', 'q11', 'q12', 'q13'],
  },
  {
    id: 'environment_support',
    sectionNumber: 4,
    title: 'Environment & Support',
    subtitle: 'Living conditions, safety and support systems.',
    icon: Home,
    questionIds: ['q14', 'q15', 'q16', 'q17'],
  },
  {
    id: 'campus_social_life',
    sectionNumber: 5,
    title: 'Campus & Social Life',
    subtitle: 'Social experiences, extracurricular activities and personal challenges.',
    icon: Users,
    questionIds: ['q18', 'q19', 'q20', 'q21', 'q22'],
  },
];

export const CHAPTERS = SECTIONS;

/**
 * Catalogue of All 22 Experience-Based Questions (Preserving Exact User Specifications)
 */
export const QUESTIONS_MAP = {
  // ====================================================
  // SECTION 1 – MIND & EMOTIONS (5 Questions)
  // ====================================================
  q1: {
    id: 'q1',
    section: 1,
    title: 'Worry & Overload',
    format: 'single_select',
    question: 'When you have several things to worry about, what usually happens?',
    helper: 'Reflect on how your mind naturally processes multiple simultaneous concerns.',
    options: [
      { value: 'stay_calm', label: 'I stay calm and handle them one by one.' },
      { value: 'think_repeatedly', label: 'I think about them repeatedly.' },
      { value: 'feel_overwhelmed', label: 'I feel overwhelmed and struggle to focus.' },
      { value: 'avoid_thinking', label: 'I avoid thinking about them.' },
      { value: 'depends_on_situation', label: 'It depends on the situation.' },
    ],
  },
  q2: {
    id: 'q2',
    section: 1,
    title: 'Task Confidence',
    format: 'visual_rating',
    question: 'How confident do you feel when facing a difficult task?',
    helper: 'Your natural belief in your abilities, personal competence, and self-worth.',
    options: [
      { value: 'very_confident', label: 'Very confident', emoji: '😎' },
      { value: 'confident', label: 'Confident', emoji: '🙂' },
      { value: 'somewhat_confident', label: 'Somewhat confident', emoji: '😐' },
      { value: 'not_very_confident', label: 'Not very confident', emoji: '😟' },
      { value: 'not_confident_at_all', label: 'Not confident at all', emoji: '🥺' },
    ],
  },
  q3: {
    id: 'q3',
    section: 1,
    title: 'Mental Health Background',
    format: 'single_select',
    isSensitive: true,
    question: 'Have you ever experienced mental health difficulties or received support for them?',
    helper: 'Your response is entirely confidential. Selecting "Prefer not to say" is fully supported.',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'prefer_not_to_say', label: 'Prefer not to say' },
    ],
  },
  q4: {
    id: 'q4',
    section: 1,
    title: 'Recent Emotional State',
    format: 'multi_select',
    instruction: 'Select all that apply.',
    question: 'Which feelings have you experienced frequently over the past few weeks?',
    helper: 'Select any emotions that have been noticeable in your daily rhythms lately.',
    options: [
      { value: 'happy_positive', label: 'Happy and positive', emoji: '😊' },
      { value: 'calm_relaxed', label: 'Calm and relaxed', emoji: '😌' },
      { value: 'emotionally_exhausted', label: 'Emotionally exhausted', emoji: '😐' },
      { value: 'low_sad', label: 'Low or sad', emoji: '😔' },
      { value: 'anxious_worried', label: 'Anxious or worried', emoji: '😰' },
      { value: 'unmotivated', label: 'Unmotivated or uninterested', emoji: '😶' },
    ],
  },
  q5: {
    id: 'q5',
    section: 1,
    title: 'Peer Academic Dynamics',
    format: 'single_select',
    question: 'Imagine your friends are doing better academically than you. How would you most likely react?',
    helper: 'Reflecting on your typical inner response to peers outperforming you.',
    options: [
      { value: 'motivated_improve', label: 'Feel motivated to improve.' },
      { value: 'happy_for_them', label: 'Feel happy for them.' },
      { value: 'compare_myself', label: 'Compare myself with them.' },
      { value: 'pressured_inadequate', label: 'Feel pressured or inadequate.' },
      { value: 'try_not_to_think', label: 'Try not to think about it.' },
    ],
  },

  // ====================================================
  // SECTION 2 – PHYSICAL WELL-BEING (4 Questions)
  // ====================================================
  q6: {
    id: 'q6',
    section: 2,
    title: 'Physical Discomfort',
    format: 'multi_select',
    instruction: 'Select all that apply.',
    question: 'Which of these physical experiences have you noticed recently?',
    helper: 'Physical tension, breathing ease, and bodily fatigue during your daily routine.',
    options: [
      { value: 'headaches', label: 'Headaches' },
      { value: 'breathing_discomfort', label: 'Breathing discomfort' },
      { value: 'physical_tiredness', label: 'Physical tiredness' },
      { value: 'difficulty_sleeping', label: 'Difficulty sleeping' },
      { value: 'none_of_these', label: 'None of these', isExclusive: true },
      { value: 'prefer_not_to_say', label: 'Prefer not to say', isExclusive: true },
    ],
  },
  q7: {
    id: 'q7',
    section: 2,
    title: 'Sleep Quality',
    format: 'visual_selection',
    question: 'How would you describe your sleep quality recently?',
    helper: 'Notice whether your sleep leaves you with natural vitality or ongoing grogginess.',
    options: [
      { value: 'very_good', label: 'Very good – I wake up refreshed.', emoji: '🌙' },
      { value: 'good', label: 'Good – I usually get enough rest.', emoji: '😴' },
      { value: 'average', label: 'Average – My sleep is irregular.', emoji: '😐' },
      { value: 'poor', label: 'Poor – I often wake up tired.', emoji: '🥱' },
      { value: 'very_poor', label: 'Very poor – I struggle to sleep properly.', emoji: '🌃' },
    ],
  },
  q8: {
    id: 'q8',
    section: 2,
    title: 'Concentration Distractions',
    format: 'multi_select',
    instruction: 'Select all that apply.',
    question: 'What most often disturbs your concentration?',
    helper: 'External noise, personal thoughts, or surroundings that interrupt your focus.',
    options: [
      { value: 'background_noise', label: 'Background noise' },
      { value: 'notifications_phone', label: 'Notifications and phone usage' },
      { value: 'personal_worries', label: 'Personal worries' },
      { value: 'academic_workload', label: 'Academic workload' },
      { value: 'people_around', label: 'People around me' },
      { value: 'nothing_in_particular', label: 'Nothing in particular', isExclusive: true },
    ],
  },
  q9: {
    id: 'q9',
    section: 2,
    title: 'Cardiovascular / Blood Pressure History',
    format: 'single_select',
    isSensitive: true,
    notice: 'Pending dataset verification. Kept separate from ML inputs until the original dataset encoding is verified.',
    question: 'Have you ever been informed by a healthcare professional that you have a blood-pressure concern?',
    helper: 'Recorded transparently for reflection without converting into unverified numerical codes.',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'not_sure', label: 'Not sure' },
      { value: 'prefer_not_to_say', label: 'Prefer not to say' },
    ],
  },

  // ====================================================
  // SECTION 3 – ACADEMICS & FUTURE (4 Questions)
  // ====================================================
  q10: {
    id: 'q10',
    section: 3,
    title: 'Multiple Deadlines Scenario',
    format: 'single_select',
    question: 'You have multiple assignments and deadlines approaching together. What would you most likely do?',
    helper: 'Think about how you typically react when academic pressure stacks up.',
    options: [
      { value: 'create_plan', label: 'Create a plan and handle them one by one.' },
      { value: 'feel_pressured_manage', label: 'Feel pressured but try to manage.' },
      { value: 'struggle_decide', label: 'Struggle to decide where to start.' },
      { value: 'feel_overwhelmed', label: 'Feel overwhelmed.' },
      { value: 'postpone_last_moment', label: 'Postpone tasks until the last moment.' },
    ],
  },
  q11: {
    id: 'q11',
    section: 3,
    title: 'Academic Performance',
    format: 'visual_rating',
    question: 'How satisfied are you with your academic performance?',
    helper: 'Personal sense of coursework progress, grades, and learning confidence.',
    options: [
      { value: 'very_satisfied', label: 'Very satisfied', emoji: '🌟' },
      { value: 'satisfied', label: 'Satisfied', emoji: '😊' },
      { value: 'neutral', label: 'Neutral', emoji: '😐' },
      { value: 'dissatisfied', label: 'Dissatisfied', emoji: '😕' },
      { value: 'very_dissatisfied', label: 'Very dissatisfied', emoji: '😞' },
    ],
  },
  q12: {
    id: 'q12',
    section: 3,
    title: 'Approaching Instructors',
    format: 'single_select',
    question: 'If you are struggling with a subject, how comfortable are you approaching your teacher or faculty member?',
    helper: 'Attending office hours, asking questions after lectures, or reaching out via email.',
    options: [
      { value: 'very_comfortable', label: 'Very comfortable' },
      { value: 'somewhat_comfortable', label: 'Somewhat comfortable' },
      { value: 'not_sure', label: 'Not sure' },
      { value: 'uncomfortable', label: 'Uncomfortable' },
      { value: 'prefer_manage_own', label: 'I prefer to manage on my own.' },
    ],
  },
  q13: {
    id: 'q13',
    section: 3,
    title: 'Career & Future Thoughts',
    format: 'single_select',
    question: 'When you think about your career and future, what comes closest to your feelings?',
    helper: 'Thoughts about internships, career paths, job search competitiveness, or future plans.',
    options: [
      { value: 'excited_opportunities', label: 'Excited about the opportunities ahead.' },
      { value: 'hopeful_uncertain', label: 'Hopeful, but sometimes uncertain.' },
      { value: 'confused_direction', label: 'Confused about which direction to take.' },
      { value: 'worried_opportunity', label: 'Worried about getting a good opportunity.' },
      { value: 'very_anxious_future', label: 'Very anxious about my future.' },
    ],
  },

  // ====================================================
  // SECTION 4 – ENVIRONMENT & SUPPORT (4 Questions)
  // ====================================================
  q14: {
    id: 'q14',
    section: 4,
    title: 'Living Environment',
    format: 'single_select',
    question: 'How would you describe your current living environment?',
    helper: 'Comfort, personal space, and study suitability in your accommodation or home.',
    options: [
      { value: 'comfortable_peaceful', label: 'Comfortable and peaceful.' },
      { value: 'mostly_comfortable', label: 'Mostly comfortable.' },
      { value: 'sometimes_distracting', label: 'Sometimes distracting.' },
      { value: 'often_stressful_uncomfortable', label: 'Often stressful or uncomfortable.' },
      { value: 'prefer_not_to_say', label: 'Prefer not to say.' },
    ],
  },
  q15: {
    id: 'q15',
    section: 4,
    title: 'Surroundings Safety',
    format: 'single_select',
    question: 'How safe and comfortable do you feel in your surroundings?',
    helper: 'Perceived safety in your accommodation, walking around campus, and neighborhood.',
    options: [
      { value: 'completely_comfortable', label: 'Completely comfortable' },
      { value: 'mostly_comfortable', label: 'Mostly comfortable' },
      { value: 'sometimes_uncomfortable', label: 'Sometimes uncomfortable' },
      { value: 'often_uncomfortable', label: 'Often uncomfortable' },
      { value: 'prefer_not_to_say', label: 'Prefer not to say' },
    ],
  },
  q16: {
    id: 'q16',
    section: 4,
    title: 'Everyday Needs',
    format: 'multi_select',
    instruction: 'Select all that apply.',
    question: 'Which of your everyday needs are adequately met?',
    helper: 'Steady access to nutritious meals, rest, personal resources, and study space.',
    options: [
      { value: 'regular_meals', label: 'I have access to regular meals.' },
      { value: 'time_to_rest', label: 'I have enough time to rest.' },
      { value: 'comfortable_place_study', label: 'I have a comfortable place to study.' },
      { value: 'access_resources', label: 'I have access to the resources I need.' },
      { value: 'struggle_some_needs', label: 'I struggle with some of these needs.' },
      { value: 'prefer_not_to_say', label: 'Prefer not to say.', isExclusive: true },
    ],
  },
  q17: {
    id: 'q17',
    section: 4,
    title: 'Support Network',
    format: 'multi_select',
    instruction: 'Select all that apply.',
    question: 'When you are having a difficult day, who can you turn to?',
    helper: 'People, mentors, or resources you feel comfortable reaching out to for support.',
    options: [
      { value: 'family', label: 'Family' },
      { value: 'friends', label: 'Friends' },
      { value: 'teachers_mentors', label: 'Teachers or mentors' },
      { value: 'college_counsellor', label: 'College counsellor' },
      { value: 'handle_myself', label: 'I usually handle things myself.' },
      { value: 'no_one_currently', label: "I don't currently have someone to turn to.", isExclusive: true },
    ],
  },

  // ====================================================
  // SECTION 5 – CAMPUS & SOCIAL LIFE (5 Questions)
  // ====================================================
  q18: {
    id: 'q18',
    section: 5,
    title: 'Interpersonal Respect',
    format: 'single_select',
    isSensitive: true,
    question: 'Have you ever experienced bullying, exclusion or repeated hurtful behaviour?',
    helper: 'Unwanted hostility, verbal degradation, or intentional social exclusion.',
    options: [
      { value: 'never', label: 'Never' },
      { value: 'once_or_twice', label: 'Once or twice' },
      { value: 'sometimes', label: 'Sometimes' },
      { value: 'frequently', label: 'Frequently' },
      { value: 'prefer_not_to_say', label: 'Prefer not to say' },
    ],
  },
  q19: {
    id: 'q19',
    section: 5,
    title: 'Time Outside Academics',
    format: 'multi_select',
    instruction: 'Select all that apply.',
    question: 'How do you usually spend your time outside academics?',
    helper: 'Activities, clubs, fitness, or relaxation you pursue outside of study hours.',
    options: [
      { value: 'sports_physical', label: 'Sports or physical activities' },
      { value: 'clubs_college_events', label: 'Clubs and college events' },
      { value: 'hobbies_creative', label: 'Hobbies and creative activities' },
      { value: 'spending_time_friends', label: 'Spending time with friends' },
      { value: 'personal_projects_learning', label: 'Personal projects or learning' },
      { value: 'mostly_resting_alone', label: 'Mostly resting or spending time alone' },
    ],
  },
  q20: {
    id: 'q20',
    section: 5,
    title: 'Student Life Routine',
    format: 'single_select',
    question: 'Which situation sounds most like your current student life?',
    helper: 'Reflecting on your typical balance between studies and personal downtime.',
    options: [
      { value: 'healthy_balance', label: 'I have a healthy balance between academics and personal life.' },
      { value: 'academics_most_time', label: 'Academics take up most of my time.' },
      { value: 'struggle_manage_time', label: 'I struggle to manage my time.' },
      { value: 'rarely_time_myself', label: 'I rarely get time for myself.' },
      { value: 'routine_changes_frequently', label: 'My routine changes frequently.' },
    ],
  },
  q21: {
    id: 'q21',
    section: 5,
    title: 'Sources of Pressure',
    format: 'multi_select',
    instruction: 'Select all that apply.',
    question: 'What are your biggest sources of pressure as a student right now?',
    helper: 'Identify the areas of life where you feel the greatest expectations or strain.',
    options: [
      { value: 'academic_exams', label: 'Academic performance and examinations' },
      { value: 'placements_career', label: 'Placements and career expectations' },
      { value: 'family_expectations', label: 'Family expectations' },
      { value: 'financial_concerns', label: 'Financial concerns' },
      { value: 'social_relationships', label: 'Social relationships' },
      { value: 'personal_expectations', label: 'Personal expectations' },
      { value: 'other', label: 'Other' },
    ],
  },
  q22: {
    id: 'q22',
    section: 5,
    title: 'Priority for Improvement',
    format: 'single_select',
    question: 'If you could improve one thing in your life right now, what would it be?',
    helper: 'The single area where positive change would bring you the greatest relief or growth.',
    options: [
      { value: 'sleep_daily_routine', label: 'My sleep and daily routine' },
      { value: 'emotional_wellbeing', label: 'My emotional well-being' },
      { value: 'academic_performance', label: 'My academic performance' },
      { value: 'confidence', label: 'My confidence' },
      { value: 'social_relationships', label: 'My social relationships' },
      { value: 'time_management', label: 'My time management' },
      { value: 'career_clarity', label: 'My career clarity' },
    ],
  },
};

/**
 * Array of All 22 Questions in Sequential Order
 */
export const QUESTIONS_LIST = Object.values(QUESTIONS_MAP);

/**
 * Pre-populated Sample Responses for 1-Click Evaluation / Viva Demonstration (22 Questions)
 */
export const SAMPLE_VIVA_RESPONSES = {
  q1: 'stay_calm',
  q2: 'confident',
  q3: 'no',
  q4: ['happy_positive', 'calm_relaxed'],
  q5: 'motivated_improve',
  q6: ['difficulty_sleeping'],
  q7: 'good',
  q8: ['background_noise', 'academic_workload'],
  q9: 'no',
  q10: 'create_plan',
  q11: 'satisfied',
  q12: 'somewhat_comfortable',
  q13: 'hopeful_uncertain',
  q14: 'comfortable_peaceful',
  q15: 'mostly_comfortable',
  q16: ['regular_meals', 'time_to_rest', 'comfortable_place_study'],
  q17: ['friends', 'family'],
  q18: 'never',
  q19: ['sports_physical', 'hobbies_creative'],
  q20: 'healthy_balance',
  q21: ['academic_exams', 'placements_career'],
  q22: 'time_management',
};
