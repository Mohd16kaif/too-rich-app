import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Text from '../components/Text';
import type { RootStackParamList } from '../navigation/types';
import theme from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Privacy'>;

type PrivacySection = {
  heading: string;
  paragraphs: string[];
};

const PRIVACY_SECTIONS: PrivacySection[] = [
  {
    heading: 'The Short Version',
    paragraphs: [
      'Too Rich is a permanent, numbered membership product capped at 1,000 members. We collect only the minimum profile information needed to run your membership and nothing else.',
    ],
  },
  {
    heading: 'What We Collect',
    paragraphs: [
      'When you join, we collect the profile information you choose to provide: your name, a status message, an Instagram username, and a profile photo. We also store a unique member number assigned to you at join time.',
    ],
  },
  {
    heading: 'How We Use It',
    paragraphs: [
      'Your profile information is used to display your membership card and your profile to other members. We never sell your data, and there are no ads, trackers, or third-party analytics in the app.',
    ],
  },
  {
    heading: 'Your Photo',
    paragraphs: [
      'Your profile photo is stored securely and is shown only to other Too Rich members. You can change or remove it at any time from your profile.',
    ],
  },
  {
    heading: 'Deleting Your Account',
    paragraphs: [
      'You can delete your account at any time from Settings. Deleting removes your profile, your photo, and your membership, and your member number is never re-issued.',
    ],
  },
  {
    heading: 'Contact',
    paragraphs: [
      'Questions about your data or privacy can be sent to support and we will respond promptly.',
    ],
  },
];

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

function PrivacyScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const handleBack = useCallback(() => {
    navigation.goBack();
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
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + theme.spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}>
        {PRIVACY_SECTIONS.map((section) => (
          <View key={section.heading}>
            <Text style={styles.sectionHeading}>{section.heading}</Text>
            {section.paragraphs.map((paragraph, index) => (
              <Text key={index} style={styles.sectionBody}>
                {paragraph}
              </Text>
            ))}
          </View>
        ))}
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
  sectionHeading: {
    marginTop: theme.spacing.lg,
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
});

export default PrivacyScreen;
