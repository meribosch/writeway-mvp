import { AIConversation, AIMessage, AIAnalysisRequest, AIAnalysisResponse } from '../types/ai-assistant.types';

// Función para enviar una solicitud de análisis a la API
export async function analyzeStory(
  storyId: string,
  content: string,
  promptType: 'grammar' | 'structure' | 'custom',
  customPrompt?: string,
  conversationId?: string
): Promise<{ response: AIAnalysisResponse | null; error: string | null }> {
  try {
    const request: AIAnalysisRequest = {
      story_id: storyId,
      content,
      prompt_type: promptType,
      custom_prompt: customPrompt,
      conversation_id: conversationId
    };

    const response = await fetch('/api/ai-assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { response: null, error: errorData.error || 'Failed to analyze story' };
    }

    const data = await response.json();
    return { response: data, error: null };
  } catch (error) {
    console.error('Error analyzing story:', error);
    return { response: null, error: 'An unexpected error occurred' };
  }
}

// Función para obtener todas las conversaciones de una historia
export async function getStoryConversations(
  storyId: string
): Promise<{ conversations: AIConversation[] | null; error: string | null }> {
  try {
    const response = await fetch(`/api/ai-assistant?story_id=${storyId}`);

    if (!response.ok) {
      const errorData = await response.json();
      return { conversations: null, error: errorData.error || 'Failed to fetch conversations' };
    }

    const data = await response.json();
    return { conversations: data.conversations, error: null };
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return { conversations: null, error: 'An unexpected error occurred' };
  }
}

// Función para procesar el formato markdown simple a HTML
export function processMarkdown(content: string): string {
  // Procesar títulos
  let processed = content.replace(/^#{1,3}\s+(.+)$/gm, '<h3>$1</h3>');
  
  // Procesar negritas
  processed = processed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  // Procesar cursivas
  processed = processed.replace(/\*(.+?)\*/g, '<em>$1</em>');
  
  // Procesar listas
  processed = processed.replace(/^-\s+(.+)$/gm, '<li>$1</li>');
  processed = processed.replace(/(<li>.+<\/li>\n)+/g, '<ul>$&</ul>');
  
  // Procesar párrafos
  processed = processed.replace(/^(?!<[hlu]).+$/gm, '<p>$&</p>');
  
  // Eliminar párrafos vacíos
  processed = processed.replace(/<p><\/p>/g, '');
  
  return processed;
}

// Función para obtener un resumen de una conversación
export function getConversationSummary(conversation: AIConversation): string {
  if (!conversation.messages || conversation.messages.length === 0) {
    return 'No messages';
  }
  
  // Encontrar el primer mensaje que no sea del usuario
  const firstAIMessage = conversation.messages.find(msg => !msg.is_user);
  if (!firstAIMessage) {
    return 'No AI response';
  }
  
  // Extraer la primera línea o las primeras X caracteres
  const content = firstAIMessage.content;
  const firstLine = content.split('\n')[0];
  
  if (firstLine.length <= 100) {
    return firstLine;
  }
  
  return firstLine.substring(0, 97) + '...';
} 