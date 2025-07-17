'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Story } from '../types/database.types';

type AIAssistantContextType = {
  isAIAssistantOpen: boolean;
  openAIAssistant: (story?: Story) => void;
  closeAIAssistant: () => void;
  currentStory: Story | null;
};

const AIAssistantContext = createContext<AIAssistantContextType | undefined>(undefined);

export function AIAssistantProvider({ children }: { children: ReactNode }) {
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [currentStory, setCurrentStory] = useState<Story | null>(null);

  const openAIAssistant = (story?: Story) => {
    if (story) {
      setCurrentStory(story);
    }
    setIsAIAssistantOpen(true);
  };

  const closeAIAssistant = () => {
    setIsAIAssistantOpen(false);
  };

  return (
    <AIAssistantContext.Provider
      value={{
        isAIAssistantOpen,
        openAIAssistant,
        closeAIAssistant,
        currentStory
      }}
    >
      {children}
    </AIAssistantContext.Provider>
  );
}

export function useAIAssistant() {
  const context = useContext(AIAssistantContext);
  if (context === undefined) {
    throw new Error('useAIAssistant must be used within an AIAssistantProvider');
  }
  return context;
} 