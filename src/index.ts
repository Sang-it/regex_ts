import { build } from './NFA';

const re = build('/(ab|b)*/');

console.log(re.matches('ab'));
