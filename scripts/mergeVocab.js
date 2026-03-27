import fs from 'fs';

const input1 = JSON.parse(fs.readFileSync('input1.json', 'utf8'));
const input2 = JSON.parse(fs.readFileSync('input2.json', 'utf8'));

const existingVocab = input1.vocab_bank;
let maxId = 0;
for (const word of existingVocab) {
  if (word.id > maxId) {
    maxId = word.id;
  }
}

// Convert input2 format to input1 format
const newWords = input2.map(item => {
  maxId++;
  return {
    id: maxId,
    word: item.word,
    part_of_speech: "", // Not provided in input2
    meaning: item.meaning,
    hindi_meaning: "", // Not provided
    synonyms: item.synonyms || [],
    antonyms: item.antonyms || [],
    example_sentence: item.example || "",
    exam_source: item.examSource || [],
    frequency: item.frequency >= 3 ? "high" : (item.frequency === 2 ? "medium" : "low"),
    difficulty: item.importance === "high" ? "hard" : "medium",
    pyq: null
  };
});

input1.vocab_bank = [...existingVocab, ...newWords];
input1.meta.total_words = input1.vocab_bank.length;

fs.writeFileSync('merged_vocab_bank.json', JSON.stringify(input1, null, 2), 'utf8');
console.log('Successfully merged into merged_vocab_bank.json');
