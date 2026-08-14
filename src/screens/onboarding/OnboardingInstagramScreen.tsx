import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Button from '../../components/Button';
import Text from '../../components/Text';
import { ensureMemberSession, isMemberCapError } from '../../lib/ensureMemberSession';
import { updateMemberProfile } from '../../lib/updateMemberProfile';
import type { RootStackParamList } from '../../navigation/types';
import theme from '../../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingInstagram'>;

const MAX_HANDLE_LENGTH = 30;

function OnboardingInstagramScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [instagramHandle, setInstagramHandle] = useState('');
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const runSessionSetup = useCallback(async () => {
    setIsLoadingSession(true);
    setSessionError(null);
    try {
      await ensureMemberSession();
    } catch (error) {
      setSessionError(
        isMemberCapError(error)
          ? error.message
          : 'Something went wrong setting up your session. Please try again.'
      );
    } finally {
      setIsLoadingSession(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await ensureMemberSession();
      } catch (error) {
        if (!cancelled) {
          setSessionError(
            isMemberCapError(error)
              ? error.message
              : 'Something went wrong setting up your session. Please try again.'
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingSession(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleReveal = useCallback(async () => {
    try {
      await updateMemberProfile({ instagram_handle: instagramHandle });
    } catch (error) {
      console.error('[OnboardingInstagram] failed to save instagram_handle:', error);
    }
    navigation.navigate('OnboardingConfirmation');
  }, [navigation, instagramHandle]);

  if (isLoadingSession) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={theme.colors.black} size="large" />
      </View>
    );
  }

  if (sessionError) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { paddingTop: insets.top + theme.spacing.lg, paddingBottom: insets.bottom + theme.spacing.lg },
        ]}>
        <Text variant="body" style={styles.errorText}>
          {sessionError}
        </Text>
        <Button title="Try Again" onPress={runSessionSetup} style={styles.retryButton} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + theme.spacing.lg,
          paddingBottom: insets.bottom + theme.spacing.lg,
        },
      ]}>
      <View style={styles.stepIndicator}>
        <View style={styles.dotsRow}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
        </View>
        <Text style={styles.stepLabel}>Step 3 of 3</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.headline}>Share your handle.</Text>
        <Text style={styles.subtitle}>
          Your Instagram shows up on your permanent member profile.
        </Text>

        <View style={styles.inputBox}>
          <Text style={styles.inputPrefix}>@</Text>
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="twitter"
            maxLength={MAX_HANDLE_LENGTH}
            placeholder="username"
            placeholderTextColor={theme.colors.textSecondary}
            value={instagramHandle}
            onChangeText={setInstagramHandle}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="Reveal My Member Number"
          onPress={handleReveal}
          style={styles.continueButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
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
  stepIndicator: {
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: theme.spacing.sm,
    height: theme.spacing.sm,
    borderRadius: theme.spacing.xs,
    marginHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.border,
  },
  dotActive: {
    backgroundColor: theme.colors.black,
  },
  stepLabel: {
    marginTop: theme.spacing.md,
    fontFamily: theme.fonts.fontMedium,
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headline: {
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
    textAlign: 'center',
    lineHeight: theme.fontSizes.base * 1.4,
  },
  inputBox: {
    marginTop: theme.spacing.xl,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
  },
  inputPrefix: {
    fontFamily: theme.fonts.fontRegular,
    fontSize: theme.fontSizes.base,
    color: theme.colors.black,
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: theme.fonts.fontRegular,
    fontSize: theme.fontSizes.base,
    color: theme.colors.textPrimary,
    paddingVertical: theme.spacing.md,
  },
  footer: {
    width: '100%',
  },
  continueButton: {
    alignSelf: 'stretch',
  },
});

export default OnboardingInstagramScreen;