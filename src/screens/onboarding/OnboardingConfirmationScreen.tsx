import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { ensureMemberSession, isMemberCapError } from '../../lib/ensureMemberSession';
import { MEMBER_CAP, fetchClaimedMemberCount } from '../../lib/memberCount';
import type { RootStackParamList } from '../../navigation/types';
import theme from '../../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingConfirmation'>;

function OnboardingConfirmationScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [memberNumber, setMemberNumber] = useState<number | null>(null);
  const [remainingCount, setRemainingCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const runLoad = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [{ member }, claimedCount] = await Promise.all([
        ensureMemberSession(),
        fetchClaimedMemberCount(),
      ]);

      if (claimedCount === null) {
        throw new Error('Could not load the current membership count.');
      }

      setMemberNumber(member.member_number);
      setRemainingCount(Math.max(0, MEMBER_CAP - claimedCount));
    } catch (error) {
      setErrorMessage(
        isMemberCapError(error)
          ? error.message
          : 'Something went wrong loading your membership. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [{ member }, claimedCount] = await Promise.all([
          ensureMemberSession(),
          fetchClaimedMemberCount(),
        ]);

        if (claimedCount === null) {
          throw new Error('Could not load the current membership count.');
        }

        if (!cancelled) {
          setMemberNumber(member.member_number);
          setRemainingCount(Math.max(0, MEMBER_CAP - claimedCount));
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            isMemberCapError(error)
              ? error.message
              : 'Something went wrong loading your membership. Please try again.'
          );
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

  const handleEnterClub = useCallback(() => {
    // Entering the club is a terminal transition out of onboarding: reset the
    // stack so the user can't back-navigate into Splash/SignIn/onboarding.
    navigation.reset({
      index: 0,
      routes: [{ name: 'ClubHome' }],
    });
  }, [navigation]);

  const handleShareMyNumber = useCallback(() => {
    // TODO: open the Share Sheet / membership card view once it exists — no route registered yet.
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={theme.colors.black} size="large" />
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          {
            paddingTop: insets.top + theme.spacing.lg,
            paddingBottom: insets.bottom + theme.spacing.lg,
            paddingHorizontal: theme.spacing.lg,
          },
        ]}>
        <Text style={styles.errorText}>{errorMessage}</Text>
        <Button title="Try Again" onPress={runLoad} style={styles.retryButton} />
      </View>
    );
  }

  const displayRemaining =
    remainingCount === null ? '—' : remainingCount.toLocaleString('en-US');

  return (
    <View
      style={[
        styles.container,
        styles.contentContainer,
        {
          paddingTop: insets.top + theme.spacing.lg,
          paddingBottom: insets.bottom + theme.spacing.lg,
        },
      ]}>
      <View style={styles.checkBadge}>
        <Text style={styles.checkGlyph}>✓</Text>
      </View>

      <Text style={styles.headline}>Welcome to the club.</Text>
      <Text style={styles.subtitle}>
        You are officially one of only 1,000 permanent members.
      </Text>

      <Card style={styles.memberCard}>
        <Text style={styles.eyebrow}>MEMBER</Text>
        <Text style={styles.memberNumber}>#{memberNumber}</Text>
      </Card>

      <Text style={styles.remainingLine}>
        <Text style={styles.remainingNumber}>{displayRemaining}</Text>
        {' memberships remaining.'}
      </Text>

      <View style={styles.footer}>
        <Button title="Enter Club" onPress={handleEnterClub} style={styles.enterButton} />
        <Pressable
          accessibilityRole="button"
          onPress={handleShareMyNumber}
          style={styles.shareButton}>
          <Text style={styles.shareText}>Share My Number</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  retryButton: {
    alignSelf: 'stretch',
  },
  contentContainer: {
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBadge: {
    width: 72,
    height: 72,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
  },
  checkGlyph: {
    fontFamily: theme.fonts.fontBold,
    fontSize: theme.fontSizes.xl3,
    color: theme.colors.black,
  },
  headline: {
    fontFamily: theme.fonts.fontSerifBold,
    fontSize: theme.fontSizes.xl3,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: theme.spacing.sm,
    fontFamily: theme.fonts.fontRegular,
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.fontSizes.base * 1.4,
  },
  memberCard: {
    marginTop: theme.spacing.xl,
    width: '100%',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  eyebrow: {
    fontFamily: theme.fonts.fontMedium,
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  memberNumber: {
    marginTop: theme.spacing.md,
    fontFamily: theme.fonts.fontSerifBold,
    fontSize: theme.fontSizes.xl5,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  remainingLine: {
    marginTop: theme.spacing.xl,
    fontFamily: theme.fonts.fontRegular,
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  remainingNumber: {
    fontFamily: theme.fonts.fontSemibold,
    color: theme.colors.black,
  },
  footer: {
    marginTop: theme.spacing.xl,
    width: '100%',
  },
  enterButton: {
    alignSelf: 'stretch',
  },
  shareButton: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  shareText: {
    fontFamily: theme.fonts.fontMedium,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textPrimary,
  },
});

export default OnboardingConfirmationScreen;