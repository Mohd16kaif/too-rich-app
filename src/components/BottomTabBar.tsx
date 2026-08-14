import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Text from './Text';
import theme from '../theme/tokens';

export type TabKey = 'Club' | 'Members' | 'Me';

type BottomTabBarProps = {
  activeTab: TabKey;
  onTabPress: (tab: TabKey) => void;
};

function HomeIcon({ color }: { color: string }) {
  const roofStyle = { ...styles.homeRoof, borderBottomColor: color };
  const bodyStyle = { ...styles.homeBody, backgroundColor: color };
  return (
    <View style={styles.iconFrame}>
      <View style={roofStyle} />
      <View style={bodyStyle} />
    </View>
  );
}

function PersonIcon({ color, size }: { color: string; size: number }) {
  const headStyle = {
    ...styles.personHead,
    width: size * 0.3,
    height: size * 0.3,
    borderRadius: size * 0.15,
    backgroundColor: color,
  };
  const bodyStyle = {
    ...styles.personBody,
    width: size * 0.66,
    height: size * 0.32,
    borderTopLeftRadius: size * 0.2,
    borderTopRightRadius: size * 0.2,
    backgroundColor: color,
  };
  const frameStyle = {
    ...styles.iconFrame,
    width: size,
    height: size,
  };
  return (
    <View style={frameStyle}>
      <View style={headStyle} />
      <View style={bodyStyle} />
    </View>
  );
}

function PeopleIcon({ color }: { color: string }) {
  return (
    <View style={styles.iconFrame}>
      <View style={styles.peopleRow}>
        <PersonIcon color={color} size={17} />
        <PersonIcon color={color} size={17} />
      </View>
    </View>
  );
}

function BottomTabBar({ activeTab, onTabPress }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom }]}>
      <Pressable accessibilityRole="button" style={styles.tab} onPress={() => onTabPress('Club')}>
        <HomeIcon color={activeTab === 'Club' ? theme.colors.black : theme.colors.textSecondary} />
        <Text style={[styles.tabLabel, activeTab === 'Club' && styles.tabLabelActive]}>Club</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        style={styles.tab}
        onPress={() => onTabPress('Members')}>
        <PeopleIcon
          color={activeTab === 'Members' ? theme.colors.black : theme.colors.textSecondary}
        />
        <Text style={[styles.tabLabel, activeTab === 'Members' && styles.tabLabelActive]}>
          Members
        </Text>
      </Pressable>
      <Pressable accessibilityRole="button" style={styles.tab} onPress={() => onTabPress('Me')}>
        <PersonIcon
          color={activeTab === 'Me' ? theme.colors.black : theme.colors.textSecondary}
          size={22}
        />
        <Text style={[styles.tabLabel, activeTab === 'Me' && styles.tabLabelActive]}>Me</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    paddingTop: theme.spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    marginTop: 2,
    fontFamily: theme.fonts.fontMedium,
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  tabLabelActive: {
    color: theme.colors.black,
  },
  iconFrame: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeRoof: {
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderBottomWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  homeBody: {
    width: 16,
    height: 12,
    borderRadius: 2,
    marginTop: -4,
  },
  personHead: {},
  personBody: {},
  peopleRow: {
    flexDirection: 'row',
    marginLeft: -5,
  },
});

export default BottomTabBar;