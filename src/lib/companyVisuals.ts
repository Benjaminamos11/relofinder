const LOCAL_LOGOS: Record<string, string> = {
  "anchor-relocation": "/images/companies/anchor-relocation-logo.png",
  "prime-relocation": "/images/companies/prime-relocation-logo.png",
  "welcome-service": "/images/companies/welcome-service-logo.png",
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
