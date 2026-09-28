/*
# Create assessments table (single-tenant, no auth)

## Purpose
Stores results from all four financial tools (Loan Eligibility Checker,
Credit Score Analyzer, EMI Calculator, AI Financial Tips) so users can
review past analyses across sessions.

## New Tables
- `assessments`
  - `id` (uuid, primary key)
  - `tool_type` (text, not null) — which tool generated this assessment:
    'loan_eligibility', 'credit_score', 'emi_calculator', 'financial_tips'
  - `user_inputs` (jsonb, not null) — the raw inputs the user provided
  - `ai_analysis` (jsonb) — the computed/AI-generated analysis result
  - `summary` (text) — short human-readable headline for the assessment
  - `created_at` (timestamptz, defaults to now())

## Security
- RLS enabled on `assessments`.
- Anon + authenticated CRUD allowed because this is a single-tenant app
  with no sign-in screen — all data is intentionally shared/public.
*/

CREATE TABLE IF NOT EXISTS assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_type text NOT NULL,
  user_inputs jsonb NOT NULL,
  ai_analysis jsonb,
  summary text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_assessments" ON assessments;
CREATE POLICY "anon_select_assessments" ON assessments FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_assessments" ON assessments;
CREATE POLICY "anon_insert_assessments" ON assessments FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_assessments" ON assessments;
CREATE POLICY "anon_update_assessments" ON assessments FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_assessments" ON assessments;
CREATE POLICY "anon_delete_assessments" ON assessments FOR DELETE
  TO anon, authenticated USING (true);