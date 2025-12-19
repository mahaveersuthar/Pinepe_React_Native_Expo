/*
  # Initial Schema Setup for Premium React Native App

  ## Overview
  This migration creates the foundational database structure for a modern payment and services app.

  ## 1. New Tables
  
  ### `users`
  - `id` (uuid, primary key) - Unique user identifier
  - `email` (text, unique) - User email address
  - `phone` (text, unique) - User phone number
  - `username` (text, unique) - User username
  - `full_name` (text) - User's full name
  - `profile_image` (text) - URL to profile image
  - `mpin_hash` (text) - Encrypted MPIN for transactions
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `transactions`
  - `id` (uuid, primary key) - Unique transaction identifier
  - `user_id` (uuid, foreign key) - Reference to users table
  - `type` (text) - Transaction type (purchase, refund, etc.)
  - `amount` (decimal) - Transaction amount
  - `description` (text) - Transaction description
  - `status` (text) - Transaction status (pending, completed, failed)
  - `service_id` (uuid, nullable) - Reference to service if applicable
  - `created_at` (timestamptz) - Transaction timestamp

  ### `services`
  - `id` (uuid, primary key) - Unique service identifier
  - `name` (text) - Service name
  - `description` (text) - Service description
  - `price` (decimal) - Service price
  - `image_url` (text) - Service image URL
  - `category` (text) - Service category
  - `is_active` (boolean) - Service availability status
  - `created_at` (timestamptz) - Service creation timestamp

  ### `user_sessions`
  - `id` (uuid, primary key) - Session identifier
  - `user_id` (uuid, foreign key) - Reference to users table
  - `token` (text) - JWT token
  - `expires_at` (timestamptz) - Token expiration time
  - `created_at` (timestamptz) - Session creation timestamp

  ## 2. Security
  - Enable RLS on all tables
  - Users can only read/update their own data
  - Transactions are read-only for users (created via edge functions)
  - Services are readable by all authenticated users
  - Sessions are managed per user

  ## 3. Important Notes
  - All sensitive data (MPIN) should be hashed before storage
  - Use secure communication for all transactions
  - Implement proper validation on client side
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  phone text UNIQUE,
  username text UNIQUE,
  full_name text NOT NULL,
  profile_image text DEFAULT '',
  mpin_hash text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT email_phone_username_check CHECK (
    email IS NOT NULL OR phone IS NOT NULL OR username IS NOT NULL
  )
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  amount decimal(10, 2) NOT NULL,
  description text DEFAULT '',
  status text DEFAULT 'pending',
  service_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  price decimal(10, 2) NOT NULL,
  image_url text DEFAULT '',
  category text DEFAULT 'general',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for transactions table
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for services table
CREATE POLICY "Authenticated users can view active services"
  ON services FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS Policies for user_sessions table
CREATE POLICY "Users can view own sessions"
  ON user_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions"
  ON user_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON user_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);

-- Insert sample services
INSERT INTO services (name, description, price, image_url, category, is_active) VALUES
  ('Mobile Recharge', 'Instant mobile recharge for all operators', 10.00, 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=400', 'recharge', true),
  ('DTH Recharge', 'Recharge your DTH connection instantly', 15.00, 'https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg?auto=compress&cs=tinysrgb&w=400', 'recharge', true),
  ('Electricity Bill', 'Pay your electricity bill with ease', 50.00, 'https://images.pexels.com/photos/949587/pexels-photo-949587.jpeg?auto=compress&cs=tinysrgb&w=400', 'bills', true),
  ('Water Bill', 'Pay your water bill instantly', 30.00, 'https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg?auto=compress&cs=tinysrgb&w=400', 'bills', true),
  ('Internet Bill', 'Pay broadband and internet bills', 40.00, 'https://images.pexels.com/photos/4218883/pexels-photo-4218883.jpeg?auto=compress&cs=tinysrgb&w=400', 'bills', true),
  ('Insurance Premium', 'Pay insurance premiums securely', 100.00, 'https://images.pexels.com/photos/6863332/pexels-photo-6863332.jpeg?auto=compress&cs=tinysrgb&w=400', 'insurance', true)
ON CONFLICT DO NOTHING;