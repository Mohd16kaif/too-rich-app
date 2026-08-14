import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Button from '../../components/Button';
import Text from '../../components/Text';
import { updateMemberProfile } from '../../lib/updateMemberProfile';
import type { RootStackParamList } from '../../navigation/types';
import theme from '../../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingMessage'>;

const MAX_STATUS_LENGTH = 80;

const SUGGESTED_STATUSES = [
  { emoji: '💎', label: 'CEO of Nothing' },
  { emoji: '😎', label: 'Too Rich to Reply' },
  { emoji: '🥂', label: 'Here for the Flex' },
  { emoji: '👑', label: 'Permanently Exclusive' },
] as const;

function OnboardingMessageScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [statusMessage, setStatusMessage] = useState('');

  const handleSelectStatus = useCallback((label: string) => {
    setStatusMessage(label);
  }, []);

  const handleContinue = useCallback(async () => {
    try {
      await updateMemberProfile({ status_message: statusMessage });
    } catch (error) {
      console.error('[OnboardingMessage] failed to save status_message:', error);
    }
    navigation.navigate('OnboardingInstagram');
  }, [navigation, statusMessage]);

  const handleSkip = useCallback(() => {
    navigation.navigate('OnboardingInstagram');
  }, [navigation]);

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
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
        </View>
        <Text style={styles.stepLabel}>Step 2 of 3</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.headline}>What&apos;s your status?</Text>
        <Text style={styles.subtitle}>
          This is the first thing other members will read.
        </Text>

        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            multiline
            maxLength={MAX_STATUS_LENGTH}
            placeholder="Too rich to reply."
            placeholderTextColor={theme.colors.textSecondary}
            value={statusMessage}
            onChangeText={setStatusMessage}
            textAlignVertical="top"
          />
          <View style={styles.counterRow} pointerEvents="none">
            <Text style={styles.counter}>
              {statusMessage.length} / {MAX_STATUS_LENGTH}
            </Text>
            <Text style={styles.resizeHandle}>↘</Text>
          </View>
        </View>

        <Text style={styles.inspirationLabel}>
          Need inspiration? Try one of these:
        </Text>

        <View style={styles.suggestions}>
          {SUGGESTED_STATUSES.map(({ emoji, label }) => (
            <Pressable
              accessibilityRole="button"
              key={label}
              onPress={() => handleSelectStatus(label)}
              style={styles.chip}>
              <Text style={styles.chipEmoji}>{emoji}</Text>
              <Text style={styles.chipLabel}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Continue" onPress={handleContinue} style={styles.continueButton} />
        <Pressable
          accessibilityRole="button"
          onPress={handleSkip}
          style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
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
  scroll: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
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
  headline: {
    marginTop: theme.spacing.xl,
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
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  input: {
    minHeight: 96,
    fontFamily: theme.fonts.fontRegular,
    fontSize: theme.fontSizes.base,
    color: theme.colors.textPrimary,
    padding: 0,
    paddingBottom: theme.spacing.xl,
  },
  counterRow: {
    position: 'absolute',
    bottom: theme.spacing.sm,
    right: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  counter: {
    fontFamily: theme.fonts.fontMedium,
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  resizeHandle: {
    marginLeft: theme.spacing.xs,
    fontFamily: theme.fonts.fontRegular,
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  inspirationLabel: {
    marginTop: theme.spacing.xl,
    fontFamily: theme.fonts.fontMedium,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  suggestions: {
    marginTop: theme.spacing.md,
    width: '100%',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  chipEmoji: {
    fontSize: theme.fontSizes.lg,
  },
  chipLabel: {
    marginLeft: theme.spacing.md,
    fontFamily: theme.fonts.fontMedium,
    fontSize: theme.fontSizes.base,
    color: theme.colors.textPrimary,
  },
  footer: {
    width: '100%',
    paddingHorizontal: theme.spacing.lg,
  },
  continueButton: {
    alignSelf: 'stretch',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  skipText: {
    fontFamily: theme.fonts.fontMedium,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
});

export default OnboardingMessageScreen;