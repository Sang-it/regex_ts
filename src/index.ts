import { rep, char } from './NFA';

let re = rep(
    char('a'),
);

console.log(
    re.matches(''),
    re.matches('a'),
    re.matches('aab'),
);

console.log('Hello World!');
