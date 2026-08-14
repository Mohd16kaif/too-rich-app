import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Button from '../../components/Button';
import Text from '../../components/Text';
import { ensureMemberSession, isMemberCapError } from '../../lib/ensureMemberSession';
import { updateMemberProfile } from '../../lib/updateMemberProfile';
import { uploadMemberPhoto } from '../../lib/uploadMemberPhoto';
import type { RootStackParamList } from '../../navigation/types';
import theme from '../../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

function OnboardingPhotoScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoMimeType, setPhotoMimeType] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const runSessionSetup = useCallback(async () => {
    setIsLoadingSession(true);
    setSessionError(null);
    try {
      await ensureMemberSession();
    } catch (error) {
      setSessionError(
        isMemberCapError(error)
          ? error.message
          : 'Something went wrong setting up your session. Please try again.'
      );
    } finally {
      setIsLoadingSession(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await ensureMemberSession();
      } catch (error) {
        if (!cancelled) {
          setSessionError(
            isMemberCapError(error)
              ? error.message
              : 'Something went wrong setting up your session. Please try again.'
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingSession(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChoosePhoto = useCallback(async () => {
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

    setPhotoUri(asset.uri);
    setPhotoBase64(asset.base64);
    setPhotoMimeType(asset.type ?? 'image/jpeg');
    setUploadError(null);
  }, []);

  const handleContinue = useCallback(async () => {
    if (isUploadingPhoto) {
      return;
    }

    if (!photoBase64) {
      navigation.navigate('OnboardingMessage');
      return;
    }

    setIsUploadingPhoto(true);
    setUploadError(null);
    try {
      const { member } = await ensureMemberSession();
      const publicUrl = await uploadMemberPhoto(
        member.apple_user_id,
        photoBase64,
        photoMimeType ?? 'image/jpeg'
      );
      await updateMemberProfile({ photo_url: publicUrl });
      navigation.navigate('OnboardingMessage');
    } catch (error) {
      setUploadError((error as Error).message);
    } finally {
      setIsUploadingPhoto(false);
    }
  }, [navigation, photoBase64, photoMimeType, isUploadingPhoto]);

  const handleSkip = useCallback(() => {
    navigation.navigate('OnboardingMessage');
  }, [navigation]);

  if (isLoadingSession) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={theme.colors.black} size="large" />
      </View>
    );
  }

  if (sessionError) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { paddingTop: insets.top + theme.spacing.lg, paddingBottom: insets.bottom + theme.spacing.lg },
        ]}>
        <Text variant="body" style={styles.errorText}>
          {sessionError}
        </Text>
        <Button title="Try Again" onPress={runSessionSetup} style={styles.retryButton} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + theme.spacing.lg,
          paddingBottom: insets.bottom + theme.spacing.lg,
        },
      ]}>
      <View style={styles.stepIndicator}>
        <View style={styles.dotsRow}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
        <Text style={styles.stepLabel}>Step 1 of 3</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.headline}>Show us who&apos;s joining.</Text>
        <Text style={styles.subtitle}>
          Your photo will appear on your permanent member profile.
        </Text>

        <View style={styles.photoCircle}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photoImage} />
          ) : (
            <View
              style={styles.cameraIcon}
              accessibilityLabel="Add photo"
              accessibilityRole="image">
              <View style={styles.cameraTop} />
              <View style={styles.cameraBody}>
                <View style={styles.cameraLens} />
              </View>
            </View>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        {uploadError ? <Text style={styles.uploadError}>{uploadError}</Text> : null}
        <Button
          title={photoUri ? 'Continue' : 'Choose Photo'}
          onPress={photoUri ? handleContinue : handleChoosePhoto}
          loading={isUploadingPhoto}
        />
        <Pressable
          accessibilityRole="button"
          onPress={handleSkip}
          style={styles.skipButton}>
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>
        <Text style={styles.footerNote}>You can change your photo anytime.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  retryButton: {
    alignSelf: 'stretch',
  },
  stepIndicator: {
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: theme.spacing.sm,
    height: theme.spacing.sm,
    borderRadius: theme.spacing.xs,
    marginHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.border,
  },
  dotActive: {
    backgroundColor: theme.colors.black,
  },
  stepLabel: {
    marginTop: theme.spacing.md,
    fontFamily: theme.fonts.fontMedium,
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headline: {
    fontFamily: theme.fonts.fontSerifBold,
    fontSize: theme.fontSizes.xl4,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: theme.spacing.sm,
    fontFamily: theme.fonts.fontRegular,
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.fontSizes.base * 1.4,
  },
  photoCircle: {
    marginTop: theme.spacing.xl,
    width: theme.photoCircleSize,
    height: theme.photoCircleSize,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.background,
    borderWidth: 2,
    borderColor: theme.colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  cameraIcon: {
    alignItems: 'center',
  },
  cameraTop: {
    width: theme.spacing.lg,
    height: theme.spacing.sm + 1,
    borderWidth: 2,
    borderColor: theme.colors.black,
    borderBottomWidth: 0,
    borderTopLeftRadius: theme.radius.sm,
    borderTopRightRadius: theme.radius.sm,
  },
  cameraBody: {
    width: 60,
    height: 44,
    borderWidth: 2,
    borderColor: theme.colors.black,
    borderRadius: theme.radius.sm,
    marginTop: -2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraLens: {
    width: 18,
    height: 18,
    borderRadius: theme.radius.full,
    borderWidth: 2,
    borderColor: theme.colors.black,
  },
  footer: {
    width: '100%',
  },
  uploadError: {
    fontFamily: theme.fonts.fontMedium,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  skipText: {
    fontFamily: theme.fonts.fontMedium,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  footerNote: {
    fontFamily: theme.fonts.fontRegular,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default OnboardingPhotoScreen;
