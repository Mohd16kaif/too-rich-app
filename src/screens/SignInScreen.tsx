import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { appleAuth, AppleButton } from '@invertase/react-native-apple-authentication';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Crown, Lock, ShieldCheck, Star } from 'lucide-react-native';
import Card from '../components/Card';
import theme from '../theme/tokens';
import type { RootStackParamList } from '../navigation/types';
import { isMemberCapError } from '../lib/ensureMemberSession';
import {
  MEMBER_CAP,
  PLACEHOLDER,
  fetchClaimedMemberCount,
  formatCount,
} from '../lib/memberCount';
import { signInWithApple } from '../lib/signInWithApple';

type Props = NativeStackScreenProps<RootStackParamList, 'SignIn'>;

function SignInScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [claimedCount, setClaimedCount] = useState<number | null>(null);
  const [isLoadingCount, setIsLoadingCount] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setIsLoadingCount(true);
      const count = await fetchClaimedMemberCount();
      if (!cancelled) {
        setClaimedCount(count);
        setIsLoadingCount(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const remainingCount = useMemo(() => {
    if (claimedCount === null) {
      return null;
    }
    return Math.max(0, MEMBER_CAP - claimedCount);
  }, [claimedCount]);

  const displayClaimed = isLoadingCount
    ? PLACEHOLDER
    : formatCount(claimedCount);

  const displayRemaining = isLoadingCount
    ? PLACEHOLDER
    : formatCount(remainingCount);

  const handleAppleSignIn = useCallback(async () => {
    if (isSigningIn) {
      return;
    }
    setIsSigningIn(true);
    try {
      // nonceEnabled: false — Supabase's Apple provider has an unfixed server-side bug
      // (hex vs base64url encoding mismatch) that makes nonce verification always fail,
      // so we disable the library's automatic nonce generation entirely.
      const appleAuthResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
        nonceEnabled: false,
      });

      const { identityToken } = appleAuthResponse;
      if (!identityToken) {
        throw new Error('Apple did not return an identity token.');
      }

      const { wasCreated } = await signInWithApple(identityToken);

      if (wasCreated) {
        navigation.navigate('Onboarding');
      } else {
        navigation.navigate('ClubHome');
      }
    } catch (error) {
      if (isMemberCapError(error)) {
        Alert.alert('Sorry', error.message);
      } else if ((error as { code?: string }).code === appleAuth.Error.CANCELED) {
        // User cancelled the Apple sign-in sheet, do nothing.
      } else {
        Alert.alert('Sign in failed', (error as Error).message);
      }
    } finally {
      setIsSigningIn(false);
    }
  }, [isSigningIn, navigation]);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inner,
          {
            paddingTop: insets.top + theme.spacing.lg,
            paddingBottom: insets.bottom + theme.spacing.lg,
          },
        ]}>
        <View style={styles.topGroup}>
          <Text style={styles.wordmark}>Too Rich</Text>
          <Text style={styles.headline}>Welcome.</Text>
          <Text style={styles.subtitle}>
            Request an invite to one of the few memberships that will ever exist.
          </Text>

          <Card style={styles.statCard}>
            <View style={styles.crownBadge}>
              <Crown size={28} strokeWidth={1.5} color={theme.colors.black} />
            </View>
            <Text style={styles.statClaimed}>
              <Text style={styles.statClaimedNumber}>{displayClaimed}</Text>
              {' / 1,000 Members Claimed'}
            </Text>
            <Text style={styles.statRemaining}>
              <Text style={styles.remainingNumber}>{displayRemaining}</Text>
              {' Spots Remaining'}
            </Text>
          </Card>
        </View>

        <View style={styles.trustColumns}>
          <View style={styles.trustColumn}>
            <View style={styles.trustBadge}>
              <Lock size={26} strokeWidth={1.5} color={theme.colors.black} />
            </View>
            <Text style={styles.trustLabel}>Private</Text>
            <Text style={styles.trustSublabel}>
              Your membership stays private.
            </Text>
          </View>

          <View style={styles.trustDivider} />

          <View style={styles.trustColumn}>
            <View style={styles.trustBadge}>
              <Star size={26} strokeWidth={1.5} color={theme.colors.black} />
            </View>
            <Text style={styles.trustLabel}>Exclusive</Text>
            <Text style={styles.trustSublabel}>Invited members only.</Text>
          </View>

          <View style={styles.trustDivider} />

          <View style={styles.trustColumn}>
            <View style={styles.trustBadge}>
              <ShieldCheck
                size={26}
                strokeWidth={1.5}
                color={theme.colors.black}
              />
            </View>
            <Text style={styles.trustLabel}>No Noise</Text>
            <Text style={styles.trustSublabel}>No subscriptions. No ads.</Text>
          </View>
        </View>

        <View style={styles.bottomGroup}>
          <View style={styles.ctaBlock}>
            <AppleButton
              buttonStyle={AppleButton.Style.BLACK}
              buttonType={AppleButton.Type.SIGN_IN}
              cornerRadius={theme.radius.full}
              onPress={handleAppleSignIn}
              style={styles.appleButton}
            />
          </View>

          <Text style={styles.footer}>
            No subscriptions. No ads. Just membership.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  inner: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  topGroup: {
    width: '100%',
  },
  wordmark: {
    fontFamily: theme.fonts.fontSerifBold,
    fontSize: theme.fontSizes.xl3,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  headline: {
    marginTop: theme.spacing.sm,
    fontFamily: theme.fonts.fontSerifBold,
    fontSize: theme.fontSizes.xl4,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: theme.spacing.sm,
    fontFamily: theme.fonts.fontRegular,
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
    lineHeight: theme.fontSizes.base * 1.4,
    textAlign: 'center',
  },
  statCard: {
    marginTop: theme.spacing.xl,
    width: '100%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  crownBadge: {
    width: 68,
    height: 68,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  statClaimed: {
    fontFamily: theme.fonts.fontRegular,
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  statClaimedNumber: {
    fontFamily: theme.fonts.fontSerifBold,
    fontSize: theme.fontSizes.xl2,
    color: theme.colors.textPrimary,
  },
  statRemaining: {
    marginTop: theme.spacing.sm,
    fontFamily: theme.fonts.fontRegular,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  remainingNumber: {
    fontFamily: theme.fonts.fontSemibold,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.black,
  },
  trustColumns: {
    flexDirection: 'row',
    alignItems: 'stretch',
    width: '100%',
    marginTop: theme.spacing.xl,
  },
  trustColumn: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xs,
  },
  trustDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
  },
  trustBadge: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustLabel: {
    marginTop: theme.spacing.md,
    fontFamily: theme.fonts.fontSemibold,
    fontSize: theme.fontSizes.base,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  trustSublabel: {
    marginTop: theme.spacing.xs,
    fontFamily: theme.fonts.fontRegular,
    fontSize: theme.fontSizes.xs,
    lineHeight: theme.fontSizes.xs * 1.4,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  bottomGroup: {
    width: '100%',
    alignItems: 'center',
  },
  ctaBlock: {
    width: '100%',
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  appleButton: {
    width: '100%',
    height: 52,
  },
  footer: {
    marginTop: theme.spacing.lg,
    fontFamily: theme.fonts.fontMedium,
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});

export default SignInScreen;