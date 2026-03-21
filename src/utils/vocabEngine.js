// ── Vocab Intelligence Engine ── Auto-generate synonyms & antonyms

// Built-in CDS vocabulary dictionary for common words
const DICTIONARY = {
  // Common CDS vocabulary with synonyms and antonyms
  'ephemeral': { syn: ['transient', 'fleeting', 'temporary', 'short-lived'], ant: ['permanent', 'enduring', 'eternal', 'lasting'] },
  'benevolent': { syn: ['kind', 'generous', 'charitable', 'altruistic'], ant: ['malevolent', 'cruel', 'selfish', 'unkind'] },
  'arduous': { syn: ['difficult', 'strenuous', 'laborious', 'grueling'], ant: ['easy', 'simple', 'effortless', 'facile'] },
  'ubiquitous': { syn: ['omnipresent', 'pervasive', 'universal', 'widespread'], ant: ['rare', 'scarce', 'uncommon', 'limited'] },
  'cogent': { syn: ['convincing', 'compelling', 'persuasive', 'logical'], ant: ['weak', 'unconvincing', 'ineffective', 'feeble'] },
  'pragmatic': { syn: ['practical', 'realistic', 'sensible', 'rational'], ant: ['idealistic', 'impractical', 'unrealistic', 'theoretical'] },
  'prolific': { syn: ['productive', 'fruitful', 'abundant', 'fertile'], ant: ['unproductive', 'barren', 'infertile', 'scarce'] },
  'candid': { syn: ['honest', 'frank', 'forthright', 'sincere'], ant: ['dishonest', 'deceptive', 'secretive', 'evasive'] },
  'diligent': { syn: ['hardworking', 'industrious', 'assiduous', 'conscientious'], ant: ['lazy', 'idle', 'negligent', 'careless'] },
  'eloquent': { syn: ['articulate', 'fluent', 'expressive', 'persuasive'], ant: ['inarticulate', 'tongue-tied', 'incoherent', 'stammering'] },
  'frugal': { syn: ['thrifty', 'economical', 'sparing', 'prudent'], ant: ['extravagant', 'wasteful', 'lavish', 'profligate'] },
  'gregarious': { syn: ['sociable', 'outgoing', 'friendly', 'convivial'], ant: ['unsociable', 'introverted', 'reclusive', 'solitary'] },
  'hostile': { syn: ['antagonistic', 'aggressive', 'unfriendly', 'belligerent'], ant: ['friendly', 'amicable', 'peaceful', 'cordial'] },
  'imminent': { syn: ['impending', 'approaching', 'forthcoming', 'looming'], ant: ['distant', 'remote', 'unlikely', 'far-off'] },
  'jovial': { syn: ['cheerful', 'merry', 'jolly', 'genial'], ant: ['gloomy', 'morose', 'sullen', 'melancholy'] },
  'keen': { syn: ['eager', 'enthusiastic', 'avid', 'fervent'], ant: ['apathetic', 'indifferent', 'unenthusiastic', 'reluctant'] },
  'lethargic': { syn: ['sluggish', 'listless', 'torpid', 'languid'], ant: ['energetic', 'vigorous', 'active', 'lively'] },
  'meticulous': { syn: ['careful', 'thorough', 'precise', 'scrupulous'], ant: ['careless', 'sloppy', 'negligent', 'haphazard'] },
  'nefarious': { syn: ['wicked', 'villainous', 'sinister', 'heinous'], ant: ['virtuous', 'noble', 'righteous', 'honorable'] },
  'obscure': { syn: ['unclear', 'vague', 'ambiguous', 'cryptic'], ant: ['clear', 'obvious', 'evident', 'transparent'] },
  'prudent': { syn: ['cautious', 'wise', 'judicious', 'sensible'], ant: ['reckless', 'foolish', 'imprudent', 'careless'] },
  'resilient': { syn: ['tough', 'hardy', 'strong', 'adaptable'], ant: ['fragile', 'weak', 'vulnerable', 'brittle'] },
  'succinct': { syn: ['concise', 'brief', 'terse', 'compact'], ant: ['verbose', 'wordy', 'lengthy', 'long-winded'] },
  'tenacious': { syn: ['persistent', 'determined', 'resolute', 'steadfast'], ant: ['yielding', 'irresolute', 'weak-willed', 'fickle'] },
  'voracious': { syn: ['insatiable', 'ravenous', 'greedy', 'avid'], ant: ['moderate', 'abstemious', 'satisfied', 'content'] },
  'zealous': { syn: ['passionate', 'fervent', 'enthusiastic', 'ardent'], ant: ['apathetic', 'indifferent', 'lukewarm', 'half-hearted'] },
  'abate': { syn: ['decrease', 'diminish', 'subside', 'lessen'], ant: ['increase', 'intensify', 'amplify', 'escalate'] },
  'alleviate': { syn: ['ease', 'relieve', 'mitigate', 'reduce'], ant: ['aggravate', 'worsen', 'intensify', 'exacerbate'] },
  'austere': { syn: ['strict', 'severe', 'stern', 'spartan'], ant: ['luxurious', 'lavish', 'lenient', 'indulgent'] },
  'bolster': { syn: ['strengthen', 'support', 'reinforce', 'fortify'], ant: ['weaken', 'undermine', 'sabotage', 'diminish'] },
  'clandestine': { syn: ['secret', 'covert', 'surreptitious', 'stealthy'], ant: ['open', 'public', 'overt', 'transparent'] },
  'deter': { syn: ['discourage', 'prevent', 'dissuade', 'hinder'], ant: ['encourage', 'promote', 'facilitate', 'assist'] },
  'eminent': { syn: ['distinguished', 'prominent', 'renowned', 'notable'], ant: ['obscure', 'unknown', 'insignificant', 'ordinary'] },
  'futile': { syn: ['useless', 'pointless', 'vain', 'fruitless'], ant: ['useful', 'productive', 'effective', 'worthwhile'] },
  'gratuitous': { syn: ['unnecessary', 'unwarranted', 'uncalled-for', 'unjustified'], ant: ['necessary', 'justified', 'warranted', 'essential'] },
  'haughty': { syn: ['arrogant', 'proud', 'conceited', 'supercilious'], ant: ['humble', 'modest', 'meek', 'unassuming'] },
  'impeccable': { syn: ['flawless', 'faultless', 'perfect', 'immaculate'], ant: ['flawed', 'imperfect', 'defective', 'faulty'] },
  'lucid': { syn: ['clear', 'intelligible', 'transparent', 'coherent'], ant: ['unclear', 'confused', 'muddled', 'vague'] },
  'mundane': { syn: ['ordinary', 'routine', 'commonplace', 'banal'], ant: ['extraordinary', 'unusual', 'remarkable', 'exciting'] },
  'novice': { syn: ['beginner', 'learner', 'amateur', 'neophyte'], ant: ['expert', 'veteran', 'professional', 'master'] },
  'ominous': { syn: ['threatening', 'menacing', 'foreboding', 'sinister'], ant: ['promising', 'auspicious', 'encouraging', 'hopeful'] },
  'placate': { syn: ['appease', 'pacify', 'calm', 'soothe'], ant: ['provoke', 'irritate', 'antagonize', 'enrage'] },
  'repudiate': { syn: ['reject', 'deny', 'renounce', 'disown'], ant: ['accept', 'embrace', 'adopt', 'acknowledge'] },
  'sporadic': { syn: ['occasional', 'irregular', 'intermittent', 'infrequent'], ant: ['constant', 'regular', 'continuous', 'frequent'] },
  'taciturn': { syn: ['reserved', 'quiet', 'reticent', 'uncommunicative'], ant: ['talkative', 'loquacious', 'chatty', 'garrulous'] },
  'vindictive': { syn: ['vengeful', 'spiteful', 'malicious', 'revengeful'], ant: ['forgiving', 'merciful', 'compassionate', 'lenient'] },
  'wary': { syn: ['cautious', 'careful', 'vigilant', 'guarded'], ant: ['careless', 'reckless', 'unwary', 'heedless'] },
  'acumen': { syn: ['insight', 'shrewdness', 'astuteness', 'perception'], ant: ['ignorance', 'stupidity', 'obtuseness', 'dullness'] },
  'brevity': { syn: ['conciseness', 'shortness', 'terseness', 'pithiness'], ant: ['lengthiness', 'verbosity', 'prolixity', 'wordiness'] },
  'capricious': { syn: ['fickle', 'unpredictable', 'changeable', 'volatile'], ant: ['steady', 'constant', 'stable', 'predictable'] },
  'debilitate': { syn: ['weaken', 'enfeeble', 'incapacitate', 'enervate'], ant: ['strengthen', 'invigorate', 'energize', 'fortify'] },
  'enigma': { syn: ['mystery', 'puzzle', 'riddle', 'conundrum'], ant: ['clarity', 'solution', 'explanation', 'answer'] },
}

