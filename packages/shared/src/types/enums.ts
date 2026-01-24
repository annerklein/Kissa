// Shared enums matching Prisma schema

export const RoastLevel = {
  LIGHT: 'LIGHT',
  MEDIUM_LIGHT: 'MEDIUM_LIGHT',
  MEDIUM: 'MEDIUM',
  MEDIUM_DARK: 'MEDIUM_DARK',
  DARK: 'DARK',
} as const;

export type RoastLevel = (typeof RoastLevel)[keyof typeof RoastLevel];

export const BagStatus = {
  UNOPENED: 'UNOPENED',
  OPEN: 'OPEN',
  FINISHED: 'FINISHED',
} as const;

export type BagStatus = (typeof BagStatus)[keyof typeof BagStatus];

export const DialStatus = {
  DIALING_IN: 'DIALING_IN',
  STABLE: 'STABLE',
} as const;

export type DialStatus = (typeof DialStatus)[keyof typeof DialStatus];

export const MethodType = {
  V60: 'v60',
  MOKA: 'moka',
  ESPRESSO: 'espresso',
  FRENCH_PRESS: 'french_press',
} as const;

export type MethodType = (typeof MethodType)[keyof typeof MethodType];
