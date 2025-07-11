import { supabase } from './supabase';
import bcrypt from 'bcryptjs';
import { User } from '../types/database.types';

// Register a new user
export async function registerUser(username: string, password: string): Promise<{ user: User | null; error: string | null }> {
  try {
    console.log('Starting registration for:', username);
    
    // Check if username already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single();

    if (checkError) {
      console.error('Error checking username:', checkError);
      // PGRST116 is the error code for "no rows returned" which is what we want
      if (checkError.code !== 'PGRST116') {
        return { user: null, error: `Error checking username: ${checkError.message}` };
      }
    }

    if (existingUser) {
      console.log('Username already exists:', existingUser);
      return { user: null, error: 'Username already exists' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

    // Insert new user
    console.log('Attempting to insert new user');
    const { data, error } = await supabase
      .from('users')
      .insert([
        { username, password: hashedPassword, role: 'user' }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error inserting user:', error);
      return { user: null, error: `Registration failed: ${error.message}` };
    }

    console.log('User registered successfully:', data);
    return { user: data as User, error: null };
  } catch (error) {
    console.error('Unexpected error during registration:', error);
    return { user: null, error: `Registration failed: ${error instanceof Error ? error.message : String(error)}` };
  }
}

// Login a user
export async function loginUser(username: string, password: string): Promise<{ user: User | null; error: string | null }> {
  try {
    console.log('Attempting login for:', username);
    
    // Get user by username
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return { user: null, error: 'Invalid username or password' };
    }

    if (!user) {
      console.log('User not found');
      return { user: null, error: 'Invalid username or password' };
    }

    // Compare password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log('Invalid password');
      return { user: null, error: 'Invalid username or password' };
    }

    // Don't return the password
    const { password: _, ...userWithoutPassword } = user;
    
    // Store user in local storage
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    console.log('Login successful');
    
    return { user: userWithoutPassword as User, error: null };
  } catch (error) {
    console.error('Unexpected error during login:', error);
    return { user: null, error: 'Login failed' };
  }
}

// Logout user
export function logoutUser(): void {
  localStorage.removeItem('user');
  console.log('User logged out');
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
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
} 

// Update user profile
export async function updateUserProfile(userId: string, data: {
  first_name?: string;
  last_name?: string;
  username?: string;
}): Promise<{ user: User | null; error: string | null }> {
  try {
    // If username is being updated, check if it already exists
    if (data.username) {
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('username')
        .eq('username', data.username)
        .neq('id', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        return { user: null, error: `Error checking username: ${checkError.message}` };
      }

      if (existingUser) {
        return { user: null, error: 'Username already exists' };
      }
    }

    // Update user profile
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(data)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return { user: null, error: `Update failed: ${error.message}` };
    }

    // Update user in local storage
    const currentUser = getCurrentUser();
    if (currentUser) {
      const updatedUserData = { ...currentUser, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(updatedUserData));
    }

    return { user: updatedUser as User, error: null };
  } catch (error) {
    return { user: null, error: `Update failed: ${error instanceof Error ? error.message : String(error)}` };
  }
}

// Upload profile image
export async function uploadProfileImage(userId: string, file: File): Promise<{ url: string | null; error: string | null }> {
  try {
    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return { url: null, error: `File size exceeds 2MB limit. Please choose a smaller image.` };
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return { url: null, error: `Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.` };
    }

    // Generate a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `profile-images/${fileName}`;

    // Check if bucket exists
    const { data: buckets, error: bucketError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketError) {
      console.error('Error checking buckets:', bucketError);
      return { url: null, error: `Failed to access storage: ${bucketError.message}` };
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === 'user-content');
    
    if (!bucketExists) {
      console.error('Bucket "user-content" does not exist');
      return { url: null, error: `Storage bucket not found. Please contact support.` };
    }

    // Upload image to Supabase Storage
    const { error: uploadError } = await supabase
      .storage
      .from('user-content')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { url: null, error: `Upload failed: ${uploadError.message}` };
    }

    // Get public URL
    const { data } = supabase
      .storage
      .from('user-content')
      .getPublicUrl(filePath);

    const publicUrl = data.publicUrl;

    // Update user profile with new image URL
    const { error: updateError } = await supabase
      .from('users')
      .update({ profile_image_url: publicUrl })
      .eq('id', userId);

    if (updateError) {
      console.error('Update error:', updateError);
      return { url: null, error: `Failed to update profile: ${updateError.message}` };
    }

    // Update user in local storage
    const currentUser = getCurrentUser();
    if (currentUser) {
      const updatedUserData = { ...currentUser, profile_image_url: publicUrl };
      localStorage.setItem('user', JSON.stringify(updatedUserData));
    }

    return { url: publicUrl, error: null };
  } catch (error) {
    console.error('Unexpected error during upload:', error);
    return { url: null, error: `Upload failed: ${error instanceof Error ? error.message : String(error)}` };
  }
} 