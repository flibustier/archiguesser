import suggestions from "../../assets/suggestions.json";

interface scoredSuggestion {
  suggestion: string;
  highlightedSuggestion: string;
  score: number;
}

const MAX_SUGGESTIONS = 10;

const byScore = (a: scoredSuggestion, b: scoredSuggestion) => b.score - a.score;

export const search = (searchTerms: string) => {
  const searchWords = searchTerms
    .toLowerCase()
    .split(/\s+|,|\//)
    .filter((word) => word.length > 1);

  return suggestions
    .reduce((acc: scoredSuggestion[], suggestion) => {
      const commonWords = searchWords.filter((word) =>
        suggestion.toLowerCase().includes(word)
      ).length;

      if (commonWords > 0) {
        const minScore = acc.length > 0 ? acc[acc.length - 1].score : 0;

        if (commonWords >= minScore) {
          const highlightedSuggestion = suggestion.replace(
            new RegExp(`(${searchWords.join("|")})`, "gi"),
            "<mark>$1</mark>"
          );

          return [
            ...acc.slice(0, MAX_SUGGESTIONS),
            {
              suggestion,
              highlightedSuggestion,
              score: commonWords,
            },
          ].sort(byScore);
        }
      }

      return acc;
    }, [])
    .sort(byScore);
};
