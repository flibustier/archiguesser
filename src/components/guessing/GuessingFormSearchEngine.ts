import suggestions from "../../assets/suggestions.json";

interface scoredSuggestion {
  suggestion: string;
  highlightedSuggestion: string;
  score: number;
}

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
      );

      const highlightedSuggestion = searchWords.reduce(
        (highlighted, word) =>
          highlighted.replace(new RegExp(`(${word})`, "gi"), "<mark>$1</mark>"),
        suggestion
      );

      if (commonWords.length > 0) {
        return [
          ...acc.slice(0, 7),
          {
            suggestion,
            highlightedSuggestion,
            score: commonWords.length,
          },
        ].sort(byScore);
      }

      return acc;
    }, [])
    .sort(byScore);
};
