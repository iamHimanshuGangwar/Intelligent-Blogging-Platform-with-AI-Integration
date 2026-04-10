-- Migration: 013_add_ai_generation_logs.sql
-- Description: Add a table to log AI content generation requests.

-- AI Generation Logs Table
CREATE TABLE ai_generation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  model_used TEXT NOT NULL,
  prompt TEXT,
  generated_content_excerpt TEXT,
  word_count INT,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'pending')),
  error_message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_ai_generation_logs_user_id ON ai_generation_logs(user_id);
CREATE INDEX idx_ai_generation_logs_model_used ON ai_generation_logs(model_used);
CREATE INDEX idx_ai_generation_logs_created_at ON ai_generation_logs(created_at DESC);

-- Row-Level Security Policies
ALTER TABLE ai_generation_logs ENABLE ROW LEVEL SECURITY;

-- Admins can see all logs
CREATE POLICY "Admins can see all logs" ON ai_generation_logs
  FOR SELECT USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- Users can see their own logs
CREATE POLICY "Users can see their own logs" ON ai_generation_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Allow service roles to insert logs (e.g., from the backend)
CREATE POLICY "Allow service role to insert" ON ai_generation_logs
  FOR INSERT WITH CHECK (true);
