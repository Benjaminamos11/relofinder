/**
 * Maps service/region display names (from DB or content) to URL slugs used by
 * /services/[slug] and /regions/[slug]. Handles both DB labels (e.g. "Home Search")
 * and existing slugs (e.g. "housing-search") so links never 404.
 */

const SERVICE_LABEL_TO_SLUG: Record<string, string> = {
  "Home Search": "housing-search",
  "Housing Search": "housing-search",
  "Visa & Immigration": "immigration",
  "Visa and Immigration": "immigration",
  "School Search": "education",
  "Education & Schools": "education",
  "Settling In": "settling-in",
  "Settling-In": "settling-in",
  "Departure Support": "departure",
  "Short-term Accommodation": "housing",
  "Short term Accommodation": "housing",
  "Spouse Support": "settling-in",
  "Moving Managment": "moving-logistics",
  "Moving Management": "moving-logistics",
  "Legal Advice": "legal-services",
  "Tax Advice": "banking-finance",
  "Banking & Finance": "banking-finance",
  "Housing & Real Estate": "housing",
  "Advisory (HNWI/Corporate)": "advisory",
  "Ongoing Support": "settling-in",
  "Event Management": "advisory",
  "immigration-services": "immigration",
  "event-management": "advisory",
  "ongoing-support": "settling-in",
  "departure-repatriation": "departure-repatriation",
  "legal-services": "legal-services",
  "moving-logistics": "moving-logistics",
  "banking-finance": "banking-finance",
  "advisory-services": "advisory",
  "housing-search": "housing-search",
  "property-purchase": "property-purchase",
};

const REGION_LABEL_TO_SLUG: Record<string, string> = {
  Zurich: "zurich",
  "Zürich": "zurich",
  Geneva: "geneva",
  Basel: "basel",
  Bern: "bern",
  Zug: "zug",
  Vaud: "lausanne",
  Lausanne: "lausanne",
  Lucerne: "swiss-hubs",
  "Central Switzerland": "swiss-hubs",
  "central-switzerland": "swiss-hubs",
  Ticino: "swiss-hubs",
  "St. Gallen": "swiss-hubs",
  "St Gallen": "swiss-hubs",
  Fribourg: "swiss-hubs",
  Valais: "alps",
  "Alpine Regions": "alps",
  "Alps": "alps",
  "Regional Coverage": "swiss-hubs",
  "Other Cantons": "swiss-hubs",
};

/** Known valid service URL slugs (for pass-through when value is already a slug). */
const VALID_SERVICE_SLUGS = new Set([
  "housing",
  "housing-search",
  "immigration",
  "visa-immigration",
  "education",
  "settling-in",
  "departure-repatriation",
  "departure",
  "advisory",
  "advisory-services",
  "banking-finance",
  "banking",
  "insurance",
  "moving-logistics",
  "legal-services",
  "property-purchase",
  "finance",
  "corporate-relocation",
  "cross-cultural",
]);

/** Known valid region URL slugs. */
const VALID_REGION_SLUGS = new Set([
  "zurich",
  "geneva",
  "basel",
  "bern",
  "zug",
  "lausanne",
  "alps",
  "swiss-hubs",
]);

function toSlugKey(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\s+/g, "-")
    .replace(/&/g, "and");
}

/**
 * Resolve a service name or slug to the URL slug for /services/[slug].
 */
export function getServiceSlug(value: string): string {
  if (!value) return "advisory";
  const trimmed = value.trim();
  const slugLower = trimmed.toLowerCase().replace(/\s+/g, "-").replace(/%20/g, "-");
  if (VALID_SERVICE_SLUGS.has(slugLower)) return slugLower;
  const byLabel = SERVICE_LABEL_TO_SLUG[trimmed] ?? SERVICE_LABEL_TO_SLUG[value];
  if (byLabel) return byLabel;
  const key = Object.keys(SERVICE_LABEL_TO_SLUG).find(
    (k) => toSlugKey(k) === toSlugKey(trimmed)
  );
  if (key) return SERVICE_LABEL_TO_SLUG[key];
  return trimmed.replace(/\s+/g, "-").toLowerCase().replace(/&/g, "and");
}

/**
 * Resolve a region name or slug to the URL slug for /regions/[slug].
 */
export function getRegionSlug(value: string): string {
  if (!value) return "zurich";
  const trimmed = value.trim();
  const slugLower = trimmed.toLowerCase().replace(/\s+/g, "-").replace(/%20/g, "-");
  if (VALID_REGION_SLUGS.has(slugLower)) return slugLower;
  const byLabel = REGION_LABEL_TO_SLUG[trimmed] ?? REGION_LABEL_TO_SLUG[value];
  if (byLabel) return byLabel;
  const key = Object.keys(REGION_LABEL_TO_SLUG).find(
    (k) => toSlugKey(k) === toSlugKey(trimmed)
  );
  if (key) return REGION_LABEL_TO_SLUG[key];
  return trimmed.replace(/\s+/g, "-").toLowerCase();
}
