import suggestions from "../../assets/suggestions.json";

interface scoredSuggestion {
  suggestion: string;
  highlightedSuggestion: string;
  score: number;
}

const MAX_SUGGESTIONS = 20;

const byScore = (a: scoredSuggestion, b: scoredSuggestion) => b.score - a.score;

const splitWords = (str: string): string[] =>
  str
    .toLowerCase()
    .split(/\s+|,|\//)
    .filter((word) => word.length > 1);

export const search = (searchTerms: string) => {
  const searchWords = splitWords(searchTerms);

  return suggestions
    .reduce((acc: scoredSuggestion[], suggestion) => {
      const includedWords = searchWords.filter((word) =>
        suggestion.toLowerCase().includes(word)
      );
      const commonWords = includedWords.length;

      if (commonWords > 0) {
        const minScore = acc.length > 0 ? acc[acc.length - 1].score : 0;
        const exactWords = splitWords(suggestion).filter((word) =>
          includedWords.includes(word)
        ).length;

        const score = commonWords + exactWords;

        if (score >= minScore) {
          const highlightedSuggestion = suggestion.replace(
            new RegExp(`(${searchWords.join("|")})`, "gi"),
            "<mark>$1</mark>"
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
    }, [])
    .sort(byScore);
};
