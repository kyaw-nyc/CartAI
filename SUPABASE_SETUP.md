# Supabase Setup Instructions

## Setting up the Negotiations Table

To enable persistent chat history across login sessions, you need to run the SQL migration in your Supabase project.

### Steps:

1. **Open your Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Migration**
   - Copy the contents of `supabase-schema.sql`
   - Paste it into the SQL editor
   - Click "Run" or press Cmd/Ctrl + Enter

4. **Verify the Setup**
   - Go to "Table Editor" in the left sidebar
   - You should see a new table called `negotiations`
   - The table should have the following columns:
     - id (uuid, primary key)
     - user_id (uuid, foreign key to auth.users)
     - title (text)
     - product (text, nullable)
     - quantity (integer, nullable)
     - budget (numeric, nullable)
     - selected_priority (text, nullable)
     - chat_messages (jsonb)
     - negotiation_messages (jsonb)
     - negotiation_result (jsonb, nullable)
     - created_at (timestamp with time zone)
     - updated_at (timestamp with time zone)

### What This Enables:

- **Persistent Chat History**: All negotiations are automatically saved to the database
- **Cross-Device Access**: Users can access their negotiation history from any device
- **Secure Storage**: Row Level Security (RLS) ensures users can only see their own data
- **Automatic Sync**: Chat history syncs automatically when users log in

### How It Works:

1. When a user starts a negotiation, it's saved locally first
2. When the negotiation completes, it's automatically saved to Supabase
3. When a user logs in, all their past negotiations are loaded from the database
4. Users can delete negotiations, which removes them from both local storage and the database

### Testing:

1. Log in to your app
2. Start a negotiation and complete it
3. Log out
4. Log back in
5. You should see your previous negotiation in the history

---

## Troubleshooting

If you encounter any issues:

1. **Check RLS Policies**: Make sure Row Level Security is enabled and policies are created
2. **Check User ID**: Verify that `auth.uid()` returns the correct user ID
3. **Check Console**: Open browser console to see any error messages
4. **Check Supabase Logs**: Go to "Logs" in Supabase dashboard to see database errors
