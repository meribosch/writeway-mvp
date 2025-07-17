import { createHash } from 'crypto';

// Tipos para la API de OpenAI
type OpenAIMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type OpenAIResponse = {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
};

// Función para generar un hash de un prompt para el caché
export function generatePromptHash(prompt: string): string {
  return createHash('sha256').update(prompt).digest('hex');
}

// Función para detectar el género literario del texto
export function detectGenre(text: string): string {
  // Implementación básica de detección de género
  // En una versión más avanzada, podríamos usar NLP o la propia IA
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('poema') || lowerText.includes('verso') || /\n\n.*\n\n/.test(text)) {
    return 'poesía';
  }
  
  if (lowerText.includes('ensayo') || lowerText.includes('argumento') || lowerText.includes('tesis')) {
    return 'ensayo';
  }
  
  if (lowerText.includes('cuento') || lowerText.includes('había una vez')) {
    return 'cuento';
  }
  
  // Por defecto, asumimos narrativa
  return 'narrativa';
}

// Función para crear el prompt del sistema según el género
export function createSystemPrompt(genre: string): string {
  const basePrompt = `Eres Master WrAIter, un mentor literario experimentado que ayuda a escritores a mejorar sus obras. 
Tu tono es amigable pero profesional. Siempre comienzas identificando los puntos fuertes de la obra antes de ofrecer sugerencias constructivas. 
Explicas conceptos literarios de manera accesible y muestras entusiasmo genuino por ayudar al escritor a desarrollar su potencial.`;
  
  // Añadir especificaciones según el género
  switch (genre.toLowerCase()) {
    case 'poesía':
      return `${basePrompt} 
Estás especializado en poesía. Presta atención al ritmo, la métrica, las imágenes poéticas, las metáforas y el impacto emocional. 
Sugiere formas de mejorar la musicalidad y la resonancia de los versos, respetando siempre el estilo único del poeta.`;
      
    case 'ensayo':
      return `${basePrompt} 
Estás especializado en ensayos. Evalúa la claridad de los argumentos, la estructura lógica, la evidencia presentada y la persuasión. 
Sugiere formas de fortalecer la tesis, mejorar las transiciones entre ideas y refinar la conclusión.`;
      
    case 'cuento':
      return `${basePrompt} 
Estás especializado en cuentos. Analiza el arco narrativo, los personajes, el conflicto central y la resolución. 
Sugiere formas de aumentar la tensión, desarrollar mejor los personajes y crear un final más impactante, manteniendo la brevedad característica del formato.`;
      
    default: // narrativa general
      return `${basePrompt} 
Estás especializado en narrativa. Evalúa la estructura de la trama, el desarrollo de personajes, el escenario, el diálogo y el ritmo. 
Sugiere formas de mejorar el enganche inicial, mantener la tensión narrativa y crear un final satisfactorio.`;
  }
}

// Función para llamar a la API de OpenAI
export async function callOpenAI(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string
): Promise<string> {
  try {
    const messages: OpenAIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json() as OpenAIResponse;
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw error;
  }
} 