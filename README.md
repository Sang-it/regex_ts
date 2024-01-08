<br />
<div align="center">
  <h3 align="center">T_REX</h3>

  <p align="center">
NFA/DFA based  Regex Machine
    <br />
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contact">Contact</a></li>
     <li><a href="#acknowledgments">Acknowledgements</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

I always wanted to know how Regular Expressions worked. That took me down this deep rabbit hole of Formal Grammar, Chomsky Hierarchy, Kleene Star and etc.

I also had been learning Haskell at the time and the concept of Finite State Machine came up time and again. It turns out I utilize FSA to implement Regex Engines. So I did.

<!-- GETTING STARTED -->
## Getting Started

Install through your favorite package manager to get started.

### Installation

   ```sh
   npm install @rux12/t_rex
   ```
   ```sh
   yarn add @rux12/t_rex
   ```

<!-- USAGE EXAMPLES -->
## Usage
Basic Usage:
```ts
import {build} from "@rux12/t_rex";

const re = build("/(ab|cd)/");

re.matches("ab") // true
re.matches("cd") // true
re.matches("ef") // false
```
You could also use the builders provided.
```ts
import {char, or} from "@rux12/t_rex";

const re = or(
	char("a"),
	char("b")
);

re.matches("a") // true
re.matches("b") // true
re.matches("e") // false
```

<!-- ROADMAP -->
## Roadmap

- [] Add Wildcard Support (for now)


<!-- CONTACT -->
## Contact

Email:  rux12@icloud.com

Project Link: [https://github.com/Sangi-it/t_rex](https://github.com/Sang-it/t_rex)

<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

* [regex-tree](https://github.com/DmitrySoshnikov/regexp-tree)
