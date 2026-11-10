// Splits src/assets/data.json into the small files the app downloads:
//
//   /data/day/<day>.json         one daily game
//   /data/challenge/<slug>.json  one themed challenge
//   /data/answers.json           every name offered by the search field
//
// plus a small index bundled with the app (virtual:game-index).
// Pure functions: the Vite plugin next to this file does the reading/writing.

import type {
  Category,
  ChallengeProject,
  Copyrights,
  DayProject,
  GameIndex,
  Project,
} from "../src/services/types.ts";
import { slugify } from "../src/services/slug.ts";

const MONUMENT = "monument";

export const allDays = (projects: Project[]): number[] =>
  projects.flatMap(({ days }) => days).sort((a, b) => a - b);

// A project played several times may have one set of copyrights per airing
// (the pictures can change); the last set is reused when one is missing.
export const copyrightsOf = (project: Project, day: number): Copyrights => {
  const index = project.days.indexOf(day);

  return (
    project.copyrights[index] ||
    project.copyrights[project.copyrights.length - 1] ||
    {}
  );
};

export const buildDay = (
  projects: Project[],
  day: number,
): DayProject | undefined => {
  const project = projects.find(({ days }) => days.includes(day));
  if (!project) {
    return undefined;
  }

  return {
    dayNumber: day,
    answer: project.answer,
    constructionYears: project.years,
    copyrights: copyrightsOf(project, day),
    links: project.links,
    categories: project.categories,
    isMonument: project.categories.includes(MONUMENT),
    noHints: project.hints === false,
    recommendation: project.recommendation,
    credits: project.credits,
    "hors-serie": project["hors-serie"],
    features: project.features,
  };
};

// Projects tagged with the category; failing that, projects whose answer
// mentions it (this is how countries and architects work: "France", "Zaha Hadid")
export const projectsOfCategory = (
  projects: Project[],
  category: string,
): Project[] => {
  const tagged = projects.filter(({ categories }) =>
    categories.includes(category),
  );

  return tagged.length > 0
    ? tagged
    : projects.filter(({ answer }) => answer.includes(category));
};

export const buildChallenge = (
  projects: Project[],
  category: string,
): ChallengeProject[] =>
  projectsOfCategory(projects, category).map((project) => ({
    answer: project.answer,
    day: project.days[0],
    copyrights: project.copyrights[0] || {},
    links: project.links,
  }));

// Published answers first, then the decoys, without duplicates
export const buildAnswers = (
  projects: Project[],
  suggestions: string[],
): string[] => [
  ...new Set(projects.map(({ answer }) => answer).concat(suggestions)),
];

export const buildCategories = (
  projects: Project[],
  names: string[],
): Category[] =>
  names.map((name) => ({
    name,
    slug: slugify(name),
    count: projectsOfCategory(projects, name).length,
  }));

export const buildIndex = (
  projects: Project[],
  categoryNames: string[],
): GameIndex => {
  const days = new Set(allDays(projects));
  const lastDay = Math.max(...days);

  return {
    lastDay,
    missingDays: [...Array(lastDay + 1).keys()].filter((day) => !days.has(day)),
    monumentDays: allDays(
      projects.filter(({ categories }) => categories.includes(MONUMENT)),
    ),
    categories: buildCategories(projects, categoryNames),
  };
};

// Mistakes that would only show up as a broken day in production
export const validate = (projects: Project[]): string[] => {
  const problems: string[] = [];
  const seen = new Map<number, string>();

  for (const project of projects) {
    if (!project.answer) {
      problems.push(`days ${project.days}: empty answer`);
    }
    if (project.days.length === 0) {
      problems.push(`${project.answer}: no day`);
    }
    if (project.copyrights.length === 0) {
      problems.push(`${project.answer}: no copyrights entry`);
    }
    for (const day of project.days) {
      if (seen.has(day)) {
        problems.push(
          `day ${day} is used twice: ${seen.get(day)} and ${project.answer}`,
        );
      }
      seen.set(day, project.answer);
    }
  }

  return problems;
};
