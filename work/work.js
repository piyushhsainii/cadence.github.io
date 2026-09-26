import { createWorkCard, createWorkRow, itemLabel } from "./work-components.js";

const workItems = await fetch(new URL("./work-data.json", import.meta.url)).then(response => {
  if (!response.ok) throw new Error("Could not load work data");
  return response.json();
});
const listing = document.querySelector("#work-listing");
const detail = document.querySelector("#work-detail");
const slug = new URLSearchParams(location.search).get("slug") || document.body.dataset.workSlug;
const item = workItems.find(entry => entry.slug === slug);
const appRoot = new URL("../", import.meta.url);
const assetUrl = src => src ? new URL(src.replace(/^\.\.\//, ""), appRoot).href : src;
const workIndexUrl = new URL("work/", appRoot).href;


const sectionHeading = (eyebrow, title) => `<div class="case-section-heading"><span class="eyebrow">${eyebrow}</span><h2>${title}</h2></div>`;
const mediaFigure = (src, alt) => `<figure class="case-feature-image"><img src="${assetUrl(src)}" alt="${alt}" loading="lazy" decoding="async"></figure>`;

function carousel(images, title) {
  if (!images?.length) return "";
  return `<section class="case-section wrap reveal" id="gallery">${sectionHeading("Selected frames", title)}<div class="case-gallery" aria-label="${title}">${images.map((src, index) => `<figure><img src="${assetUrl(src)}" alt="${title}, frame ${index + 1}" loading="lazy" decoding="async"></figure>`).join("")}</div></section>`;
}

function videoMarkup(url) {
  if (!url) return "";
  const iframe = /youtube|vimeo/.test(url);
  return `<section class="case-section wrap reveal" id="motion">${sectionHeading("In motion", "Watch the work")}${iframe ? `<div class="case-video"><iframe src="${url}" title="Case study video" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>` : `<video class="case-video" controls preload="none" poster="${assetUrl(item.heroImage)}"><source data-src="${assetUrl(url)}"></video>`}</section>`;
}

function teamMarkup(team) {
  if (!team?.length) return "";
  return `<section class="case-section case-team wrap reveal" id="team">${sectionHeading("The people", "Made together")}<div class="team-grid">${team.map(person => {
    const initials = person.name.split(" ").map(part => part[0]).slice(0, 2).join("");
    const body = `<span class="team-avatar">${person.avatar ? `<img src="${person.avatar}" alt="" loading="lazy">` : initials}</span><span><strong>${person.name}</strong><small>${person.role}</small></span>${person.link ? `<span aria-hidden="true">↗</span>` : ""}`;
    return person.link ? `<a href="${person.link}" target="_blank" rel="noopener noreferrer">${body}</a>` : `<div>${body}</div>`;
  }).join("")}</div></section>`;
}

function adSpecificMarkup(entry) {
  if (entry.type !== "adCreative") return "";
  if (entry.adType === "ugc") return `<section class="case-section wrap reveal">${sectionHeading("From script to screen", "The creative build")}<div class="case-split"><div><span class="pill">01 / Storyboard</span>${mediaFigure(entry.storyboardImage, `${entry.title} storyboard`)}</div><div><span class="pill">02 / Character reference</span>${mediaFigure(entry.characterImage, `${entry.title} character reference`)}</div></div></section>${carousel(entry.adsCarousel, "Generated UGC ads")}`;
  return `<section class="case-section wrap reveal">${sectionHeading("One source, many outcomes", "The product image")}<div class="case-source">${mediaFigure(entry.productImage, `${entry.title} source product`)}</div></section>${carousel(entry.adsCarousel, "Generated static ads")}`;
}

const workCategories = [
  ["all", "All work"],
  ["logo-design", "Logo design"],
  ["websites", "Websites"],
  ["mobile-apps", "Mobile development / design prototypes"],
  ["ai-ads", "AI ads"],
  ["brand-creatives", "Brand creatives"],
  ["digital-products", "Digital products"]
];

function workTypes(entry) {
  const types = [];
  if (entry.category === "branding") types.push("logo-design");
  if (entry.category === "website") types.push("websites");
  if (entry.category === "mobile") types.push("mobile-apps");
  if (entry.type === "adCreative") types.push("ai-ads");
  if (entry.slug === "au-terra-essentials") types.push("brand-creatives");
  if (entry.category === "saas" || entry.category === "template") types.push("digital-products");
  return types;
}

function renderListing() {
  document.title = "All Work | Cadence";
  listing.hidden = false;
  const list = listing.querySelector(".work-accordion");
  const filters = listing.querySelector("#work-filters");
  const rows = workItems.map((entry, index) => {
    const row = createWorkRow(entry, index, "../");
    row.dataset.workTypes = workTypes(entry).join(" ");
    list.append(row);
    return row;
  });
  const available = new Set(workItems.flatMap(workTypes));
  const categories = workCategories.filter(([value]) => value === "all" || available.has(value));
  filters.innerHTML = categories.map(([value, label]) => `<button type="button" data-work-filter="${value}" aria-pressed="false">${label}<span>${value === "all" ? workItems.length : workItems.filter(item => workTypes(item).includes(value)).length}</span></button>`).join("");

  const applyFilter = value => {
    const active = categories.some(([category]) => category === value) ? value : "all";
    let visibleIndex = 0;
    rows.forEach(row => {
      const visible = active === "all" || row.dataset.workTypes.split(" ").includes(active);
      row.hidden = !visible;
      if (visible) row.querySelector(".work-number").textContent = String(++visibleIndex).padStart(2, "0");
    });
    filters.querySelectorAll("button").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.workFilter === active)));
    const url = new URL(location.href);
    if (active === "all") url.searchParams.delete("type"); else url.searchParams.set("type", active);
    history.replaceState(null, "", url);
  };

  filters.addEventListener("click", event => {
    const button = event.target.closest("[data-work-filter]");
    if (button) applyFilter(button.dataset.workFilter);
  });
  applyFilter(new URLSearchParams(location.search).get("type") || "all");
}

