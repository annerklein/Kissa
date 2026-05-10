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
  OPEN: 'OPEN',
  FINISHED: 'FINISHED',
  FROZEN: 'FROZEN',
} as const;

export type BagStatus = (typeof BagStatus)[keyof typeof BagStatus];

export const TubePosition = {
  LEFT: 'LEFT',
  MIDDLE: 'MIDDLE',
  RIGHT: 'RIGHT',
} as const;

export type TubePosition = (typeof TubePosition)[keyof typeof TubePosition];

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
