import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { getCurrentMember } from '../lib/getCurrentMember';
import type { Member } from '../lib/ensureMemberSession';

type MemberContextValue = {
  member: Member | null;
  isLoading: boolean;
  errorMessage: string | null;
  /** Re-fetch and show the loading state (use for explicit "Try Again" actions). */
  reload: () => Promise<void>;
  /** Re-fetch in the background without touching isLoading/errorMessage (use on screen focus). */
  refreshSilently: () => Promise<void>;
};

const MemberContext = createContext<MemberContextValue | null>(null);

export function MemberProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasLoadedOnce = useRef(false);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const loaded = await getCurrentMember();
      setMember(loaded);
      hasLoadedOnce.current = true;
    } catch {
      setErrorMessage('Something went wrong loading your profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshSilently = useCallback(async () => {
    try {
      const loaded = await getCurrentMember();
      setMember(loaded);
      setErrorMessage(null);
      hasLoadedOnce.current = true;
    } catch {
      // Keep whatever is currently shown when a background refresh fails.
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const loaded = await getCurrentMember();
        if (!cancelled) {
          setMember(loaded);
          hasLoadedOnce.current = true;
        }
      } catch {
        if (!cancelled) {
          setErrorMessage('Something went wrong loading your profile. Please try again.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <MemberContext.Provider value={{ member, isLoading, errorMessage, reload, refreshSilently }}>
      {children}
    </MemberContext.Provider>
  );
}

export function useMember(): MemberContextValue {
  const ctx = useContext(MemberContext);
  if (!ctx) {
    throw new Error('useMember must be used within a MemberProvider');
  }
  return ctx;
}