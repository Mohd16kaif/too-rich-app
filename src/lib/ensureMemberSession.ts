import { supabase } from '../supabase';

export type Member = {
  id: string;
  apple_user_id: string;
  member_number: number;
  full_name: string | null;
  status_message: string | null;
  instagram_handle: string | null;
  photo_url: string | null;
  joined_at: string;
};

export type MemberSessionResult = {
  member: Member;
  wasCreated: boolean;
};

export class MemberCapError extends Error {
  constructor() {
    super('Sorry, all 1,000 spots are claimed.');
    this.name = 'MemberCapError';
  }
}

export function isMemberCapError(error: unknown): error is MemberCapError {
  return error instanceof MemberCapError;
}

/**
 * Ensures a real Supabase session + members row exists for the current user,
 * creating both on first use.
 *
 * TEMPORARY: anonymous auth for testing, replace with real Apple auth flow.
 * The members row is minted up-front (with a sequential member_number) so
 * RLS policies resolve against a real auth.uid(), then onboarding screens
 * UPDATE the same row as the user fills in their profile.
 */
export async function ensureMemberSession(): Promise<MemberSessionResult> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(`Failed to read Supabase session: ${sessionError.message}`);
  }

  let session = sessionData.session;

  if (!session) {
    // TEMPORARY: anonymous auth for testing, replace with real Apple auth flow.
    const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();

    if (anonError) {
      throw new Error(`Anonymous sign-in failed: ${anonError.message}`);
    }

    session = anonData.session;
  }

  if (!session) {
    throw new Error('Anonymous sign-in did not return a session.');
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

  if (existing) {
    return { member: existing as Member, wasCreated: false };
  }

  const { data: created, error: rpcError } = await supabase.rpc('create_member', {
    p_apple_user_id: uid,
  });

  if (rpcError) {
    if (rpcError.message.includes('MEMBER_CAP_REACHED')) {
      throw new MemberCapError();
    }
    throw new Error(`Failed to create member row: ${rpcError.message}`);
  }

  const member = (Array.isArray(created) ? created[0] : created) as Member | null | undefined;

  if (!member) {
    throw new Error('create_member returned no member row.');
  }

  return { member, wasCreated: true };
}
