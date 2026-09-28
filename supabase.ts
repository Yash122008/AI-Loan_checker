import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type ToolType =
  | 'loan_eligibility'
  | 'credit_score'
  | 'emi_calculator'
  | 'financial_tips';

export interface Assessment {
  id: string;
  tool_type: ToolType;
  user_inputs: Record<string, unknown>;
  ai_analysis: Record<string, unknown> | null;
  summary: string | null;
  created_at: string;
}

export async function saveAssessment(
  toolType: ToolType,
  userInputs: Record<string, unknown>,
  aiAnalysis: Record<string, unknown>,
  summary: string,
): Promise<Assessment | null> {
  const { data, error } = await supabase
    .from('assessments')
    .insert({
      tool_type: toolType,
      user_inputs: userInputs,
      ai_analysis: aiAnalysis,
      summary,
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Failed to save assessment:', error.message);
    return null;
  }
  return data as Assessment | null;
}

export async function fetchAssessments(
  toolType?: ToolType,
): Promise<Assessment[]> {
  let query = supabase
    .from('assessments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (toolType) {
    query = query.eq('tool_type', toolType);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Failed to fetch assessments:', error.message);
    return [];
  }
  return (data as Assessment[]) ?? [];
}

export async function deleteAssessment(id: string): Promise<boolean> {
  const { error } = await supabase.from('assessments').delete().eq('id', id);
  if (error) {
    console.error('Failed to delete assessment:', error.message);
    return false;
  }
  return true;
}
