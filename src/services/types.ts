// Shapes of the data files generated at build time (see build/game-data.ts)

export type Copyrights = Record<string, string>;

export interface Feature {
  title: string;
  link?: string;
}

// One entry of src/assets/data.json: a project and every day it was played
export interface Project {
  answer: string;
  days: number[];
  copyrights: Copyrights[];
  years?: string;
  links: string[];
  categories: string[];
  recommendation?: string;
  credits?: string;
  style?: string;
  hints?: boolean;
  "hors-serie"?: string;
  features?: Record<string, Feature>;
}

// /data/day/<day>.json: what one daily game needs, and nothing else
export interface DayProject {
  dayNumber: number;
  answer: string;
  constructionYears?: string;
  copyrights: Copyrights;
  links: string[];
  categories: string[];
  isMonument: boolean;
  noHints: boolean;
  recommendation?: string;
  credits?: string;
  "hors-serie"?: string;
  features?: Record<string, Feature>;
}

// /data/challenge/<slug>.json: the projects of one themed challenge
export interface ChallengeProject {
  answer: string;
  day: number;
  copyrights: Copyrights;
  links: string[];
}

export interface Category {
  name: string;
  slug: string;
  count: number;
}

// virtual:game-index: small facts about the whole collection, kept in the bundle
export interface GameIndex {
  lastDay: number;
  // days without a project, between 0 and lastDay
  missingDays: number[];
  monumentDays: number[];
  categories: Category[];
}
