export const ENHANCED_PYQ_BANK = [
  // MODERN HISTORY
  {
    id: 'mh-001', subject: 'GK', topic: 'Modern History', subtopic: 'Freedom Struggle',
    type: 'conceptual', difficulty: 'hard', year: '2024',
    question: 'Consider the following statements regarding the Cabinet Mission Plan, 1946: \n1. It rejected the demand for a full-fledged Pakistan. \n2. It proposed a weak central government with control only over foreign affairs, defense, and communications.',
    options: ['Only 1', 'Only 2', 'Both 1 and 2', 'Neither 1 nor 2'],
    correct_answer: 'C',
    explanation: 'The Cabinet Mission Plan 1946 proposed a three-tier structure for the Union of India and rejected the partition demand while giving limited powers to the center.'
  },
  {
    id: 'mh-002', subject: 'GK', topic: 'Modern History', subtopic: 'Social Reforms',
    type: 'factual', difficulty: 'medium', year: '2023',
    question: 'Who among the following was the founder of the Atmiya Sabha established in 1815?',
    options: ['Raja Ram Mohan Roy', 'Debendranath Tagore', 'Ishwar Chandra Vidyasagar', 'Keshab Chandra Sen'],
    correct_answer: 'A',
    explanation: 'Raja Ram Mohan Roy founded Atmiya Sabha in 1815 to propagate monotheism and social reforms.'
  },
  // INDIAN POLITY
  {
    id: 'pl-001', subject: 'GK', topic: 'Indian Polity', subtopic: 'Constitutional Bodies',
    type: 'statement-based', difficulty: 'hard', year: '2024',
    question: 'With reference to the Election Commission of India, consider these statements:\n1. The Chief Election Commissioner can be removed from office in the same manner as a judge of the Supreme Court.\n2. The other Election Commissioners can be removed by the President on the recommendation of the CEC.',
    options: ['Only 1', 'Only 2', 'Both 1 and 2', 'Neither 1 nor 2'],
    correct_answer: 'C',
    explanation: 'Article 324 provides security of tenure to CEC. Other commissioners are removed based on CEC recommendation to ensure independence.'
  },
  {
    id: 'pl-002', subject: 'GK', topic: 'Indian Polity', subtopic: 'Fundamental Rights',
    type: 'conceptual', difficulty: 'medium', year: '2022',
    question: 'Which Article of the Indian Constitution protects the right of minorities to establish and administer educational institutions?',
    options: ['Article 28', 'Article 29', 'Article 30', 'Article 31'],
    correct_answer: 'C',
    explanation: 'Article 30 grants all minorities, whether based on religion or language, the right to establish and administer educational institutions of their choice.'
  },
  // GEOGRAPHY
  {
    id: 'geo-001', subject: 'GK', topic: 'Geography', subtopic: 'Physical Geography',
    type: 'factual', difficulty: 'medium', year: '2023',
    question: 'Which of the following ocean currents is a cold current?',
    options: ['Gulf Stream', 'Kuroshio Current', 'Canary Current', 'Brazil Current'],
    correct_answer: 'C',
    explanation: 'The Canary Current is a cold ocean current that flows along the west coast of Africa.'
  },
  {
    id: 'geo-002', subject: 'GK', topic: 'Geography', subtopic: 'Indian Geography',
    type: 'conceptual', difficulty: 'hard', year: '2024',
    question: 'The "Karewas" of Jammu and Kashmir are famous for the cultivation of which crop?',
    options: ['Saffron', 'Apple', 'Walnut', 'Almond'],
    correct_answer: 'A',
    explanation: 'Karewas are lacustrine deposits in the Kashmir Valley, highly fertile and world-famous for Saffron (Zafran) cultivation.'
  },
  // MATHEMATICS
  {
    id: 'mt-001', subject: 'Mathematics', topic: 'Arithmetic', subtopic: 'Number Systems',
    type: 'calculation-based', difficulty: 'medium', year: '2024',
    question: 'What is the unit digit of (7^95 - 3^58)?',
    options: ['0', '4', '6', '7'],
    correct_answer: 'B',
    explanation: 'Unit digit of 7^95: 95 mod 4 = 3, so 7^3 = 343 (Unit digit 3). Unit digit of 3^58: 58 mod 4 = 2, so 3^2 = 9. 13 - 9 = 4.'
  },
  {
    id: 'mt-002', subject: 'Mathematics', topic: 'Trigonometry', subtopic: 'Identities',
    type: 'calculation-based', difficulty: 'hard', year: '2023',
    question: 'If sin θ + cos θ = √2, then what is the value of sin^6 θ + cos^6 θ?',
    options: ['1/4', '1/2', '1/8', '1'],
    correct_answer: 'A',
    explanation: 'Squaring gives 1 + 2sinθcosθ = 2 => sinθcosθ = 1/2. sin^6θ + cos^6θ = (sin^2θ + cos^2θ)(sin^4θ - sin^2θcos^2θ + cos^4θ) = 1( (sin^2θ+cos^2θ)^2 - 3sin^2θcos^2θ ) = 1 - 3(1/4) = 1/4.'
  },
  // ENGLISH
  {
    id: 'en-001', subject: 'English', topic: 'Grammar', subtopic: 'Error Spotting',
    type: 'conceptual', difficulty: 'medium', year: '2024',
    question: 'Find the error: "Each of the students (A) / have finished (B) / their homework (C) / on time (D)."',
    options: ['A', 'B', 'C', 'D'],
    correct_answer: 'B',
    explanation: '"Each" is singular, so the verb should be "has finished" instead of "have finished".'
  },
  {
    id: 'en-002', subject: 'English', topic: 'Vocabulary', subtopic: 'Antonyms',
    type: 'factual', difficulty: 'hard', year: '2023',
    question: 'What is the antonym of "PERSPICACIOUS"?',
    options: ['Dull', 'Astute', 'Shrewd', 'Clear'],
    correct_answer: 'A',
    explanation: 'Perspicacious means having a ready insight into things (shrewd). Dull is the opposite.'
  }
];

// Helper to generate 500+ questions by repeating and varying metadata for demo purposes
// In a real scenario, this would be a full static JSON or DB fetch
for (let i = 11; i <= 500; i++) {
  const base = ENHANCED_PYQ_BANK[i % ENHANCED_PYQ_BANK.length];
  ENHANCED_PYQ_BANK.push({
    ...base,
    id: `pyq-${i}`,
    question: `[MOCK-VAR-${i}] ${base.question}`,
    difficulty: i % 3 === 0 ? 'hard' : (i % 2 === 0 ? 'medium' : 'easy')
  });
}
