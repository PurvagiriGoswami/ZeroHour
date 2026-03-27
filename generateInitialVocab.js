import fs from 'fs';

const merged = JSON.parse(fs.readFileSync('merged_vocab_bank.json', 'utf8'));

const initialVocab = merged.vocab_bank.map(v => {
  return {
    id: v.id,
    word: v.word,
    meaning: v.meaning,
    example: v.example_sentence || '',
    synonyms: v.synonyms || [],
    antonyms: v.antonyms || [],
    createdAt: "2026-03-21",
    isImportant: v.difficulty === 'hard' || v.frequency === 'high' || v.importance === 'high',
    revisionDates: [],
    learned: false,
    tag: v.exam_source && v.exam_source.length ? 'English' : 'English' // Keep tag as English for consistency
  };
});

fs.writeFileSync('src/utils/initialVocab.js', `export const INITIAL_VOCAB = ${JSON.stringify(initialVocab, null, 2)};\n`, 'utf8');
console.log('Created src/utils/initialVocab.js');
