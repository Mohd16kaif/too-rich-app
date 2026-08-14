import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import theme from '../theme/tokens';

type RuleWithDiamondProps = {
  style?: StyleProp<ViewStyle>;
};

function RuleWithDiamond({ style }: RuleWithDiamondProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.line} />
      <Text style={styles.diamond}>◆</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    width: 48,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  diamond: {
    marginHorizontal: theme.spacing.sm,
    fontSize: 6,
    lineHeight: 6,
    color: theme.colors.textPrimary,
  },
});

export default RuleWithDiamond;
