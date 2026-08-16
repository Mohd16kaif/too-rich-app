import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Card from '../components/Card';
import RuleWithDiamond from '../components/RuleWithDiamond';
import Text from '../components/Text';
import { fetchMemberProfile } from '../lib/fetchMemberProfile';
import type { Member } from '../lib/ensureMemberSession';
import type { RootStackParamList } from '../navigation/types';
import theme from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'MemberProfile'>;

function formatJoinedMonth(joinedAt: string): string {
  const date = new Date(joinedAt);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

function CrownIcon({ color }: { color: string }) {
  return (
    <View style={styles.crown}>
      <View style={[styles.crownBase, { backgroundColor: color }]} />
      <View style={[styles.crownPeak, styles.crownPeakLeft, { borderBottomColor: color }]} />
      <View style={[styles.crownPeak, styles.crownPeakCenter, { borderBottomColor: color }]} />
      <View style={[styles.crownPeak, styles.crownPeakRight, { borderBottomColor: color }]} />
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

function PhotoPlaceholder() {
  return (
    <View style={styles.photoPerson}>
      <View style={styles.photoPersonHead} />
      <View style={styles.photoPersonBody} />
    </View>
  );
}

function MemberProfileScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { memberId } = route.params;
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const runLoad = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const loaded = await fetchMemberProfile(memberId);
      setMember(loaded);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Something went wrong loading this profile. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const loaded = await fetchMemberProfile(memberId);
        if (!cancelled) {
          setMember(loaded);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Something went wrong loading this profile. Please try again.'
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
  }, [memberId]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

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
          },
        ]}>
        <Text style={styles.errorText}>{errorMessage}</Text>
        <Pressable accessibilityRole="button" onPress={runLoad} style={styles.retryButton}>
          <Text style={styles.retryText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  const joinedLabel = member ? formatJoinedMonth(member.joined_at) : '';

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + theme.spacing.sm }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={handleBack}
          hitSlop={8}
          style={styles.backButton}>
          <ChevronIcon color={theme.colors.black} />
        </Pressable>
        <Text style={styles.headerTitle}>Member Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + theme.spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}>
        <Card style={styles.memberCard}>
          <CrownIcon color={theme.colors.black} />

          <Text style={styles.wordmark}>Too Rich</Text>

          <RuleWithDiamond style={styles.rule} />

          <View style={styles.photoCircle}>
            {member?.photo_url ? (
              <Image source={{ uri: member.photo_url }} style={styles.photoImage} />
            ) : (
              <PhotoPlaceholder />
            )}
          </View>

          <Text style={styles.eyebrow}>MEMBER #{member?.member_number}</Text>
          <Text style={styles.memberName}>{member?.full_name ?? 'Member'}</Text>

          <RuleWithDiamond style={styles.rule} />

          <Text style={styles.permanentLabel}>Permanent Member</Text>
          {member?.status_message ? (
            <Text style={styles.statusMessage}>{member.status_message}</Text>
          ) : null}

          <RuleWithDiamond style={styles.rule} />

          <Text style={styles.footline}>Joined {joinedLabel}</Text>
          <Text style={[styles.footline, styles.footlineSpaced]}>Only 1,000 Ever.</Text>
        </Card>
      </ScrollView>
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
    fontFamily: theme.fonts.fontRegular,
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  retryButton: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.black,
  },
  retryText: {
    fontFamily: theme.fonts.fontSemibold,
    fontSize: theme.fontSizes.base,
    color: theme.colors.white,
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
  },
  memberCard: {
    marginTop: theme.spacing.sm,
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  wordmark: {
    marginTop: theme.spacing.md,
    fontFamily: theme.fonts.fontSerifBold,
    fontSize: theme.fontSizes.xl3,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  rule: {
    marginVertical: theme.spacing.md,
  },
  photoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.border,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoPerson: {
    alignItems: 'center',
  },
  photoPersonHead: {
    marginTop: theme.spacing.xl,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.textSecondary,
  },
  photoPersonBody: {
    marginTop: theme.spacing.sm,
    width: 72,
    height: 36,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: theme.colors.textSecondary,
  },
  eyebrow: {
    marginTop: theme.spacing.md,
    fontFamily: theme.fonts.fontMedium,
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  memberName: {
    marginTop: theme.spacing.sm,
    fontFamily: theme.fonts.fontSerifBold,
    fontSize: theme.fontSizes.xl2,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  permanentLabel: {
    fontFamily: theme.fonts.fontMedium,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  statusMessage: {
    marginTop: theme.spacing.sm,
    fontFamily: theme.fonts.fontSerifItalic,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  footline: {
    fontFamily: theme.fonts.fontMedium,
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  footlineSpaced: {
    marginTop: theme.spacing.sm,
  },
  crown: {
    width: 24,
    height: 20,
    position: 'relative',
  },
  crownBase: {
    position: 'absolute',
    bottom: 0,
    left: 2,
    width: 20,
    height: 4,
    borderRadius: 1,
  },
  crownPeak: {
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  crownPeakLeft: {
    position: 'absolute',
    top: 5,
    left: 0,
  },
  crownPeakCenter: {
    position: 'absolute',
    top: 0,
    left: 8,
  },
  crownPeakRight: {
    position: 'absolute',
    top: 5,
    left: 16,
  },
  chevron: {
    width: 16,
    height: 16,
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
    top: 7,
    transform: [{ rotate: '45deg' }],
  },
  chevronArmBottom: {
    left: 3,
    top: 8,
    transform: [{ rotate: '-45deg' }],
  },
});

export default MemberProfileScreen;