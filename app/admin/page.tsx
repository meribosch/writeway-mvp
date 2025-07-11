'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { getAllComments, deleteComment } from '../utils/comments';
import { Comment } from '../types/database.types';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import Container from '../components/Container';
import Button from '../components/Button';
import Alert from '../components/Alert';
import Badge from '../components/Badge';

export default function AdminPage() {
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only run client-side navigation after component mounts
    if (isMounted) {
      if (!user) {
        router.push('/login');
        return;
      }

      if (!isAdmin) {
        router.push('/');
        return;
      }

      // Convertido a expresión de función para evitar el error de ES5 en modo estricto
      const fetchComments = async () => {
        setIsLoading(true);
        const { comments, error } = await getAllComments();
        
        if (comments) {
          setComments(comments);
        }
        
        if (error) {
          setError(error);
        }
        
        setIsLoading(false);
      };

      fetchComments();
    }
  }, [isMounted, user, isAdmin, router]);

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      return;
    }
    
    const { success, error } = await deleteComment(commentId);
    
    if (success) {
      setComments(comments.filter(comment => comment.id !== commentId));
    }
    
    if (error) {
      setError(error);
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
        <div className="flex items-center mb-8">
          <svg className="w-8 h-8 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <h1 className="text-3xl font-playfair font-bold text-gray-800">Admin Dashboard</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-xl font-playfair font-bold mb-6 text-gray-800 border-b border-gray-100 pb-2">
            Comment Moderation
          </h2>
          
          {error && (
            <Alert 
              type="error" 
              message={error} 
              onClose={() => setError(null)}
              className="mb-6"
            />
          )}
          
          {isLoading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
              <p className="mt-4 text-gray-600">Loading comments...</p>
            </div>
          ) : comments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Author
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comment
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Story
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {comments.map((comment) => (
                    <tr key={comment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{comment.author_name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {comment.content.length > 100
                            ? `${comment.content.substring(0, 100)}...`
                            : comment.content}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href={`/story/${comment.story_id}`} className="text-purple-600 hover:text-purple-800 font-medium">
                          {comment.stories?.title || 'View Story'}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <p className="mt-4 text-lg font-medium text-gray-700">No comments to moderate</p>
              <p className="mt-2 text-gray-500">All comments have been reviewed</p>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-playfair font-bold mb-6 text-gray-800 border-b border-gray-100 pb-2">
            Admin Stats
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
              <h3 className="text-lg font-medium text-purple-800 mb-2">Total Comments</h3>
              <p className="text-3xl font-bold text-purple-900">{comments.length}</p>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
              <h3 className="text-lg font-medium text-blue-800 mb-2">Active Users</h3>
              <p className="text-3xl font-bold text-blue-900">-</p>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg border border-green-100">
              <h3 className="text-lg font-medium text-green-800 mb-2">Total Stories</h3>
              <p className="text-3xl font-bold text-green-900">-</p>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
} 