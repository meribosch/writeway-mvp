import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../utils/supabase';
import { createSystemPrompt, detectGenre, generatePromptHash, callOpenAI } from '../../utils/openai';
import { AIAnalysisRequest, AIAnalysisResponse, PROMPT_TEMPLATES } from '../../types/ai-assistant.types';

// Obtener la clave de API de OpenAI desde variables de entorno
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

export async function POST(request: NextRequest) {
  try {
    // Verificar que la clave de API está configurada
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Obtener datos de la solicitud
    const requestData: AIAnalysisRequest = await request.json();
    const { story_id, content, prompt_type, custom_prompt, conversation_id } = requestData;

    // Validar datos requeridos
    if (!story_id || !content || !prompt_type) {
      return NextResponse.json(
        { error: 'Missing required fields: story_id, content, prompt_type' },
        { status: 400 }
      );
    }

    // Obtener la historia para verificar que existe y es pública
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('*')
      .eq('id', story_id)
      .single();

    if (storyError || !story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    if (!story.is_public) {
      return NextResponse.json(
        { error: 'Cannot analyze private stories' },
        { status: 403 }
      );
    }

    // Detectar el género literario
    const detectedGenre = detectGenre(content);

    // Construir el prompt según el tipo
    let userPrompt = '';
    if (prompt_type === 'grammar') {
      userPrompt = `${PROMPT_TEMPLATES.GRAMMAR}\n\n${content}`;
    } else if (prompt_type === 'structure') {
      userPrompt = `${PROMPT_TEMPLATES.STRUCTURE}\n\n${content}`;
    } else if (prompt_type === 'custom' && custom_prompt) {
      userPrompt = `${custom_prompt}\n\n${content}`;
    } else {
      return NextResponse.json(
        { error: 'Invalid prompt type or missing custom prompt' },
        { status: 400 }
      );
    }

    // Generar hash para caché
    const promptHash = generatePromptHash(userPrompt);

    // Verificar si la respuesta está en caché
    const { data: cachedResponse } = await supabase
      .from('ai_cache')
      .select('*')  // Seleccionar todos los campos para obtener el id
      .eq('prompt_hash', promptHash)
      .single();

    let aiResponse: string;

    if (cachedResponse) {
      // Usar respuesta en caché
      aiResponse = cachedResponse.response;
      
      // Actualizar contador de uso y fecha de último uso
      await supabase
        .from('ai_cache')
        .update({
          used_count: supabase.rpc('increment', { row_id: cachedResponse.id, increment_amount: 1 }),
          last_used_at: new Date().toISOString()
        })
        .eq('prompt_hash', promptHash);
    } else {
      // Llamar a la API de OpenAI
      const systemPrompt = createSystemPrompt(detectedGenre);
      aiResponse = await callOpenAI(systemPrompt, userPrompt, OPENAI_API_KEY);
      
      // Guardar en caché
      await supabase
        .from('ai_cache')
        .insert({
          prompt_hash: promptHash,
          prompt: userPrompt,
          response: aiResponse,
          created_at: new Date().toISOString(),
          last_used_at: new Date().toISOString()
        });
    }

    // Crear o continuar conversación
    let conversationId = conversation_id || '';
    
    if (!conversationId) {
      // Crear nueva conversación
      const { data: newConversation, error: convError } = await supabase
        .from('ai_conversations')
        .insert({
          story_id,
          user_id: story.author_id,
          detected_genre: detectedGenre,
          title: `Análisis de "${story.title}"`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();
      
      if (convError || !newConversation) {
        return NextResponse.json(
          { error: 'Failed to create conversation' },
          { status: 500 }
        );
      }
      
      conversationId = newConversation.id;
    } else {
      // Actualizar conversación existente
      await supabase
        .from('ai_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);
    }
    
    // Guardar mensaje del usuario
    await supabase
      .from('ai_messages')
      .insert({
        conversation_id: conversationId,
        is_user: true,
        content: userPrompt,
        prompt_type,
        created_at: new Date().toISOString()
      });
    
    // Guardar respuesta de la IA
    const { data: aiMessage, error: msgError } = await supabase
      .from('ai_messages')
      .insert({
        conversation_id: conversationId,
        is_user: false,
        content: aiResponse,
        created_at: new Date().toISOString()
      })
      .select('*')
      .single();
    
    if (msgError || !aiMessage) {
      return NextResponse.json(
        { error: 'Failed to save AI response' },
        { status: 500 }
      );
    }
    
    // Devolver respuesta
    const response: AIAnalysisResponse = {
      message: aiMessage,
      conversation_id: conversationId,
      detected_genre: detectedGenre
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('AI Assistant error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Endpoint para obtener conversaciones de una historia
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const storyId = url.searchParams.get('story_id');
    
    if (!storyId) {
      return NextResponse.json(
        { error: 'Missing story_id parameter' },
        { status: 400 }
      );
    }
    
    // Obtener todas las conversaciones para esta historia
    const { data: conversations, error } = await supabase
      .from('ai_conversations')
      .select(`
        *,
        messages:ai_messages(*)
      `)
      .eq('story_id', storyId)
      .order('updated_at', { ascending: false });
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch conversations' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('AI Assistant error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 