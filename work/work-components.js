const appRoot = new URL("../", import.meta.url);
const projectUrl = item => new URL(`work/${encodeURIComponent(item.slug)}/`, appRoot).href;
const assetUrl = src => new URL(src.replace(/^\.\.\//, ""), appRoot).href;

export const itemLabel = item => item.type === "project" ? item.category : `${item.adType} ad`;

export function createWorkCard(item, basePath = "") {
  const link = document.createElement("a");
  link.className = "work-card reveal visible";
  link.href = projectUrl(item);
  link.setAttribute("aria-label", `View ${item.title} case study`);
  const coverImage = assetUrl(item.coverImage);
  link.innerHTML = `
    <span class="work-card-media"><img src="${coverImage}" alt="" loading="lazy" decoding="async"></span>
    <span class="work-card-copy">
      <span class="pill">${itemLabel(item)}</span>
      <span class="work-card-title">${item.title}<span aria-hidden="true">↗</span></span>
      <span class="work-card-summary">${item.summary}</span>
    </span>`;
  return link;
}

export function createWorkRow(item, index, basePath = "") {
  const link = document.createElement("a");
  const coverImage = assetUrl(item.coverImage);
  link.className = "work-row work-accordion-row reveal visible";
  link.href = projectUrl(item);
  link.setAttribute("aria-label", `View ${item.title} case study`);
  link.innerHTML = `
    <span class="work-number">${String(index + 1).padStart(2, "0")}</span>
    <span class="work-row-main"><span class="work-row-title">${item.title}</span><span class="work-row-summary">${item.summary}</span></span>
    <span class="pill">${itemLabel(item)}</span>
    <span class="work-row-preview"><img src="${coverImage}" alt="" loading="lazy" decoding="async"></span>
    <span class="work-arrow" aria-hidden="true">↗</span>`;
  return link;
}