// Common word-pair mappings for synonym/antonym generation
const COMMON_PAIRS = {
  'good': { syn: ['excellent', 'fine', 'great', 'superb'], ant: ['bad', 'poor', 'terrible', 'awful'] },
  'bad': { syn: ['poor', 'terrible', 'awful', 'dreadful'], ant: ['good', 'excellent', 'fine', 'superb'] },
  'big': { syn: ['large', 'huge', 'enormous', 'massive'], ant: ['small', 'tiny', 'little', 'minute'] },
  'small': { syn: ['tiny', 'little', 'minute', 'miniature'], ant: ['big', 'large', 'huge', 'enormous'] },
  'happy': { syn: ['joyful', 'cheerful', 'delighted', 'elated'], ant: ['sad', 'unhappy', 'miserable', 'gloomy'] },
  'sad': { syn: ['unhappy', 'sorrowful', 'melancholy', 'dejected'], ant: ['happy', 'joyful', 'cheerful', 'elated'] },
  'fast': { syn: ['quick', 'rapid', 'swift', 'speedy'], ant: ['slow', 'sluggish', 'leisurely', 'gradual'] },
  'slow': { syn: ['sluggish', 'leisurely', 'gradual', 'unhurried'], ant: ['fast', 'quick', 'rapid', 'swift'] },
  'strong': { syn: ['powerful', 'mighty', 'robust', 'sturdy'], ant: ['weak', 'feeble', 'frail', 'delicate'] },
  'weak': { syn: ['feeble', 'frail', 'delicate', 'fragile'], ant: ['strong', 'powerful', 'mighty', 'robust'] },
  'brave': { syn: ['courageous', 'valiant', 'fearless', 'bold'], ant: ['cowardly', 'timid', 'fearful', 'afraid'] },
  'calm': { syn: ['peaceful', 'serene', 'tranquil', 'placid'], ant: ['agitated', 'turbulent', 'restless', 'stormy'] },
  'clever': { syn: ['smart', 'intelligent', 'brilliant', 'astute'], ant: ['stupid', 'foolish', 'dull', 'dim'] },
  'ancient': { syn: ['old', 'antique', 'archaic', 'primeval'], ant: ['modern', 'new', 'contemporary', 'recent'] },
  'beautiful': { syn: ['gorgeous', 'stunning', 'attractive', 'elegant'], ant: ['ugly', 'hideous', 'unsightly', 'repulsive'] },
  'create': { syn: ['make', 'build', 'construct', 'produce'], ant: ['destroy', 'demolish', 'ruin', 'dismantle'] },
  'defend': { syn: ['protect', 'guard', 'shield', 'safeguard'], ant: ['attack', 'assault', 'invade', 'expose'] },
  'expand': { syn: ['enlarge', 'extend', 'increase', 'broaden'], ant: ['shrink', 'contract', 'reduce', 'narrow'] },
  'generous': { syn: ['liberal', 'charitable', 'munificent', 'bountiful'], ant: ['stingy', 'miserly', 'selfish', 'greedy'] },
  'humble': { syn: ['modest', 'unassuming', 'meek', 'unpretentious'], ant: ['arrogant', 'proud', 'haughty', 'conceited'] },
  'important': { syn: ['significant', 'crucial', 'vital', 'essential'], ant: ['unimportant', 'trivial', 'insignificant', 'minor'] },
  'loyal': { syn: ['faithful', 'devoted', 'true', 'steadfast'], ant: ['disloyal', 'treacherous', 'unfaithful', 'fickle'] },
  'victory': { syn: ['triumph', 'conquest', 'success', 'win'], ant: ['defeat', 'failure', 'loss', 'rout'] },
}

