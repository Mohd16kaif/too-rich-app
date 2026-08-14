import {
  Text as RNText,
  type StyleProp,
  type TextProps as RNTextProps,
  type TextStyle,
} from 'react-native';
import theme from '../theme/tokens';

export type TextVariant =
  | 'display'
  | 'heading'
  | 'subheading'
  | 'body'
  | 'caption'
  | 'label';

const variantStyles: Record<TextVariant, TextStyle> = {
  display: {
    fontFamily: theme.fonts.fontSemibold,
    fontSize: theme.fontSizes.xl5,
    color: theme.colors.textPrimary,
  },
  heading: {
    fontFamily: theme.fonts.fontBold,
    fontSize: theme.fontSizes.xl3,
    color: theme.colors.textPrimary,
  },
  subheading: {
    fontFamily: theme.fonts.fontMedium,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textPrimary,
  },
  body: {
    fontFamily: theme.fonts.fontRegular,
    fontSize: theme.fontSizes.base,
    color: theme.colors.textPrimary,
  },
  caption: {
    fontFamily: theme.fonts.fontRegular,
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
  },
  label: {
    fontFamily: theme.fonts.fontMedium,
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
};

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  style?: StyleProp<TextStyle>;
};

function Text({ variant = 'body', style, ...rest }: TextProps) {
  return <RNText style={[variantStyles[variant], style]} {...rest} />;
}

export default Text;
