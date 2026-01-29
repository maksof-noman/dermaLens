/*
  # Create Scan Logs Table

  1. New Tables
    - `scan_logs`
      - `id` (uuid, primary key) - Unique identifier for each scan
      - `created_at` (timestamptz) - When the scan was performed
      - `image_size_bytes` (integer) - Size of the uploaded image in bytes
      - `prompt_sent` (text) - The prompt sent to OpenAI API
      - `openai_model` (text) - Model used (e.g., gpt-4o)
      - `openai_response` (jsonb) - Full response from OpenAI
      - `tokens_used` (jsonb) - Token usage details (prompt_tokens, completion_tokens, total_tokens)
      - `analysis_result` (jsonb) - Parsed skin analysis result
      - `error_message` (text) - Any error that occurred during processing
      - `processing_time_ms` (integer) - Time taken to process the scan
      - `success` (boolean) - Whether the scan was successful
      
  2. Security
    - Enable RLS on `scan_logs` table
    - Public can insert scan logs (for anonymous usage)
    - No read access by default (for admin review only)
    
  3. Indexes
    - Index on created_at for time-based queries
    - Index on success for filtering failed scans
*/

CREATE TABLE IF NOT EXISTS scan_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  image_size_bytes integer,
  prompt_sent text,
  openai_model text DEFAULT 'gpt-4o',
  openai_response jsonb,
  tokens_used jsonb,
  analysis_result jsonb,
  error_message text,
  processing_time_ms integer,
  success boolean DEFAULT false
);

ALTER TABLE scan_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert scan logs"
  ON scan_logs
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_scan_logs_created_at ON scan_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scan_logs_success ON scan_logs(success);
CREATE INDEX IF NOT EXISTS idx_scan_logs_error ON scan_logs(success) WHERE success = false;