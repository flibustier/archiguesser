import countryList from "./countries.json" with { type: "json" };
import suggestions from "../../src/assets/suggestions.json" with { type: "json" };

const countries = new Set();
const invalid = new Set();
suggestions.forEach((suggestion) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_project, _architectsOrPlaces, places] = suggestion.split(" / ");

  if (suggestion.split(" / ").length > 3) {
    console.log("+ " + suggestion);
  }

  if (places) {
    const placesList = places.split(", ");

    const country = placesList.pop().toLowerCase();

    countries.add(country);
    if (!countryList.map((s) => s.toLowerCase()).includes(country)) {
      invalid.add(country);
    }
  }
});

console.log([...invalid].sort(), countries.size);
