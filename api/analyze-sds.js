export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500 });
  }

  try {
    const { pdfBase64 } = await req.json();
    if (!pdfBase64) {
      return new Response(JSON.stringify({ error: 'No PDF data provided' }), { status: 400 });
    }

    const prompt = `You are a chemical safety expert. Analyze this Safety Data Sheet (SDS) PDF and extract the following information in JSON format:

{
  "name": "Chemical/product name",
  "cas": "CAS number (main substance). If mixture, use the most hazardous component's CAS or leave empty string",
  "formula": "Molecular formula if available, otherwise empty string",
  "hPhrases": ["H200", "H301", ...],
  "manufacturer": "Manufacturer/supplier name",
  "concentrations": [
    {"name": "Component name", "cas": "CAS number", "concentration": "10-20%", "hPhrases": ["H301"]}
  ],
  "physicalState": "Solid/Liquid/Gas",
  "boilingPoint": "value with unit or N/A",
  "flashPoint": "value with unit or N/A",
  "molecularWeight": 0
}

IMPORTANT RULES:
- Extract ALL H-phrases (hazard statements) found anywhere in the document (sections 2, 3, etc.)
- H-phrases must be in standard format: H followed by 3 digits, optionally with letter suffix (e.g. H301, H360F, H360Df)
- For mixtures, list all components with their concentrations and individual H-phrases in the concentrations array
- If molecular weight is not found, use 0
- Return ONLY valid JSON, no markdown, no explanation`;

    // Try gemini-2.5-flash first, fall back to 2.0-flash
    const models = ['gemini-2.5-flash-preview-05-20', 'gemini-2.0-flash'];
    let lastError = null;

    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                { inline_data: { mime_type: 'application/pdf', data: pdfBase64 } }
              ]
            }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 4096,
            }
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          lastError = `${model}: ${response.status} ${errText}`;
          continue;
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          lastError = `${model}: No text in response`;
          continue;
        }

        // Extract JSON from response (handle markdown code blocks)
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
        const parsed = JSON.parse(jsonMatch[1].trim());

        return new Response(JSON.stringify(parsed), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      } catch (e) {
        lastError = `${model}: ${e.message}`;
        continue;
      }
    }

    return new Response(JSON.stringify({ error: `All models failed. Last error: ${lastError}` }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}
