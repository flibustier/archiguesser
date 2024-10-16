import { basename } from "node:path";

export const uniq = (array) => [...new Set(array)];
export const filename = (url) => basename(url.split("?")[0]);
