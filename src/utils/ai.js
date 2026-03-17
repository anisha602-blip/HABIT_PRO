// ── AI API Helper — Groq (Free) ──
// Get your free API key at: https://console.groq.com/keys
// Free tier: 30 req/min, 14,400 req/day, no credit card needed
// Model: Llama 3.3 70B — very capable, fast inference

const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

export async function ai(prompt, systemPrompt = '', maxTokens = 1200) {
  const apiKey = import.meta.env.VITE_GROQ_KEY;
  if (!apiKey || apiKey.length < 10 || apiKey.startsWith('your_')) {
    throw new Error('Groq API key not configured. Add VITE_GROQ_KEY to your .env file. Get a free key at https://console.groq.com/keys');
  }

  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  const res = await fetch(GROQ_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error?.message || `Groq API error ${res.status}`);
  }

  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from Groq');
  return text;
}

export function extractJSON(raw) {
  // Strategy 1: Direct parse
  try {
    return JSON.parse(raw.trim());
  } catch {}

  // Strategy 2: Strip markdown code fences
  try {
    const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fence) return JSON.parse(fence[1].trim());
  } catch {}

  // Strategy 3: Extract outermost braces
  try {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      return JSON.parse(raw.slice(start, end + 1));
    }
  } catch {}

  throw new Error('Could not parse JSON from AI response');
}
