-- Schema for AI Assistant (Master WrAIter) conversations

-- Table to store AI conversations
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  detected_genre TEXT,
  title TEXT NOT NULL
);

-- Table to store individual messages in a conversation
CREATE TABLE IF NOT EXISTS ai_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  is_user BOOLEAN NOT NULL, -- true if message is from user, false if from AI
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  prompt_type TEXT -- 'grammar', 'structure', 'custom', etc.
);

-- Table to store cached responses to reduce API calls
CREATE TABLE IF NOT EXISTS ai_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_hash TEXT UNIQUE NOT NULL, -- hash of the prompt for quick lookup
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_count INTEGER DEFAULT 1,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_conversations_story_id ON ai_conversations(story_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_cache_prompt_hash ON ai_cache(prompt_hash);

-- Comments for clarity
COMMENT ON TABLE ai_conversations IS 'Stores master conversations between users and the AI about specific stories';
COMMENT ON TABLE ai_messages IS 'Stores individual messages within AI conversations';
COMMENT ON TABLE ai_cache IS 'Caches AI responses to reduce API calls for similar prompts'; 