import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Button from '../components/Button';
import Card from '../components/Card';
import Text from '../components/Text';
import { getCurrentMember } from '../lib/getCurrentMember';
import type { Member } from '../lib/ensureMemberSession';
import { MEMBER_PHOTOS_BUCKET } from '../lib/uploadMemberPhoto';
import type { RootStackParamList } from '../navigation/types';
import { supabase } from '../supabase';
import theme from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const DELETE_CONFIRMATION = 'DELETE';

function extractPhotoPath(photoUrl: string): string | null {
  const marker = `/storage/v1/object/public/${MEMBER_PHOTOS_BUCKET}/`;
  const index = photoUrl.indexOf(marker);
  if (index === -1) {
    return null;
  }
  return photoUrl.slice(index + marker.length);
}

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

function ChevronIcon({ color }: { color: string }) {
  return (
    <View style={styles.chevron}>
      <View style={[styles.chevronArm, styles.chevronArmTop, { backgroundColor: color }]} />
      <View style={[styles.chevronArm, styles.chevronArmBottom, { backgroundColor: color }]} />
    </View>
  );
}

function SettingsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handlePrivacyPress = useCallback(() => {
    navigation.navigate('Privacy');
  }, [navigation]);

  const handleTermsPress = useCallback(() => {
    navigation.navigate('Terms');
  }, [navigation]);

  const handleAboutPress = useCallback(() => {
    navigation.navigate('About');
  }, [navigation]);

  const resetStackToSignIn = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'SignIn' }],
    });
  }, [navigation]);

  const handleSignOut = useCallback(async () => {
    if (isSigningOut) {
      return;
    }
    setIsSigningOut(true);
    try {
      await supabase.auth.signOut();
      resetStackToSignIn();
    } catch (error) {
      Alert.alert('Sign Out Failed', (error as Error).message);
    } finally {
      setIsSigningOut(false);
    }
  }, [isSigningOut, resetStackToSignIn]);

  const handleOpenDeleteModal = useCallback(() => {
    setConfirmationText('');
    setDeleteModalVisible(true);
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    if (isDeleting) {
      return;
    }
    setDeleteModalVisible(false);
    setConfirmationText('');
  }, [isDeleting]);

  const handleConfirmDelete = useCallback(async () => {
    if (!member || isDeleting || confirmationText !== DELETE_CONFIRMATION) {
      return;
    }

    setIsDeleting(true);
    try {
      if (member.photo_url) {
        try {
          const path = extractPhotoPath(member.photo_url);
          if (path) {
            const { error } = await supabase.storage
              .from(MEMBER_PHOTOS_BUCKET)
              .remove([path]);
            if (error) {
              console.warn('Failed to remove member photo from storage:', error.message);
            }
          } else {
            console.warn('Could not resolve storage path from photo_url:', member.photo_url);
          }
        } catch (error) {
          console.warn('Failed to clean up member photo:', error);
        }
      }

      const { error } = await supabase.rpc('delete_own_account');

      if (error) {
        Alert.alert('Delete Account Failed', error.message);
        return;
      }

      await supabase.auth.signOut();
      resetStackToSignIn();
    } catch (error) {
      Alert.alert('Delete Account Failed', (error as Error).message);
    } finally {
      setIsDeleting(false);
    }
  }, [member, isDeleting, confirmationText, resetStackToSignIn]);

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
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + theme.spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}>
        <Card style={styles.listCard}>
          <Pressable
            accessibilityRole="button"
            onPress={handlePrivacyPress}
            style={({ pressed }) => [styles.listRow, pressed && styles.rowPressed]}>
            <LockIcon color={theme.colors.black} />
            <Text style={styles.listRowLabel}>Privacy Policy</Text>
            <ChevronIcon color={theme.colors.textSecondary} />
          </Pressable>
          <View style={styles.listDivider} />
          <Pressable
            accessibilityRole="button"
            onPress={handleTermsPress}
            style={({ pressed }) => [styles.listRow, pressed && styles.rowPressed]}>
            <LockIcon color={theme.colors.black} />
            <Text style={styles.listRowLabel}>Terms of Service</Text>
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

        <View style={styles.sectionDivider} />

        <Button
          variant="outline"
          title="Sign Out"
          loading={isSigningOut}
          onPress={handleSignOut}
          style={styles.actionButton}
        />

        <Button
          variant="danger"
          title="Delete Account"
          onPress={handleOpenDeleteModal}
          style={styles.actionButton}
        />
      </ScrollView>

      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCloseDeleteModal}>
        <View style={styles.modalOverlay}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close delete confirmation"
            disabled={isDeleting}
            onPress={handleCloseDeleteModal}
            style={styles.modalBackdrop}
          />
          <View
            style={[styles.modalSheet, { paddingBottom: insets.bottom + theme.spacing.lg }]}>
            <Text style={styles.modalTitle}>Delete Account</Text>
            <Text variant="caption" style={styles.modalBody}>
              This permanently deletes your membership, your profile, and your photo. Your member
              number is never re-issued. This cannot be undone.
            </Text>

            <Text style={[styles.fieldLabel, styles.fieldLabelSpaced]}>
              Type DELETE to confirm
            </Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.input}
                value={confirmationText}
                onChangeText={setConfirmationText}
                placeholder={DELETE_CONFIRMATION}
                placeholderTextColor={theme.colors.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                maxLength={6}
              />
            </View>

            <Button
              variant="danger"
              title="Delete Account"
              disabled={confirmationText !== DELETE_CONFIRMATION}
              loading={isDeleting}
              onPress={handleConfirmDelete}
              style={styles.modalButton}
            />

            <Button
              variant="outline"
              title="Cancel"
              disabled={isDeleting}
              onPress={handleCloseDeleteModal}
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
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
  listCard: {
    marginTop: theme.spacing.sm,
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
  sectionDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.lg,
  },
  rowPressed: {
    opacity: 0.88,
  },
  actionButton: {
    marginTop: theme.spacing.md,
    alignSelf: 'stretch',
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalSheet: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  modalTitle: {
    fontFamily: theme.fonts.fontSerifSemibold,
    fontSize: theme.fontSizes.xl2,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  modalBody: {
    marginTop: theme.spacing.md,
    textAlign: 'center',
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
  input: {
    fontFamily: theme.fonts.fontRegular,
    fontSize: theme.fontSizes.base,
    color: theme.colors.textPrimary,
    paddingVertical: theme.spacing.md,
    textAlign: 'center',
  },
  modalButton: {
    marginTop: theme.spacing.md,
    alignSelf: 'stretch',
  },
});

export default SettingsScreen;
