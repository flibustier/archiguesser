import data from "../../src/assets/data.json" with { type: "json" };

let numberOfProjects = 0;
let projectsNotReplayed = 0;
let projectsWithoutLinks = 0;
let projectsWithoutYears = 0;
let projectsWithoutCategory = 0;
let projectsWithoutRecommendation = 0;

const DEBUG = false;

for (const project of data) {
  numberOfProjects++;

  if (project.categories.length === 0) {
    projectsWithoutCategory++;
    if (DEBUG) {
      console.log(
        "Project without category: [" + project.days[0] + "] " + project.answer,
      );
    }
  }

  if (project.days.length === 1) {
    projectsNotReplayed++;
  }

  if (project.links.length === 0) {
    projectsWithoutLinks++;
    if (DEBUG) {
      console.log(
        "Project without links: [" + project.days[0] + "] " + project.answer,
      );
    }
  }

  if (!project.years || project.years.length === 0) {
    projectsWithoutYears++;
    if (DEBUG) {
      console.log(
        "Project without years: [" + project.days[0] + "] " + project.answer,
      );
    }
  }
  if (!project.recommendation) {
    projectsWithoutRecommendation++;
    if (DEBUG) {
      console.log(
        "Project without recommendation: [" +
          project.days[0] +
          "] " +
          project.answer,
      );
    }
  }
}

console.log("Total project count: ", numberOfProjects);
console.log("Projects not replayed: ", projectsNotReplayed);
console.log("Projects without years: ", projectsWithoutYears);
console.log("Projects without links: ", projectsWithoutLinks);
console.log("Projects without category: ", projectsWithoutCategory);
console.log(
  "Projects with recommendation: ",
  numberOfProjects - projectsWithoutRecommendation,
);
