'use client';

import { useState, useEffect } from 'react';
import { Story } from './types/database.types';
import { getPublicStories } from './utils/stories';
import StoryCard from './components/StoryCard';
import Container from './components/Container';
import Alert from './components/Alert';
import Button from './components/Button';
import Link from 'next/link';

export default function Home() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStories() {
      setIsLoading(true);
      const { stories, error } = await getPublicStories();
      
      if (stories) {
        setStories(stories);
      }
      
      if (error) {
        setError(error);
      }
      
      setIsLoading(false);
    }

    fetchStories();
  }, []);

  return (
    <Container>
      <div className="py-10 animate-fadeIn">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold text-purple-700 mb-4">
            Welcome to Writeway
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-sourceSerif">
            The right way to write and share your stories with the world.
          </p>
          
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/register">
              <Button variant="primary" size="lg">Get Started</Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg">Sign In</Button>
            </Link>
          </div>
        </div>
        
        {error && (
          <Alert 
            type="error" 
            message={`Error loading stories: ${error}`} 
            onClose={() => setError(null)} 
          />
        )}
        
        {isLoading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Loading stories...</p>
          </div>
        ) : stories.length > 0 ? (
          <div>
            <h2 className="text-2xl font-playfair font-bold mb-6 text-gray-800 border-b border-gray-200 pb-2">
              Latest Stories
            </h2>
            <div className="space-y-6">
              {stories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <p className="mt-4 text-lg font-medium text-gray-700">No stories have been shared yet.</p>
            <p className="mt-2 text-gray-500">Be the first to share your story!</p>
            <Link href="/new-story" className="mt-4 inline-block">
              <Button>Write a Story</Button>
            </Link>
          </div>
        )}
      </div>
    </Container>
  );
} 