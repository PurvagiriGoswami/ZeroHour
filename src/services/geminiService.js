async function callGemini(prompt) {
  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  })
  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`)
  const { text, error } = await res.json()
  if (error) throw new Error(error)
  return text
}

function parseJSON(text) {
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

export const extractQuestionsFromText = async (rawText) => {
  const prompt = `
    You are an expert CDS Exam examiner. I will provide you with raw text extracted from a CDS exam PDF.
    Your task is to extract all valid MCQs (Multiple Choice Questions) from this text.

    EXTRACTION RULES:
    - Extract ONLY complete MCQs with all 4 options
    - Each question must have: question text, 4 options (A/B/C/D), correct answer, subject, topic, year, difficulty
    - Ignore incomplete questions, instructions, or non-MCQ content
    - Infer subject from context (Maths/English/General Knowledge)
    - Estimate difficulty: easy/medium/hard based on complexity
    - Generate a brief explanation for the correct answer

    OUTPUT FORMAT (strict JSON array):
    [
      {
        "id": "unique_id",
        "subject": "Maths|English|General Knowledge",
        "topic": "topic name",
        "year": 2023,
        "difficulty": "easy|medium|hard",
        "question": "question text",
        "options": ["option A", "option B", "option C", "option D"],
        "correct_answer": "A|B|C|D",
        "explanation": "brief explanation"
      }
    ]

    RAW TEXT:
    ${rawText}
  `
  try {
    const text = await callGemini(prompt)
    return parseJSON(text)
  } catch (error) {
    console.error('Error extracting questions:', error)
    throw error
  }
}

export const generateMockTest = async (pyqs, subject) => {
  const prompt = `
    You are an AI engine for ZeroHour, a defence exam prep platform.
    Your task is to generate a CDS-style mock test for the subject: ${subject}.
    
    I will provide you with a set of Previous Year Questions (PYQs) for reference.
    
    MOCK TEST REQUIREMENTS:
    - Total Questions: 100
    - 40% PYQs: Select the most relevant 40 questions from the provided PYQs.
    - 60% AI-generated: Generate 60 NEW questions that strictly follow the CDS exam style and pattern.
    - Distribution: 30% easy, 50% medium, 20% hard.

    OUTPUT FORMAT (strict JSON):
    {
      "testId": "zerohour_dynamic_mock_${subject.toLowerCase()}",
      "metadata": {
        "subject": "${subject}",
        "totalQuestions": 100,
        "pyqPercentage": 40,
        "generatedPercentage": 60,
        "difficultyDistribution": { "easy": 30, "medium": 50, "hard": 20 }
      },
      "questions": [
        {
          "source": "PYQ or AI",
          "subject": "${subject}",
          "topic": "...",
          "question": "...",
          "options": ["A", "B", "C", "D"],
          "correct_answer": "A|B|C|D",
          "explanation": "...",
          "difficulty": "easy|medium|hard"
        }
      ]
    }

    PYQs PROVIDED:
    ${JSON.stringify(pyqs.slice(0, 100))}

    STRICT RULES:
    - Output ONLY valid JSON.
    - Ensure all answers are correct.
    - Maintain high-quality CDS-level language.
  `
  try {
    const text = await callGemini(prompt)
    return parseJSON(text)
  } catch (error) {
    console.error('Error generating mock test:', error)
    throw error
  }
}