// Merge all dictionaries
const FULL_DICT = { ...DICTIONARY, ...COMMON_PAIRS }

/**
 * Auto-generate synonyms for a word
 * @param {string} word
 * @returns {string[]}
 */
export function getSynonyms(word) {
  const w = word.toLowerCase().trim()
  if (FULL_DICT[w]) return FULL_DICT[w].syn

  // Try reverse lookup - if this word is a synonym of another word
  for (const [key, val] of Object.entries(FULL_DICT)) {
    if (val.syn.includes(w)) {
      return [key, ...val.syn.filter(s => s !== w)].slice(0, 4)
    }
  }
  return []
}

/**
 * Auto-generate antonyms for a word
 * @param {string} word
 * @returns {string[]}
 */
export function getAntonyms(word) {
  const w = word.toLowerCase().trim()
  if (FULL_DICT[w]) return FULL_DICT[w].ant

  // Try reverse lookup
  for (const [key, val] of Object.entries(FULL_DICT)) {
    if (val.ant.includes(w)) {
      return [key, ...val.ant.filter(a => a !== w)].slice(0, 4)
    }
    if (val.syn.includes(w)) {
      return val.ant
    }
  }
  return []
}

/**
 * Create a structured vocab entry from user input
 */
export function createVocabEntry({ word, meaning, example }) {
  return {
    id: Date.now() + Math.random(),
    word: word.trim(),
    meaning: meaning.trim(),
    example: example || '',
    synonyms: getSynonyms(word),
    antonyms: getAntonyms(word),
    createdAt: new Date().toISOString().split('T')[0],
    isImportant: false,
    revisionDates: [],
    learned: false,
  }
}

