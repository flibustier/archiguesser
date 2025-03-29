import data from "../assets/data.json" with { type: "json" };
import suggestions from "../assets/suggestions.json" with { type: "json" };

import { getProjectInformation } from "./projects.ts";

const suggestionsWithAnswers = data
  .map(({ answer }) => answer)
  .concat(suggestions);

export const getSuggestions = () => {
  const { ["hors-serie"]: horsSerie } = getProjectInformation();

  if (horsSerie === "City") {
    return [
      ...new Set(
        suggestionsWithAnswers.map((suggestion) => {
          const location = suggestion.split("/").pop()?.trim();

          if (location) {
            const splited = location.split(", ");

            if (splited.length > 1) {
              return (
                splited[splited.length - 2] + ", " + splited[splited.length - 1]
              );
            }
          }

          return "";
        }),
      ),
    ];
  }

  return suggestionsWithAnswers;
};
