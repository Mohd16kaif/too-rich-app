import { supabase } from '../supabase';

export const MEMBER_CAP = 1000;
export const PLACEHOLDER = '—';

/** Public RPC — requires `get_member_claim_count()` in Supabase (see project docs / PR notes). */
export async function fetchClaimedMemberCount(): Promise<number | null> {
  const { data, error } = await supabase.rpc('get_member_claim_count');

  if (error) {
    console.error('get_member_claim_count failed:', error.message);
    return null;
  }

  if (typeof data !== 'number' || Number.isNaN(data)) {
    console.error('unexpected get_member_claim_count payload:', data);
    return null;
  }

  return data;
}

export function formatCount(value: number | null): string {
  if (value === null) {
    return PLACEHOLDER;
  }
  return value.toLocaleString('en-US');
}