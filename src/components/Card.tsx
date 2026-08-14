import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import theme from '../theme/tokens';

export type CardProps = ViewProps & {
  style?: StyleProp<ViewStyle>;
};

function Card({ style, children, ...rest }: CardProps) {
  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
  },
});

export default Card;
