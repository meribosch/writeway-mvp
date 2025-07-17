'use client';

import { useAIAssistant } from '../context/AIAssistantContext';
import AISidebar from './AISidebar';

export default function AIAssistantWrapper() {
  const { isAIAssistantOpen, closeAIAssistant, currentStory } = useAIAssistant();
  
  return (
    <AISidebar 
      isOpen={isAIAssistantOpen} 
      onClose={closeAIAssistant} 
      currentStory={currentStory} 
    />
  );
} 