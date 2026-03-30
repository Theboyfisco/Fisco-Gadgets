export const MOTION = {
  duration: {
    fast: 0.16,
    base: 0.24,
    slow: 0.42,
  },
  ease: {
    standard: [0.22, 1, 0.36, 1],
    enter: [0, 0, 0.2, 1],
    exit: [0.4, 0, 1, 1],
  },
} as const;
