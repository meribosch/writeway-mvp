# Writeway MVP

Writeway MVP is a simple web application that allows users to share stories with friends and family. Users can create public or private stories, comment on public stories, and moderate content.

## Features

- **User Authentication**: Simple username and password authentication
- **Story Management**: Create, read, update, and delete stories
- **Privacy Controls**: Make stories public or private
- **Comments**: Comment on public stories
- **Moderation**: Admin role for comment moderation

## Tech Stack

- **Frontend**: Next.js 14 with App Router
- **UI**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Custom authentication with bcrypt

## Setup Instructions

### Prerequisites

- Node.js (v18 or newer)
- npm or yarn
- Supabase account

### Supabase Setup

1. Create a new Supabase project
2. Copy your Supabase URL and anon key
3. Run the SQL script in `supabase-schema.sql` in the Supabase SQL Editor to set up the database schema

### Local Development

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env.local` file in the root directory with the following content:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Run the development server:
   ```
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### User Registration and Login

- Register with a username and password
- Login with your credentials

### Creating and Managing Stories

- Create new stories from the "Write Story" page
- View all your stories on the "My Stories" page
- Edit or delete your own stories

### Commenting

- Comment on public stories
- Delete your own comments

### Admin Features

- Login with the admin account (username: admin, password: admin123)
- Access the Admin Dashboard to moderate comments

## Deployment

You can deploy this application to platforms like Vercel, Netlify, or Railway:

1. Connect your repository to your preferred deployment platform
2. Set the environment variables (Supabase URL and anon key)
3. Deploy the application

## License

This project is for demonstration purposes only.
