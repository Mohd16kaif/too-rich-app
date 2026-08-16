import { supabase } from '../supabase';
import { MemberCapError, type Member, type MemberSessionResult } from './ensureMemberSession';

/**
 * Signs into Supabase using an Apple identity token (from
 * @invertase/react-native-apple-authentication), then ensures a `members`
 * row exists for this user — creating it on first sign-in.
 *
 * Mirrors ensureMemberSession's member-row lookup/create logic, but starts
 * from a real Apple-authenticated Supabase session instead of an anonymous one.
 */
export async function signInWithApple(identityToken: string): Promise<MemberSessionResult> {
  const { data: authData, error: authError } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: identityToken,
  });

  if (authError) {
    throw new Error(`Apple sign-in failed: ${authError.message}`);
  }

  const session = authData.session;

  if (!session) {
    throw new Error('Apple sign-in did not return a session.');
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