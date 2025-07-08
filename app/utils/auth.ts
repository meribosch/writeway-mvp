import { supabase } from './supabase';
import bcrypt from 'bcryptjs';
import { User } from '../types/database.types';

// Register a new user
export async function registerUser(username: string, password: string): Promise<{ user: User | null; error: string | null }> {
  try {
    // Check if username already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      return { user: null, error: 'Error checking username' };
    }

    if (existingUser) {
      return { user: null, error: 'Username already exists' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const { data, error } = await supabase
      .from('users')
      .insert([
        { username, password: hashedPassword, role: 'user' }
      ])
      .select()
      .single();

    if (error) {
      return { user: null, error: error.message };
    }

    return { user: data as User, error: null };
  } catch (error) {
    return { user: null, error: 'Registration failed' };
  }
}

// Login a user
export async function loginUser(username: string, password: string): Promise<{ user: User | null; error: string | null }> {
  try {
    // Get user by username
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
      return { user: null, error: 'Invalid username or password' };
    }

    // Compare password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return { user: null, error: 'Invalid username or password' };
    }

    // Don't return the password
    const { password: _, ...userWithoutPassword } = user;
    
    // Store user in local storage
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    
    return { user: userWithoutPassword as User, error: null };
  } catch (error) {
    return { user: null, error: 'Login failed' };
  }
}

// Logout user
export function logoutUser(): void {
  localStorage.removeItem('user');
}

// Get current user from localStorage
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    return null;
  }
  
  try {
    return JSON.parse(userStr) as User;
  } catch (error) {
    return null;
  }
} 