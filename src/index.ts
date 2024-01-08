import { build } from './NFA';

const re = build('/(a|b)?/');

console.log(re.matches("aaabbb"));
