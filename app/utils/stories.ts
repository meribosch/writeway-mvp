import { supabase } from './supabase';
import { Story } from '../types/database.types';

// Get all public stories
export async function getPublicStories(): Promise<{ stories: Story[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) {
      return { stories: null, error: error.message };
    }

    return { stories: data as Story[], error: null };
  } catch (error) {
    return { stories: null, error: 'Failed to fetch stories' };
  }
}

// Get stories by author ID
export async function getStoriesByAuthor(authorId: string): Promise<{ stories: Story[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('author_id', authorId)
      .order('created_at', { ascending: false });

    if (error) {
      return { stories: null, error: error.message };
    }

    return { stories: data as Story[], error: null };
  } catch (error) {
    return { stories: null, error: 'Failed to fetch stories' };
  }
}

// Get a single story by ID
export async function getStoryById(storyId: string): Promise<{ story: Story | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .single();

    if (error) {
      return { story: null, error: error.message };
    }

    return { story: data as Story, error: null };
  } catch (error) {
    return { story: null, error: 'Failed to fetch story' };
  }
}

// Create a new story
export async function createStory(
  title: string,
  content: string,
  isPublic: boolean,
  authorId: string
): Promise<{ story: Story | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('stories')
      .insert([
        {
          title,
          content,
          is_public: isPublic,
          author_id: authorId,
          updated_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (error) {
      return { story: null, error: error.message };
    }

    return { story: data as Story, error: null };
  } catch (error) {
    return { story: null, error: 'Failed to create story' };
  }
}

// Update a story
export async function updateStory(
  storyId: string,
  title: string,
  content: string,
  isPublic: boolean
): Promise<{ story: Story | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('stories')
      .update({
        title,
        content,
        is_public: isPublic,
        updated_at: new Date().toISOString(),
      })
      .eq('id', storyId)
      .select()
      .single();

    if (error) {
      return { story: null, error: error.message };
    }

    return { story: data as Story, error: null };
  } catch (error) {
    return { story: null, error: 'Failed to update story' };
  }
}

// Delete a story
export async function deleteStory(storyId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', storyId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: 'Failed to delete story' };
  }
} 