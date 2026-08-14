import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import BottomTabBar, { type TabKey } from '../components/BottomTabBar';
import Card from '../components/Card';
import { ensureMemberSession, isMemberCapError } from '../lib/ensureMemberSession';
import { MEMBER_CAP, fetchClaimedMemberCount } from '../lib/memberCount';
import type { RootStackParamList } from '../navigation/types';
import { supabase } from '../supabase';
import theme from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'ClubHome'>;

const NEWEST_MEMBER_LIMIT = 10;

type NewestMember = {
  member_number: number;
  full_name: string | null;
  photo_url: string | null;
  status_message: string | null;
};

function formatJoinedMonth(joinedAt: string): string {
  const date = new Date(joinedAt);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
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

function CheckBadgeIcon() {
  return (
    <View style={styles.checkBadge}>
      <Text style={styles.checkBadgeGlyph}>✓</Text>
    </View>
  );
}

function MemberThumbnail({
  photoUrl,
  size,
  style,
}: {
  photoUrl: string | null;
  size: number;
  style?: StyleProp<ViewStyle>;
}) {
  const circleStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: theme.colors.border,
    overflow: 'hidden' as const,
  };
  return (
    <View style={[circleStyle, style]}>
      {photoUrl ? <Image source={{ uri: photoUrl }} style={styles.thumbnailImage} /> : null}
    </View>
  );
}

function ClubHomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [memberNumber, setMemberNumber] = useState<number | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [joinedMonth, setJoinedMonth] = useState('');
  const [claimedCount, setClaimedCount] = useState<number | null>(null);
  const [newestMembers, setNewestMembers] = useState<NewestMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const runLoad = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const { member } = await ensureMemberSession();

      const [claimed, newestResult] = await Promise.all([
        fetchClaimedMemberCount(),
        supabase
          .from('members')
          .select('member_number, full_name, photo_url, status_message')
          .order('member_number', { ascending: false })
          .neq('apple_user_id', member.apple_user_id)
          .limit(NEWEST_MEMBER_LIMIT),
      ]);

      if (claimed === null) {
        throw new Error('Could not load the current membership count.');
      }

      if (newestResult.error) {
        throw new Error(`Failed to load newest members: ${newestResult.error.message}`);
      }

      setMemberNumber(member.member_number);
      setPhotoUrl(member.photo_url);
      setJoinedMonth(formatJoinedMonth(member.joined_at));
      setClaimedCount(claimed);
      setNewestMembers((newestResult.data ?? []) as NewestMember[]);
    } catch (error) {
      setErrorMessage(
        isMemberCapError(error)
          ? error.message
          : 'Something went wrong loading the club. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { member } = await ensureMemberSession();

        const [claimed, newestResult] = await Promise.all([
          fetchClaimedMemberCount(),
          supabase
            .from('members')
            .select('member_number, full_name, photo_url, status_message')
            .order('member_number', { ascending: false })
            .neq('apple_user_id', member.apple_user_id)
            .limit(NEWEST_MEMBER_LIMIT),
        ]);

        if (claimed === null) {
          throw new Error('Could not load the current membership count.');
        }

        if (newestResult.error) {
          throw new Error(`Failed to load newest members: ${newestResult.error.message}`);
        }

        if (!cancelled) {
          setMemberNumber(member.member_number);
          setPhotoUrl(member.photo_url);
          setJoinedMonth(formatJoinedMonth(member.joined_at));
          setClaimedCount(claimed);
          setNewestMembers((newestResult.data ?? []) as NewestMember[]);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            isMemberCapError(error)
              ? error.message
              : 'Something went wrong loading the club. Please try again.'
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

  const handleSeeAll = useCallback(() => {
    navigation.navigate('Members');
  }, [navigation]);

  const handleTabPress = useCallback(
    (tab: TabKey) => {
      if (tab === 'Members') {
        navigation.navigate('Members');
      }
      if (tab === 'Me') {
        navigation.navigate('Me');
      }
    },
    [navigation]
  );

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

  const displayClaimed = claimedCount?.toLocaleString('en-US') ?? '—';
  const displayRemaining =
    claimedCount === null ? '—' : Math.max(0, MEMBER_CAP - claimedCount).toLocaleString('en-US');
  const progressPct =
    claimedCount === null ? 0 : Math.min(100, (claimedCount / MEMBER_CAP) * 100);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <Text style={styles.wordmark}>Too Rich</Text>
          <MemberThumbnail photoUrl={photoUrl} size={48} />
        </View>

        <Text style={styles.headline}>
          Welcome back,{'\n'}Member #{memberNumber}
        </Text>
        <Text style={styles.subtitle}>One of only 1,000 permanent members.</Text>

        <Card style={styles.memberCard}>
          <View style={styles.memberCardLeft}>
            <Text style={styles.eyebrow}>MEMBER</Text>
            <Text style={styles.memberNumber}>#{memberNumber}</Text>
          </View>
          <View style={styles.cardDivider} />
          <View style={styles.memberCardRight}>
            <View style={styles.metaRow}>
              <CalendarIcon />
              <Text style={styles.metaText}>Joined {joinedMonth}</Text>
            </View>
            <View style={[styles.metaRow, styles.metaRowSpaced]}>
              <CheckBadgeIcon />
              <Text style={styles.metaText}>Active Member</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.progressCard}>
          <Text style={styles.claimLine}>
            <Text style={styles.claimNumber}>{displayClaimed}</Text>
            {' / 1,000 Members Claimed'}
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
          </View>
          <Text style={styles.remainingLine}>
            <Text style={styles.remainingNumber}>{displayRemaining}</Text>
            {' Spots Remaining'}
          </Text>
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Newest Members</Text>
          <Pressable accessibilityRole="button" onPress={handleSeeAll}>
            <Text style={styles.seeAllText}>See All</Text>
          </Pressable>
        </View>

        {newestMembers.length === 0 ? (
          <Text style={styles.emptyState}>No other members yet.</Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.memberStrip}>
            {newestMembers.map(({ member_number, full_name, photo_url, status_message }) => (
              <View key={member_number} style={styles.memberCardItem}>
                <View style={styles.memberPhoto}>
                  {photo_url ? (
                    <Image source={{ uri: photo_url }} style={styles.memberPhotoImage} />
                  ) : null}
                </View>
                <Text style={styles.memberItemNumber}>#{member_number}</Text>
                <Text style={styles.memberItemName} numberOfLines={1}>
                  {full_name ?? 'Member'}
                </Text>
                {status_message ? (
                  <Text style={styles.memberItemStatus} numberOfLines={1}>
                    {'\u00B7'} {status_message}
                  </Text>
                ) : null}
              </View>
            ))}
          </ScrollView>
        )}
      </ScrollView>

      <BottomTabBar activeTab="Club" onTabPress={handleTabPress} />
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
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xl,
  },
  wordmark: {
    fontFamily: theme.fonts.fontSerifBold,
    fontSize: theme.fontSizes.xl3,
    color: theme.colors.textPrimary,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  headline: {
    marginTop: theme.spacing.xl,
    fontFamily: theme.fonts.fontSerifBold,
    fontSize: theme.fontSizes.xl4,
    color: theme.colors.textPrimary,
    lineHeight: theme.fontSizes.xl4 * 1.15,
  },
  subtitle: {
    marginTop: theme.spacing.sm,
    fontFamily: theme.fonts.fontRegular,
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
  },
  memberCard: {
    marginTop: theme.spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberCardLeft: {
    flex: 1,
  },
  cardDivider: {
    width: 1,
    alignSelf: 'stretch',
    marginHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.border,
  },
  memberCardRight: {
    flex: 1,
  },
  eyebrow: {
    fontFamily: theme.fonts.fontMedium,
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  memberNumber: {
    marginTop: theme.spacing.sm,
    fontFamily: theme.fonts.fontSerifBold,
    fontSize: theme.fontSizes.xl3,
    color: theme.colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaRowSpaced: {
    marginTop: theme.spacing.sm,
  },
  metaText: {
    marginLeft: theme.spacing.sm,
    fontFamily: theme.fonts.fontRegular,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
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
  checkBadge: {
    width: 18,
    height: 18,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBadgeGlyph: {
    fontFamily: theme.fonts.fontBold,
    fontSize: 11,
    color: theme.colors.black,
  },
  progressCard: {
    marginTop: theme.spacing.md,
  },
  claimLine: {
    fontFamily: theme.fonts.fontRegular,
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
  },
  claimNumber: {
    fontFamily: theme.fonts.fontSerifBold,
    fontSize: theme.fontSizes.xl2,
    color: theme.colors.textPrimary,
  },
  progressTrack: {
    marginTop: theme.spacing.sm,
    height: 8,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.black,
  },
  remainingLine: {
    marginTop: theme.spacing.sm,
    fontFamily: theme.fonts.fontRegular,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  remainingNumber: {
    fontFamily: theme.fonts.fontSemibold,
    color: theme.colors.black,
  },
  sectionHeader: {
    marginTop: theme.spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: theme.fonts.fontBold,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textPrimary,
  },
  seeAllText: {
    fontFamily: theme.fonts.fontMedium,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  emptyState: {
    marginTop: theme.spacing.md,
    fontFamily: theme.fonts.fontRegular,
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
  },
  memberStrip: {
    paddingTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.xs,
  },
  memberCardItem: {
    width: 144,
    marginRight: theme.spacing.md,
  },
  memberPhoto: {
    width: 144,
    height: 144,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.border,
    overflow: 'hidden',
  },
  memberPhotoImage: {
    width: '100%',
    height: '100%',
  },
  memberItemNumber: {
    marginTop: theme.spacing.sm,
    fontFamily: theme.fonts.fontSerifSemibold,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textPrimary,
  },
  memberItemName: {
    marginTop: 2,
    fontFamily: theme.fonts.fontMedium,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textPrimary,
  },
  memberItemStatus: {
    marginTop: 2,
    fontFamily: theme.fonts.fontRegular,
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
});

export default ClubHomeScreen;