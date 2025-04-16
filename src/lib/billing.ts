import { Parse } from './parse';
import { AppError, ValidationError, NotFoundError } from './errors';

interface CreateBillingEntryParams {
  timeEntryId: string;
  providerId: string;
  clientId: string;
  duration: number;
  rate: number;
  serviceCode?: string;
  status?: 'pending' | 'submitted' | 'paid' | 'denied';
}

export async function createBillingEntry({
  timeEntryId,
  providerId,
  clientId,
  duration,
  rate,
  serviceCode = 'TIME',
  status = 'pending'
}: CreateBillingEntryParams): Promise<any> {
  try {
    const amount = (duration / 60) * rate; // Convert minutes to hours
    const units = Math.ceil(duration / 15); // 15-minute units

    const BillingEntry = Parse.Object.extend('BillingEntry');
    const billingEntry = new BillingEntry();
    
    billingEntry.set({
      time_entry_id: timeEntryId,
      provider_id: providerId,
      client_id: clientId,
      service_code: serviceCode,
      units,
      amount,
      status
    });

    const data = await billingEntry.save();

    if (error) throw error;
    return data;
  } catch (error) {
    if (error instanceof Parse.Error) {
      switch (error.code) {
        case Parse.Error.INVALID_JSON:
          throw new ValidationError('Invalid data format');
        case Parse.Error.OBJECT_NOT_FOUND:
          throw new NotFoundError('Billing entry not found');
        default:
          throw new AppError(error.message);
      }
    }
    throw error;
  }
}

interface UpdateBillingEntryParams {
  units?: number;
  amount?: number;
  status?: string;
  notes?: string;
}

export async function updateBillingEntry(
  id: string,
  updates: UpdateBillingEntryParams
): Promise<any> {
  try {
    const query = new Parse.Query('BillingEntry');
    const billingEntry = await query.get(id);
    
    Object.entries(updates).forEach(([key, value]) => {
      billingEntry.set(key, value);
    });

    const data = await billingEntry.save();

    if (error) throw error;
    return data;
  } catch (error) {
    if (error instanceof Parse.Error) {
      switch (error.code) {
        case Parse.Error.INVALID_JSON:
          throw new ValidationError('Invalid data format');
        case Parse.Error.OBJECT_NOT_FOUND:
          throw new NotFoundError('Billing entry not found');
        default:
          throw new AppError(error.message);
      }
    }
    throw error;
  }
}

export async function getBillingRate(providerId: string): Promise<number> {
  try {
    const query = new Parse.Query('_User');
    const user = await query.get(providerId);
    const data = { billing_rate: user.get('billing_rate') || 0 };

    if (error) throw error;
    return data.billing_rate || 0;
  } catch (error) {
    if (error instanceof Parse.Error) {
      switch (error.code) {
        case Parse.Error.INVALID_JSON:
          throw new ValidationError('Invalid data format');
        case Parse.Error.OBJECT_NOT_FOUND:
          throw new NotFoundError('Billing entry not found');
        default:
          throw new AppError(error.message);
      }
    }
    throw error;
  }
}