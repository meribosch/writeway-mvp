-- Create tables for the Writeway MVP app

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user', -- can be 'user' or 'admin'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de historias
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_public BOOLEAN DEFAULT true,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de comentarios
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Stories policies
CREATE POLICY "Public stories are viewable by everyone" ON stories
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own stories" ON stories
  FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Users can create stories" ON stories
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own stories" ON stories
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own stories" ON stories
  FOR DELETE USING (auth.uid() = author_id);

-- Comments policies
CREATE POLICY "Comments on public stories are viewable by everyone" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = comments.story_id AND stories.is_public = true
    )
  );

CREATE POLICY "Users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete their own comments" ON comments
  FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "Admins can delete any comment" ON comments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Insert an admin user (password: admin123)
INSERT INTO users (username, password, role)
VALUES ('admin', '$2a$10$YMxhHYVdpXOQOtUH8uMkku7Wp5GQtKDdvJmcjZZA0Jz7RPGQlBlPK', 'admin');

-- Insert some sample stories
INSERT INTO stories (title, content, is_public, author_id)
VALUES 
  ('Welcome to Writeway MVP', 'This is a sample story to showcase the features of Writeway MVP. Feel free to explore the app and create your own stories!', true, (SELECT id FROM users WHERE username = 'admin')),
  ('How to use Writeway MVP', 'Writeway MVP is a simple platform for sharing stories with friends and family. You can create public or private stories, comment on public stories, and more.', true, (SELECT id FROM users WHERE username = 'admin')); 