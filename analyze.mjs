const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export default async (req, context) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders() });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400, headers: corsHeaders() });
  }

  const { system, userContent, isUrl } = body;
  if (!system || !userContent) {
    return new Response('Missing required fields', { status: 400, headers: corsHeaders() });
  }

  const anthropicPayload = {
    model: MODEL,
    max_tokens: 1500,
    system,
    messages: [{ role: 'user', content: userContent }],
  };
  if (isUrl) {
    anthropicPayload.tools = [{ type: 'web_search_20250305', name: 'web_search' }];
  }

  let anthropicRes;
  try {
    anthropicRes = await fetch(ANTHROPIC_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(anthropicPayload),
    });
  } catch (err) {
    return new Response(`Upstream fetch failed: ${err.message}`, { status: 502, headers: corsHeaders() });
  }

  if (!anthropicRes.ok) {
    const errText = await anthropicRes.text();
    return new Response(`Anthropic error ${anthropicRes.status}: ${errText}`, { status: 502, headers: corsHeaders() });
  }

  const anthropicData = await anthropicRes.json();
  const textContent = anthropicData.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('');

  let parsed;
  try {
    const clean = textContent.replace(/```json|```/g, '').trim();
    parsed = JSON.parse(clean);
  } catch {
    return new Response(
      JSON.stringify({ type: 'error', message: 'Could not parse AI response', raw: textContent }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders() } }
    );
  }

  return new Response(JSON.stringify(parsed), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
};

export const config = { path: '/analyze' };
