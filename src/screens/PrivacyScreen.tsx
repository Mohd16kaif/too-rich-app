import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Text from '../components/Text';
import type { RootStackParamList } from '../navigation/types';
import theme from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Privacy'>;

type LegalBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'labeled'; label: string; text: string }
  | { type: 'bullets'; items: string[] };

type LegalSection = {
  heading: string;
  blocks: LegalBlock[];
};

type LegalContent = {
  preamble: string[];
  sections: LegalSection[];
  footer: string;
};

const CONTENT: LegalContent = {
  preamble: [
    'Last updated: August 14, 2026',
    'This Privacy Policy explains what information Too Rich ("the App," "we," "us") collects when you use it, how it\'s used, and the choices you have.',
  ],
  sections: [
    {
      heading: 'Information We Collect',
      blocks: [
        {
          type: 'labeled',
          label: 'Account Information',
          text: 'When you sign in using Sign in with Apple, we receive your name and an email address (or Apple\'s private relay email, depending on your choice at sign-in).',
        },
        {
          type: 'labeled',
          label: 'Profile Information',
          text: 'When you join, we collect a photo you provide, an optional status message, and an optional Instagram handle. This information is displayed to other members on the Member Wall and your individual profile.',
        },
        {
          type: 'labeled',
          label: 'Purchase Information',
          text: 'Membership is a one-time paid purchase processed through Apple\'s payment system. We do not receive or store your payment card details — those are handled entirely by Apple. We do retain a record that a purchase was completed, associated with your membership number.',
        },
        {
          type: 'labeled',
          label: 'Membership Number',
          text: 'Each member receives a unique, permanent membership number, which is stored and displayed alongside your profile.',
        },
      ],
    },
    {
      heading: 'How We Use Your Information',
      blocks: [
        {
          type: 'paragraph',
          text: 'We use the information above solely to operate the App:',
        },
        {
          type: 'bullets',
          items: [
            'To create and display your member profile and membership card',
            'To display members to one another on the Member Wall',
            'To verify your membership status',
            'To respond if you contact support',
          ],
        },
        {
          type: 'paragraph',
          text: 'We do not use your information for advertising, and we do not sell or share it with third parties for marketing or advertising purposes.',
        },
      ],
    },
    {
      heading: 'Tracking and Third Parties',
      blocks: [
        {
          type: 'paragraph',
          text: 'Too Rich does not use your data to track you across other companies\' apps or websites, and we do not share your data with advertising networks. We use Supabase as our backend infrastructure provider to store app data securely — they act as a service provider on our behalf and do not use your data for their own purposes.',
        },
      ],
    },
    {
      heading: 'Data Retention and Deletion',
      blocks: [
        {
          type: 'paragraph',
          text: 'Your information is retained for as long as your account exists. You can request deletion of your account and associated data at any time through the App\'s settings or by contacting us at ark07q@gmail.com. Note that your membership number, once retired, is not reissued to another user, consistent with the permanent nature of Too Rich membership — however, your personal profile data (photo, status, Instagram handle) will be removed upon deletion.',
        },
      ],
    },
    {
      heading: 'Children\'s Privacy',
      blocks: [
        {
          type: 'paragraph',
          text: 'Too Rich is not intended for users under the age of 13, and we do not knowingly collect information from children under 13.',
        },
      ],
    },
    {
      heading: 'Your Choices',
      blocks: [
        {
          type: 'bullets',
          items: [
            'The status message and Instagram handle are optional and can be left blank.',
            'You can edit your profile information at any time from within the App.',
            'You can request account deletion at any time.',
          ],
        },
      ],
    },
    {
      heading: 'Changes to This Policy',
      blocks: [
        {
          type: 'paragraph',
          text: 'We may update this Privacy Policy from time to time. Material changes will be reflected with an updated "Last updated" date above.',
        },
      ],
    },
    {
      heading: 'Contact Us',
      blocks: [
        {
          type: 'paragraph',
          text: 'If you have questions about this Privacy Policy or your data, contact us at:',
        },
        {
          type: 'paragraph',
          text: 'ark07q@gmail.com',
        },
      ],
    },
  ],
  footer:
    'This Privacy Policy is effective as of August 14, 2026 and applies to all users of Too Rich. If you have questions about this policy or your data, contact us at ark07q@gmail.com.',
};

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
        {CONTENT.preamble.map((paragraph, index) => (
          <Text key={`preamble-${index}`} style={styles.sectionBody}>
            {paragraph}
          </Text>
        ))}

        {CONTENT.sections.map(section => (
          <View key={section.heading}>
            <Text style={styles.sectionHeading}>{section.heading}</Text>
            {section.blocks.map((block, index) => {
              if (block.type === 'paragraph') {
                return (
                  <Text key={index} style={styles.sectionBody}>
                    {block.text}
                  </Text>
                );
              }
              if (block.type === 'labeled') {
                return (
                  <Text key={index} style={styles.sectionBody}>
                    <Text style={styles.subsectionLabel}>{block.label} </Text>
                    {block.text}
                  </Text>
                );
              }
              return (
                <View key={index}>
                  {block.items.map((item, itemIndex) => (
                    <View key={itemIndex} style={styles.bulletRow}>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text style={[styles.sectionBody, styles.bulletText]}>{item}</Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        ))}

        <Text style={styles.footerNote}>{CONTENT.footer}</Text>
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
  subsectionLabel: {
    fontFamily: theme.fonts.fontSemibold,
    fontSize: theme.fontSizes.base,
    lineHeight: theme.fontSizes.base + theme.spacing.sm,
    color: theme.colors.textPrimary,
  },
  bulletRow: {
    marginTop: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletDot: {
    fontFamily: theme.fonts.fontRegular,
    fontSize: theme.fontSizes.base,
    lineHeight: theme.fontSizes.base + theme.spacing.sm,
    color: theme.colors.textPrimary,
    marginRight: theme.spacing.sm,
  },
  bulletText: {
    marginTop: 0,
    flex: 1,
  },
  footerNote: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.fonts.fontSerifItalic,
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
