// Types for AI Assistant (Master WrAIter)

export type AIConversation = {
  id: string;
  story_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  detected_genre?: string;
  title: string;
  messages?: AIMessage[];
};

export type AIMessage = {
  id: string;
  conversation_id: string;
  is_user: boolean;
  content: string;
  created_at: string;
  prompt_type?: 'grammar' | 'structure' | 'custom';
};

export type AICache = {
  id: string;
  prompt_hash: string;
  prompt: string;
  response: string;
  created_at: string;
  used_count: number;
  last_used_at: string;
};

// Request and response types for API endpoints
export type AIAnalysisRequest = {
  story_id: string;
  content: string;
  prompt_type: 'grammar' | 'structure' | 'custom';
  custom_prompt?: string;
  conversation_id?: string; // Optional, if continuing an existing conversation
};

export type AIAnalysisResponse = {
  message: AIMessage;
  conversation_id: string;
  detected_genre?: string;
  error?: string;
};

// Predefined prompt templates
export const PROMPT_TEMPLATES = {
  GRAMMAR: "Analiza el siguiente texto y sugiere correcciones gramaticales, ortográficas y de puntuación. Sé específico y educativo en tus sugerencias:",
  STRUCTURE: "Analiza la estructura narrativa del siguiente texto. Sugiere mejoras en cuanto a ritmo, desarrollo de personajes, trama y coherencia. Proporciona ejemplos específicos de cómo mejorar:",
}; 