export const config = { runtime: 'edge' }

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const { prompt } = await req.json()
  if (!prompt) return new Response('Missing prompt', { status: 400 })

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return new Response('API key not configured', { status: 500 })

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  )

  if (!res.ok) {
    const err = await res.text()
    return new Response(JSON.stringify({ error: err }), { status: res.status })
  }

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  return new Response(JSON.stringify({ text }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
