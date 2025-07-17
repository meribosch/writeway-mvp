'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyzeStory, getStoryConversations } from '../utils/ai-assistant';
import { AIConversation, AIMessage } from '../types/ai-assistant.types';
import { Story } from '../types/database.types';
import Button from './Button';
import Input from './Input';
import AIMessageDisplay from './AIMessageDisplay';
import Alert from './Alert';

interface AIAssistantProps {
  story: Story;
}

export default function AIAssistant({ story }: AIAssistantProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<AIConversation | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  
  // Cargar conversaciones existentes
  useEffect(() => {
    async function loadConversations() {
      if (!story || !story.id) return;
      
      setIsLoadingConversations(true);
      const { conversations, error } = await getStoryConversations(story.id);
      setIsLoadingConversations(false);
      
      if (error) {
        setError(`Error loading conversations: ${error}`);
        return;
      }
      
      if (conversations && conversations.length > 0) {
        setConversations(conversations);
        // Activar la conversación más reciente
        setActiveConversation(conversations[0]);
      }
    }
    
    loadConversations();
  }, [story]);
  
  // Función para enviar un prompt predefinido
  const sendPredefinedPrompt = async (promptType: 'grammar' | 'structure') => {
    if (!story || !story.id || !story.content) {
      setError('Story content is required');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    const { response, error } = await analyzeStory(
      story.id,
      story.content,
      promptType,
      undefined,
      activeConversation?.id
    );
    
    setIsLoading(false);
    
    if (error) {
      setError(error);
      return;
    }
    
    if (response) {
      // Si es una nueva conversación, añadirla a la lista
      if (!activeConversation || activeConversation.id !== response.conversation_id) {
        const newConversation: AIConversation = {
          id: response.conversation_id,
          story_id: story.id,
          user_id: user?.id || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          detected_genre: response.detected_genre,
          title: `Análisis de "${story.title}"`,
          messages: [response.message]
        };
        
        setConversations([newConversation, ...conversations]);
        setActiveConversation(newConversation);
      } else {
        // Actualizar la conversación existente
        const updatedConversation = {
          ...activeConversation,
          messages: [...(activeConversation.messages || []), response.message],
          updated_at: new Date().toISOString()
        };
        
        const updatedConversations = conversations.map(conv => 
          conv.id === updatedConversation.id ? updatedConversation : conv
        );
        
        setConversations(updatedConversations);
        setActiveConversation(updatedConversation);
      }
    }
  };
  
  // Función para enviar un prompt personalizado
  const sendCustomPrompt = async () => {
    if (!story || !story.id || !story.content || !customPrompt.trim()) {
      setError('Story content and custom prompt are required');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    const { response, error } = await analyzeStory(
      story.id,
      story.content,
      'custom',
      customPrompt,
      activeConversation?.id
    );
    
    setIsLoading(false);
    
    if (error) {
      setError(error);
      return;
    }
    
    if (response) {
      // Similar a la función anterior
      if (!activeConversation || activeConversation.id !== response.conversation_id) {
        const newConversation: AIConversation = {
          id: response.conversation_id,
          story_id: story.id,
          user_id: user?.id || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          detected_genre: response.detected_genre,
          title: `Análisis de "${story.title}"`,
          messages: [response.message]
        };
        
        setConversations([newConversation, ...conversations]);
        setActiveConversation(newConversation);
      } else {
        const updatedConversation = {
          ...activeConversation,
          messages: [...(activeConversation.messages || []), response.message],
          updated_at: new Date().toISOString()
        };
        
        const updatedConversations = conversations.map(conv => 
          conv.id === updatedConversation.id ? updatedConversation : conv
        );
        
        setConversations(updatedConversations);
        setActiveConversation(updatedConversation);
      }
      
      // Limpiar el prompt personalizado después de enviarlo
      setCustomPrompt('');
    }
  };
  
  // Función para cambiar a otra conversación
  const switchConversation = (conversationId: string) => {
    const selected = conversations.find(conv => conv.id === conversationId);
    if (selected) {
      setActiveConversation(selected);
    }
  };
  
  // Función para iniciar una nueva conversación
  const startNewConversation = () => {
    setActiveConversation(null);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-8">
      <h2 className="text-2xl font-inter font-bold mb-4 text-purple-800">Master WrAIter</h2>
      <p className="text-gray-600 mb-6">
        Obtén retroalimentación y sugerencias para mejorar tu historia de nuestro asistente literario.
      </p>
      
      {error && (
        <Alert 
          type="error" 
          message={error} 
          onClose={() => setError(null)}
          className="mb-4"
        />
      )}
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Panel de conversaciones */}
        <div className="w-full md:w-1/4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-bold text-gray-700 mb-3">Conversaciones</h3>
            
            {isLoadingConversations ? (
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
              </div>
            ) : conversations.length > 0 ? (
              <div className="space-y-2">
                <button
                  onClick={startNewConversation}
                  className={`w-full text-left p-2 rounded ${!activeConversation ? 'bg-purple-100 text-purple-800' : 'hover:bg-gray-100'}`}
                >
                  + Nueva conversación
                </button>
                
                {conversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => switchConversation(conv.id)}
                    className={`w-full text-left p-2 rounded truncate ${activeConversation?.id === conv.id ? 'bg-purple-100 text-purple-800' : 'hover:bg-gray-100'}`}
                  >
                    {new Date(conv.created_at).toLocaleDateString()}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                No hay conversaciones previas.
              </p>
            )}
          </div>
        </div>
        
        {/* Panel principal */}
        <div className="w-full md:w-3/4">
          {/* Botones de prompts predefinidos */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              onClick={() => sendPredefinedPrompt('grammar')}
              variant="secondary"
              disabled={isLoading}
            >
              Correcciones gramaticales
            </Button>
            <Button
              onClick={() => sendPredefinedPrompt('structure')}
              variant="secondary"
              disabled={isLoading}
            >
              Mejoras estructurales
            </Button>
          </div>
          
          {/* Prompt personalizado */}
          <div className="mb-6">
            <div className="flex gap-2">
              <Input
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Escribe tu pregunta personalizada..."
                fullWidth
              />
              <Button
                onClick={sendCustomPrompt}
                variant="primary"
                disabled={isLoading || !customPrompt.trim()}
              >
                Enviar
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Ejemplo: "¿Cómo puedo mejorar los diálogos de mi historia?"
            </p>
          </div>
          
          {/* Mensajes */}
          <div className="mt-6">
            {isLoading && (
              <AIMessageDisplay 
                message={{ id: 'loading', conversation_id: '', is_user: false, content: '', created_at: '' }} 
                isLoading={true}
              />
            )}
            
            {activeConversation?.messages?.length ? (
              <div className="space-y-4">
                {activeConversation.messages
                  .filter(msg => !msg.is_user) // Solo mostrar respuestas de la IA
                  .map(msg => (
                    <AIMessageDisplay key={msg.id} message={msg} />
                  ))}
              </div>
            ) : !isLoading && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  Selecciona una opción para obtener retroalimentación sobre tu historia.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 