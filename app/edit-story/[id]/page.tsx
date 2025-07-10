'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { getStoryById, updateStory } from '../../utils/stories';
import { Story } from '../../types/database.types';
import Container from '../../components/Container';
import Button from '../../components/Button';
import Input from '../../components/Input';
import TextArea from '../../components/TextArea';
import Alert from '../../components/Alert';

export default function EditStory() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [story, setStory] = useState<Story | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not logged in
  if (!user) {
    router.push('/login');
    return null;
  }

  useEffect(() => {
    async function fetchStory() {
      if (!id || typeof id !== 'string') {
        setError('Invalid story ID');
        setIsLoading(false);
        return;
      }

      if (!user) {
        return;
      }

      setIsLoading(true);
      const { story, error } = await getStoryById(id);
      
      if (story) {
        // Check if user is the author
        if (user.id !== story.author_id) {
          setError('You do not have permission to edit this story');
          setIsLoading(false);
          return;
        }
        
        setStory(story);
        setTitle(story.title);
        setContent(story.content);
        setIsPublic(story.is_public);
      }
      
      if (error) {
        setError(error);
      }
      
      setIsLoading(false);
    }

    fetchStory();
  }, [id, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!story) return;
    
    setError(null);
    
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }
    
    setIsSaving(true);
    
    const { story: updatedStory, error } = await updateStory(
      story.id,
      title.trim(),
      content.trim(),
      isPublic
    );
    
    if (updatedStory) {
      router.push(`/story/${updatedStory.id}`);
    } else {
      setError(error || 'Failed to update story');
      setIsSaving(false);
    }
  };

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
              onClick={() => router.push('/my-stories')}
              variant="primary"
            >
              Go back to my stories
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
          <p className="mt-2 text-gray-500">The story you are trying to edit does not exist or has been removed.</p>
          <div className="mt-6">
            <Button
              onClick={() => router.push('/my-stories')}
              variant="primary"
            >
              Go back to my stories
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container size="md">
      <div className="bg-white rounded-lg shadow-md p-8 my-8 animate-fadeIn">
        <h1 className="text-3xl font-playfair font-bold mb-6 text-gray-800 border-b border-gray-100 pb-3">
          Edit Story
        </h1>
        
        {error && (
          <Alert 
            type="error" 
            message={error} 
            onClose={() => setError(null)}
            className="mb-6"
          />
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            id="title"
            type="text"
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title for your story"
            fullWidth
            required
            className="text-xl font-playfair"
          />
          
          <TextArea
            id="content"
            label="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={15}
            placeholder="Write your story here..."
            fullWidth
            required
            className="font-inter text-lg"
          />
          
          <div className="flex items-center">
            <input
              id="isPublic"
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="isPublic" className="ml-2 text-gray-700">
              Make this story public
            </label>
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSaving}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </Container>
  );
} 