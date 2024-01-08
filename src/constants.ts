export const EPSILON = 'ε';
export const EPSILON_CLOSURE = `${EPSILON}*`;
export type DFATransitionTable = Record<string, Record<string, string | number>>;
export type NFATransitionTable = Record<string, Record<string, string | number[]>>;
