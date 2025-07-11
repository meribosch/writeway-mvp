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
  const { user, isLoading } = useAuth();
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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isLoading) {
      if (!user) {
        router.push('/login');
        return;
      }

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
    
    const { user: updatedUser, error } = await updateUserProfile(user.id, {
      first_name: firstName.trim() || undefined,
      last_name: lastName.trim() || undefined,
      username: username.trim() !== user.username ? username.trim() : undefined,
    });
    
    setIsSubmitting(false);
    
    if (error) {
      setError(error);
      return;
    }
    
    setSuccessMessage('Profile updated successfully');
  };

  const handleImageChange = async (file: File) => {
    if (!user) return;
    
    setIsUploading(true);
    setError(null);
    
    const { url, error } = await uploadProfileImage(user.id, file);
    
    setIsUploading(false);
    
    if (error) {
      setError(error);
      return;
    }
    
    if (url) {
      setProfileImage(url);
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
              <ImageUploader
                currentImage={profileImage}
                onImageSelect={handleImageChange}
                isUploading={isUploading}
                size="md"
                shape="circle"
              />
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