'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { getStoriesByAuthor, deleteStory } from '../utils/stories';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import Container from '../components/Container';
import Button from '../components/Button';
import Alert from '../components/Alert';
import { Story } from '../types/database.types';

export default function MyStoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const { user } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only run client-side code after mounting
    if (isMounted) {
      if (!user) {
        router.push('/login');
        return;
      }
      
      fetchStories();
    }
  }, [user, router, isMounted]);

  const fetchStories = async () => {
    setIsLoading(true);
    try {
      const { stories, error } = await getStoriesByAuthor(user?.id || '');
      
      if (stories) {
        setStories(stories);
      }
      
      if (error) {
        setError(error);
      }
    } catch (err) {
      setError('Failed to fetch stories');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (storyId: string) => {
    if (!confirm('Are you sure you want to delete this story? This action cannot be undone.')) {
      return;
    }
    
    try {
      const { success, error } = await deleteStory(storyId);
      
      if (success) {
        setStories(stories.filter(story => story.id !== storyId));
        setSuccessMessage('Story deleted successfully');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }
      
      if (error) {
        setError(error);
      }
    } catch (err) {
      setError('Failed to delete story');
      console.error(err);
    }
  };

  // Show loading state until client-side code runs
  if (!isMounted) {
    return (
      <Container>
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="animate-fadeIn">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <svg className="w-8 h-8 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h1 className="text-3xl font-playfair font-bold text-gray-800">My Stories</h1>
          </div>
          
          <Link href="/new-story">
            <Button variant="primary" className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Story
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
        
        {successMessage && (
          <Alert 
            type="success" 
            message={successMessage} 
            onClose={() => setSuccessMessage('')} 
            className="mb-6"
          />
        )}
        
        {isLoading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Loading your stories...</p>
          </div>
        ) : stories.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {stories.map((story) => (
              <div key={story.id} className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-purple-600">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-playfair font-bold mb-2 text-gray-800">
                      {story.title || 'Untitled Story'}
                    </h2>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(story.updated_at), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {story.content ? 
                      (story.content.length > 150 ? 
                        `${story.content.substring(0, 150)}...` : 
                        story.content) : 
                      'No content yet'}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <Link href={`/edit-story/${story.id}`}>
                        <Button variant="secondary" size="sm">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </Button>
                      </Link>
                      
                      <Link href={`/story/${story.id}`}>
                        <Button variant="tertiary" size="sm">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </Button>
                      </Link>
                    </div>
                    
                    <button 
                      onClick={() => handleDelete(story.id)}
                      className="text-red-600 hover:text-red-800 font-medium text-sm flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-700">You don't have any stories yet</h3>
            <p className="mt-2 text-gray-500">Create your first story to get started!</p>
            <div className="mt-6">
              <Link href="/new-story">
                <Button variant="primary">Create New Story</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
} 