// ── Vocab Intelligence Engine ── UPSC/CDS Standard

export const CDS_QUESTIONS = [
  // Synonyms
  {
    type: 'synonym',
    word: 'Ephemeral',
    question: 'Choose the word closest in meaning to "Ephemeral":',
    options: ['Transient', 'Eternal', 'Substantial', 'Perpetual'],
    correct: 'Transient',
    difficulty: 'hard',
    explanation: 'Ephemeral means lasting for a very short time. Transient is its closest synonym. Eternal and Perpetual are antonyms.'
  },
  {
    type: 'synonym',
    word: 'Benevolent',
    question: 'Which of these is a synonym for "Benevolent"?',
    options: ['Altruistic', 'Malevolent', 'Miserly', 'Avaricious'],
    correct: 'Altruistic',
    difficulty: 'medium',
    explanation: 'Benevolent means well-meaning and kindly. Altruistic (showing selfless concern for others) is the best fit.'
  },
  {
    type: 'synonym',
    word: 'Pragmatic',
    question: 'Select the synonym for "Pragmatic":',
    options: ['Utilitarian', 'Idealistic', 'Quixotic', 'Visionary'],
    correct: 'Utilitarian',
    difficulty: 'hard',
    explanation: 'Pragmatic means dealing with things sensibly and realistically. Utilitarian (designed to be useful or practical) is the closest distractor.'
  },
  {
    type: 'synonym',
    word: 'Candid',
    question: 'What is the synonym of "Candid"?',
    options: ['Forthright', 'Deceptive', 'Evasive', 'Ambiguous'],
    correct: 'Forthright',
    difficulty: 'medium',
    explanation: 'Candid means truthful and straightforward. Forthright is a direct synonym.'
  },
  {
    type: 'synonym',
    word: 'Diligent',
    question: 'Identify the synonym for "Diligent":',
    options: ['Assiduous', 'Lethargic', 'Cursory', 'Indolent'],
    correct: 'Assiduous',
    difficulty: 'hard',
    explanation: 'Diligent means showing care and conscientiousness in one\'s work. Assiduous is a high-level synonym.'
  },

  // Antonyms
  {
    type: 'antonym',
    word: 'Gregarious',
    question: 'Choose the word opposite in meaning to "Gregarious":',
    options: ['Reclusive', 'Sociable', 'Convivial', 'Amiable'],
    correct: 'Reclusive',
    difficulty: 'medium',
    explanation: 'Gregarious means fond of company; sociable. Reclusive (avoiding the company of other people) is the antonym.'
  },
  {
    type: 'antonym',
    word: 'Frugal',
    question: 'What is the antonym of "Frugal"?',
    options: ['Profligate', 'Parsimonious', 'Thrifty', 'Provident'],
    correct: 'Profligate',
    difficulty: 'hard',
    explanation: 'Frugal means sparing or economical. Profligate (recklessly extravagant or wasteful) is the opposite.'
  },
  {
    type: 'antonym',
    word: 'Lethargic',
    question: 'Select the antonym for "Lethargic":',
    options: ['Vivacious', 'Torpid', 'Languid', 'Phlegmatic'],
    correct: 'Vivacious',
    difficulty: 'medium',
    explanation: 'Lethargic means affected by lethargy; sluggish. Vivacious (attractively lively and animated) is the opposite.'
  },

  // Contextual Meaning
  {
    type: 'context',
    question: 'Which meaning of the word "Mundane" best fits the sentence: "The general found the administrative tasks quite mundane compared to the battlefield."',
    options: ['Banal and ordinary', 'Heavenly or spiritual', 'Exciting and novel', 'Complex and challenging'],
    correct: 'Banal and ordinary',
    difficulty: 'medium',
    explanation: 'In this context, mundane refers to something that is lacklustre or ordinary.'
  },
  {
    type: 'context',
    question: 'In the sentence: "His impeccable record made him a prime candidate for the special forces," what does "Impeccable" mean?',
    options: ['Beyond reproach or fault', 'Susceptible to bribery', 'Marked by several errors', 'Average and unnoteworthy'],
    correct: 'Beyond reproach or fault',
    difficulty: 'hard',
    explanation: 'Impeccable means in accordance with the highest standards; faultless.'
  },

  // Idioms & Phrases
  {
    type: 'idiom',
    question: 'The phrase "to bell the cat" means:',
    options: ['To undertake a dangerous task', 'To play with a pet', 'To be very friendly', 'To make a lot of noise'],
    correct: 'To undertake a dangerous task',
    difficulty: 'medium',
    explanation: 'This idiom comes from a fable about mice who wanted to hang a bell on a cat but found no one brave enough to do it.'
  },
  {
    type: 'idiom',
    question: 'What does "to burn the candle at both ends" imply?',
    options: ['To work excessively hard without rest', 'To be very wasteful with resources', 'To light a room brightly', 'To be undecided between two choices'],
    correct: 'To work excessively hard without rest',
    difficulty: 'medium',
    explanation: 'It refers to someone who is exhausting themselves by being busy from early morning until late at night.'
  },
  {
    type: 'idiom',
    question: 'The idiom "A bolt from the blue" refers to:',
    options: ['A complete surprise', 'A thunderstorm', 'A bright blue object', 'A planned event'],
    correct: 'A complete surprise',
    difficulty: 'easy',
    explanation: 'Something that happens suddenly and unexpectedly is called a bolt from the blue.'
  },

  // Fill in the Blanks
  {
    type: 'fill',
    question: 'The general\'s ___ speech inspired the troops to hold their ground despite the odds.',
    options: ['Rousing', 'Insipid', 'Tepid', 'Platitudinous'],
    correct: 'Rousing',
    difficulty: 'hard',
    explanation: 'A rousing speech is one that is exciting and stirring. Insipid and Tepid mean dull or unenthusiastic.'
  },
  {
    type: 'fill',
    question: 'The treaty was signed in a ___ manner to avoid public scrutiny before the final details were agreed upon.',
    options: ['Clandestine', 'Overt', 'Manifest', 'Palpable'],
    correct: 'Clandestine',
    difficulty: 'hard',
    explanation: 'Clandestine means kept secret or done secretively. Overt, Manifest, and Palpable all imply something visible or obvious.'
  },

  // One-Word Substitution
  {
    type: 'substitution',
    question: 'A person who fights for a cause or a country they don\'t necessarily believe in, solely for money:',
    options: ['Mercenary', 'Patriot', 'Partisan', 'Zealot'],
    correct: 'Mercenary',
    difficulty: 'medium',
    explanation: 'A mercenary is primarily concerned with making money at the expense of ethics or loyalty.'
  },
  {
    type: 'substitution',
    question: 'A speech or piece of writing that highly praises someone or something, typically someone who has just died:',
    options: ['Eulogy', 'Elegy', 'Satire', 'Lampoon'],
    correct: 'Eulogy',
    difficulty: 'hard',
    explanation: 'A eulogy is a commendatory oration or writing. An elegy is a poem of serious reflection, typically a lament for the dead.'
  },

  // Error Spotting
  {
    type: 'error',
    question: 'Identify the segment that contains a grammatical error: "Neither the captain (A) / nor the soldiers (B) / was aware of (C) / the impending ambush (D)."',
    options: ['A', 'B', 'C', 'D', 'No Error'],
    correct: 'C',
    difficulty: 'hard',
    explanation: 'When "neither/nor" connects a singular and a plural subject, the verb should agree with the nearer subject. Since "soldiers" is plural, it should be "were aware of".'
  },
  {
    type: 'error',
    question: 'Identify the segment that contains a grammatical error: "The reason why (A) / he failed the exam (B) / was because (C) / he did not study hard enough (D)."',
    options: ['A', 'B', 'C', 'D', 'No Error'],
    correct: 'C',
    difficulty: 'hard',
    explanation: 'Using "the reason why" along with "because" is redundant. It should be "The reason why... was that..." or "He failed... because...".'
  },
  {
    type: 'error',
    question: 'Identify the segment that contains a grammatical error: "If I was you (A) / I would not (B) / accept such (C) / a humiliating offer (D)."',
    options: ['A', 'B', 'C', 'D', 'No Error'],
    correct: 'A',
    difficulty: 'medium',
    explanation: 'In a conditional sentence expressing a hypothetical situation (subjunctive mood), "were" should be used instead of "was" regardless of the subject. Correct: "If I were you".'
  },

  // More high-quality questions to reach 30+
  {
    type: 'synonym',
    word: 'Abate',
    question: 'Which word is the closest synonym for "Abate"?',
    options: ['Subside', 'Escalate', 'Augment', 'Proliferate'],
    correct: 'Subside',
    difficulty: 'medium',
    explanation: 'Abate means to become less intense or widespread. Subside is its synonym.'
  },
  {
    type: 'antonym',
    word: 'Austere',
    question: 'What is the opposite of "Austere"?',
    options: ['Sybaritic', 'Spartan', 'Ascetic', 'Stark'],
    correct: 'Sybaritic',
    difficulty: 'hard',
    explanation: 'Austere means severe or strict in manner or appearance. Sybaritic means fond of luxury or pleasure, which is the opposite.'
  },
  {
    type: 'substitution',
    question: 'The practice of having more than one husband at the same time:',
    options: ['Polyandry', 'Polygyny', 'Polygamy', 'Bigamy'],
    correct: 'Polyandry',
    difficulty: 'hard',
    explanation: 'Polyandry is specific to multiple husbands. Polygyny is multiple wives. Polygamy is a general term for multiple spouses.'
  },
  {
    type: 'idiom',
    question: 'To "leave no stone unturned" means:',
    options: ['To try every possible course of action', 'To be a geologist', 'To work in a quarry', 'To give up easily'],
    correct: 'To try every possible course of action',
    difficulty: 'easy',
    explanation: 'This idiom means to search or investigate thoroughly.'
  },
  {
    type: 'fill',
    question: 'His arguments were so ___ that even his opponents found it hard to disagree with him.',
    options: ['Cogent', 'Specious', 'Fallacious', 'Incoherent'],
    correct: 'Cogent',
    difficulty: 'hard',
    explanation: 'Cogent means clear, logical, and convincing. Specious and Fallacious mean misleadingly attractive or based on a mistaken belief.'
  },
  {
    type: 'synonym',
    word: 'Eloquence',
    question: 'Choose the word that best expresses the meaning of "Eloquence":',
    options: ['Oratory', 'Silence', 'Stammer', 'Ineptitude'],
    correct: 'Oratory',
    difficulty: 'medium',
    explanation: 'Eloquence is fluent or persuasive speaking or writing. Oratory is the art of formal public speaking.'
  },
  {
    type: 'antonym',
    word: 'Ambiguous',
    question: 'Select the antonym for "Ambiguous":',
    options: ['Unequivocal', 'Equivocal', 'Obscure', 'Enigmatic'],
    correct: 'Unequivocal',
    difficulty: 'hard',
    explanation: 'Ambiguous means open to more than one interpretation. Unequivocal means leaving no doubt; unambiguous.'
  },
  {
    type: 'error',
    question: 'Identify the segment with an error: "Each of the students (A) / are required (B) / to submit (C) / their assignment by Monday (D)."',
    options: ['A', 'B', 'C', 'D', 'No Error'],
    correct: 'B',
    difficulty: 'medium',
    explanation: '"Each" is a singular pronoun and requires a singular verb. It should be "is required".'
  },
  {
    type: 'context',
    question: 'What does "Resilient" mean in: "The local economy proved to be remarkably resilient in the face of the global recession"?',
    options: ['Able to withstand or recover quickly', 'Fragile and easily broken', 'Dependent on external aid', 'Stagnant and unchanging'],
    correct: 'Able to withstand or recover quickly',
    difficulty: 'easy',
    explanation: 'Resilient means able to recoil or spring back into shape after bending, stretching, or being compressed; able to withstand or recover quickly from difficult conditions.'
  },
  {
    type: 'substitution',
    question: 'A person who is indifferent to pleasure or pain:',
    options: ['Stoic', 'Epicurean', 'Hedonist', 'Sadist'],
    correct: 'Stoic',
    difficulty: 'medium',
    explanation: 'A stoic person can endure pain or hardship without showing their feelings or complaining.'
  },
  {
    type: 'idiom',
    question: 'The idiom "to show the white feather" means:',
    options: ['To show signs of cowardice', 'To be very proud', 'To be peace-loving', 'To win a prize'],
    correct: 'To show signs of cowardice',
    difficulty: 'hard',
    explanation: 'Historically, a white feather in a gamecock\'s tail was considered a sign of inferior breeding and cowardice.'
  },
  {
    type: 'fill',
    question: 'The diplomat used ___ language to avoid offending either of the warring parties.',
    options: ['Equivocal', 'Blunt', 'Candid', 'Explicit'],
    correct: 'Equivocal',
    difficulty: 'hard',
    explanation: 'Equivocal language is open to more than one interpretation and is often used to be non-committal or avoid offense.'
  }
];

export function generateQuiz(count = 10, difficulty = 'mixed') {
  let pool = [...CDS_QUESTIONS];
  
  if (difficulty !== 'mixed') {
    pool = pool.filter(q => q.difficulty === difficulty);
  }

  // If pool is too small, fallback to mixed
  if (pool.length < count) pool = [...CDS_QUESTIONS];

  // Shuffle and pick
  const shuffled = pool.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
