import { supabase } from '../supabase';
import { getCurrentMember } from './getCurrentMember';

export type MemberProfileUpdates = {
  full_name?: string;
  status_message?: string;
  instagram_handle?: string;
  photo_url?: string | null;
};

/**
 * Persists profile fields to the current user's `members` row.
 * Resolves the current auth uid from the existing session (never creates one),
 * then UPDATEs only the passed fields. Non-critical: callers should not
 * block navigation on failure.
 */
export async function updateMemberProfile(
  updates: MemberProfileUpdates
): Promise<void> {
  let userId: string;

  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(`Failed to read Supabase session: ${sessionError.message}`);
  }

  const sessionUserId = sessionData.session?.user?.id;

  if (sessionUserId) {
    userId = sessionUserId;
  } else {
    const member = await getCurrentMember();
    if (!member) {
      throw new Error('Expected an active member session, but none was found.');
    }
    userId = member.apple_user_id;
  }

  const { error } = await supabase
    .from('members')
    .update(updates)
    .eq('apple_user_id', userId);

  if (error) {
    throw new Error(`Failed to update member profile: ${error.message}`);
  }
}