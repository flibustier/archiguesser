import { getSuggestions } from "../../services/suggestions.ts";

const suggestionsWithAnswers = getSuggestions();

const MAX_SUGGESTIONS = 30;
const MIN_WORD_LENGTH = 2;

const byScore = (a: scoredSuggestion, b: scoredSuggestion) => b.score - a.score;
const minScore = (acc: scoredSuggestion[]): number =>
  acc.length > 0 ? acc[acc.length - 1].score : 0;

const normalize = (str: string): string =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace("ø", "o")
    .replace("-", " ")
    .replace("+", " ")
    .replace(/’|'/, "")
    .replace(/\(|\)|\]|\[/g, "");

const splitWords = (str: string): string[] =>
  str.split(/\s+|,|\//).filter((word) => word.length >= MIN_WORD_LENGTH);

interface scoredSuggestion {
  suggestion: string;
  highlightedSuggestion: string;
  score: number;
}

const uniq = (array: string[]) => [...new Set(array)];

const buildScoredSuggestions =
  (searchWords: string[]) => (acc: scoredSuggestion[], suggestion: string) => {
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
        const highlightedSuggestion = suggestion.replace(
          new RegExp(`(${searchWords.join("|")})`, "gi"),
          "<mark>$1</mark>",
        );

        return [
          ...acc.slice(0, MAX_SUGGESTIONS),
          {
            suggestion,
            highlightedSuggestion,
            score,
          },
        ].sort(byScore);
      }
    }

    return acc;
  };

export const search = (
  searchTerms: string,
  suggestionList = suggestionsWithAnswers,
) => {
  const searchWords = splitWords(normalize(searchTerms));

  return suggestionList.reduce(buildScoredSuggestions(searchWords), []);
};
