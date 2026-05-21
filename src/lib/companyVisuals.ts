const LOCAL_LOGOS: Record<string, string> = {
  "a-good-day-relocation": "/images/companies/a-good-day-relocation-logo.avif",
  "all-in-one-relocation": "/images/companies/all-in-one-relocation-logo.png",
  "alliance-relocation": "/images/companies/alliance-relocation-logo.webp",
  "am-relocation": "/images/companies/am-relocation-logo.png",
  "anchor-relocation": "/images/companies/anchor-relocation-logo.png",
  "ap-executive": "/images/companies/ap-executive-logo.svg",
  "auris-relocation": "/images/companies/auris-relocation-logo.jpg",
  "bridging-cultures-relocation": "/images/companies/bridging-cultures-relocation-logo.webp",
  "connectiv-relocation-ag": "/images/companies/connectiv-relocation-ag-logo.png",
  "crown-relocations": "/images/companies/crown-relocations-logo.svg",
  "de-peri-relocation-services": "/images/companies/de-peri-relocation-services-logo.png",
  "executive-relocation": "/images/companies/executive-relocation-logo.jpg",
  "expat-savvy": "/images/companies/expat-savvy-logo.svg",
  "harsch": "/images/companies/harsch-logo.jpg",
  "harsch---the-art-of-moving-forward": "/images/companies/harsch---the-art-of-moving-forward-logo.jpg",
  "just-relocation": "/images/companies/just-relocation-logo.webp",
  "keller-swiss-group": "/images/companies/keller-swiss-group-logo.svg",
  "la-boutique-relocation": "/images/companies/la-boutique-relocation-logo.avif",
  "leman-relocation-srl": "/images/companies/leman-relocation-srl-logo.webp",
  "lifestylemanagers": "/images/companies/lifestylemanagers-logo.avif",
  "lodge-relocation": "/images/companies/lodge-relocation-logo.png",
  "matterhorn-relocation": "/images/companies/matterhorn-relocation-logo.jpg",
  "packimpex": "/images/companies/packimpex-logo.svg",
  "practical-services": "/images/companies/practical-services-logo.webp",
  "prime-relocation": "/images/companies/prime-relocation-logo.png",
  "rel-ex-relocation-expat-services-gmbh": "/images/companies/rel-ex-relocation-expat-services-gmbh-logo.png",
  "relocality": "/images/companies/relocality-logo.gif",
  "relocation-basel-homes-gmbh": "/images/companies/relocation-basel-homes-gmbh-logo.jpg",
  "relocation-genevoise": "/images/companies/relocation-genevoise-logo.svg",
  "relocation-plus-relocation": "/images/companies/relocation-plus-relocation-logo.svg",
  "relonest": "/images/companies/relonest-logo.avif",
  "santa-fe-relocation": "/images/companies/santa-fe-relocation-logo.png",
  "schmid-hoppler": "/images/companies/schmid-hoppler-logo.webp",
  "schweizer-relocation": "/images/companies/schweizer-relocation-logo.svg",
  "sgier-partner": "/images/companies/sgier-partner-logo.webp",
  "silver-nest-relocation": "/images/companies/silver-nest-relocation-logo.jpg",
  "silverline-relocation": "/images/companies/silverline-relocation-logo.png",
  "sirva-relocation": "/images/companies/sirva-relocation-logo.png",
  "srs-relocation": "/images/companies/srs-relocation-logo.png",
  "swiss-expat-realtor": "/images/companies/swiss-expat-realtor-logo.avif",
  "the-relocation-company-gmbh": "/images/companies/the-relocation-company-gmbh-logo.png",
  "the-smc": "/images/companies/the-smc-logo.jpg",
  "touchdown-relocation-services": "/images/companies/touchdown-relocation-services-logo.png",
  "welcome-service": "/images/companies/welcome-service-logo.png",
  "xpat-relocation": "/images/companies/xpat-relocation-logo.png",
  "zug-relocation": "/images/companies/zug-relocation-logo.avif",
  "zurich-relocation": "/images/companies/zurich-relocation-logo.avif",
  "zweers-include-gmbh": "/images/companies/zweers-include-gmbh-logo.png",
};

export function getCompanyLogo(slug?: string | null, remoteLogo?: string | null) {
  if (slug && LOCAL_LOGOS[slug]) return LOCAL_LOGOS[slug];
  return "";
}

export function getCompanyInitials(name?: string | null) {
  if (!name) return "RF";

  const parts = name
    .replace(/&/g, " and ")
    .split(/\s+/)
    .filter((part) => part && !/^(ag|sa|gmbh|sarl|ltd|llc)$/i.test(part));

  const initials = parts.slice(0, 2).map((part) => part[0]).join("");
  return (initials || name.slice(0, 2)).toUpperCase();
}

export function shouldInvertCompanyLogo(name?: string | null) {
  return Boolean(name?.includes("AM Relocation"));
}
