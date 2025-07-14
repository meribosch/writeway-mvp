'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile, uploadProfileImage } from '../utils/auth';
import Container from '../components/Container';
import Button from '../components/Button';
import Input from '../components/Input';
import Alert from '../components/Alert';
import ImageUploader from '../components/ImageUploader';

export default function ProfilePage() {
  const { user, isLoading, refreshUser } = useAuth();
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [bucketError, setBucketError] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isLoading) {
      if (!user) {
        router.push('/login');
        return;
      }

      console.log('Loading user data:', user);
      setUsername(user.username || '');
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setProfileImage(user.profile_image_url || null);
    }
  }, [user, isLoading, router, isMounted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    
    console.log('Submitting profile update:', {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      username: username.trim()
    });
    
    const { user: updatedUser, error } = await updateUserProfile(user.id, {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      username: username.trim() !== user.username ? username.trim() : undefined,
    });
    
    setIsSubmitting(false);
    
    if (error) {
      console.error('Profile update error:', error);
      setError(error);
      return;
    }
    
    if (updatedUser) {
      console.log('Profile updated successfully:', updatedUser);
      // Refresh user context
      if (typeof refreshUser === 'function') {
        refreshUser();
      }
      setSuccessMessage('Profile updated successfully');
    } else {
      setError('Failed to update profile. Please try again.');
    }
  };

  const handleImageChange = async (file: File) => {
    if (!user) return;
    
    setIsUploading(true);
    setError(null);
    setBucketError(false);
    
    console.log('Uploading image:', file.name, file.type, file.size);
    const { url, error } = await uploadProfileImage(user.id, file);
    
    setIsUploading(false);
    
    if (error) {
      console.error('Image upload error:', error);
      // Check if it's a bucket error
      if (error.includes('bucket not found') || error.includes('Storage bucket not found')) {
        setBucketError(true);
        setError('Image upload is not available at the moment. Profile information will still be saved.');
      } else {
        setError(error);
      }
      return;
    }
    
    if (url) {
      console.log('Image uploaded successfully');
      setProfileImage(url);
      // Refresh user context
      if (typeof refreshUser === 'function') {
        refreshUser();
      }
      setSuccessMessage('Profile image updated successfully');
    }
  };

  if (isLoading || !isMounted) {
    return (
      <Container>
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container size="sm">
      <div className="py-8 animate-fadeIn">
        <h1 className="text-3xl font-inter font-bold mb-8 text-gray-800">Your Profile</h1>
        
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
            onClose={() => setSuccessMessage(null)}
            className="mb-6"
          />
        )}
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-1/3 flex flex-col items-center">
              {bucketError ? (
                <div className="text-center mb-6">
                  <div className="w-40 h-40 rounded-full bg-gray-100 border-4 border-white shadow-md mb-4 flex items-center justify-center">
                    <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600">Image upload is temporarily unavailable.</p>
                </div>
              ) : (
                <ImageUploader
                  currentImage={profileImage}
                  onImageSelect={handleImageChange}
                  isUploading={isUploading}
                  size="md"
                  shape="circle"
                />
              )}
            </div>
            
            <div className="w-full md:w-2/3">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    required
                    fullWidth
                  />
                </div>
                
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                    fullWidth
                  />
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                    fullWidth
                  />
                </div>
                
                <div className="pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting || isUploading}
                    fullWidth
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
} 