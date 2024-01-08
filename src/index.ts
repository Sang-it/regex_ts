import { build } from './NFA';

const re = build('/a*/');

console.log(re.matches("a"));
