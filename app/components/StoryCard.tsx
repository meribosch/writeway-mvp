'use client';

import Link from 'next/link';
import { Story } from '../types/database.types';
import { formatDistanceToNow } from 'date-fns';

interface StoryCardProps {
  story: Story;
  showActions?: boolean;
  onDelete?: (storyId: string) => void;
}

export default function StoryCard({ story, showActions = false, onDelete }: StoryCardProps) {
  const formattedDate = formatDistanceToNow(new Date(story.created_at), { addSuffix: true });
  
  // Truncate content for preview
  const previewContent = story.content.length > 150 
    ? `${story.content.substring(0, 150)}...` 
    : story.content;
  
  return (
    <div className="story-card mb-6 animate-fadeIn">
      <div className="flex justify-between items-start">
        <Link href={`/story/${story.id}`} className="text-xl font-playfair font-bold text-purple-700 hover:text-purple-900">
          {story.title}
        </Link>
        {!story.is_public && (
          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">Private</span>
        )}
      </div>
      
      <p className="text-gray-500 text-sm mt-1 font-medium">
        Posted {formattedDate}
      </p>
      
      <p className="mt-3 text-gray-700 font-sourceSerif">
        {previewContent}
      </p>
      
      <div className="mt-4 flex justify-between items-center">
        <Link href={`/story/${story.id}`} className="btn-tertiary text-sm flex items-center">
          Read more <span className="ml-1">→</span>
        </Link>
        
        {showActions && onDelete && (
          <div className="space-x-2">
            <Link href={`/edit-story/${story.id}`} className="btn-secondary text-sm">
              Edit
            </Link>
            <button 
              onClick={() => onDelete(story.id)}
              className="btn-secondary text-sm text-red-600 border-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 