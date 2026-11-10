/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PROD: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Cabin {
  event(content: string): void;
}

declare const cabin: Cabin;

interface Window {
  goatcounter?: {
    count?: (vars: { path: string; title?: string; event?: boolean }) => void;
  };
}

declare module "virtual:picture-folders" {
  const pictureFolders: Record<number, number>;
  export default pictureFolders;
}

declare module "virtual:game-index" {
  const gameIndex: import("./src/services/types").GameIndex;
  export default gameIndex;
}
