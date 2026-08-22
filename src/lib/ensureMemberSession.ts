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
