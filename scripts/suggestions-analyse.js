/* eslint-disable no-undef */
const suggestions = require("../src/assets/suggestions.json");
let i = 0;
suggestions.forEach((suggestion, index) => {
  const [project, architectsOrPlaces, places] = suggestion.split(" / ");

  if (places) {
    const placesList = places.split(", ");

    if (placesList.length > 4) {
      console.log(index, placesList.join(", "));
      i++;
    }
  }
});

console.log(i);