function renderDetail(entry) {
  if (!entry) {
    document.title = "Work not found | Cadence";
    detail.hidden = false;
    detail.innerHTML = `<section class="work-empty wrap"><span class="eyebrow">404 / Off beat</span><h1>That work isn't here.</h1><p>The case study may have moved, or the link may be incomplete.</p><a class="button" href="./">See all work &nearr;</a></section>`;
    return;
  }
  const detailLabel = itemLabel(entry).replace(/\b\w/g, letter => letter.toUpperCase());
  document.title = `${entry.title} | ${detailLabel} Case Study by Cadence`;
  detail.hidden = false;
  const similar = entry.similarWork.map(ref => workItems.find(candidate => candidate.slug === ref)).filter(Boolean);
  const railLinks = [
    ["overview", "Overview"],
    entry.video && ["motion", "Motion"],
    ((entry.type === "project" && entry.imageCarousel?.length) || entry.adsCarousel?.length) && ["gallery", "Gallery"],
    entry.team?.length && ["team", "Team"],
    similar.length && ["similar", "Similar work"]
  ].filter(Boolean);
  detail.innerHTML = `
    <article class="case-study">
      <aside class="case-rail">
        <a class="case-back" href="${appRoot.href}" aria-label="Back to Cadence home"><span aria-hidden="true">&larr;</span> Cadence</a>
        <div class="case-rail-index">
          <span class="eyebrow">Project index</span>
          <nav aria-label="Case study sections">${railLinks.map(([id, label]) => `<a href="#${id}">${label}</a>`).join("")}</nav>
        </div>
        <a class="case-all-work" href="${workIndexUrl}">All work <span aria-hidden="true">&nearr;</span></a>
      </aside>
      <div class="case-content">
        <header class="case-hero" id="overview">
          <div class="case-hero-copy wrap">
            <div class="case-kicker"><span class="pill">${itemLabel(entry)}</span><span>${String(workItems.indexOf(entry) + 1).padStart(2, "0")} / ${String(workItems.length).padStart(2, "0")}</span></div>
            <h1>${entry.title}</h1>
            <div class="case-intro"><span class="eyebrow">Project overview</span><p>${entry.summary}</p>${entry.liveLink ? `<a class="text-link" href="${entry.liveLink}" target="_blank" rel="noopener noreferrer">Visit live project <span aria-hidden="true">&nearr;</span></a>` : ""}</div>
          </div>
          <figure class="case-hero-media"><img src="${assetUrl(entry.heroImage)}" alt="${entry.title} case study" fetchpriority="high" decoding="async"></figure>
        </header>
        ${videoMarkup(entry.video)}
        ${entry.type === "project" ? carousel(entry.imageCarousel, "Project gallery") : adSpecificMarkup(entry)}
        ${teamMarkup(entry.team)}
        ${similar.length ? `<section class="case-section similar-work wrap reveal" id="similar">${sectionHeading("Keep exploring", "Similar work")}<div class="work-grid"></div></section>` : ""}
      </div>
    </article>`;
  const similarGrid = detail.querySelector(".similar-work .work-grid");
  similar.forEach(candidate => similarGrid?.append(createWorkCard(candidate, "../")));
  const nativeVideo = detail.querySelector("video");
  if (nativeVideo) {
    const source = nativeVideo.querySelector("source");
    const loadVideo = () => { source.src = source.dataset.src; nativeVideo.load(); };
    if ("IntersectionObserver" in window) new IntersectionObserver((entries, observer) => { if (entries[0].isIntersecting) { loadVideo(); observer.disconnect(); } }, { rootMargin: "200px" }).observe(nativeVideo); else loadVideo();
  }
}

slug ? renderDetail(item) : renderListing();
document.querySelector("#year").textContent = new Date().getFullYear();

const header = document.querySelector(".header");
const menu = document.querySelector(".menu-toggle");
menu.addEventListener("click", () => { const open = header.classList.toggle("menu-open"); menu.setAttribute("aria-expanded", String(open)); });
addEventListener("scroll", () => header.classList.toggle("scrolled", scrollY > 30), { passive: true });
document.querySelectorAll(".nav-links a").forEach(link => link.addEventListener("click", () => header.classList.remove("menu-open")));
