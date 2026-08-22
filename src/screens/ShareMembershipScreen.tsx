import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  PermissionsAndroid,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from 'react-native';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ViewShot, { type ViewShotRef } from 'react-native-view-shot';
import { Crown } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Card from '../components/Card';
import RuleWithDiamond from '../components/RuleWithDiamond';
import Text from '../components/Text';
import { getCurrentMember } from '../lib/getCurrentMember';
import type { Member } from '../lib/ensureMemberSession';
import type { RootStackParamList } from '../navigation/types';
import theme from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'ShareMembership'>;

function formatJoinedMonth(joinedAt: string): string {
  const date = new Date(joinedAt);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

function ChevronIcon({ color }: { color: string }) {
  return (
    <View style={styles.chevron}>
      <View style={[styles.chevronArm, styles.chevronArmTop, { backgroundColor: color }]} />
      <View style={[styles.chevronArm, styles.chevronArmBottom, { backgroundColor: color }]} />
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

function DownloadIcon({ color }: { color: string }) {
  return (
    <View style={styles.downloadIcon}>
      <View style={[styles.downloadArrowHead, { borderTopColor: color }]} />
      <View style={[styles.downloadArrowStem, { backgroundColor: color }]} />
      <View style={[styles.downloadTray, { borderColor: color }]} />
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

function ShareMembershipScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const shotRef = useRef<ViewShotRef>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingImage, setIsSavingImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const runLoad = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const loaded = await getCurrentMember();
      if (!loaded) {
        throw new Error('Expected an active member session, but none was found.');
      }
      setMember(loaded);
    } catch {
      setErrorMessage('Something went wrong loading your membership. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const loaded = await getCurrentMember();
        if (!loaded) {
          throw new Error('Expected an active member session, but none was found.');
        }
        if (!cancelled) {
          setMember(loaded);
        }
      } catch {
        if (!cancelled) {
          setErrorMessage('Something went wrong loading your membership. Please try again.');
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

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleShare = useCallback(async () => {
    if (!member) {
      return;
    }
    try {
      await Share.share({
        message: `I'm Member #${member.member_number} of Too Rich.`,
      });
    } catch (error) {
      Alert.alert('Share failed', (error as Error).message);
    }
  }, [member]);

  const handleSaveImage = useCallback(async () => {
    if (isSavingImage) {
      return;
    }

    if (!shotRef.current) {
      Alert.alert('Save failed', 'The membership card is not ready to be captured yet.');
      return;
    }

    if (Platform.OS === 'android' && Number(Platform.Version) < 29) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert(
          'Permission needed',
          'Photo library access is required to save the card image.'
        );
        return;
      }
    }

    setIsSavingImage(true);
    try {
      const uri = await shotRef.current.capture();
      await CameraRoll.save(uri, { type: 'photo' });
      Alert.alert('Saved', 'Your membership card was saved to your photo library.');
    } catch (error) {
      Alert.alert('Save failed', (error as Error).message);
    } finally {
      setIsSavingImage(false);
    }
  }, [isSavingImage]);

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
        <Text style={styles.headerTitle}>Share Membership</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + theme.spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}>
        <ViewShot ref={shotRef} options={{ format: 'png', quality: 1.0 }}>
          <Card style={styles.memberCard}>
            <Crown size={24} strokeWidth={2} color={theme.colors.black} />

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
        </ViewShot>

        <Pressable
          accessibilityRole="button"
          onPress={handleShare}
          style={({ pressed }) => [
            styles.actionButton,
            styles.actionButtonPrimary,
            pressed && styles.actionButtonPressed,
          ]}>
          <ShareIcon color={theme.colors.white} />
          <Text style={styles.actionButtonTextPrimary}>Share Card</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: isSavingImage }}
          disabled={isSavingImage}
          onPress={handleSaveImage}
          style={({ pressed }) => [
            styles.actionButton,
            styles.actionButtonOutline,
            pressed && !isSavingImage && styles.actionButtonPressed,
            isSavingImage && styles.actionButtonDisabled,
          ]}>
          <DownloadIcon color={theme.colors.black} />
          <Text style={styles.actionButtonTextOutline}>
            {isSavingImage ? 'Saving…' : 'Save as Image'}
          </Text>
        </Pressable>

        <Text style={styles.caption}>Only 1,000 people will ever own one.</Text>
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
  actionButton: {
    marginTop: theme.spacing.lg,
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
  actionButtonDisabled: {
    opacity: 0.5,
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
  caption: {
    marginTop: theme.spacing.lg,
    fontFamily: theme.fonts.fontRegular,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
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
  downloadIcon: {
    width: 20,
    height: 20,
    position: 'relative',
  },
  downloadArrowHead: {
    position: 'absolute',
    left: 6.75,
    top: 6,
    width: 0,
    height: 0,
    borderLeftWidth: 3.25,
    borderRightWidth: 3.25,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  downloadArrowStem: {
    position: 'absolute',
    left: 9.1,
    top: 0,
    width: 1.75,
    height: 7,
  },
  downloadTray: {
    position: 'absolute',
    left: 2,
    bottom: 0,
    width: 16,
    height: 10,
    borderRadius: 2.5,
    borderWidth: 1.75,
  },
});

export default ShareMembershipScreen;