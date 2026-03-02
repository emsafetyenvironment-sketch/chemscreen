export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { pdfBase64 } = req.body;
    if (!pdfBase64) {
      return res.status(400).json({ error: 'No PDF data provided' });
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

    const models = ['gemini-2.5-flash', 'gemini-2.0-flash'];
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

        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
        const parsed = JSON.parse(jsonMatch[1].trim());

        return res.status(200).json(parsed);
      } catch (e) {
        lastError = `${model}: ${e.message}`;
        continue;
      }
    }

    return res.status(502).json({ error: `All models failed. Last error: ${lastError}` });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
