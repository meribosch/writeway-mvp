'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { getStoriesByAuthor, deleteStory } from '../utils/stories';
import { Story } from '../types/database.types';
import StoryCard from '../components/StoryCard';
import Link from 'next/link';
import Container from '../components/Container';
import Button from '../components/Button';
import Alert from '../components/Alert';

export default function MyStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  // Redirect if not logged in
  if (!user) {
    router.push('/login');
    return null;
  }

  useEffect(() => {
    async function fetchStories() {
      if (!user) return;
      
      setIsLoading(true);
      const { stories, error } = await getStoriesByAuthor(user.id);
      
      if (stories) {
        setStories(stories);
      }
      
      if (error) {
        setError(error);
      }
      
      setIsLoading(false);
    }

    fetchStories();
  }, [user]);

  const handleDelete = async (storyId: string) => {
    if (!confirm('Are you sure you want to delete this story? This action cannot be undone.')) {
      return;
    }
    
    const { success, error } = await deleteStory(storyId);
    
    if (success) {
      setStories(stories.filter(story => story.id !== storyId));
    }
    
    if (error) {
      setError(error);
    }
  };

  return (
    <Container>
      <div className="animate-fadeIn">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-playfair font-bold text-gray-800">My Stories</h1>
          <Link href="/new-story">
            <Button variant="primary">
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Write New Story
              </span>
            </Button>
          </Link>
        </div>
        
        {error && (
          <Alert 
            type="error" 
            message={error} 
            onClose={() => setError(null)}
            className="mb-6"
          />
        )}
        
        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Loading your stories...</p>
          </div>
        ) : stories.length > 0 ? (
          <div className="space-y-6">
            {stories.map((story) => (
              <StoryCard 
                key={story.id} 
                story={story} 
                showActions={true} 
                onDelete={handleDelete} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <p className="mt-4 text-lg font-medium text-gray-700">You haven't written any stories yet</p>
            <p className="mt-2 text-gray-500 mb-6">Start creating your first story and share it with the world</p>
            <Link href="/new-story">
              <Button variant="primary">Write Your First Story</Button>
            </Link>
          </div>
        )}
      </div>
    </Container>
  );
} 