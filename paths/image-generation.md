# AI Colouring Page Generator - Product Requirements Document

## Overview
An AI-powered web application that generates customizable coloring pages from text descriptions. The application will transform user prompts into black and white line art suitable for coloring, with various customization options and a gallery system for saved designs.

## Technical Stack
- Framework: Next.js 14+ with App Router
- Language: TypeScript
- Styling: Tailwind CSS
- State Management: React Context + Hooks
- Database: Supabase (PostgreSQL + Storage)
- AI Integration: OpenAI DALL-E API with custom post-processing
- Testing: Jest + React Testing Library
- Deployment: Netlify
- Authentication: Supabase Auth

## Infrastructure Setup

### Netlify Configuration
- Build settings:
  - Build command: `npm run build`
  - Publish directory: `.next`
  - Node version: 18.x+
- Environment variables management
- Deploy previews for pull requests
- Branch deploy settings
- Custom domain setup
- SSL/TLS configuration

### Supabase Integration

#### Database Schema
```sql
-- Users table (extends Supabase auth.users)
create table public.user_profiles (
  id uuid references auth.users primary key,
  username text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Images table
create table public.images (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  prompt text not null,
  storage_path text not null,
  parameters jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  metadata jsonb
);

-- Collections table
create table public.collections (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Collection items table
create table public.collection_items (
  collection_id uuid references public.collections not null,
  image_id uuid references public.images not null,
  added_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (collection_id, image_id)
);
```

#### Storage Buckets
- `images`: Generated coloring pages
- `thumbnails`: Optimized previews
- `exports`: Downloadable files in various formats

#### Row Level Security (RLS) Policies
```sql
-- Images access policy
create policy "Users can view their own images"
  on images for select
  using (auth.uid() = user_id);

-- Collections access policy
create policy "Users can manage their own collections"
  on collections for all
  using (auth.uid() = user_id);
```

## Core Features

### 1. Authentication Flow
- Email/password registration
- Social auth providers:
  - Google
  - GitHub
- Password reset flow
- Session management
- Protected routes
- User profile management

### 2. Image Generation Interface
Prompt Input

Multi-line text input field with character counter
Suggested prompts carousel for inspiration
Prompt history with quick reuse functionality
Auto-save draft prompts
Style presets (e.g., "Cartoon", "Realistic", "Manga")

Advanced Controls

Line thickness adjustment (1-5 scale)
Complexity level (Simple, Medium, Complex)
Canvas size selection (A4, A5, Letter, Custom)
Orientation toggle (Portrait/Landscape)
Style modifiers:

Detail level (Low, Medium, High)
Edge softness
Background removal option
Symmetry options (None, Horizontal, Vertical, Both)



AI Processing Pipeline
Image Generation

Initial generation using DALL-E API
Post-processing steps:

Edge detection and enhancement
Conversion to high-contrast black and white
Line smoothing and optimization
Background cleanup
Optional symmetry application



Performance Optimization

Client-side caching of generated images
Progressive image loading
Batch processing for multiple variations
Request queuing system for concurrent generations

3. User Interface Components
Generation Progress

Step-by-step progress indicator
Estimated time remaining
Cancel generation option
Preview of intermediate results
Error recovery suggestions

Gallery View

Masonry grid layout
Infinite scroll pagination
Filter by:

Date created
Style preset
Canvas size
Complexity level


Sort by:

Newest first
Oldest first
Most complex
Most simple


Image Management

Download options:

PNG (high-res)
PDF (print-ready)
SVG (vector format)


Sharing capabilities:

Direct link
Social media integration
Email sharing


Collection organization:

Custom folders
Tagging system
Favorites


4. Responsive Design Specifications
Breakpoints

Mobile: 320px - 480px
Tablet: 481px - 768px
Desktop: 769px+

Layout Adaptations

Mobile:

Single column layout
Bottom sheet for advanced controls
Gesture-based navigation
Simplified gallery view


Tablet:

Two-column layout
Slide-out control panel
Touch-optimized UI elements


Desktop:

Multi-column layout
Persistent advanced controls
Keyboard shortcuts
Side-by-side preview

### 3. Data Management

#### Image Storage
- Direct upload to Supabase Storage
- Automatic thumbnail generation
- Metadata storage in PostgreSQL
- Cached image URLs
- Automatic cleanup of unused files

#### Database Operations
- Real-time subscriptions for updates
- Batch operations for multiple images
- Optimistic updates
- Offline support with sync
- Automatic retry on failure

### 4. Deployment Pipeline

#### Netlify CI/CD
- Automatic deployments from main branch
- Preview deployments for pull requests
- Environment-specific builds
- Build caching
- Post-processing optimization

#### Build Optimization
- Code splitting
- Image optimization
- CSS purging
- JavaScript minification
- Static page generation

[Previous sections for Responsive Design, Error Handling, Performance Targets remain the same]

### 5. Security Considerations

#### Authentication Security
- JWT token management
- Refresh token rotation
- Session timeouts
- CORS configuration
- API rate limiting

#### Database Security
- Row Level Security (RLS)
- SQL injection prevention
- Input sanitization
- Prepared statements
- Audit logging

## Development Milestones

1. MVP (4 weeks)
   - Supabase setup and schema implementation
   - Basic auth flow
   - Image generation and storage
   - Simple gallery with RLS

2. Beta Release (8 weeks)
   - Advanced query optimization
   - Real-time features
   - Storage optimization
   - Full auth features

3. Production Release (12 weeks)
   - Performance optimization
   - CDN configuration
   - Security hardening
   - Documentation

## Technical Dependencies

### Required Services
- Supabase Project
  - PostgreSQL database
  - Storage buckets
  - Authentication
  - Edge functions
- Netlify
  - Build plugins
  - Forms
  - Functions
  - Identity
- OpenAI API

## Success Metrics

- Generation success rate > 95%
- Average generation time < 10s
- User satisfaction score > 4.5/5
- Browser compatibility > 98%
- Mobile usage > 40%

### Example Supabase components

// Example server component
async function GalleryPage() {
  const supabase = createServerSupabaseClient()
  
  const { data: images } = await supabase
    .from('images')
    .select('*')
    .order('created_at', { ascending: false })
  
  return <div>{/* Render images */}</div>
}

// Example client component
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase'

function ImageUploader() {
  const uploadImage = async (file: File) => {
    const { data, error } = await supabase
      .storage
      .from('images')
      .upload(`${Date.now()}-${file.name}`, file)
      
    if (error) {
      console.error('Error uploading file:', error)
      return
    }
    
    // Save image reference to database
    const { error: dbError } = await supabase
      .from('images')
      .insert({
        storage_path: data.path,
        prompt: 'User uploaded image'
      })
  }
  
  return <div>{/* Upload UI */}</div>
}