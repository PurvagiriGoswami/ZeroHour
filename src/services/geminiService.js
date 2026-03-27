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
    
    For each question, identify:
    1. The question statement.
    2. Four options (A, B, C, D).
    3. The correct answer (locate it from the text, often in an answer key or explanation section).
    4. The subject (GK, English, or Mathematics).
    5. The topic and subtopic (auto-detect based on content).
    6. The difficulty level (easy, medium, hard).
    7. The year (if mentioned in the text).

    Format the output as a JSON array of objects with the following structure:
    [
      {
        "subject": "...",
        "topic": "...",
        "subtopic": "...",
        "question": "...",
        "options": ["...", "...", "...", "..."],
        "correct_answer": "...",
        "year": "...",
        "difficulty": "..."
      }
    ]

    STRICT RULES:
    - Output ONLY valid JSON. No preamble, no markdown code blocks, just the JSON array.
    - If a question is incomplete or an answer cannot be found, ignore it.
    - Clean any broken text or formatting issues.
    - Ensure subject is one of: "GK", "English", "Mathematics".
    
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
    - Use formats like "Which of the following...", "Consider the following statements...", etc.
    - Do NOT duplicate any question.
    - The mock test must feel realistic and mimic the actual CDS exam difficulty.

    Format the final output as a JSON object with this EXACT structure:
    {
      "testId": "zerohour_dynamic_mock_${subject.toLowerCase()}",
      "metadata": {
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
          "correct_answer": "..."
        }
      ],
      "timeLimit": 7200,
      "negativeMarking": true,
      "markingScheme": { "correct": 1, "wrong": -0.33, "unattempted": 0 }
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
