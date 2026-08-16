import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Button from '../components/Button';
import Card from '../components/Card';
import Text from '../components/Text';
import { getCurrentMember } from '../lib/getCurrentMember';
import type { Member } from '../lib/ensureMemberSession';
import { updateMemberProfile } from '../lib/updateMemberProfile';
import { uploadMemberPhoto } from '../lib/uploadMemberPhoto';
import type { RootStackParamList } from '../navigation/types';
import theme from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

const MAX_STATUS_LENGTH = 80;

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

function PhotoPlaceholder() {
  return (
    <View style={styles.photoPerson}>
      <View style={styles.photoPersonHead} />
      <View style={styles.photoPersonBody} />
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

function CameraOverlayButton({ onPress, disabled }: { onPress: () => void; disabled: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Change photo"
      disabled={disabled}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [
        styles.cameraOverlay,
        pressed && styles.pressed,
        disabled && styles.cameraOverlayDisabled,
      ]}>
      <View style={styles.cameraGlyph}>
        <View style={styles.cameraGlyphTop} />
        <View style={styles.cameraGlyphBody}>
          <View style={styles.cameraGlyphLens} />
        </View>
      </View>
    </Pressable>
  );
}

function EditProfileScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [member, setMember] = useState<Member | null>(null);
  const [fullName, setFullName] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [photoSrc, setPhotoSrc] = useState<string | null>(null);
  const [savedPhotoUrl, setSavedPhotoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
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
      setFullName(loaded.full_name ?? '');
      setStatusMessage(loaded.status_message ?? '');
      setInstagramHandle(loaded.instagram_handle ?? '');
      setSavedPhotoUrl(loaded.photo_url);
      setPhotoSrc(loaded.photo_url);
    } catch {
      setErrorMessage('Something went wrong loading your profile. Please try again.');
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
          setFullName(loaded.full_name ?? '');
          setStatusMessage(loaded.status_message ?? '');
          setInstagramHandle(loaded.instagram_handle ?? '');
          setSavedPhotoUrl(loaded.photo_url);
          setPhotoSrc(loaded.photo_url);
        }
      } catch {
        if (!cancelled) {
          setErrorMessage('Something went wrong loading your profile. Please try again.');
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

  const handlePickPhoto = useCallback(async () => {
    if (isUploadingPhoto) {
      return;
    }

    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.7,
      selectionLimit: 1,
      includeBase64: true,
    });

    if (result.didCancel) {
      return;
    }

    if (result.errorCode) {
      Alert.alert('Unable to open photo library', result.errorMessage ?? undefined);
      return;
    }

    const asset = result.assets?.[0];
    if (!asset?.uri) {
      return;
    }

    if (!asset.base64) {
      Alert.alert('Photo upload failed', 'The selected photo could not be read.');
      return;
    }

    setPhotoSrc(asset.uri);
    setIsUploadingPhoto(true);
    setErrorMessage(null);
    try {
      const publicUrl = await uploadMemberPhoto(
        member?.apple_user_id ?? '',
        asset.base64,
        asset.type ?? 'image/jpeg'
      );
      setSavedPhotoUrl(publicUrl);
      setPhotoSrc(publicUrl);
    } catch (error) {
      Alert.alert('Photo upload failed', (error as Error).message);
      setPhotoSrc(savedPhotoUrl);
    } finally {
      setIsUploadingPhoto(false);
    }
  }, [member, savedPhotoUrl, isUploadingPhoto]);

  const handleCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSave = useCallback(async () => {
    if (!member || isSaving) {
      return;
    }

    const normalizedHandle = instagramHandle.trim().replace(/^@+/, '');

    setIsSaving(true);
    setErrorMessage(null);
    try {
      await updateMemberProfile({
        full_name: fullName,
        status_message: statusMessage,
        instagram_handle: normalizedHandle,
        photo_url: savedPhotoUrl,
      });
      navigation.goBack();
    } catch (error) {
      setErrorMessage((error as Error).message);
      Alert.alert('Save failed', (error as Error).message);
    } finally {
      setIsSaving(false);
    }
  }, [member, isSaving, instagramHandle, fullName, statusMessage, savedPhotoUrl, navigation]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={theme.colors.black} size="large" />
      </View>
    );
  }

  if (errorMessage && !member) {
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
  const previewName = fullName.trim() || 'Member';

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + theme.spacing.sm }]}>
        <Pressable
          accessibilityRole="button"
          onPress={handleCancel}
          hitSlop={8}
          style={styles.headerSide}>
          <Text style={styles.headerAction}>Cancel</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <Pressable
          accessibilityRole="button"
          disabled={isSaving}
          onPress={handleSave}
          hitSlop={8}
          style={[styles.headerSide, styles.headerSideRight]}>
          <Text style={styles.headerAction}>Save</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + theme.spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <Card style={styles.profileCard}>
          <DotDivider />

          <View style={styles.photoCircle}>
            {photoSrc ? (
              <Image source={{ uri: photoSrc }} style={styles.photoImage} />
            ) : (
              <PhotoPlaceholder />
            )}
            <CameraOverlayButton onPress={handlePickPhoto} disabled={isUploadingPhoto} />
          </View>

          <Text style={styles.eyebrow}>MEMBER #{member?.member_number}</Text>
          <Text style={styles.profileName}>{previewName}</Text>

          {statusMessage.trim() ? (
            <Text style={styles.profileStatus}>{statusMessage.trim()}</Text>
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

        <Pressable
          accessibilityRole="button"
          disabled={isUploadingPhoto}
          onPress={handlePickPhoto}
          style={styles.changePhotoLink}>
          <Text style={styles.changePhotoText}>
            {isUploadingPhoto ? 'Uploading…' : 'Change Photo'}
          </Text>
        </Pressable>

        <View style={styles.form}>
          <Text style={styles.fieldLabel}>Full Name</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor={theme.colors.textSecondary}
              value={fullName}
              onChangeText={setFullName}
              autoCorrect={false}
            />
          </View>

          <Text style={[styles.fieldLabel, styles.fieldLabelSpaced]}>Status</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
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

          <Text style={[styles.fieldLabel, styles.fieldLabelSpaced]}>Instagram Username</Text>
          <View style={[styles.inputBox, styles.inputBoxRow]}>
            <Text style={styles.inputPrefix}>@</Text>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="twitter"
              maxLength={30}
              placeholder="username"
              placeholderTextColor={theme.colors.textSecondary}
              value={instagramHandle}
              onChangeText={setInstagramHandle}
            />
          </View>

          <Text style={styles.caption}>Your profile is visible to every member.</Text>

          {errorMessage ? <Text style={styles.saveError}>{errorMessage}</Text> : null}

          <Button
            title="Save Changes"
            loading={isSaving}
            onPress={handleSave}
            style={styles.saveButton}
          />
        </View>
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
  headerSide: {
    width: 64,
  },
  headerSideRight: {
    alignItems: 'flex-end',
  },
  headerAction: {
    fontFamily: theme.fonts.fontMedium,
    fontSize: theme.fontSizes.base,
    color: theme.colors.textPrimary,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: theme.fonts.fontBold,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textPrimary,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
  },
  profileCard: {
    marginTop: theme.spacing.sm,
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
  cameraOverlay: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraOverlayDisabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.88,
  },
  cameraGlyph: {
    alignItems: 'center',
  },
  cameraGlyphTop: {
    width: 10,
    height: 4,
    borderWidth: 1.5,
    borderColor: theme.colors.black,
    borderBottomWidth: 0,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  cameraGlyphBody: {
    width: 16,
    height: 11,
    borderWidth: 1.5,
    borderColor: theme.colors.black,
    borderRadius: 2,
    marginTop: -1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraGlyphLens: {
    width: 5,
    height: 5,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: theme.colors.black,
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
  changePhotoLink: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  changePhotoText: {
    fontFamily: theme.fonts.fontMedium,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  form: {
    width: '100%',
  },
  fieldLabel: {
    fontFamily: theme.fonts.fontMedium,
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  fieldLabelSpaced: {
    marginTop: theme.spacing.lg,
  },
  inputBox: {
    marginTop: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
  },
  inputBoxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputPrefix: {
    fontFamily: theme.fonts.fontRegular,
    fontSize: theme.fontSizes.base,
    color: theme.colors.black,
    marginRight: theme.spacing.sm,
  },
  input: {
    fontFamily: theme.fonts.fontRegular,
    fontSize: theme.fontSizes.base,
    color: theme.colors.textPrimary,
    paddingVertical: theme.spacing.md,
  },
  inputMultiline: {
    minHeight: 88,
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
  caption: {
    marginTop: theme.spacing.lg,
    fontFamily: theme.fonts.fontRegular,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  saveError: {
    marginTop: theme.spacing.md,
    fontFamily: theme.fonts.fontMedium,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  saveButton: {
    marginTop: theme.spacing.md,
    alignSelf: 'stretch',
  },
});

export default EditProfileScreen;