import { supabase } from '../supabase';

interface UpdatePolicyResult {
  success: boolean;
  error?: Error;
}

export async function updateTreatmentPlansPolicy(): Promise<UpdatePolicyResult> {
  try {
    // First delete the existing policy
    await supabase.rpc('policies_delete', {
      table_name: 'treatment_plans',
      policy_name: 'Users can view treatment plans'
    });

    // Create new policy with updated conditions
    await supabase.rpc('policies_create', {
      table_name: 'treatment_plans',
      policy_name: 'Users can view treatment plans',
      policy_definition: `
        provider_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM clients
          WHERE clients.id = treatment_plans.client_id
          AND clients.parent_id = auth.uid()
        ) OR
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = auth.uid()
          AND (users.role = 'admin' OR users.role = 'employee')
        )
      `
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating treatment plans policy:', error);
    return { success: false, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}