import { useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Crown } from 'lucide-react-native';
import BottomTabBar, { type TabKey } from '../components/BottomTabBar';
import Card from '../components/Card';
import Text from '../components/Text';
import { useMember } from '../context/MemberContext';
import type { RootStackParamList } from '../navigation/types';
import theme from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Me'>;

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

function PencilIcon({ color }: { color: string }) {
  return (
    <View style={styles.pencil}>
      <View style={[styles.pencilEraser, { backgroundColor: color }]} />
      <View style={[styles.pencilShaft, { backgroundColor: color }]} />
      <View style={[styles.pencilTip, { borderTopColor: color }]} />
    </View>
  );
}

function ShareIcon({ color }: { color: string }) {
  return (
    <View style={styles.shareIcon}>
      <View style={[styles.shareArrowHead, { borderBottomColor: color }]} />
      <View style={[styles.shareArrowStem, { backgroundColor: color }]} />
      <View style={[styles.shareTray, { borderColor: color }]} />
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

function ChevronIcon({ color }: { color: string }) {
  return (
    <View style={styles.chevron}>
      <View style={[styles.chevronArm, styles.chevronArmTop, { backgroundColor: color }]} />
      <View style={[styles.chevronArm, styles.chevronArmBottom, { backgroundColor: color }]} />
    </View>
  );
}

function GearIcon({ color }: { color: string }) {
  return (
    <View style={styles.gear}>
      <View style={[styles.gearRing, { borderColor: color }]} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <View
          key={angle}
          style={[
            styles.gearTooth,
            { backgroundColor: color, transform: [{ rotate: `${angle}deg` }] },
          ]}
        />
      ))}
      <View style={[styles.gearHub, { backgroundColor: color }]} />
    </View>
  );
}

function LockIcon({ color }: { color: string }) {
  return (
    <View style={styles.lockWrap}>
      <View style={[styles.lockShackle, { borderColor: color }]} />
      <View style={[styles.lockBody, { borderColor: color }]} />
    </View>
  );
}

