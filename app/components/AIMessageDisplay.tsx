'use client';

import { useState, useEffect } from 'react';
import { AIMessage } from '../types/ai-assistant.types';
import { processMarkdown } from '../utils/ai-assistant';

interface AIMessageDisplayProps {
  message: AIMessage;
  isLoading?: boolean;
}

export default function AIMessageDisplay({ message, isLoading = false }: AIMessageDisplayProps) {
  const [processedContent, setProcessedContent] = useState<string>('');
  
  useEffect(() => {
    if (message && message.content) {
      const processed = processMarkdown(message.content);
      setProcessedContent(processed);
    }
  }, [message]);
  
  if (isLoading) {
    return (
      <div className="bg-purple-50 p-4 rounded-lg mb-4 animate-pulse">
        <div className="h-4 bg-purple-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-purple-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-purple-200 rounded w-5/6"></div>
      </div>
    );
  }
  
  if (!message || !message.content) {
    return null;
  }
  
  return (
    <div className="bg-purple-50 p-4 rounded-lg mb-4">
      <div 
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
    </div>
  );
} 