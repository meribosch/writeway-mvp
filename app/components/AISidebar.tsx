'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AIConversation } from '../types/ai-assistant.types';
import { getStoryConversations } from '../utils/ai-assistant';
import Button from './Button';
import AIAssistant from './AIAssistant';
import { Story } from '../types/database.types';

interface AISidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentStory?: Story | null;
}

export default function AISidebar({ isOpen, onClose, currentStory }: AISidebarProps) {
  const { user } = useAuth();
  const [recentStories, setRecentStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(currentStory || null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Si se proporciona una historia actual, usarla como seleccionada
  useEffect(() => {
    if (currentStory) {
      setSelectedStory(currentStory);
    }
  }, [currentStory]);

  // Cargar historias recientes del usuario (implementar en el futuro)
  // Esta función podría obtener las historias recientes del usuario para permitirle
  // seleccionar con cuál quiere trabajar en el asistente
  
  return (
    <div className={`fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-purple-800">Master WrAIter</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-grow overflow-y-auto p-4">
          {!user ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Inicia sesión para usar el asistente de escritura</p>
              <Button 
                variant="primary"
                onClick={() => window.location.href = '/login'}
              >
                Iniciar sesión
              </Button>
            </div>
          ) : !selectedStory ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Selecciona una historia para recibir asistencia</p>
              <Button 
                variant="primary"
                onClick={() => window.location.href = '/my-stories'}
              >
                Mis historias
              </Button>
            </div>
          ) : (
            <AIAssistant story={selectedStory} />
          )}
        </div>
      </div>
    </div>
  );
} 