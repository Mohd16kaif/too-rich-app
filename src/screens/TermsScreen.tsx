import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Text from '../components/Text';
import type { RootStackParamList } from '../navigation/types';
import theme from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Terms'>;

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
    'By downloading and using Too Rich ("the App"), you agree to these Terms of Service. If you do not agree, do not use the App.',
  ],
  sections: [
    {
      heading: '1. Eligibility',
      blocks: [
        {
          type: 'paragraph',
          text: 'You must be at least 13 years old to use Too Rich. By using the App, you represent that you meet this requirement.',
        },
      ],
    },
    {
      heading: '2. Membership',
      blocks: [
        {
          type: 'bullets',
          items: [
            'Too Rich offers a fixed, limited membership of 1,000 seats total.',
            'Membership is granted via a one-time payment of $399 USD (or the local equivalent shown at purchase).',
            'Once purchased, membership is permanent for the lifetime of the App and does not expire, renew, or require any subscription.',
            'Each member receives a unique, permanently assigned membership number that is not reused or reassigned.',
            'All 1,000 memberships are final once claimed; there is no waiting list and no guarantee of future availability once the cap is reached.',
          ],
        },
      ],
    },
    {
      heading: '3. Payments and Refunds',
      blocks: [
        {
          type: 'bullets',
          items: [
            'All payments are processed through Apple\'s App Store payment system, subject to Apple\'s own terms and refund policies.',
            'Membership fees are generally non-refundable except where required by law or Apple\'s own refund policy.',
          ],
        },
      ],
    },
    {
      heading: '4. Your Content',
      blocks: [
        {
          type: 'bullets',
          items: [
            'You are responsible for the photo, status message, and any other information you choose to add to your profile.',
            'You agree not to upload content that is illegal, infringing, harassing, or that impersonates another person.',
            'You retain ownership of the content you upload, but grant us a license to display it within the App as part of your membership profile and the Member Wall.',
          ],
        },
      ],
    },
    {
      heading: '5. Member Conduct',
      blocks: [
        {
          type: 'bullets',
          items: [
            'You agree to use the App respectfully and not to use it to harass, defame, or harm other members.',
            'We reserve the right to remove content or suspend/terminate a membership that violates these Terms, at our discretion.',
          ],
        },
      ],
    },
    {
      heading: '6. No Guarantee of Features',
      blocks: [
        {
          type: 'paragraph',
          text: 'Too Rich provides a membership profile, a permanent membership number, and a Member Wall where members can view one another. We do not currently offer in-app messaging between members; any connection with other members beyond what the App displays (e.g. via a shared Instagram handle) is between users directly and outside our control.',
        },
      ],
    },
    {
      heading: '7. Termination',
      blocks: [
        {
          type: 'paragraph',
          text: 'We reserve the right to suspend or terminate your membership if you violate these Terms. Since membership is a one-time purchase, termination for cause does not entitle you to a refund except where required by law.',
        },
      ],
    },
    {
      heading: '8. Disclaimer of Warranties',
      blocks: [
        {
          type: 'paragraph',
          text: 'The App is provided "as is" without warranties of any kind, express or implied. We do not guarantee the App will be uninterrupted, error-free, or meet your expectations.',
        },
      ],
    },
    {
      heading: '9. Limitation of Liability',
      blocks: [
        {
          type: 'paragraph',
          text: 'To the maximum extent permitted by law, Too Rich and its developer shall not be liable for any indirect, incidental, or consequential damages arising from your use of the App.',
        },
      ],
    },
    {
      heading: '10. Changes to These Terms',
      blocks: [
        {
          type: 'paragraph',
          text: 'We may update these Terms from time to time. Continued use of the App after changes constitutes acceptance of the updated Terms.',
        },
      ],
    },
    {
      heading: '11. Governing Law',
      blocks: [
        {
          type: 'paragraph',
          text: 'These Terms are governed by the laws of India, without regard to conflict of law principles, unless otherwise required by the laws of your country of residence.',
        },
      ],
    },
    {
      heading: '12. Contact',
      blocks: [
        {
          type: 'paragraph',
          text: 'Questions about these Terms can be sent to:',
        },
        {
          type: 'paragraph',
          text: 'ark07q@gmail.com',
        },
      ],
    },
  ],
  footer:
    'This document is a starting draft based on the App\'s actual functionality. Given that Too Rich processes real payments internationally and includes user-generated content, we recommend having this reviewed by a legal professional before publishing — particularly the refund, liability, and governing law sections, which can carry real consequences if misdrafted.',
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

function TermsScreen({ navigation }: Props) {
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
        <Text style={styles.headerTitle}>Terms of Service</Text>
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

export default TermsScreen;
