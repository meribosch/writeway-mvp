'use client';

import Link from 'next/link';
import { Story } from '../types/database.types';
import { formatDistanceToNow } from 'date-fns';
import { useState, useEffect } from 'react';
import { getCommentsByStoryId } from '../utils/comments';

interface StoryCardProps {
  story: Story;
  showActions?: boolean;
  onDelete?: (storyId: string) => void;
}

export default function StoryCard({ story, showActions = false, onDelete }: StoryCardProps) {
  const [commentCount, setCommentCount] = useState(0);
  const formattedDate = formatDistanceToNow(new Date(story.created_at), { addSuffix: true });
  
  // Truncate content for preview
  const previewContent = story.content.length > 150 
    ? `${story.content.substring(0, 150)}...` 
    : story.content;
  
  useEffect(() => {
    async function fetchCommentCount() {
      const { comments } = await getCommentsByStoryId(story.id);
      if (comments) {
        setCommentCount(comments.length);
      }
    }
    
    if (story.is_public) {
      fetchCommentCount();
    }
  }, [story.id, story.is_public]);
  
  return (
    <div className="card-modern p-6 mb-6 animate-fadeIn">
      <div className="flex justify-between items-start">
        <Link href={`/story/${story.id}`} className="text-xl font-inter font-bold text-purple-700 hover:text-purple-900">
          {story.title}
        </Link>
        {!story.is_public && (
          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">Private</span>
        )}
      </div>
      
      <p className="text-gray-500 text-sm mt-1 font-medium">
        Posted {formattedDate}
      </p>
      
      <p className="mt-3 text-gray-700 font-inter">
        {previewContent}
      </p>
      
      <div className="mt-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href={`/story/${story.id}`} className="text-purple-700 hover:text-purple-900 text-sm flex items-center font-medium">
            Read more <span className="ml-1">→</span>
          </Link>
          
          {story.is_public && (
            <Link href={`/story/${story.id}`} className="flex items-center text-gray-600 hover:text-purple-700">
              <svg className="h-5 w-5 mr-1 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <span className="text-sm font-medium">{commentCount} {commentCount === 1 ? 'Comment' : 'Comments'}</span>
            </Link>
          )}
        </div>
        
        {showActions && onDelete && (
          <div className="space-x-2">
            <Link href={`/edit-story/${story.id}`} className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200">
              Edit
            </Link>
            <button 
              onClick={() => onDelete(story.id)}
              className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded-md hover:bg-red-200"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 