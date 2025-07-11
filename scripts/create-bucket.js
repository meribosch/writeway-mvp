// Script to create a storage bucket in Supabase
const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from environment variables or hardcode them for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zvijuuirirlrowtxuuvv.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // This should be the service key, not the anon key

// Exit if no service key is provided
if (!supabaseServiceKey) {
  console.error('Error: SUPABASE_SERVICE_KEY environment variable is required');
  console.error('You need to use a service key with enough permissions to create buckets');
  console.error('Please set it and try again');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createBucket() {
  try {
    // Create the bucket
    const { data, error } = await supabase.storage.createBucket('user-content', {
      public: true, // Make the bucket public
      fileSizeLimit: 1024 * 1024 * 2, // 2MB file size limit
    });

    if (error) {
      console.error('Error creating bucket:', error.message);
      return;
    }

    console.log('Bucket created successfully:', data);

    // Set up a policy to allow authenticated users to upload files to their own folder
    const { error: policyError } = await supabase.storage.from('user-content').createPolicy('authenticated-uploads', {
      name: 'authenticated-uploads',
      definition: `
        bucket_id = 'user-content' AND
        auth.uid() IS NOT NULL AND
        (storage.foldername(name))[1] = auth.uid()::text
      `
    });

    if (policyError) {
      console.error('Error creating policy:', policyError.message);
      return;
    }

    console.log('Policy created successfully');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createBucket(); 