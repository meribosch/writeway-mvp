// This is a test file to check if we can connect to Supabase and register a user
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Initialize Supabase client
const supabaseUrl = 'https://zvijuuirirlrowtxuuvv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aWp1dWlyaXJscm93dHh1dXZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5ODY2MjYsImV4cCI6MjA2NzU2MjYyNn0.7aXqsVDQ1SIH42HLfSS0MkJBrpJpTOqQ3EusnsnbYmI';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to test user registration
async function testRegisterUser() {
  try {
    console.log('Starting test registration');
    
    const username = 'testuser' + Math.floor(Math.random() * 1000);
    const password = 'password123';
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');
    
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
        return;
      }
    }
    
    if (existingUser) {
      console.log('Username already exists:', existingUser);
      return;
    }
    
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
      return;
    }
    
    console.log('User registered successfully:', data);
  } catch (error) {
    console.error('Unexpected error during test registration:', error);
  }
}

// Run the test
testRegisterUser();
