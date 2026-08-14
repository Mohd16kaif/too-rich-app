import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import theme from '../theme/tokens';
import Text from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';

export type ButtonProps = {
  variant?: ButtonVariant;
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

function Button({
  variant = 'primary',
  title,
  onPress,
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const isBusy = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isBusy }}
      disabled={isBusy}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        pressed && !isBusy && styles.pressed,
        isBusy && styles.disabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColors[variant]} />
      ) : (
        <Text
          variant="body"
          style={[styles.title, titleStyles[variant]]}
          numberOfLines={1}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const spinnerColors: Record<ButtonVariant, string> = {
  primary: theme.colors.background,
  secondary: theme.colors.textPrimary,
  outline: theme.colors.textPrimary,
  danger: theme.colors.background,
};

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.5,
  },
  title: {
    textAlign: 'center',
  },
});

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: theme.colors.black,
  },
  secondary: {
    backgroundColor: theme.colors.border,
  },
  outline: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  danger: {
    backgroundColor: theme.colors.destructive,
  },
});

const titleStyles = StyleSheet.create({
  primary: {
    fontFamily: theme.fonts.fontSemibold,
    color: theme.colors.background,
  },
  secondary: {
    fontFamily: theme.fonts.fontSemibold,
    color: theme.colors.textPrimary,
  },
  outline: {
    fontFamily: theme.fonts.fontSemibold,
    color: theme.colors.textPrimary,
  },
  danger: {
    fontFamily: theme.fonts.fontSemibold,
    color: theme.colors.background,
  },
});

export default Button;
