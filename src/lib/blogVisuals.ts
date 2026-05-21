const LOCAL_IMAGE_REPLACEMENTS: Record<string, string> = {
  "https://res.cloudinary.com/dphbnwjtx/image/upload/v1767009350/images/blog/health-insurance-consultants.jpg": "/images/blog/health-insurance-consultants.webp",
  "https://res.cloudinary.com/dphbnwjtx/image/upload/v1767009358/images/blog/relocation-agencies.jpg": "/images/blog/relocation-agencies.webp",
  "https://res.cloudinary.com/dphbnwjtx/image/upload/v1767009360/images/blog/relocation-companies.jpg": "/images/blog/relocation-companies.webp",
  "https://res.cloudinary.com/dphbnwjtx/image/upload/v1767009347/images/blog/cost-of-living.jpg": "/images/blog/cost-of-living.webp",
  "https://res.cloudinary.com/dphbnwjtx/image/upload/v1767009355/images/blog/mandatory-insurance.jpg": "/images/blog/mandatory-insurance.webp",
  "https://res.cloudinary.com/dphbnwjtx/image/upload/v1767009357/images/blog/moving-checklist.jpg": "/images/blog/moving-checklist.webp",
  "https://res.cloudinary.com/dphbnwjtx/image/upload/v1767009361/images/blog/reverse-application-strategy.jpg": "/images/blog/reverse-application-strategy.webp",
  "https://res.cloudinary.com/dphbnwjtx/image/upload/v1767009363/images/blog/ultimate-guide.jpg": "/images/blog/ultimate-guide.webp",
};

const TOPIC_IMAGES = [
  { test: /permit|immigration|visa|quota|c-permit|b-permit/i, image: "/images/blog/b_permit_hero.webp" },
  { test: /housing|rental|apartment|home-search|off-market|affordability|buyer/i, image: "/images/blog/off_market_housing_hero.webp" },
  { test: /school|education|international-school/i, image: "/images/blog/school_search_hero.webp" },
  { test: /insurance|health/i, image: "/images/blog/health_insurance_hero.webp" },
  { test: /tax|pension|pillar|finance|bank/i, image: "/images/blog/pension_guide_hero.webp" },
  { test: /cost|salary|budget|living/i, image: "/images/blog/cost-of-living.webp" },
  { test: /zug/i, image: "/images/blog/zug_zytturm_branded.webp" },
  { test: /zurich|zürich/i, image: "/images/blog/zurich_skyline_branded.webp" },
  { test: /agency|agencies|company|companies|vs|alternative|comparison|review/i, image: "/images/blog/boutique_comparison_branded.webp" },
  { test: /moving|checklist|timeline/i, image: "/images/blog/moving-checklist.webp" },
  { test: /settling|arrival|integration/i, image: "/images/blog/settling_in_hero.webp" },
];

export function getBlogImage(post: { slug?: string; data: { title?: string; category?: string; heroImage?: string } }) {
  const current = post.data.heroImage || "";
  if (LOCAL_IMAGE_REPLACEMENTS[current]) return LOCAL_IMAGE_REPLACEMENTS[current];

  const haystack = `${post.slug || ""} ${post.data.title || ""} ${post.data.category || ""}`;
  const genericImages = new Set([
    "/images/blog/swiss_relocation_2026_branded.webp",
    "/images/blog/boutique_comparison_branded.webp",
  ]);

  if (!current || genericImages.has(current)) {
    return TOPIC_IMAGES.find((item) => item.test.test(haystack))?.image || current || "/images/blog/swiss_relocation_2026_branded.webp";
  }

  return current;
}
