import data from "../../src/assets/data.json" with { type: "json" };

console.log(
  JSON.stringify(
    data
      .filter(
        ({ categories }) => !(categories as string[]).includes("classics"),
      )
      .map(({ answer }) => answer),
    null,
    2,
  ),
);
