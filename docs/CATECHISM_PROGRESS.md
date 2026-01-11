# Child Catechism Progress Tracking

This feature allows users to sign up, register their children, and track their progress through various catechisms.

## Features

- **User Authentication**: Sign up and sign in with email/password
- **Children Management**: Add, edit, and remove children with name and birth date
- **Catechism Assignments**: Assign catechisms to children:
  - Westminster Shorter Catechism (WSC) - 107 questions
  - Westminster Larger Catechism (WLC) - 196 questions  
  - Catechism for Young Children (CfYC) - 145 questions
  - Heidelberg Catechism (HC) - 129 questions
- **Progress Tracking**: Track current question number with increment/decrement buttons
- **Quick Links**: Direct link to the current question in the search interface
- **Completion Tracking**: Mark catechisms as completed when finished

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and publishable key from Settings > API (or the Connect dialog)

### 2. Set Up Environment Variables

Create a `.env.local` file in the project root:

```bash
# Copy from .env.example
cp .env.example .env.local
```

Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

### 3. Set Up the Database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL from `/lib/database.sql` to create the necessary tables

### 4. Configure Authentication

In your Supabase project:

1. Go to Authentication > Settings
2. Enable Email/Password sign-in
3. Optionally configure email templates for verification emails

## User Flow

### Sign Up
1. Click "Sign Up" in the navigation
2. Enter email and password
3. Verify email (if email verification is enabled)
4. Sign in

### Add a Child
1. Go to Dashboard
2. Click "Add Child"
3. Enter name and optional birth date
4. Click "Add Child"

### Assign a Catechism
1. Click on a child's card to view details
2. Click "Assign Catechism"
3. Select a catechism from the list
4. Click "Assign"

### Track Progress
1. View the child's detail page
2. Use +/- buttons to update the current question number
3. Click "Go to Question X" to view that question in the search interface
4. When finished, click "Mark Complete"

## File Structure

```
/context
  └── AuthContext.jsx        # Authentication context provider

/hooks
  └── useChildren.js         # Hooks for children & assignment management

/lib
  ├── supabase.js           # Supabase browser client
  ├── supabase-server.js    # Supabase server client
  ├── catechisms.js         # Catechism metadata and helpers
  └── database.sql          # Database schema

/pages
  ├── auth/
  │   ├── signin.jsx        # Sign in page
  │   └── signup.jsx        # Sign up page
  └── dashboard/
      ├── index.jsx         # Dashboard with children list
      └── children/
          └── [childId].jsx # Child detail with assignments
```

## Database Schema

### children
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | References auth.users |
| name | TEXT | Child's name |
| birth_date | DATE | Optional birth date |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### catechism_assignments
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| child_id | UUID | References children |
| catechism_id | TEXT | WSC, WLC, CfYC, or HC |
| current_question | INTEGER | Current progress (1-based) |
| started_at | TIMESTAMP | When assignment started |
| completed_at | TIMESTAMP | When completed (nullable) |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

## Security

Row Level Security (RLS) is enabled on all tables:
- Users can only view, create, update, and delete their own children
- Users can only manage catechism assignments for their own children
