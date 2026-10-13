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

declare module "virtual:picture-folders" {
  const pictureFolders: Record<number, number>;
  export default pictureFolders;
}
