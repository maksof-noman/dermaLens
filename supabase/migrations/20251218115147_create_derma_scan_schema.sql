/*
  # DermaScan Platform Schema

  1. New Tables
    - products: Stores derma product information
    - scan_history: Stores face scan results and analysis
    - recommended_products: Links scans with recommended products

  2. Security
    - Enable RLS on all tables
    - Products are publicly readable
    - Scan history readable by owner or anonymous users
    - Recommended products readable by anyone
*/

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  price numeric(10,2) NOT NULL DEFAULT 0,
  category text NOT NULL,
  skin_concerns text[] NOT NULL DEFAULT '{}',
  rating numeric(2,1) DEFAULT 0,
  ingredients text,
  created_at timestamptz DEFAULT now()
);

-- Scan history table
CREATE TABLE IF NOT EXISTS scan_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  image_url text,
  analysis_results jsonb DEFAULT '{}'::jsonb,
  skin_concerns text[] DEFAULT '{}',
  skin_type text,
  confidence_score numeric(5,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Recommended products table
CREATE TABLE IF NOT EXISTS recommended_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id uuid REFERENCES scan_history(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  relevance_score numeric(5,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommended_products ENABLE ROW LEVEL SECURITY;

-- Products policies (publicly readable)
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  TO public
  USING (true);

-- Scan history policies
CREATE POLICY "Users can view own scans"
  ON scan_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anonymous scans viewable by session"
  ON scan_history FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Users can insert own scans"
  ON scan_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous users can insert scans"
  ON scan_history FOR INSERT
  TO anon
  WITH CHECK (true);

-- Recommended products policies
CREATE POLICY "Recommended products viewable by everyone"
  ON recommended_products FOR SELECT
  TO public
  USING (true);

CREATE POLICY "System can insert recommendations"
  ON recommended_products FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);