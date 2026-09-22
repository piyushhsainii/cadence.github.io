import { createWorkRow } from "./work-components.js";

const workItems = await fetch("work/work-data.json").then(response => {
  if (!response.ok) throw new Error("Could not load work data");
  return response.json();
});
const list = document.querySelector("#recent-work-list");
workItems
  .filter(item => item.featured)
  .forEach((item, index) => list?.append(createWorkRow(item, index)));
