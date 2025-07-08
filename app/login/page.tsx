'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Container from '../components/Container';
import Button from '../components/Button';
import Input from '../components/Input';
import Alert from '../components/Alert';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { success, error } = await login(username, password);

    if (success) {
      router.push('/');
    } else {
      setError(error || 'An error occurred during login');
      setIsLoading(false);
    }
  };

  return (
    <Container size="sm">
      <div className="bg-white rounded-lg shadow-md p-8 my-10 animate-fadeIn">
        <h1 className="text-3xl font-playfair font-bold mb-6 text-center text-gray-800">
          Welcome Back
        </h1>
        
        {error && (
          <Alert 
            type="error" 
            message={error} 
            onClose={() => setError(null)}
            className="mb-6"
          />
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            id="username"
            type="text"
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            required
          />
          
          <Input
            id="password"
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
          />
          
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </div>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="text-purple-600 hover:text-purple-800 font-medium">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </Container>
  );
} 