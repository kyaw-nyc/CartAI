-- Create negotiations table to store conversation history
CREATE TABLE IF NOT EXISTS negotiations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  product TEXT,
  quantity INTEGER,
  budget NUMERIC,
  selected_priority TEXT CHECK (selected_priority IN ('speed', 'carbon', 'price')),
  chat_messages JSONB DEFAULT '[]'::jsonb,
  negotiation_messages JSONB DEFAULT '[]'::jsonb,
  negotiation_result JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS negotiations_user_id_idx ON negotiations(user_id);
CREATE INDEX IF NOT EXISTS negotiations_created_at_idx ON negotiations(created_at DESC);

-- Enable Row Level Security
ALTER TABLE negotiations ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own negotiations
CREATE POLICY "Users can view own negotiations"
  ON negotiations FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own negotiations
CREATE POLICY "Users can insert own negotiations"
  ON negotiations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own negotiations
CREATE POLICY "Users can update own negotiations"
  ON negotiations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can delete their own negotiations
CREATE POLICY "Users can delete own negotiations"
  ON negotiations FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER update_negotiations_updated_at
  BEFORE UPDATE ON negotiations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
