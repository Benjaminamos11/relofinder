/**
 * JSON-LD Schema Markup Helpers
 * SEO structured data for agency profiles
 */

export interface OrganizationSchemaParams {
  name: string;
  url?: string;
  phone?: string;
  email?: string;
  foundingYear?: number;
  description?: string;
}

export function orgSchema(params: OrganizationSchemaParams) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': params.name,
    'url': params.url || undefined,
    'foundingDate': params.foundingYear ? `${params.foundingYear}-01-01` : undefined,
    'description': params.description || undefined,
    'contactPoint': params.phone || params.email ? [{
      '@type': 'ContactPoint',
      'telephone': params.phone || undefined,
      'email': params.email || undefined,
      'contactType': 'customer support',
    }] : undefined,
  };
}

export interface AggregateRatingSchemaParams {
  ratingValue: number;
  reviewCount: number;
  bestRating?: number;
  worstRating?: number;
}

export function aggregateRatingSchema(params: AggregateRatingSchemaParams) {
  return {
    '@context': 'https://schema.org',
    '@type': 'AggregateRating',
    'ratingValue': params.ratingValue.toFixed(2),
    'reviewCount': String(params.reviewCount),
    'bestRating': String(params.bestRating || 5),
    'worstRating': String(params.worstRating || 1),
  };
}

export interface FaqSchemaParams {
  question: string;
  answer: string;
}

export function faqSchema(items: FaqSchemaParams[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': items.map(i => ({
      '@type': 'Question',
      'name': i.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': i.answer,
      },
    })),
  };
}

export interface AlternativeItem {
  name: string;
  url: string;
  description?: string;
}

export function alternativesItemList(items: AlternativeItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'itemListElement': items.map((x, idx) => ({
      '@type': 'ListItem',
      'position': idx + 1,
      'name': x.name,
      'url': x.url,
      'description': x.description || undefined,
    })),
  };
}

export interface LocalBusinessSchemaParams extends OrganizationSchemaParams {
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  priceRange?: string;
}

export function localBusinessSchema(params: LocalBusinessSchemaParams) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': params.name,
    'url': params.url || undefined,
    'telephone': params.phone || undefined,
    'email': params.email || undefined,
    'description': params.description || undefined,
    'foundingDate': params.foundingYear ? `${params.foundingYear}-01-01` : undefined,
    'priceRange': params.priceRange || undefined,
    'address': params.address ? {
      '@type': 'PostalAddress',
      'streetAddress': params.address.streetAddress,
      'addressLocality': params.address.addressLocality,
      'postalCode': params.address.postalCode,
      'addressCountry': params.address.addressCountry || 'CH',
    } : undefined,
  };
}

