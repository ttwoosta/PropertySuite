// Typed access to the design-system components registered on the global
// namespace by the bundle. The bundle is JS, so these prop types are hand-written
// to mirror the components' real props (derived from the DS prompt notes and the
// prototype usage). They give us editor help without re-implementing anything.
import type { CSSProperties, ReactNode } from 'react';
import { ds } from './ds';

type FC<P> = (props: P) => JSX.Element;

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-soft';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: React.MouseEvent) => void;
  style?: CSSProperties;
  className?: string;
  children?: ReactNode;
}

export interface IconButtonProps {
  label: string;
  variant?: 'ghost' | 'solid' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  style?: CSSProperties;
  children?: ReactNode;
}

export interface AvatarProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  square?: boolean;
  image?: string;
  style?: CSSProperties;
}

export interface BadgeProps {
  tone?: 'neutral' | 'brand' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  dot?: boolean;
  children?: ReactNode;
}

export interface CardProps {
  interactive?: boolean;
  padding?: string | number;
  onClick?: (e: React.MouseEvent) => void;
  style?: CSSProperties;
  className?: string;
  children?: ReactNode;
}

export interface CardHeaderProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}

export interface InputProps {
  label?: string;
  type?: string;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  leadingIcon?: ReactNode;
  hint?: string;
  error?: string;
  min?: string | number;
  autoComplete?: string;
  autoFocus?: boolean;
  style?: CSSProperties;
}

export type SelectOption = string | { value: string; label: string };
export interface SelectProps {
  label?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  style?: CSSProperties;
}

export interface CheckboxProps {
  label?: ReactNode;
  description?: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface NavItemProps {
  icon?: ReactNode;
  label: ReactNode;
  active?: boolean;
  badge?: number | string;
  onClick?: (e: React.MouseEvent) => void;
  style?: CSSProperties;
}

export interface StatCardProps {
  label: ReactNode;
  value: ReactNode;
  tone?: 'neutral' | 'brand' | 'success' | 'warning' | 'danger';
  icon?: ReactNode;
  delta?: ReactNode;
}

export const Button = ds.Button as FC<ButtonProps>;
export const IconButton = ds.IconButton as FC<IconButtonProps>;
export const Avatar = ds.Avatar as FC<AvatarProps>;
export const Badge = ds.Badge as FC<BadgeProps>;
export const Card = ds.Card as FC<CardProps>;
export const CardHeader = ds.CardHeader as FC<CardHeaderProps>;
export const Input = ds.Input as FC<InputProps>;
export const Select = ds.Select as FC<SelectProps>;
export const Checkbox = ds.Checkbox as FC<CheckboxProps>;
export const NavItem = ds.NavItem as FC<NavItemProps>;
export const StatCard = ds.StatCard as FC<StatCardProps>;
export const TaskCard = ds.TaskCard as FC<Record<string, unknown>>;
