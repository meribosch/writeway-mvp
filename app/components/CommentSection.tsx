'use client';

import { useState, useEffect } from 'react';
import { Comment } from '../types/database.types';
import { useAuth } from '../context/AuthContext';
import { getCommentsByStoryId, createComment, deleteComment } from '../utils/comments';
import { formatDistanceToNow } from 'date-fns';
import Button from './Button';
import TextArea from './TextArea';
import Alert from './Alert';

interface CommentSectionProps {
  storyId: string;
}

export default function CommentSection({ storyId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    fetchComments();
  }, [storyId]);

  const fetchComments = async () => {
    setIsLoading(true);
    const { comments, error } = await getCommentsByStoryId(storyId);
    
    if (comments) {
      setComments(comments);
    }
    
    if (error) {
      setError(error);
    }
    
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !newComment.trim()) {
      return;
    }
    
    const { comment, error } = await createComment(
      storyId,
      user.id,
      user.username,
      newComment.trim()
    );
    
    if (comment) {
      setComments([...comments, comment]);
      setNewComment('');
    }
    
    if (error) {
      setError(error);
    }
  };

  const handleDelete = async (commentId: string) => {
    const { success, error } = await deleteComment(commentId);
    
    if (success) {
      setComments(comments.filter(comment => comment.id !== commentId));
    }
    
    if (error) {
      setError(error);
    }
  };

  const canDeleteComment = (comment: Comment) => {
    if (!user) return false;
    return isAdmin || comment.author_id === user.id;
  };

  return (
    <div className="mt-8 card-modern p-6">
      <h2 className="text-2xl font-inter font-bold mb-6 text-gray-800 border-b border-purple-100 pb-2 flex items-center">
        <svg className="h-6 w-6 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
        Comments {comments.length > 0 && <span className="ml-2 text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded-full">{comments.length}</span>}
      </h2>
      
      {error && (
        <Alert 
          type="error" 
          message={error} 
          onClose={() => setError(null)}
          className="mb-6"
        />
      )}
      
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8 bg-purple-50 p-4 rounded-lg border border-purple-100">
          <TextArea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            placeholder="Write a comment..."
            fullWidth
            required
            className="font-inter"
          />
          <div className="mt-3 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              disabled={!newComment.trim()}
              className="flex items-center px-6 py-2 text-base"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Post Comment
            </Button>
          </div>
        </form>
      ) : (
        <Alert
          type="info"
          message="Please login to leave a comment."
          className="mb-6"
        />
      )}
      
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
          <p className="mt-2 text-gray-600">Loading comments...</p>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-l-purple-300 animate-fadeIn">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-800">{comment.author_name}</p>
                  <p className="text-gray-500 text-sm">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </p>
                </div>
                
                {canDeleteComment(comment) && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                    aria-label="Delete comment"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="mt-3 text-gray-700 font-inter">{comment.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-purple-50 rounded-lg border border-purple-100">
          <svg className="mx-auto h-12 w-12 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          <p className="mt-4 text-lg font-medium text-gray-700">No comments yet</p>
          <p className="mt-2 text-gray-500">Be the first to share your thoughts</p>
        </div>
      )}
    </div>
  );
} 