// Search engine of the guessing form: ranks suggestions against what the
// player typed. Pure functions, no access to the page or to the data files.

const MAX_SUGGESTIONS = 30;
const MIN_WORD_LENGTH = 2;

export interface ScoredSuggestion {
  suggestion: string;
  highlightedSuggestion: string;
  score: number;
}

const byScore = (a: ScoredSuggestion, b: ScoredSuggestion) => b.score - a.score;
const minScore = (acc: ScoredSuggestion[]): number =>
  acc.length > 0 ? acc[acc.length - 1].score : 0;

export const normalize = (str: string): string =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/ø/g, "o")
    .replace(/[-+]/g, " ")
    .replace(/[’']/g, "")
    .replace(/[()[\]]/g, "");

export const splitWords = (str: string): string[] =>
  str.split(/\s+|,|\//).filter((word) => word.length >= MIN_WORD_LENGTH);

// What the player types ends up in a regular expression: "c++" or "**" must
// be read as text, not as syntax.
export const escapeRegExp = (str: string): string =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const escapeHTML = (str: string): string =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Wraps every occurrence of the words in the given tag. The result is safe to
// use with v-html: the text is escaped, only the tags are HTML.
export const highlight = (text: string, words: string[], tag = "mark") => {
  const escapedWords = words.filter(Boolean).map(escapeRegExp);
  if (escapedWords.length === 0) {
    return escapeHTML(text);
  }

  return text
    .split(new RegExp(`(${escapedWords.join("|")})`, "gi"))
    .map((part, index) =>
      // split() with a capturing group puts the matches at odd indexes
      index % 2 === 1
        ? `<${tag}>${escapeHTML(part)}</${tag}>`
        : escapeHTML(part),
    )
    .join("");
};

const uniq = (array: string[]) => [...new Set(array)];

const buildScoredSuggestions =
  (searchWords: string[]) => (acc: ScoredSuggestion[], suggestion: string) => {
    const normalizedSuggestion = normalize(suggestion);
    const includedWords = uniq(
      searchWords.filter((word) => normalizedSuggestion.includes(word)),
    );
    const commonWords = includedWords.length;

    if (commonWords > 0) {
      const exactWords = uniq(
        splitWords(normalizedSuggestion).filter((word) =>
          includedWords.includes(word),
        ),
      );

      const score = commonWords + exactWords.length;

      if (acc.length < MAX_SUGGESTIONS || score > minScore(acc)) {
        return [
          ...acc.slice(0, MAX_SUGGESTIONS - 1),
          {
            suggestion,
            highlightedSuggestion: highlight(suggestion, searchWords),
            score,
          },
        ].sort(byScore);
      }
    }

    return acc;
  };

export const search = (
  searchTerms: string,
  suggestionList: string[],
): ScoredSuggestion[] => {
  const searchWords = splitWords(normalize(searchTerms));

  return suggestionList.reduce(buildScoredSuggestions(searchWords), []);
};