function InfoIcon({ color }: { color: string }) {
  return (
    <View style={[styles.infoRing, { borderColor: color }]}>
      <Text style={[styles.infoGlyph, { color }]}>i</Text>
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

function MeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { member, isLoading, errorMessage, reload, refreshSilently } = useMember();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', refreshSilently);
    return unsubscribe;
  }, [navigation, refreshSilently]);

  const handleEditProfile = useCallback(() => {
    navigation.navigate('EditProfile');
  }, [navigation]);

  const handleShareCard = useCallback(() => {
    navigation.navigate('ShareMembership');
  }, [navigation]);

  const handleInstagramPress = useCallback(() => {
    navigation.navigate('EditProfile');
  }, [navigation]);

  const handleSettingsPress = useCallback(() => {
    navigation.navigate('Settings');
  }, [navigation]);

  const handlePrivacyPress = useCallback(() => {
    navigation.navigate('Privacy');
  }, [navigation]);

  const handleAboutPress = useCallback(() => {
    navigation.navigate('About');
  }, [navigation]);

  const handleTabPress = useCallback(
    (tab: TabKey) => {
      if (tab === 'Club') {
        navigation.navigate('ClubHome');
      }
      if (tab === 'Members') {
        navigation.navigate('Members');
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
        <Pressable accessibilityRole="button" onPress={reload} style={styles.retryButton}>
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
        <Text style={styles.headline}>My Profile</Text>

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
              <Crown size={24} strokeWidth={2} color={theme.colors.black} />
              <Text style={styles.metaTextDark}>Permanent Member</Text>
            </View>
            <View style={[styles.metaRow, styles.metaRowSpaced]}>
              <CalendarIcon />
              <Text style={styles.metaTextLight}>Joined {joinedLabel}</Text>
            </View>
          </View>

          <DotDivider />
        </Card>

        <View style={styles.buttonRow}>
          <Pressable
            accessibilityRole="button"
            onPress={handleEditProfile}
            style={({ pressed }) => [
              styles.actionButton,
              styles.actionButtonPrimary,
              pressed && styles.actionButtonPressed,
            ]}>
            <PencilIcon color={theme.colors.white} />
            <Text style={styles.actionButtonTextPrimary}>Edit Profile</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={handleShareCard}
            style={({ pressed }) => [
              styles.actionButton,
              styles.actionButtonOutline,
              pressed && styles.actionButtonPressed,
            ]}>
            <ShareIcon color={theme.colors.black} />
            <Text style={styles.actionButtonTextOutline}>Share Card</Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={handleInstagramPress}
          style={({ pressed }) => [styles.instagramCard, pressed && styles.rowPressed]}>
          <InstagramIcon color={theme.colors.black} />
          <View style={styles.instagramTexts}>
            <Text style={styles.instagramLabel}>Instagram</Text>
            {member?.instagram_handle ? (
              <Text style={styles.instagramHandle}>@{member.instagram_handle}</Text>
            ) : (
              <Text style={styles.instagramPlaceholder}>Add Instagram</Text>
            )}
          </View>
          <ChevronIcon color={theme.colors.textSecondary} />
        </Pressable>

        <Card style={styles.listCard}>
          <Pressable
            accessibilityRole="button"
            onPress={handleSettingsPress}
            style={({ pressed }) => [styles.listRow, pressed && styles.rowPressed]}>
            <GearIcon color={theme.colors.black} />
            <Text style={styles.listRowLabel}>Settings</Text>
            <ChevronIcon color={theme.colors.textSecondary} />
          </Pressable>
          <View style={styles.listDivider} />
          <Pressable
            accessibilityRole="button"
            onPress={handlePrivacyPress}
            style={({ pressed }) => [styles.listRow, pressed && styles.rowPressed]}>
            <LockIcon color={theme.colors.black} />
            <Text style={styles.listRowLabel}>Privacy</Text>
            <ChevronIcon color={theme.colors.textSecondary} />
          </Pressable>
          <View style={styles.listDivider} />
          <Pressable
            accessibilityRole="button"
            onPress={handleAboutPress}
            style={({ pressed }) => [styles.listRow, pressed && styles.rowPressed]}>
            <InfoIcon color={theme.colors.black} />
            <Text style={styles.listRowLabel}>About Too Rich</Text>
            <ChevronIcon color={theme.colors.textSecondary} />
          </Pressable>
        </Card>
      </ScrollView>

      <BottomTabBar activeTab="Me" onTabPress={handleTabPress} />
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
  headline: {
    fontFamily: theme.fonts.fontSerifBold,
    fontSize: theme.fontSizes.xl3,
    color: theme.colors.textPrimary,
  },
  profileCard: {
    marginTop: theme.spacing.lg,
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
  buttonRow: {
    marginTop: theme.spacing.lg,
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: theme.radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonPrimary: {
    backgroundColor: theme.colors.black,
  },
  actionButtonOutline: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.black,
  },
  actionButtonPressed: {
    opacity: 0.88,
  },
  actionButtonTextPrimary: {
    marginLeft: theme.spacing.sm,
    fontFamily: theme.fonts.fontSemibold,
    fontSize: theme.fontSizes.base,
    color: theme.colors.white,
  },
  actionButtonTextOutline: {
    marginLeft: theme.spacing.sm,
    fontFamily: theme.fonts.fontSemibold,
    fontSize: theme.fontSizes.base,
    color: theme.colors.textPrimary,
  },
  pencil: {
    width: 18,
    height: 18,
    position: 'relative',
    transform: [{ rotate: '-45deg' }],
  },
  pencilEraser: {
    position: 'absolute',
    left: 7.5,
    top: 0,
    width: 3,
    height: 2.5,
    borderRadius: 1,
  },
  pencilShaft: {
    position: 'absolute',
    left: 7.5,
    top: 2.5,
    width: 3,
    height: 12,
    borderRadius: 1.5,
  },
  pencilTip: {
    position: 'absolute',
    left: 6.25,
    top: 14.5,
    width: 0,
    height: 0,
    borderLeftWidth: 2.75,
    borderRightWidth: 2.75,
    borderTopWidth: 3.5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  shareIcon: {
    width: 20,
    height: 20,
    position: 'relative',
  },
  shareArrowHead: {
    position: 'absolute',
    left: 6.75,
    top: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 3.25,
    borderRightWidth: 3.25,
    borderBottomWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  shareArrowStem: {
    position: 'absolute',
    left: 9.1,
    top: 4,
    width: 1.75,
    height: 7,
  },
  shareTray: {
    position: 'absolute',
    left: 2,
    bottom: 0,
    width: 16,
    height: 10,
    borderRadius: 2.5,
    borderWidth: 1.75,
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
  instagramPlaceholder: {
    marginTop: 2,
    fontFamily: theme.fonts.fontMedium,
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
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
  listCard: {
    marginTop: theme.spacing.md,
    padding: 0,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  listRowLabel: {
    flex: 1,
    marginLeft: theme.spacing.md,
    fontFamily: theme.fonts.fontRegular,
    fontSize: theme.fontSizes.base,
    color: theme.colors.textPrimary,
  },
  listDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginLeft: theme.spacing.md + 22 + theme.spacing.md,
  },
  rowPressed: {
    opacity: 0.88,
  },
  gear: {
    width: 22,
    height: 22,
    position: 'relative',
  },
  gearRing: {
    position: 'absolute',
    top: 3,
    left: 3,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  gearTooth: {
    position: 'absolute',
    left: 9.5,
    top: 0,
    width: 3,
    height: 6,
  },
  gearHub: {
    position: 'absolute',
    top: 9,
    left: 9,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  lockWrap: {
    width: 18,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockShackle: {
    width: 10,
    height: 10,
    borderWidth: 1.75,
    borderBottomWidth: 0,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    marginTop: theme.spacing.xs,
  },
  lockBody: {
    width: 15,
    height: 11,
    borderWidth: 1.75,
    borderRadius: 2,
    marginTop: -3,
  },
  infoRing: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoGlyph: {
    fontFamily: theme.fonts.fontSemibold,
    fontSize: theme.fontSizes.sm,
    lineHeight: theme.fontSizes.sm,
  },
});

export default MeScreen;