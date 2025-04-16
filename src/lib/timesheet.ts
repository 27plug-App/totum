import { supabase } from './supabase';
import { handleSupabaseError } from './errors';
import { createBillingEntry, getBillingRate } from './billing';

interface ClockInParams {
  userId: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
}

interface ClockOutParams {
  entryId: string;
  userId: string;
  clientId: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
}

export async function clockIn({
  userId,
  latitude,
  longitude,
  notes
}: ClockInParams): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('time_entries')
      .insert([{
        user_id: userId,
        clock_in: new Date().toISOString(),
        latitude,
        longitude,
        notes
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw await handleSupabaseError(error);
  }
}

export async function clockOut({
  entryId,
  userId,
  clientId,
  latitude,
  longitude,
  notes
}: ClockOutParams): Promise<any> {
  try {
    // Get billing rate
    const rate = await getBillingRate(userId);

    // Clock out
    const { data: timeEntry, error: clockOutError } = await supabase
      .from('time_entries')
      .update({
        clock_out: new Date().toISOString(),
        latitude,
        longitude,
        notes
      })
      .eq('id', entryId)
      .select()
      .single();

    if (clockOutError) throw clockOutError;

    // Calculate duration in minutes
    const start = new Date(timeEntry.clock_in);
    const end = new Date(timeEntry.clock_out);
    const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60));

    // Create billing entry
    const billingEntry = await createBillingEntry({
      timeEntryId: entryId,
      providerId: userId,
      clientId,
      duration,
      rate
    });

    return { timeEntry, billingEntry };
  } catch (error) {
    throw await handleSupabaseError(error);
  }
}

export async function getTimeEntries(userId: string, startDate: Date, endDate: Date): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('time_entries')
      .select(`
        *,
        billing_entries (
          id,
          amount,
          status,
          service_code
        )
      `)
      .eq('user_id', userId)
      .gte('clock_in', startDate.toISOString())
      .lte('clock_in', endDate.toISOString())
      .order('clock_in', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    throw await handleSupabaseError(error);
  }
}