import { supabase } from '../supabase';
import type { Member } from './ensureMemberSession';

/**
 * Fetches a single member's public profile data by row id.
 * Read-only — used for viewing other members' profiles from the Members grid.
 * Relies on the `members` table's "Allow authenticated read" RLS policy
 * (SELECT using (true)) to permit reading any member's row.
 */
export async function fetchMemberProfile(memberId: number): Promise<Member> {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('id', memberId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load member profile: ${error.message}`);
  }

  if (!data) {
    throw new Error('Member not found.');
  }

  return data as Member;
}