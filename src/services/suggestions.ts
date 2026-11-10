// What the search field offers. A normal day offers full answers
// ("Name / Architects / City, Country"); a hors-série only offers the part
// to guess: cities or architects.

const cityOf = (suggestion: string): string => {
  const places = (suggestion.split("/").pop() || "").trim().split(", ");

  return places.length > 1
    ? places[places.length - 2] + ", " + places[places.length - 1]
    : "";
};

const architectsOf = (suggestion: string): string[] => {
  const parts = suggestion.split("/");

  return parts.length > 2
    ? parts[1]
        .trim()
        .split(", ")
        .map((architect) => architect.trim())
    : [];
};

export const suggestionsFor = (
  horsSerie: string | undefined,
  answers: string[],
): string[] => {
  if (horsSerie === "City") {
    return [...new Set(answers.map(cityOf))].filter(Boolean);
  }
  if (horsSerie === "Architect") {
    return [...new Set(answers.flatMap(architectsOf))].filter(Boolean);
  }

  return answers;
};
