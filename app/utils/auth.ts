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
    console.log('Updating profile for user ID:', userId);
    console.log('Update data:', data);
    
    // If username is being updated, check if it already exists
    if (data.username) {
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('username')
        .eq('username', data.username)
        .neq('id', userId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking username:', checkError);
        return { user: null, error: `Error checking username: ${checkError.message}` };
      }

      if (existingUser) {
        console.log('Username already exists:', existingUser);
        return { user: null, error: 'Username already exists' };
      }
    }

    // Prepare update data with explicit fields
    const updateData: Record<string, any> = {};
    if (data.username !== undefined) updateData.username = data.username;
    if (data.first_name !== undefined) updateData.first_name = data.first_name;
    if (data.last_name !== undefined) updateData.last_name = data.last_name;

    console.log('Final update data:', updateData);

    // Update user profile
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Update error:', error);
      return { user: null, error: `Update failed: ${error.message}` };
    }

    if (!updatedUser) {
      console.error('No user found with ID:', userId);
      return { user: null, error: 'User not found' };
    }

    // Update user in local storage
    const currentUser = getCurrentUser();
    if (currentUser) {
      const updatedUserData = { ...currentUser, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(updatedUserData));
    }

    console.log('Profile updated successfully:', updatedUser);
    return { user: updatedUser as User, error: null };
  } catch (error) {
    console.error('Unexpected error during profile update:', error);
    return { user: null, error: `Update failed: ${error instanceof Error ? error.message : String(error)}` };
  }
}

// Upload profile image
export async function uploadProfileImage(userId: string, file: File): Promise<{ url: string | null; error: string | null }> {
  try {
    console.log('Uploading profile image for user ID:', userId);
    
    // Validate file size (max 500KB para Base64)
    const maxSize = 500 * 1024; // 500KB
    if (file.size > maxSize) {
      console.log('File size exceeds limit:', file.size);
      return { url: null, error: `File size exceeds 500KB limit. Please choose a smaller image.` };
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      console.log('Invalid file type:', file.type);
      return { url: null, error: `Invalid file type. Please upload a JPEG, PNG, or WebP image.` };
    }

    // Convert file to Base64
    const base64 = await fileToBase64(file);
    console.log('File converted to Base64 successfully');
    
    // Update user profile with base64 image
    const { error: updateError } = await supabase
      .from('users')
      .update({ profile_image_url: base64 })
      .eq('id', userId);

    if (updateError) {
      console.error('Update error:', updateError);
      return { url: null, error: `Failed to update profile: ${updateError.message}` };
    }

    // Update user in local storage
    const currentUser = getCurrentUser();
    if (currentUser) {
      const updatedUserData = { ...currentUser, profile_image_url: base64 };
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      console.log('User local storage updated with new profile image');
    }

    console.log('Profile image updated successfully');
    return { url: base64, error: null };
  } catch (error) {
    console.error('Unexpected error during upload:', error);
    return { url: null, error: `Upload failed: ${error instanceof Error ? error.message : String(error)}` };
  }
}

// Helper function to convert File to Base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
} 