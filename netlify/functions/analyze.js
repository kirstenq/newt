const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';
 
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
 
exports.handler = async function(event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: 'Method not allowed' };
  }
 
  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers: corsHeaders, body: 'Invalid JSON' };
  }
 
  const { system, userContent, isUrl } = body;
  if (!system || !userContent) {
    return { statusCode: 400, headers: corsHeaders, body: 'Missing required fields' };
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
    return { statusCode: 502, headers: corsHeaders, body: `Upstream fetch failed: ${err.message}` };
  }
 
  if (!anthropicRes.ok) {
    const errText = await anthropicRes.text();
    return { statusCode: 502, headers: corsHeaders, body: `Anthropic error ${anthropicRes.status}: ${errText}` };
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
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      body: JSON.stringify({ type: 'error', message: 'Could not parse AI response', raw: textContent }),
    };
  }
 
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
    body: JSON.stringify(parsed),
  };
};
