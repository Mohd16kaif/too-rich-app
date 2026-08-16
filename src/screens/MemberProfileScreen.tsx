import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Card from '../components/Card';
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

function CalendarIcon() {
  return (
    <View style={styles.calendarIcon}>
      <View style={styles.calendarNub} />
      <View style={styles.calendarNubRight} />
      <View style={styles.calendarBody}>
        <View style={styles.calendarLine} />
      </View>
    </View>
  );
}

function InstagramIcon({ color }: { color: string }) {
  return (
    <View style={styles.igWrap}>
      <View style={[styles.igBody, { borderColor: color }]}>
        <View style={[styles.igLens, { borderColor: color }]} />
      </View>
      <View style={[styles.igDot, { backgroundColor: color }]} />
    </View>
  );
}

function BackIcon({ color }: { color: string }) {
  return (
    <View style={styles.backIcon}>
      <View style={[styles.backArm, styles.backArmTop, { backgroundColor: color }]} />
      <View style={[styles.backArm, styles.backArmBottom, { backgroundColor: color }]} />
    </View>
  );
}

function DotDivider() {
  return (
    <View style={styles.dotRow}>
      {Array.from({ length: 11 }).map((_, index) => (
        <View key={index} style={styles.dot} />
      ))}
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

  const profileName = member?.full_name ?? 'Member';
  const joinedLabel = member ? formatJoinedMonth(member.joined_at) : '';

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + theme.spacing.md }]}
        showsVerticalScrollIndicator={false}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={handleBack}
          hitSlop={8}
          style={({ pressed }) => [styles.backButton, pressed && styles.rowPressed]}>
          <BackIcon color={theme.colors.black} />
        </Pressable>

        <Card style={styles.profileCard}>
          <DotDivider />

          <View style={styles.photoCircle}>
            {member?.photo_url ? (
              <Image source={{ uri: member.photo_url }} style={styles.photoImage} />
            ) : (
              <PhotoPlaceholder />
            )}
          </View>

          <Text style={styles.eyebrow}>MEMBER #{member?.member_number}</Text>
          <Text style={styles.profileName}>{profileName}</Text>

          {member?.status_message ? (
            <Text style={styles.profileStatus}>{member.status_message}</Text>
          ) : null}

          <View style={styles.cardDivider} />

          <View style={styles.metaBlock}>
            <View style={styles.metaRow}>
              <CrownIcon color={theme.colors.black} />
              <Text style={styles.metaTextDark}>Permanent Member</Text>
            </View>
            <View style={[styles.metaRow, styles.metaRowSpaced]}>
              <CalendarIcon />
              <Text style={styles.metaTextLight}>Joined {joinedLabel}</Text>
            </View>
          </View>

          <DotDivider />
        </Card>

        {member?.instagram_handle ? (
          <View style={styles.instagramCard}>
            <InstagramIcon color={theme.colors.black} />
            <View style={styles.instagramTexts}>
              <Text style={styles.instagramLabel}>Instagram</Text>
              <Text style={styles.instagramHandle}>@{member.instagram_handle}</Text>
            </View>
          </View>
        ) : null}
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
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  rowPressed: {
    opacity: 0.88,
  },
  backIcon: {
    width: 14,
    height: 14,
    position: 'relative',
  },
  backArm: {
    position: 'absolute',
    width: 8,
    height: 2,
    borderRadius: 1,
    left: 2,
  },
  backArmTop: {
    top: 3,
    transform: [{ rotate: '-45deg' }],
  },
  backArmBottom: {
    top: 9,
    transform: [{ rotate: '45deg' }],
  },
  profileCard: {
    alignItems: 'center',
  },
  dotRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
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
  profileName: {
    marginTop: theme.spacing.sm,
    fontFamily: theme.fonts.fontSerifBold,
    fontSize: theme.fontSizes.xl2,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  profileStatus: {
    marginTop: theme.spacing.sm,
    fontFamily: theme.fonts.fontSerifItalic,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  cardDivider: {
    alignSelf: 'stretch',
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
  metaBlock: {
    width: '100%',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
  },
  metaRowSpaced: {
    marginTop: theme.spacing.sm,
  },
  metaTextDark: {
    marginLeft: theme.spacing.sm,
    fontFamily: theme.fonts.fontMedium,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textPrimary,
  },
  metaTextLight: {
    marginLeft: theme.spacing.sm,
    fontFamily: theme.fonts.fontRegular,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  crown: {
    width: 20,
    height: 16,
    position: 'relative',
  },
  crownBase: {
    position: 'absolute',
    bottom: 0,
    left: 2,
    width: 16,
    height: 3,
    borderRadius: 1,
  },
  crownPeak: {
    width: 0,
    height: 0,
    borderLeftWidth: 3.5,
    borderRightWidth: 3.5,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  crownPeakLeft: {
    position: 'absolute',
    top: 4,
    left: 0,
  },
  crownPeakCenter: {
    position: 'absolute',
    top: 0,
    left: 6.5,
  },
  crownPeakRight: {
    position: 'absolute',
    top: 4,
    left: 13,
  },
  calendarIcon: {
    width: 14,
    height: 14,
  },
  calendarNub: {
    position: 'absolute',
    top: 0,
    left: 3,
    width: 2,
    height: 3,
    backgroundColor: theme.colors.textSecondary,
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
  },
  calendarNubRight: {
    position: 'absolute',
    top: 0,
    right: 3,
    width: 2,
    height: 3,
    backgroundColor: theme.colors.textSecondary,
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
  },
  calendarBody: {
    position: 'absolute',
    top: 2,
    left: 0,
    right: 0,
    height: 12,
    borderWidth: 1,
    borderColor: theme.colors.textSecondary,
    borderRadius: 2,
  },
  calendarLine: {
    position: 'absolute',
    top: 3,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: theme.colors.textSecondary,
  },
  instagramCard: {
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
  instagramTexts: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  instagramLabel: {
    fontFamily: theme.fonts.fontMedium,
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    letterSpacing: 0.5,
  },
  instagramHandle: {
    marginTop: 2,
    fontFamily: theme.fonts.fontSemibold,
    fontSize: theme.fontSizes.base,
    color: theme.colors.textPrimary,
  },
  igWrap: {
    width: 22,
    height: 22,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  igBody: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  igLens: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.75,
  },
  igDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
});

export default MemberProfileScreen;