// Common CDS idioms & phrases for quiz generation
export const IDIOMS_AND_PHRASES = [
  { phrase: 'A bolt from the blue', meaning: 'A sudden and unexpected event', options: ['A sudden event', 'A loud noise', 'A blue object', 'A lightning strike'] },
  { phrase: 'Break the ice', meaning: 'To initiate conversation in an awkward situation', options: ['Start a conversation', 'Break something', 'Cool down', 'End a friendship'] },
  { phrase: 'Burn the midnight oil', meaning: 'To work or study late into the night', options: ['Study late at night', 'Waste resources', 'Start a fire', 'Cook at night'] },
  { phrase: 'Cry over spilt milk', meaning: 'To regret something that cannot be undone', options: ['Regret past mistakes', 'Waste milk', 'Feel hungry', 'Clean up a mess'] },
  { phrase: 'Hit the nail on the head', meaning: 'To describe exactly what is right', options: ['Be exactly right', 'Use a hammer', 'Hurt yourself', 'Build something'] },
  { phrase: 'Once in a blue moon', meaning: 'Very rarely', options: ['Very rarely', 'At night', 'During full moon', 'Monthly'] },
  { phrase: 'Bite the bullet', meaning: 'To endure a painful situation bravely', options: ['Face difficulty bravely', 'Eat something hard', 'Get injured', 'Shoot a gun'] },
  { phrase: 'Piece of cake', meaning: 'Something very easy to do', options: ['Very easy task', 'A dessert', 'A celebration', 'A small portion'] },
  { phrase: 'Spill the beans', meaning: 'To reveal a secret', options: ['Reveal a secret', 'Cook beans', 'Make a mess', 'Share food'] },
  { phrase: 'Under the weather', meaning: 'Feeling ill or sick', options: ['Feeling unwell', 'In the rain', 'Outside', 'Cold temperature'] },
  { phrase: 'The ball is in your court', meaning: 'It is your turn to take action', options: ['Your decision now', 'A sports game', 'In the playground', 'A tennis match'] },
  { phrase: 'Let the cat out of the bag', meaning: 'To reveal a secret accidentally', options: ['Reveal a secret', 'Free an animal', 'Open a bag', 'Pet a cat'] },
  { phrase: 'A penny for your thoughts', meaning: 'Asking what someone is thinking', options: ['What are you thinking?', 'Give me money', 'You look cheap', 'Save money'] },
  { phrase: 'Actions speak louder than words', meaning: 'What you do matters more than what you say', options: ['Deeds matter more', 'Be loud', 'Talk less', 'Exercise more'] },
  { phrase: 'Add insult to injury', meaning: 'To make a bad situation worse', options: ['Make things worse', 'Be rude', 'Get hurt', 'Start a fight'] },
  { phrase: 'At the drop of a hat', meaning: 'Without any hesitation', options: ['Without hesitation', 'Lose your hat', 'Fall down', 'Be clumsy'] },
  { phrase: 'Beat around the bush', meaning: 'To avoid getting to the point', options: ['Avoid the main topic', 'Hit plants', 'Walk in garden', 'Exercise outside'] },
  { phrase: 'Blessing in disguise', meaning: 'Something good that initially seems bad', options: ['Good thing seeming bad', 'A costume', 'A gift', 'A hidden treasure'] },
  { phrase: 'Cost an arm and a leg', meaning: 'Very expensive', options: ['Very expensive', 'Cause injury', 'A surgery', 'Physical exercise'] },
  { phrase: 'Every cloud has a silver lining', meaning: 'There is good in every bad situation', options: ['Hope in difficulty', 'Weather forecast', 'Expensive clouds', 'Silver jewelry'] },
]
