/**
 * MindScope Assessment Questionnaire Data (20-Question Feature-Aligned Specification)
 *
 * Structure:
 * - 5 Well-being Sections (4 Questions Each = 20 Questions Total):
 *   1. Mind & Emotions (Q1–Q4): anxiety_level, self_esteem, mental_health_history, depression
 *   2. Physical Wellbeing (Q5–Q8): headache, blood_pressure, sleep_quality, breathing_problem
 *   3. Living Environment (Q9–Q12): noise_level, living_conditions, safety, basic_needs
 *   4. Academics & Future (Q13–Q16): academic_performance, study_load, teacher_student_relationship, future_career_concerns
 *   5. Social & Campus Life (Q17–Q20): social_support, peer_pressure, extracurricular_activities, bullying
 *
 * Interaction formats reuse existing MindScope UI components:
 * - Visual emoji cards (`visual_rating` / `visual_selection`): Q2, Q7, Q13
 * - Single-select cards (`single_select`): Q1, Q3–Q6, Q8–Q12, Q14–Q20
 *
 * Privacy & MLOps note:
 * - Sensitive items (Q3, Q6, Q20) support "Prefer not to say", which stays missing (null).
 * - Dataset-range conversion rules in featureMapping.js represent proposed encodings only
 *   and are NOT validated by the original Kaggle dataset. Live student answers are NOT
 *   submitted to the ML /predict endpoint in this version.
 */

import {
  Brain,
  HeartPulse,
  Home,
  GraduationCap,
  Users,
} from 'lucide-react';

export const SECTIONS = [
  {
    id: 'mind_emotions',
    sectionNumber: 1,
    title: 'Mind & Emotions',
    subtitle: 'Anxiety frequency, self-confidence, mental health background, and low mood.',
    icon: Brain,
    questionIds: ['q1', 'q2', 'q3', 'q4'],
  },
  {
    id: 'physical_wellbeing',
    sectionNumber: 2,
    title: 'Physical Wellbeing',
    subtitle: 'Headaches, blood-pressure background, sleep quality, and breathing comfort.',
    icon: HeartPulse,
    questionIds: ['q5', 'q6', 'q7', 'q8'],
  },
  {
    id: 'living_environment',
    sectionNumber: 3,
    title: 'Living Environment',
    subtitle: 'Noise disturbance, living comfort, everyday safety, and essential needs.',
    icon: Home,
    questionIds: ['q9', 'q10', 'q11', 'q12'],
  },
  {
    id: 'academics_future',
    sectionNumber: 4,
    title: 'Academics & Future',
    subtitle: 'Academic satisfaction, workload demands, teacher support, and career outlook.',
    icon: GraduationCap,
    questionIds: ['q13', 'q14', 'q15', 'q16'],
  },
  {
    id: 'social_campus_life',
    sectionNumber: 5,
    title: 'Social & Campus Life',
    subtitle: 'Social support, peer pressure, extracurricular participation, and interpersonal safety.',
    icon: Users,
    questionIds: ['q17', 'q18', 'q19', 'q20'],
  },
];

export const CHAPTERS = SECTIONS;

/**
 * Catalogue of All 20 Questions in Exact ML Dataset Feature Order (Q1–Q20)
 */
