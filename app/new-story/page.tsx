'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { createStory } from '../utils/stories';
import Container from '../components/Container';
import Button from '../components/Button';
import Input from '../components/Input';
import TextArea from '../components/TextArea';
import Alert from '../components/Alert';

export default function NewStory() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // Redirect if not logged in
  if (!user) {
    router.push('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }
    
    setIsLoading(true);
    
    const { story, error } = await createStory(
      title.trim(),
      content.trim(),
      isPublic,
      user.id
    );
    
    if (story) {
      router.push(`/story/${story.id}`);
    } else {
      setError(error || 'Failed to create story');
      setIsLoading(false);
    }
  };

  return (
    <Container size="md">
      <div className="bg-white rounded-lg shadow-md p-8 my-8 animate-fadeIn">
        <h1 className="text-3xl font-playfair font-bold mb-6 text-gray-800 border-b border-gray-100 pb-3">
          Write a New Story
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
            className="font-sourceSerif text-lg"
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
              isLoading={isLoading}
            >
              Publish Story
            </Button>
          </div>
        </form>
      </div>
    </Container>
  );
} 