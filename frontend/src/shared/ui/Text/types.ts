export interface TextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'body1' | 'body2' | 'caption' | 'button';
  size?: 10 | 12 | 14 | 16 | 18 | 24 | 26;
  color?: string;
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  truncate?: boolean;
  lineHeight?: number;
  letterSpacing?: number;
  as?: 'div' | 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'a' | 'button' | 'label' | 'strong' | 'em';
}

export type TextVariant = TextProps['variant'];
export type TextSize = TextProps['size'];
export type TextWeight = TextProps['weight'];
export type TextAlign = TextProps['align'];