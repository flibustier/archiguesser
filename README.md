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

Every task is available through `make` (run `make` alone to list them).

```sh
pnpm install
```

#### Compile and Hot-Reload for Development

```sh
pnpm run dev
```

#### Type-Check, Compile and Minify for Production

```sh
pnpm run build
```

#### Lint with [ESLint](https://eslint.org/)

```sh
pnpm run lint
```

#### Tests

```sh
pnpm run test:unit   # services and build scripts, with Node's test runner
pnpm run test:e2e    # Playwright, 5 browsers (make test-e2e-update refreshes Linux screenshots)
```

The end-to-end tests start the development server themselves. The CI runs them
against the production build, which is the only one with a service worker
(`tests/offline.spec.ts` is skipped otherwise).

Dependencies are managed with [pnpm](https://pnpm.io/) only (`pnpm-lock.yaml`).
New versions are only installed once they are at least 7 days old (see `pnpm-workspace.yaml` and `renovate.json`).

### How it is built

| URL                                           | Page                           |
| --------------------------------------------- | ------------------------------ |
| `/`                                           | today's game                   |
| `/day/12`                                     | a previous day                 |
| `/replay`, `/challenges`, `/challenge/museum` | replay list, themes, one theme |
| `/score`, `/account`, `/about`                |                                |

`src/router.ts` is a small router on the History API. Links shared before it
existed (`/?day=12`, `/?challenge=museum`, `/#replay`) are redirected.

The site is static (GitHub Pages), so the build (`build/vite-plugin-game.ts`)
writes what a server would otherwise compute:

- **one HTML file per URL** (`day/12.html`, `replay.html`…), copies of
  `index.html` with their own title and preview image, plus a `404.html`
  that boots the app for any other address;
- **the data, split**: `src/assets/data.json` stays the single source, but a
  game only downloads `/data/day/<day>.json`; the names offered by the search
  field are in `/data/answers.json`, each theme in `/data/challenge/<slug>.json`;
- **`sw.js`**, the service worker that makes the app installable and keeps the
  days already opened playable offline.

`public/data.json` is still published as a whole for the statistics dashboard.

### Data Scripts

Some scripts use [Deno](https://deno.com/) > 2.0 for its permission sandbox (`deno task add`, `deno task replay`, `scripts/dev`).
They use Deno's own cache and never touch `node_modules`.
