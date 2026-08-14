import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Text from '../components/Text';
import type { RootStackParamList } from '../navigation/types';
import theme from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'About'>;

const APP_VERSION = '0.0.1';

function BackChevronIcon({ color }: { color: string }) {
  return (
    <View style={styles.backChevron}>
      <View style={[styles.backChevronArm, styles.backChevronArmTop, { backgroundColor: color }]} />
      <View
        style={[styles.backChevronArm, styles.backChevronArmBottom, { backgroundColor: color }]}
      />
    </View>
  );
}

function ChevronIcon({ color }: { color: string }) {
  return (
    <View style={styles.chevron}>
      <View style={[styles.chevronArm, styles.chevronArmTop, { backgroundColor: color }]} />
      <View style={[styles.chevronArm, styles.chevronArmBottom, { backgroundColor: color }]} />
    </View>
  );
}

function AboutScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handlePrivacyPress = useCallback(() => {
    navigation.navigate('Privacy');
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + theme.spacing.sm }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={handleBack}
          hitSlop={8}
          style={styles.backButton}>
          <BackChevronIcon color={theme.colors.black} />
        </Pressable>
        <Text style={styles.headerTitle}>About Too Rich</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + theme.spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.wordmark}>Too Rich</Text>
        <Text style={styles.tagline}>Only 1,000 will ever hold it.</Text>

        <Text style={styles.sectionHeading}>A Collector&apos;s Membership</Text>
        <Text style={styles.sectionBody}>
          Too Rich is a permanent, numbered membership capped at 1,000. Each member is issued a
          unique number that is never re-issued and never recycled.
        </Text>
        <Text style={styles.sectionBody}>
          There are no ongoing benefits, features, or obligations attached to membership beyond
          your profile. Too Rich is a collector&apos;s and status product — a statement you keep,
          not a service you use.
        </Text>

        <Text style={styles.sectionHeading}>Version</Text>
        <Text style={styles.sectionBody}>{APP_VERSION}</Text>

        <Text style={styles.sectionHeading}>Privacy</Text>
        <Pressable
          accessibilityRole="button"
          onPress={handlePrivacyPress}
          style={({ pressed }) => [styles.privacyRow, pressed && styles.rowPressed]}>
          <Text style={styles.privacyLabel}>Privacy Policy</Text>
          <ChevronIcon color={theme.colors.textSecondary} />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  backButton: {
    width: 64,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: theme.fonts.fontBold,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textPrimary,
  },
  headerSpacer: {
    width: 64,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  wordmark: {
    marginTop: theme.spacing.sm,
    fontFamily: theme.fonts.fontSerifBold,
    fontSize: theme.fontSizes.xl3,
    color: theme.colors.textPrimary,
  },
  tagline: {
    marginTop: theme.spacing.sm,
    fontFamily: theme.fonts.fontRegular,
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
  },
  sectionHeading: {
    marginTop: theme.spacing.xl,
    fontFamily: theme.fonts.fontSerifSemibold,
    fontSize: theme.fontSizes.xl,
    color: theme.colors.textPrimary,
  },
  sectionBody: {
    marginTop: theme.spacing.sm,
    fontFamily: theme.fonts.fontRegular,
    fontSize: theme.fontSizes.base,
    lineHeight: theme.fontSizes.base + theme.spacing.sm,
    color: theme.colors.textSecondary,
  },
  privacyRow: {
    marginTop: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  privacyLabel: {
    flex: 1,
    fontFamily: theme.fonts.fontRegular,
    fontSize: theme.fontSizes.base,
    color: theme.colors.textPrimary,
  },
  rowPressed: {
    opacity: 0.88,
  },
  backChevron: {
    width: 18,
    height: 18,
    position: 'relative',
  },
  backChevronArm: {
    position: 'absolute',
    width: 8,
    height: 2,
    borderRadius: 1,
  },
  backChevronArmTop: {
    left: 3,
    top: 7.5,
    transform: [{ rotate: '-45deg' }],
  },
  backChevronArmBottom: {
    left: 3,
    top: 8.5,
    transform: [{ rotate: '45deg' }],
  },
  chevron: {
    width: 18,
    height: 18,
    position: 'relative',
  },
  chevronArm: {
    position: 'absolute',
    width: 8,
    height: 2,
    borderRadius: 1,
  },
  chevronArmTop: {
    left: 3,
    top: 7.5,
    transform: [{ rotate: '45deg' }],
  },
  chevronArmBottom: {
    left: 3,
    top: 8.5,
    transform: [{ rotate: '-45deg' }],
  },
});

export default AboutScreen;
