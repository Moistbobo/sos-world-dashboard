import * as stylex from '@stylexjs/stylex';
export const s = stylex.create({
  x: {
    ':is(:not(:first-child))': { marginTop: '0.75rem' },
  },
  y: {
    ':nth-child(n+2)': { marginTop: '0.75rem' },
  },
  z: {
    ':global(> :not(:first-child))': { marginTop: '0.75rem' },
  },
});
