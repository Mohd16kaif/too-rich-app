import { supabase } from '../supabase';
import type { Member } from './ensureMemberSession';

/**
 * Reads the current member if a real (Apple-authenticated) session already
 * exists — never creates a session or a members row. Returns null when
 * there is no session yet, so the app can correctly show Sign In instead
 * of silently minting a throwaway anonymous identity.
 *
 * Use this everywhere except the actual sign-in flow (signInWithApple.ts),
 * which is the only place allowed to create a new session/member row.
 */
export async function getCurrentMember(): Promise<Member | null> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(`Failed to read Supabase session: ${sessionError.message}`);
  }

  const session = sessionData.session;

  if (!session) {
    return null;
  }

  const uid = session.user.id;

  const { data: existing, error: selectError } = await supabase
    .from('members')
    .select('*')
    .eq('apple_user_id', uid)
    .maybeSingle();

  if (selectError) {
    throw new Error(`Failed to look up member row: ${selectError.message}`);
  }

  return (existing as Member) ?? null;
}