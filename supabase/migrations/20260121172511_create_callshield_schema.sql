/*
  # CallShield Database Schema
  
  ## Overview
  Creates the complete database schema for the CallShield AI call protection app.
  
  ## New Tables
  
  ### 1. users
  - `id` (bigserial, primary key) - Unique user identifier
  - `username` (text, unique) - User login name
  - `display_name` (text, nullable) - Display name for the user
  - `created_at` (timestamptz) - Account creation timestamp
  
  ### 2. calls
  - `id` (bigserial, primary key) - Unique call identifier
  - `user_id` (bigint, foreign key) - References users table
  - `phone_number` (text) - Caller's phone number
  - `caller_name` (text, nullable) - Name of caller if available
  - `timestamp` (timestamptz) - When the call occurred
  - `risk_score` (integer, default 0) - AI-calculated risk score (0-100)
  - `category` (text, default 'unknown') - Call category (spam, scam, legitimate, etc.)
  - `transcription` (text, nullable) - Call transcription
  - `ai_response` (text, nullable) - AI assistant's response during call
  - `duration` (integer, nullable) - Call duration in seconds
  - `blocked` (boolean, default false) - Whether call was blocked
  
  ### 3. blocked_rules
  - `id` (bigserial, primary key) - Unique rule identifier
  - `user_id` (bigint, foreign key) - References users table
  - `phone_number` (text) - Phone number or pattern to block
  - `rule_name` (text) - Descriptive name for the rule
  - `is_wildcard` (boolean, default false) - Whether this is a pattern match
  - `created_at` (timestamptz) - When rule was created
  
  ### 4. user_settings
  - `id` (bigserial, primary key) - Unique settings identifier
  - `user_id` (bigint, foreign key, unique) - References users table
  - `screening_enabled` (boolean, default true) - Whether AI screening is active
  - `protection_level` (text, default 'medium') - Protection level (low, medium, high)
  - `quiet_hours_start` (text, nullable) - Start time for quiet hours (HH:MM)
  - `quiet_hours_end` (text, nullable) - End time for quiet hours (HH:MM)
  - `auto_block_threshold` (integer, default 70) - Risk score threshold for auto-blocking
  
  ### 5. conversations
  - `id` (bigserial, primary key) - Unique conversation identifier
  - `user_id` (bigint, foreign key) - References users table
  - `title` (text, default 'New Conversation') - Conversation title
  - `created_at` (timestamptz) - When conversation started
  - `updated_at` (timestamptz) - Last message timestamp
  
  ### 6. messages
  - `id` (bigserial, primary key) - Unique message identifier
  - `conversation_id` (bigint, foreign key) - References conversations table
  - `role` (text) - Message role (user or assistant)
  - `content` (text) - Message content
  - `timestamp` (timestamptz) - When message was sent
  
  ## Security
  - RLS enabled on all tables
  - Users can only access their own data
  - Appropriate policies for SELECT, INSERT, UPDATE, DELETE operations
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id bigserial PRIMARY KEY,
  username text UNIQUE NOT NULL,
  display_name text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create calls table
CREATE TABLE IF NOT EXISTS calls (
  id bigserial PRIMARY KEY,
  user_id bigint REFERENCES users(id) NOT NULL,
  phone_number text NOT NULL,
  caller_name text,
  timestamp timestamptz DEFAULT now() NOT NULL,
  risk_score integer DEFAULT 0 NOT NULL,
  category text DEFAULT 'unknown' NOT NULL,
  transcription text,
  ai_response text,
  duration integer,
  blocked boolean DEFAULT false NOT NULL
);

-- Create blocked_rules table
CREATE TABLE IF NOT EXISTS blocked_rules (
  id bigserial PRIMARY KEY,
  user_id bigint REFERENCES users(id) NOT NULL,
  phone_number text NOT NULL,
  rule_name text NOT NULL,
  is_wildcard boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id bigserial PRIMARY KEY,
  user_id bigint REFERENCES users(id) NOT NULL UNIQUE,
  screening_enabled boolean DEFAULT true NOT NULL,
  protection_level text DEFAULT 'medium' NOT NULL,
  quiet_hours_start text,
  quiet_hours_end text,
  auto_block_threshold integer DEFAULT 70 NOT NULL
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id bigserial PRIMARY KEY,
  user_id bigint REFERENCES users(id) NOT NULL,
  title text DEFAULT 'New Conversation' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id bigserial PRIMARY KEY,
  conversation_id bigint REFERENCES conversations(id) NOT NULL,
  role text NOT NULL,
  content text NOT NULL,
  timestamp timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid()::text = username);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = username)
  WITH CHECK (auth.uid()::text = username);

-- RLS Policies for calls table
CREATE POLICY "Users can view own calls"
  ON calls FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE username = auth.uid()::text));

CREATE POLICY "Users can insert own calls"
  ON calls FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM users WHERE username = auth.uid()::text));

CREATE POLICY "Users can update own calls"
  ON calls FOR UPDATE
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE username = auth.uid()::text))
  WITH CHECK (user_id IN (SELECT id FROM users WHERE username = auth.uid()::text));

CREATE POLICY "Users can delete own calls"
  ON calls FOR DELETE
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE username = auth.uid()::text));

-- RLS Policies for blocked_rules table
CREATE POLICY "Users can view own blocked rules"
  ON blocked_rules FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE username = auth.uid()::text));

CREATE POLICY "Users can insert own blocked rules"
  ON blocked_rules FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM users WHERE username = auth.uid()::text));

CREATE POLICY "Users can delete own blocked rules"
  ON blocked_rules FOR DELETE
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE username = auth.uid()::text));

-- RLS Policies for user_settings table
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE username = auth.uid()::text));

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM users WHERE username = auth.uid()::text));

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE username = auth.uid()::text))
  WITH CHECK (user_id IN (SELECT id FROM users WHERE username = auth.uid()::text));

-- RLS Policies for conversations table
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE username = auth.uid()::text));

CREATE POLICY "Users can insert own conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM users WHERE username = auth.uid()::text));

CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE username = auth.uid()::text))
  WITH CHECK (user_id IN (SELECT id FROM users WHERE username = auth.uid()::text));

CREATE POLICY "Users can delete own conversations"
  ON conversations FOR DELETE
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE username = auth.uid()::text));

-- RLS Policies for messages table
CREATE POLICY "Users can view messages in own conversations"
  ON messages FOR SELECT
  TO authenticated
  USING (conversation_id IN (
    SELECT id FROM conversations WHERE user_id IN (
      SELECT id FROM users WHERE username = auth.uid()::text
    )
  ));

CREATE POLICY "Users can insert messages in own conversations"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (conversation_id IN (
    SELECT id FROM conversations WHERE user_id IN (
      SELECT id FROM users WHERE username = auth.uid()::text
    )
  ));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_calls_user_id ON calls(user_id);
CREATE INDEX IF NOT EXISTS idx_calls_timestamp ON calls(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_blocked_rules_user_id ON blocked_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
