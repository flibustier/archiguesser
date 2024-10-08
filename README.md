<div align="center">
   <img src="./public/brand.png" width="400px"/> 
</div>
<br/>
<p align="center">
   A daily architectural guessing game -> https://archiguesser.com/
</p>

## About

A game for architects and enthusiasts, inspired by the excellent [Framed](https://framed.wtf), [Sutom](https://sutom.nocle.fr/), [Wordle](https://https://www.nytimes.com/games/wordle/index.html) and all the other spinoffs.

Each day a architectural project is picked from a curated list and you have 6 pictures to guess which one it is.

All pictures rights go to the rightful owners - no copyright infringement intended.

<div align="center">
   <img width="600px" src="https://user-images.githubusercontent.com/9994935/177162987-b9e78cdb-2c61-479d-8a46-f96b188abd1d.png" />
</div>

## Contributing

Fell free to send me suggestions using [Github issues](https://github.com/flibustier/archiguesser/issues) or by [mail](mailto:contact@archiguesser.com) (contact at archiguesser.com)

If you have a project you want to submit, we will need 6 pictures, a project name, architect name and location.

---

## Running it yourself

This project is built using [Vue.js 3](https://vuejs.org/) (composition mode & Typescript)

### Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

### Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
   1. Run `Extensions: Show Built-in Extensions` from VSCode's command palette
   2. Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.

### Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

### Project Setup

```sh
npm install
```

#### Compile and Hot-Reload for Development

```sh
npm run dev
```

#### Type-Check, Compile and Minify for Production

```sh
npm run build
```

#### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

### Work in Progress

Some new scripts are using [Deno](https://deno.com/) > 2.0 (`scripts/dev`)
This is optional for now
