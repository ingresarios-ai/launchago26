const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Manejo de CORS preflight (necesario para ser llamado desde el navegador)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { route, gap, q1, q2, q3, q4 } = await req.json();

    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');
    if (!DEEPSEEK_API_KEY) {
      throw new Error('DEEPSEEK_API_KEY no está configurada.');
    }

    const systemPrompt = `Actúa como "Geny", una inteligencia artificial experta en análisis de comportamiento financiero y desarrollo de sistemas de inversión.
Tu tarea es analizar las respuestas de un usuario y generar una frase exacta que describa su "Mapa de Brecha".

EL FORMATO DE RESPUESTA DEBE SER ESTRICTAMENTE ESTE (completa los espacios en blanco de forma coherente y natural, sin añadir saludos ni texto adicional, y elimina los corchetes [] en la respuesta final):
"Mi brecha principal hoy es [Brecha seleccionada]. No necesito [Acción que debe evitar basada en las respuestas]. Necesito [Acción que debe hacer]. Durante los próximos 7 días voy a [Acción práctica]. Sabré que avancé cuando pueda demostrar [Evidencia de avance]."

Asegúrate de que la frase sea empática pero directa, resumiendo la esencia de lo que el usuario respondió.`;

    const userPrompt = `
Brecha seleccionada: ${gap}
Ruta: ${route}
Respuesta 1: ${q1}
Respuesta 2: ${q2}
Respuesta 3: ${q3}
Respuesta 4: ${q4}
    `;

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('DeepSeek Error:', err);
      throw new Error('Error de conexión con la IA Geny.');
    }

    const data = await response.json();
    const resultText = data.choices[0].message.content.trim();

    return new Response(JSON.stringify({ result: resultText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
