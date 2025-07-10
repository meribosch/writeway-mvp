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

// Update user profile
export async function updateUserProfile(
  userId: string,
  profileData: {
    first_name?: string;
    last_name?: string;
    username?: string;
    profile_image_url?: string;
  }
): Promise<{ user: User | null; error: string | null }> {
  try {
    // If username is being updated, check if it already exists
    if (profileData.username) {
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('username')
        .eq('username', profileData.username)
        .neq('id', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking username:', checkError);
      }

      if (existingUser) {
        return { user: null, error: 'Username already exists' };
      }
    }

    // Update user profile
    const { data, error } = await supabase
      .from('users')
      .update(profileData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return { user: null, error: error.message };
    }

    if (!data) {
      return { user: null, error: 'User not found' };
    }

    // Don't return the password
    const { password: _, ...userWithoutPassword } = data;
    
    // Update user in local storage
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    
    return { user: userWithoutPassword as User, error: null };
  } catch (error) {
    console.error('Update profile error:', error);
    return { user: null, error: 'Failed to update profile' };
  }
}

// Upload profile image
export async function uploadProfileImage(
  userId: string,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `profile-images/${fileName}`;

    // Upload image to Supabase Storage
    const { data, error } = await supabase.storage
      .from('user-content')
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading image:', error);
      return { url: null, error: error.message };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('user-content')
      .getPublicUrl(filePath);

    // Update user profile with new image URL
    const { user, error: updateError } = await updateUserProfile(userId, {
      profile_image_url: publicUrl
    });

    if (updateError) {
      return { url: null, error: updateError };
    }

    return { url: publicUrl, error: null };
  } catch (error) {
    console.error('Upload image error:', error);
    return { url: null, error: 'Failed to upload image' };
  }
} 