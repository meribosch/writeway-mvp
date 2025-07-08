import { supabase } from './supabase';
import { Comment } from '../types/database.types';

// Get comments for a story
export async function getCommentsByStoryId(storyId: string): Promise<{ comments: Comment[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('story_id', storyId)
      .order('created_at', { ascending: true });

    if (error) {
      return { comments: null, error: error.message };
    }

    return { comments: data as Comment[], error: null };
  } catch (error) {
    return { comments: null, error: 'Failed to fetch comments' };
  }
}

// Create a comment
export async function createComment(
  storyId: string,
  authorId: string,
  authorName: string,
  content: string
): Promise<{ comment: Comment | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          story_id: storyId,
          author_id: authorId,
          author_name: authorName,
          content,
        }
      ])
      .select()
      .single();

    if (error) {
      return { comment: null, error: error.message };
    }

    return { comment: data as Comment, error: null };
  } catch (error) {
    return { comment: null, error: 'Failed to create comment' };
  }
}

// Delete a comment (for author or admin)
export async function deleteComment(commentId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: 'Failed to delete comment' };
  }
}

// Get all comments (for admin moderation)
export async function getAllComments(): Promise<{ comments: Comment[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*, stories(title)')
      .order('created_at', { ascending: false });

    if (error) {
      return { comments: null, error: error.message };
    }

    return { comments: data as Comment[], error: null };
  } catch (error) {
    return { comments: null, error: 'Failed to fetch comments' };
  }
} 