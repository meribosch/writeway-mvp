'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile, uploadProfileImage } from '../utils/auth';
import Container from '../components/Container';
import Button from '../components/Button';
import Input from '../components/Input';
import Alert from '../components/Alert';
import Image from 'next/image';

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    setIsSubmitting(true);
    setError(null);
    
    const { url, error } = await uploadProfileImage(user.id, file);
    
    setIsSubmitting(false);
    
    if (error) {
      setError(error);
      return;
    }
    
    if (url) {
      setProfileImage(url);
      setSuccessMessage('Profile image updated successfully');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
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
              <div className="relative w-40 h-40 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-md mb-4">
                {profileImage ? (
                  <Image 
                    src={profileImage}
                    alt="Profile" 
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="160px"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-purple-50">
                    <svg className="h-20 w-20 text-purple-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                )}
              </div>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
              
              <Button
                onClick={triggerFileInput}
                variant="secondary"
                disabled={isSubmitting}
                className="mt-2"
              >
                {profileImage ? 'Change Photo' : 'Upload Photo'}
              </Button>
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
                    disabled={isSubmitting}
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