export const QUESTIONS_MAP = {
  // ====================================================
  // SECTION 1 – MIND & EMOTIONS (Q1–Q4)
  // ====================================================
  q1: {
    id: 'q1',
    featureName: 'anxiety_level',
    section: 1,
    title: 'Anxiety Frequency',
    format: 'single_select',
    direction: '1 to 5, increasing anxiety',
    question: 'How frequently have you felt anxious, worried, or unable to relax recently?',
    helper: 'Reflect on how often worry or restlessness has shown up in your recent routine.',
    options: [
      { value: 'never', label: 'Never' },
      { value: 'rarely', label: 'Rarely' },
      { value: 'sometimes', label: 'Sometimes' },
      { value: 'often', label: 'Often' },
      { value: 'almost_always', label: 'Almost always' },
    ],
  },
  q2: {
    id: 'q2',
    featureName: 'self_esteem',
    section: 1,
    title: 'Self-Confidence',
    format: 'visual_rating',
    direction: '1 to 5, increasing self-esteem',
    question: 'How confident do you feel about yourself and your abilities?',
    helper: 'Consider your general trust in your own strengths, competence, and self-worth.',
    options: [
      { value: 'not_at_all_confident', label: 'Not at all confident', emoji: '🥺' },
      { value: 'slightly_confident', label: 'Slightly confident', emoji: '😟' },
      { value: 'moderately_confident', label: 'Moderately confident', emoji: '😐' },
      { value: 'very_confident', label: 'Very confident', emoji: '🙂' },
      { value: 'extremely_confident', label: 'Extremely confident', emoji: '😎' },
    ],
  },
  q3: {
    id: 'q3',
    featureName: 'mental_health_history',
    section: 1,
    title: 'Mental Health History',
    format: 'single_select',
    isSensitive: true,
    direction: 'Binary: No = 0, Yes = 1; Prefer not to say = missing',
    question: 'Have you previously experienced mental health difficulties?',
    helper: 'Your response is completely confidential. Selecting "Prefer not to say" leaves this undisclosed.',
    options: [
      { value: 'no', label: 'No' },
      { value: 'yes', label: 'Yes' },
      { value: 'prefer_not_to_say', label: 'Prefer not to say' },
    ],
  },
  q4: {
    id: 'q4',
    featureName: 'depression',
    section: 1,
    title: 'Low Mood & Interest',
    format: 'single_select',
    direction: '1 to 5, increasing depression-related experiences',
    question: 'How frequently have you felt low, sad, or lost interest in activities?',
    helper: 'Notice how often low mood or loss of motivation has appeared recently.',
    options: [
      { value: 'never', label: 'Never' },
      { value: 'rarely', label: 'Rarely' },
      { value: 'sometimes', label: 'Sometimes' },
      { value: 'often', label: 'Often' },
      { value: 'almost_always', label: 'Almost always' },
    ],
  },

  // ====================================================
  // SECTION 2 – PHYSICAL WELLBEING (Q5–Q8)
  // ====================================================
  q5: {
    id: 'q5',
    featureName: 'headache',
    section: 2,
    title: 'Headache Frequency',
    format: 'single_select',
    direction: '1 to 5, increasing frequency',
    question: 'How frequently have you experienced headaches recently?',
    helper: 'Think about tension headaches or recurring head discomfort over recent weeks.',
    options: [
      { value: 'never', label: 'Never' },
      { value: 'rarely', label: 'Rarely' },
      { value: 'sometimes', label: 'Sometimes' },
      { value: 'often', label: 'Often' },
      { value: 'almost_always', label: 'Almost always' },
    ],
  },
  q6: {
    id: 'q6',
    featureName: 'blood_pressure',
    section: 2,
    title: 'Blood Pressure Concern',
    format: 'single_select',
    isSensitive: true,
    direction: 'Provisional categorical: No = 1, Not sure = 2, Yes = 3; Prefer not to say = missing',
    noticeTitle: 'A quick note',
    notice:
      'Your answers help us understand your well-being patterns. If you\'re unsure, it\'s completely okay to select "Not sure" or "Prefer not to say". Your choice will be handled appropriately.',
    question: 'Have you been informed by a healthcare professional that you have a blood-pressure concern?',
    options: [
      { value: 'no', label: 'No' },
      { value: 'not_sure', label: 'Not sure' },
      { value: 'yes', label: 'Yes' },
      { value: 'prefer_not_to_say', label: 'Prefer not to say' },
    ],
  },
  q7: {
    id: 'q7',
    featureName: 'sleep_quality',
    section: 2,
    title: 'Sleep Quality',
    format: 'visual_selection',
    direction: '1 to 5, increasing sleep quality',
    question: 'How would you describe your sleep quality recently?',
    helper: 'Notice whether your sleep leaves you feeling restored or persistently tired.',
    options: [
      { value: 'very_poor', label: 'Very poor', emoji: '🌃' },
      { value: 'poor', label: 'Poor', emoji: '🥱' },
      { value: 'average', label: 'Average', emoji: '😐' },
      { value: 'good', label: 'Good', emoji: '😴' },
      { value: 'excellent', label: 'Excellent', emoji: '🌙' },
    ],
  },
  q8: {
    id: 'q8',
    featureName: 'breathing_problem',
    section: 2,
    title: 'Breathing Difficulties',
    format: 'single_select',
    direction: '1 to 5, increasing frequency',
    question: 'How frequently have you experienced breathing difficulties?',
    helper: 'Include shortness of breath, shallow breathing, or chest tightness during daily life.',
    options: [
      { value: 'never', label: 'Never' },
      { value: 'rarely', label: 'Rarely' },
      { value: 'sometimes', label: 'Sometimes' },
      { value: 'often', label: 'Often' },
      { value: 'almost_always', label: 'Almost always' },
    ],
  },

  // ====================================================
  // SECTION 3 – LIVING ENVIRONMENT (Q9–Q12)
  // ====================================================
  q9: {
    id: 'q9',
    featureName: 'noise_level',
    section: 3,
    title: 'Surrounding Noise',
    format: 'single_select',
    direction: '1 to 5, increasing disturbance',
    question: 'How much does noise in your surroundings disturb you?',
    helper: 'Consider ambient noise where you study, rest, or sleep.',
    options: [
      { value: 'not_at_all', label: 'Not at all' },
      { value: 'slightly', label: 'Slightly' },
      { value: 'moderately', label: 'Moderately' },
      { value: 'very_much', label: 'Very much' },
      { value: 'extremely', label: 'Extremely' },
    ],
  },
  q10: {
    id: 'q10',
    featureName: 'living_conditions',
    section: 3,
    title: 'Living Conditions',
    format: 'single_select',
    direction: '1 to 5, increasing comfort',
    question: 'How comfortable are your current living conditions?',
    helper: 'Reflect on space, physical comfort, and suitability for everyday rest and study.',
    options: [
      { value: 'very_uncomfortable', label: 'Very uncomfortable' },
      { value: 'uncomfortable', label: 'Uncomfortable' },
      { value: 'average', label: 'Average' },
      { value: 'comfortable', label: 'Comfortable' },
      { value: 'very_comfortable', label: 'Very comfortable' },
    ],
  },
  q11: {
    id: 'q11',
    featureName: 'safety',
    section: 3,
    title: 'Everyday Safety',
    format: 'single_select',
    direction: '1 to 5, increasing perceived safety',
    question: 'How safe do you feel in your everyday surroundings?',
    helper: 'Consider your accommodation, campus environment, and daily commute.',
    options: [
      { value: 'not_at_all_safe', label: 'Not at all safe' },
      { value: 'slightly_safe', label: 'Slightly safe' },
      { value: 'moderately_safe', label: 'Moderately safe' },
      { value: 'very_safe', label: 'Very safe' },
      { value: 'completely_safe', label: 'Completely safe' },
    ],
  },
  q12: {
    id: 'q12',
    featureName: 'basic_needs',
    section: 3,
    title: 'Essential Basic Needs',
    format: 'single_select',
    direction: '1 to 5, increasing fulfilment of basic needs',
    question: 'How consistently are your essential needs, such as food, accommodation, and basic resources, met?',
    helper: 'Reflect on reliable day-to-day access to nutrition, housing, and essential supplies.',
    options: [
      { value: 'never', label: 'Never' },
      { value: 'rarely', label: 'Rarely' },
      { value: 'sometimes', label: 'Sometimes' },
      { value: 'often', label: 'Often' },
      { value: 'always', label: 'Always' },
    ],
  },

  // ====================================================
  // SECTION 4 – ACADEMICS & FUTURE (Q13–Q16)
  // ====================================================
  q13: {
    id: 'q13',
    featureName: 'academic_performance',
    section: 4,
    title: 'Academic Satisfaction',
    format: 'visual_rating',
    direction: '1 to 5, increasing satisfaction',
    question: 'How satisfied are you with your academic performance?',
    helper: 'Reflect on your satisfaction with coursework progress, grades, and learning.',
    options: [
      { value: 'very_dissatisfied', label: 'Very dissatisfied', emoji: '😞' },
      { value: 'dissatisfied', label: 'Dissatisfied', emoji: '😕' },
      { value: 'neutral', label: 'Neutral', emoji: '😐' },
      { value: 'satisfied', label: 'Satisfied', emoji: '😊' },
      { value: 'very_satisfied', label: 'Very satisfied', emoji: '🌟' },
    ],
  },
  q14: {
    id: 'q14',
    featureName: 'study_load',
    section: 4,
    title: 'Academic Workload',
    format: 'single_select',
    direction: '1 to 5, increasing workload',
    question: 'How demanding is your current academic workload?',
    helper: 'Consider assignments, lectures, exams, and study hours required each week.',
    options: [
      { value: 'not_demanding', label: 'Not demanding' },
      { value: 'slightly_demanding', label: 'Slightly demanding' },
      { value: 'moderately_demanding', label: 'Moderately demanding' },
      { value: 'very_demanding', label: 'Very demanding' },
      { value: 'extremely_demanding', label: 'Extremely demanding' },
    ],
  },
  q15: {
    id: 'q15',
    featureName: 'teacher_student_relationship',
    section: 4,
    title: 'Teacher Supportiveness',
    format: 'single_select',
    direction: '1 to 5, increasing support',
    question: 'How supportive and approachable do you find your teachers?',
    helper: 'Think about reaching out during office hours, lectures, or academic advising.',
    options: [
      { value: 'not_at_all_supportive', label: 'Not at all supportive' },
      { value: 'slightly_supportive', label: 'Slightly supportive' },
      { value: 'moderately_supportive', label: 'Moderately supportive' },
      { value: 'very_supportive', label: 'Very supportive' },
      { value: 'extremely_supportive', label: 'Extremely supportive' },
    ],
  },
  q16: {
    id: 'q16',
    featureName: 'future_career_concerns',
    section: 4,
    title: 'Future Career Worries',
    format: 'single_select',
    direction: '1 to 5, increasing concern',
    question: 'How worried are you about your future career?',
    helper: 'Consider thoughts around placements, internships, post-graduation direction, or job security.',
    options: [
      { value: 'not_worried', label: 'Not worried' },
      { value: 'slightly_worried', label: 'Slightly worried' },
      { value: 'moderately_worried', label: 'Moderately worried' },
      { value: 'very_worried', label: 'Very worried' },
      { value: 'extremely_worried', label: 'Extremely worried' },
    ],
  },

  // ====================================================
  // SECTION 5 – SOCIAL & CAMPUS LIFE (Q17–Q20)
  // ====================================================
  q17: {
    id: 'q17',
    featureName: 'social_support',
    section: 5,
    title: 'Social Support',
    format: 'single_select',
    direction: '1 to 5, increasing support',
    question: 'How much support do you receive from friends, family, or other people around you?',
    helper: 'Think about having people you can rely on when things feel busy or difficult.',
    options: [
      { value: 'no_support', label: 'No support' },
      { value: 'very_little_support', label: 'Very little support' },
      { value: 'some_support', label: 'Some support' },
      { value: 'good_support', label: 'Good support' },
      { value: 'great_deal_of_support', label: 'A great deal of support' },
    ],
  },
  q18: {
    id: 'q18',
    featureName: 'peer_pressure',
    section: 5,
    title: 'Peer Pressure',
    format: 'single_select',
    direction: '1 to 5, increasing peer pressure',
    question: 'How frequently do you feel pressured by your peers or compare yourself with them?',
    helper: 'Reflect on social expectations, academic comparison, or pressure to match peers.',
    options: [
      { value: 'never', label: 'Never' },
      { value: 'rarely', label: 'Rarely' },
      { value: 'sometimes', label: 'Sometimes' },
      { value: 'often', label: 'Often' },
      { value: 'almost_always', label: 'Almost always' },
    ],
  },
  q19: {
    id: 'q19',
    featureName: 'extracurricular_activities',
    section: 5,
    title: 'Extracurricular Participation',
    format: 'single_select',
    direction: '1 to 5, increasing participation',
    question: 'How actively do you participate in extracurricular activities or hobbies?',
    helper: 'Include clubs, sports, societies, creative hobbies, or volunteering outside classes.',
    options: [
      { value: 'never', label: 'Never' },
      { value: 'rarely', label: 'Rarely' },
      { value: 'sometimes', label: 'Sometimes' },
      { value: 'often', label: 'Often' },
      { value: 'very_frequently', label: 'Very frequently' },
    ],
  },
  q20: {
    id: 'q20',
    featureName: 'bullying',
    section: 5,
    title: 'Bullying & Unwanted Behaviour',
    format: 'single_select',
    isSensitive: true,
    direction: '1 to 5, increasing frequency; Prefer not to say = missing',
    question: 'How frequently have you experienced bullying, harassment, or repeated unwanted behaviour?',
    helper: 'Your privacy is respected. Selecting "Prefer not to say" leaves this undisclosed.',
    options: [
      { value: 'never', label: 'Never' },
      { value: 'rarely', label: 'Rarely' },
      { value: 'sometimes', label: 'Sometimes' },
      { value: 'often', label: 'Often' },
      { value: 'almost_always', label: 'Almost always' },
      { value: 'prefer_not_to_say', label: 'Prefer not to say' },
    ],
  },
};

/**
 * Array of All 20 Questions in Sequential Order (Q1–Q20)
 */
export const QUESTIONS_LIST = Object.values(QUESTIONS_MAP);

/**
 * Pre-populated Sample Responses for Preview & Testing (20 Questions)
 */
export const SAMPLE_VIVA_RESPONSES = {
  q1: 'rarely',
  q2: 'very_confident',
  q3: 'no',
  q4: 'rarely',
  q5: 'rarely',
  q6: 'no',
  q7: 'good',
  q8: 'never',
  q9: 'slightly',
  q10: 'comfortable',
  q11: 'very_safe',
  q12: 'often',
  q13: 'satisfied',
  q14: 'moderately_demanding',
  q15: 'very_supportive',
  q16: 'slightly_worried',
  q17: 'good_support',
  q18: 'rarely',
  q19: 'sometimes',
  q20: 'never',
};
