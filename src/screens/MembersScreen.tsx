import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import BottomTabBar, { type TabKey } from '../components/BottomTabBar';
import Text from '../components/Text';
import { ensureMemberSession, isMemberCapError } from '../lib/ensureMemberSession';
import { MEMBER_CAP, fetchClaimedMemberCount, formatCount } from '../lib/memberCount';
import type { RootStackParamList } from '../navigation/types';
import { supabase } from '../supabase';
import theme from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Members'>;

const PAGE_SIZE = 30;
const SEARCH_DEBOUNCE_MS = 300;

type FilterKey = 'All' | 'Newest' | 'Lowest' | 'Highest' | 'Favorites';

type MemberRecord = {
  id: number;
  member_number: number;
  joined_at: string;
  full_name: string | null;
  photo_url: string | null;
  status_message: string | null;
};

const FILTERS: ReadonlyArray<{ key: FilterKey; label: string }> = [
  { key: 'All', label: 'All' },
  { key: 'Newest', label: 'Newest' },
  { key: 'Lowest', label: 'Lowest Number' },
  { key: 'Highest', label: 'Highest Number' },
  { key: 'Favorites', label: 'Favorites' },
];

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (match) => `\\${match}`);
}

function SearchIcon() {
  return (
    <View style={styles.searchIcon}>
      <View style={styles.searchLens} />
      <View style={styles.searchHandle} />
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

function MembersScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [claimedCount, setClaimedCount] = useState<number | null>(null);
  const [memberId, setMemberId] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('All');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [favoriteIds, setFavoriteIds] = useState<number[] | null>(null);
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const membersRef = useRef<MemberRecord[]>([]);
  const seqRef = useRef(0);
  const loadedKeyRef = useRef('');

  const setMembersBoth = useCallback((next: MemberRecord[]) => {
    membersRef.current = next;
    setMembers(next);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [{ member }, claimed] = await Promise.all([
          ensureMemberSession(),
          fetchClaimedMemberCount(),
        ]);

        if (!cancelled) {
          setMemberId(Number(member.id));
          setClaimedCount(claimed);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            isMemberCapError(error)
              ? error.message
              : 'Something went wrong loading members. Please try again.'
          );
          setIsInitialLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (activeFilter !== 'Favorites') {
      setFavoriteIds(null);
    }
  }, [activeFilter]);

  const loadPage = useCallback(
    async (direction: 'reset' | 'append') => {
      const seq = ++seqRef.current;
      const offset = direction === 'append' ? membersRef.current.length : 0;

      if (direction === 'reset') {
        setIsInitialLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setErrorMessage(null);

      try {
        let ids: number[] | null = null;

        if (activeFilter === 'Favorites') {
          if (favoriteIds === null) {
            const { data: favoriteData, error: favoriteError } = await supabase
              .from('favorites')
              .select('favorited_member_id')
              .eq('member_id', memberId);

            if (seqRef.current !== seq) return;
            if (favoriteError) {
              throw new Error(`Failed to load favorites: ${favoriteError.message}`);
            }
            ids = (favoriteData ?? []).map((row) => Number(row.favorited_member_id));
            setFavoriteIds(ids);
          } else {
            ids = favoriteIds;
          }
        }

        const orderColumn = activeFilter === 'Newest' ? 'joined_at' : 'member_number';
        const ascending = activeFilter === 'Newest' || activeFilter === 'Highest';

        let query = supabase
          .from('members')
          .select('id, member_number, joined_at, full_name, photo_url, status_message')
          .order(orderColumn, { ascending: !ascending })
          .range(offset, offset + PAGE_SIZE);

        if (searchQuery) {
          query = query.or(
            `full_name.ilike.%${escapeLike(searchQuery)}%,member_number::text.ilike.%${escapeLike(searchQuery)}%`
          );
        }

        if (ids !== null) {
          query = query.in('id', ids);
        }

        const { data, error } = await query;
        if (seqRef.current !== seq) return;
        if (error) {
          throw new Error(`Failed to load members: ${error.message}`);
        }

        const rows = (data ?? []) as MemberRecord[];
        const hasMoreRows = rows.length > PAGE_SIZE;
        const pageRows = hasMoreRows ? rows.slice(0, PAGE_SIZE) : rows;

        setMembersBoth(direction === 'reset' ? pageRows : [...membersRef.current, ...pageRows]);
        setHasMore(hasMoreRows);
      } catch (error) {
        if (seqRef.current !== seq) return;
        setErrorMessage(
          isMemberCapError(error)
            ? error.message
            : 'Something went wrong loading members. Please try again.'
        );
      } finally {
        if (seqRef.current === seq) {
          setIsInitialLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [activeFilter, searchQuery, favoriteIds, memberId, setMembersBoth]
  );

  useEffect(() => {
    if (memberId === null) {
      return;
    }
    const key = `${activeFilter}|${searchQuery}`;
    if (loadedKeyRef.current === key) {
      return;
    }
    loadedKeyRef.current = key;
    loadPage('reset');
  }, [activeFilter, searchQuery, memberId, loadPage]);

  const handleLoadMore = useCallback(() => {
    if (isInitialLoading || isLoadingMore || !hasMore) {
      return;
    }
    loadPage('append');
  }, [isInitialLoading, isLoadingMore, hasMore, loadPage]);

  const handleRetry = useCallback(() => {
    loadedKeyRef.current = '';
    loadPage('reset');
  }, [loadPage]);

  const handleRetryMore = useCallback(() => {
    loadPage('append');
  }, [loadPage]);

  const handleMemberPress = useCallback(() => {
    // TODO: Individual Member Page does not exist yet — no route registered.
  }, []);

  const handleTabPress = useCallback(
    (tab: TabKey) => {
      if (tab === 'Club') {
        navigation.navigate('ClubHome');
      }
      if (tab === 'Me') {
        navigation.navigate('Me');
      }
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }: { item: MemberRecord }) => (
      <Pressable
        accessibilityRole="button"
        onPress={handleMemberPress}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
        <View style={styles.cardTop}>
          <View style={styles.photo}>
            {item.photo_url ? (
              <Image source={{ uri: item.photo_url }} style={styles.photoImage} />
            ) : (
              <PhotoPlaceholder />
            )}
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeGlyph}>✓</Text>
          </View>
        </View>
        <Text style={styles.eyebrow}>MEMBER</Text>
        <Text style={styles.cardNumber}>#{item.member_number}</Text>
        <Text style={styles.cardName} numberOfLines={1}>
          {item.full_name ?? 'Member'}
        </Text>
        {item.status_message ? (
          <Text style={styles.cardStatus} numberOfLines={1}>
            {'\u00B7'} {item.status_message}
          </Text>
        ) : null}
      </Pressable>
    ),
    [handleMemberPress]
  );

  if (errorMessage && members.length === 0) {
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
        <Pressable accessibilityRole="button" onPress={handleRetry} style={styles.retryButton}>
          <Text style={styles.retryText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  if (isInitialLoading && members.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={theme.colors.black} size="large" />
      </View>
    );
  }

  const emptyMessage =
    searchQuery !== ''
      ? 'No members found.'
      : activeFilter === 'Favorites'
      ? 'No favorites yet.'
      : 'No members yet.';

  return (
    <View style={styles.container}>
      <FlatList
        data={members}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.column}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + theme.spacing.md }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headline}>Members</Text>
            <Text style={styles.subtitle}>
              {formatCount(claimedCount)} of {MEMBER_CAP.toLocaleString('en-US')} Members
            </Text>

            <View style={styles.searchBox}>
              <SearchIcon />
              <TextInput
                style={styles.searchInput}
                placeholder="Search member..."
                placeholderTextColor={theme.colors.textSecondary}
                value={searchInput}
                onChangeText={setSearchInput}
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="search"
                accessibilityLabel="Search member"
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}>
              {FILTERS.map(({ key, label }) => {
                const active = key === activeFilter;
                return (
                  <Pressable
                    key={key}
                    accessibilityRole="button"
                    onPress={() => setActiveFilter(key)}
                    style={[styles.chip, active && styles.chipActive]}>
                    <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={
          isInitialLoading ? null : <Text style={styles.emptyText}>{emptyMessage}</Text>
        }
        ListFooterComponent={
          isLoadingMore ? (
            <ActivityIndicator color={theme.colors.black} style={styles.footerSpinner} />
          ) : errorMessage && members.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              onPress={handleRetryMore}
              style={styles.footerRetry}>
              <Text style={styles.footerRetryText}>Couldn't load more - Try Again</Text>
            </Pressable>
          ) : null
        }
      />

      <BottomTabBar activeTab="Members" onTabPress={handleTabPress} />
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
  column: {
    gap: theme.spacing.md,
  },
  header: {
    marginBottom: theme.spacing.md,
  },
  headline: {
    fontFamily: theme.fonts.fontSerifBold,
    fontSize: theme.fontSizes.xl3,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    marginTop: theme.spacing.sm,
    fontFamily: theme.fonts.fontRegular,
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
  },
  searchBox: {
    marginTop: theme.spacing.lg,
    height: 44,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    width: 16,
    height: 16,
    position: 'relative',
  },
  searchLens: {
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.black,
  },
  searchHandle: {
    position: 'absolute',
    right: -1,
    bottom: 1,
    width: 7,
    height: 2,
    borderRadius: 1,
    backgroundColor: theme.colors.black,
    transform: [{ rotate: '45deg' }],
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    paddingVertical: 0,
    fontFamily: theme.fonts.fontRegular,
    fontSize: theme.fontSizes.base,
    color: theme.colors.textPrimary,
  },
  chipRow: {
    marginTop: theme.spacing.md,
    paddingRight: theme.spacing.md,
  },
  chip: {
    height: 36,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  chipActive: {
    backgroundColor: theme.colors.black,
    borderColor: theme.colors.black,
  },
  chipLabel: {
    fontFamily: theme.fonts.fontMedium,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textPrimary,
  },
  chipLabelActive: {
    color: theme.colors.white,
  },
  card: {
    flex: 1,
    marginBottom: theme.spacing.lg,
  },
  cardPressed: {
    opacity: 0.88,
  },
  cardTop: {
    position: 'relative',
  },
  photo: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: theme.radius.lg,
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
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.textSecondary,
  },
  photoPersonBody: {
    marginTop: theme.spacing.sm,
    width: 56,
    height: 28,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: theme.colors.textSecondary,
  },
  badge: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    width: 24,
    height: 24,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeGlyph: {
    fontFamily: theme.fonts.fontBold,
    fontSize: 13,
    color: theme.colors.black,
  },
  eyebrow: {
    marginTop: theme.spacing.md,
    fontFamily: theme.fonts.fontMedium,
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  cardNumber: {
    marginTop: 2,
    fontFamily: theme.fonts.fontSerifBold,
    fontSize: theme.fontSizes.xl,
    color: theme.colors.textPrimary,
  },
  cardName: {
    marginTop: 2,
    fontFamily: theme.fonts.fontBold,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textPrimary,
  },
  cardStatus: {
    marginTop: 2,
    fontFamily: theme.fonts.fontRegular,
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  emptyText: {
    marginTop: theme.spacing.xl,
    fontFamily: theme.fonts.fontRegular,
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  footerSpinner: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  footerRetry: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  footerRetryText: {
    fontFamily: theme.fonts.fontMedium,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
});

export default MembersScreen;