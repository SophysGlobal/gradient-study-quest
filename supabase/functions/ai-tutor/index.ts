import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { prompt, type, subject } = await req.json();

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    const apiKey = openaiApiKey || lovableApiKey;
    const apiUrl = openaiApiKey
      ? 'https://api.openai.com/v1/chat/completions'
      : 'https://ai.gateway.lovable.dev/v1/chat/completions';
    const model = openaiApiKey ? 'gpt-4o-mini' : 'google/gemini-2.0-flash-exp';

    if (!apiKey) {
      throw new Error('No AI API key configured');
    }

    let systemMessage = '';
    let maxTokens = 500;

    if (type === 'flashcard') {
      systemMessage = `You are an expert AP-level tutor for ${subject}. Generate educational flashcard content suitable for AP students preparing for exams.

CRITICAL INSTRUCTIONS:
1. Return ONLY a valid JSON array with exactly 3 flashcards
2. Each flashcard MUST have exactly these properties: "front" (the question) and "back" (the answer)
3. Make questions challenging but appropriate for AP level
4. Include detailed, educational answers that help students learn
5. NO markdown formatting, NO code blocks, NO extra text
6. Return ONLY the raw JSON array starting with [ and ending with ]

Example format:
[{"front": "What is...", "back": "The answer is..."}, {"front": "Explain...", "back": "It means..."}]`;
      maxTokens = 800;
    } else if (type === 'explanation') {
      systemMessage = `You are an expert AP-level tutor for ${subject}. Provide clear, detailed explanations suitable for AP students.

Guidelines:
- Use academic but accessible language
- Break down complex concepts into understandable parts
- Provide examples when helpful
- Keep responses focused and educational
- Aim for 100-200 words unless more detail is needed`;
      maxTokens = 600;
    } else if (type === 'quiz') {
      systemMessage = `You are creating AP-level quiz questions for ${subject}. Generate challenging multiple choice questions.

CRITICAL INSTRUCTIONS:
1. Return ONLY valid JSON with these exact properties:
   - "question": the quiz question (string)
   - "options": array of exactly 4 answer choices (string array)
   - "correctAnswer": index of correct answer 0-3 (number)
2. Make questions AP exam difficulty
3. All options should be plausible to test understanding
4. NO markdown, NO code blocks, NO extra text
5. Return ONLY the raw JSON object starting with { and ending with }

Example format:
{"question": "What is...", "options": ["A", "B", "C", "D"], "correctAnswer": 0}`;
      maxTokens = 400;
    }

    console.log(`Generating ${type} for ${subject} using ${openaiApiKey ? 'OpenAI' : 'Lovable AI Gateway'}`);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('AI API error:', data);

      if (response.status === 429) {
        return new Response(JSON.stringify({
          error: 'Rate limit reached. Please try again in a moment.',
          success: false
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (response.status === 402) {
        return new Response(JSON.stringify({
          error: 'AI usage limit reached. Please add credits to continue.',
          success: false
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      throw new Error(data.error?.message || 'Failed to get AI response');
    }

    const aiResponse = data.choices[0].message.content;

    if (type === 'flashcard' || type === 'quiz') {
      try {
        let cleanedResponse = aiResponse.trim();

        cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');

        const openBracketIndex = Math.max(
          cleanedResponse.indexOf('['),
          cleanedResponse.indexOf('{')
        );

        if (openBracketIndex === -1) {
          throw new Error('No JSON structure found in AI response');
        }

        let closeBracketIndex = -1;
        if (cleanedResponse[openBracketIndex] === '[') {
          closeBracketIndex = cleanedResponse.lastIndexOf(']');
        } else if (cleanedResponse[openBracketIndex] === '{') {
          closeBracketIndex = cleanedResponse.lastIndexOf('}');
        }

        if (closeBracketIndex === -1 || closeBracketIndex <= openBracketIndex) {
          throw new Error('No matching closing bracket found in AI response');
        }

        cleanedResponse = cleanedResponse.substring(openBracketIndex, closeBracketIndex + 1);

        const parsedJson = JSON.parse(cleanedResponse);

        if (type === 'flashcard' && Array.isArray(parsedJson)) {
          const validFlashcards = parsedJson.filter(card =>
            card && typeof card === 'object' && 'front' in card && 'back' in card
          );

          if (validFlashcards.length === 0) {
            throw new Error('No valid flashcards found in response');
          }

          return new Response(JSON.stringify({
            success: true,
            response: JSON.stringify(validFlashcards.slice(0, 3))
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else if (type === 'quiz' && !Array.isArray(parsedJson)) {
          if (!parsedJson.question || !parsedJson.options || parsedJson.correctAnswer === undefined) {
            throw new Error('Invalid quiz question structure');
          }

          return new Response(JSON.stringify({
            success: true,
            response: JSON.stringify(parsedJson)
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({
          success: true,
          response: JSON.stringify(parsedJson)
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError, 'Raw response:', aiResponse);
        return new Response(JSON.stringify({
          error: 'Failed to parse AI response as valid JSON. Please try again.',
          success: false,
          debug: aiResponse.substring(0, 200)
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      response: aiResponse
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-tutor function:', error);
    return new Response(JSON.stringify({
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
