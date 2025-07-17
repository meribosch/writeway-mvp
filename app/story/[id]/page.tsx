'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getStoryById } from '../../utils/stories';
import { Story } from '../../types/database.types';
import { useAuth } from '../../context/AuthContext';
import CommentSection from '../../components/CommentSection';
import AIAssistant from '../../components/AIAssistant';
import { formatDistanceToNow } from 'date-fns';
import Container from '../../components/Container';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import Badge from '../../components/Badge';
import Link from 'next/link';

export default function StoryDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  useEffect(() => {
    async function fetchStory() {
      if (!id || typeof id !== 'string') {
        setError('Invalid story ID');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const { story, error } = await getStoryById(id);
      
      if (story) {
        // Check if user can access this story
        if (!story.is_public && (!user || user.id !== story.author_id)) {
          setError('You do not have permission to view this story');
          setIsLoading(false);
          return;
        }
        
        setStory(story);
      }
      
      if (error) {
        setError(error);
      }
      
      setIsLoading(false);
    }

    fetchStory();
  }, [id, user]);

  // Get author display name
  const getAuthorDisplayName = () => {
    if (!story || !story.author) return 'Anonymous';
    
    return story.author.first_name && story.author.last_name 
      ? `${story.author.first_name} ${story.author.last_name}`
      : story.author.username;
  };

  // Determinar si el usuario actual es el autor
  const isAuthor = user && story && user.id === story.author_id;

  if (isLoading) {
    return (
      <Container size="md">
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading story...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="md">
        <div className="py-12">
          <Alert
            type="error"
            message={error}
          />
          <div className="mt-6 text-center">
            <Button
              onClick={() => router.push('/')}
              variant="primary"
            >
              Go back to home
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  if (!story) {
    return (
      <Container size="md">
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="mt-4 text-xl font-bold text-gray-700">Story not found</h2>
          <p className="mt-2 text-gray-500">The story you are looking for does not exist or has been removed.</p>
          <div className="mt-6">
            <Button
              onClick={() => router.push('/')}
              variant="primary"
            >
              Go back to home
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container size="md">
      <div className="animate-fadeIn">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          {isAuthor && (
            <div className="flex justify-end mb-4 gap-2">
              <Link href={`/edit-story/${story.id}`} className="btn-secondary text-sm">
                Edit Story
              </Link>
              
              {story.is_public && (
                <Button
                  onClick={() => setShowAIAssistant(!showAIAssistant)}
                  variant="secondary"
                >
                  {showAIAssistant ? 'Hide AI Assistant' : 'Show AI Assistant'}
                </Button>
              )}
            </div>
          )}
          
          <h1 className="text-3xl md:text-4xl font-inter font-bold mb-3 text-gray-800">{story.title}</h1>
          
          <div className="flex items-center text-gray-600 mb-8">
            <span className="font-medium">
              By <span className="text-purple-700">{getAuthorDisplayName()}</span> • Posted {formatDistanceToNow(new Date(story.created_at), { addSuffix: true })}
            </span>
            {!story.is_public && (
              <span className="ml-3">
                <Badge variant="purple">Private</Badge>
              </span>
            )}
          </div>
          
          <div className="prose max-w-none font-inter text-lg leading-relaxed">
            {story.content.split('\n').map((paragraph, index) => (
              paragraph ? (
                <p key={index} className="mb-6">
                  {paragraph}
                </p>
              ) : <br key={index} />
            ))}
          </div>
        </div>
        
        {/* AI Assistant - solo visible para el autor y si la historia es pública */}
        {isAuthor && story.is_public && showAIAssistant && (
          <AIAssistant story={story} />
        )}
        
        {story.is_public && (
          <CommentSection storyId={story.id} />
        )}
      </div>
    </Container>
  );
} 