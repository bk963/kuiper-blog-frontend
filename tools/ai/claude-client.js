/**
 * Claude API Client für Content-Engine (Phase 5)
 */
const API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.CLAUDE_MODEL || 'claude-opus-4-6';

export async function claudeChat(system, userMessage, opts = {}) {
  if (!API_KEY) return { error: 'ANTHROPIC_API_KEY nicht gesetzt' };
  const { maxTokens = 4000, temperature = 0.7 } = opts;
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY, 'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL, max_tokens: maxTokens, temperature,
      system, messages: [{ role: 'user', content: userMessage }],
    }),
  });
  const j = await r.json();
  if (!r.ok) return { error: j.error?.message || 'API error', details: j };
  return { text: j.content?.[0]?.text || '', usage: j.usage };
}

export async function generateArticle({ keyword, category, pillar, targetWords = 1500 }) {
  const system = `Du bist Experte für ${category} in Unternehmen. Schreibe sachlich, praxisnah, SEO-optimiert auf Deutsch.
Struktur: H2-Abschnitte mit H3-Unterpunkten, Bulletlisten wo sinnvoll, 1 FAQ-Block am Ende.
Ziel: ${targetWords} Wörter, Fokus-Keyword: "${keyword}".
Nur gültiges HTML ohne Wrapper, ohne <html>/<body>-Tags. Beginne direkt mit <h2>.`;
  const userMsg = `Schreibe einen vollständigen Blog-Artikel zum Keyword "${keyword}" im Kontext "${pillar || category}".`;
  return claudeChat(system, userMsg, { maxTokens: 8000, temperature: 0.6 });
}

export async function enhanceSeo({ title, content }) {
  const system = `Du bist SEO-Experte. Analysiere den gegebenen Artikel und gib als reines JSON zurück:
{"meta_title":"...<=60 Zeichen", "meta_description":"...<=160 Zeichen", "focus_keyword":"...", "secondary_keywords":["...","..."], "faqs":[{"q":"...","a":"..."}]}`;
  const userMsg = `Titel: ${title}\n\nInhalt:\n${(content || '').slice(0, 6000)}`;
  const r = await claudeChat(system, userMsg, { maxTokens: 2000, temperature: 0.3 });
  if (r.error) return r;
  try {
    const match = r.text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : { error: 'no JSON returned' };
  } catch (e) { return { error: e.message, raw: r.text }; }
}

export async function expandContent({ title, content, instructions }) {
  const system = `Du erweiterst bestehende Blog-Artikel. Antwort als reines HTML ohne Wrapper.`;
  const userMsg = `Titel: ${title}\n\nBestehender Content:\n${content}\n\nAnweisung: ${instructions}`;
  return claudeChat(system, userMsg, { maxTokens: 4000, temperature: 0.5 });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [,, cmd, ...args] = process.argv;
  (async () => {
    if (cmd === 'test') console.log(JSON.stringify(await claudeChat('Du bist hilfreich.', 'Sag hallo auf Deutsch.'), null, 2));
    else if (cmd === 'gen') console.log((await generateArticle({ keyword: args[0], category: 'Brandschutz', pillar: 'Brandschutz' })).text);
    else if (cmd === 'seo') console.log(JSON.stringify(await enhanceSeo({ title: args[0], content: args.slice(1).join(' ') }), null, 2));
    else console.log('Usage: node claude-client.js [test|gen|seo] args...');
  })().catch(e => { console.error(e); process.exit(1); });
}
