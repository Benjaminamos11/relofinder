#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

interface CompanyData {
  id: string;
  name: string;
  description: string;
  logo: string;
  website: string;
  phone?: string;
  email?: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    canton: string;
  };
  services: string[];
  regions: string[];
  specializations: string[];
  languages: string[];
  founded?: number;
  employees?: string;
  verified: boolean;
  featured: boolean;
  certifications?: string[];
  pros?: string[];
  cons?: string[];
  bestFor?: string[];
  faqs?: Array<{ question: string; answer: string; }>;
  rating: {
    score: number;
    reviews: number;
    breakdown: {
      communication: number;
      professionalism: number;
      value: number;
      timeliness: number;
    };
  };
  pricing: {
    consultationFee?: number;
    packagePricing: boolean;
    freeInitialConsult: boolean;
  };
  seoTitle?: string;
  seoDescription?: string;
}

interface SyncReport {
  scanned: number;
  updated: number;
  created: number;
  skipped: number;
  flagged: number;
  changes: Array<{
    id: string;
    field: string;
    oldValue: any;
    newValue: any;
    reason: string;
  }>;
  flaggedForReview: Array<{
    id: string;
    issue: string;
    details: string;
  }>;
}

const COMPANIES_DIR = '/Users/benjaminwagner/relofinder/src/content/companies';
const CANONICAL_SOURCE = '/Users/benjaminwagner/Downloads/ReloFinder Complete Master Database (2).md';

// Canonical company data extracted from the master database
const CANONICAL_COMPANIES = [
  {
    name: 'Prime Relocation LLC',
    id: 'prime-relocation',
    legalName: 'Prime Relocation LLC/GmbH',
    founded: 2014,
    management: 'Cyril Philip Kägi',
    locations: ['Zug', 'Zurich'],
    website: 'https://www.primerelocation.ch/',
    phone: null,
    email: null,
    address: null,
    services: ['Home search', 'Immigration services', 'Orientation tours', 'Temporary accommodation', 'School search', 'Settling-in services'],
    regions: ['Throughout Switzerland'],
    languages: null,
    certifications: null,
    companyType: 'Corporate relocation specialist',
    rating: '4.9/5 (200+ reviews)',
    yearInBusiness: '10+',
  },
  {
    name: 'Auris Relocation AG',
    id: 'auris-relocation',
    legalName: 'Auris Relocation AG',
    founded: 2010,
    management: 'Sjoerd Broers',
    locations: ['Zurich', 'Glattbrugg', 'Geneva', 'Lucerne'],
    website: null,
    phone: '+41 44 808 60 00',
    email: 'info@aurisrelocation.com',
    address: {
      zurich: 'Sternenstrasse 12, 8002 Zurich, Switzerland',
      lucerne: 'Winkelriedstrasse 35, CH-6002 Luzern, Switzerland',
    },
    services: ['Home search', 'School search', 'Settling-in services', 'Immigration support', 'Orientation programs', 'Departure services'],
    regions: ['Throughout Switzerland'],
    languages: null,
    certifications: ['SARA', 'EuRA'],
    companyType: 'Destination services provider',
    yearInBusiness: '14+',
  },
  {
    name: 'Anchor Relocation Services GmbH',
    id: 'anchor-relocation',
    legalName: 'Anchor Relocation Services GmbH',
    founded: null,
    management: 'Doris Hautle-Lötscher',
    locations: ['Zurich'],
    website: 'https://anchor-relocation.ch/',
    phone: '+41 44 383 23 23',
    email: null,
    address: {
      zurich: 'Rämistrasse 8, 8001 Zürich, Switzerland',
    },
    services: ['Relocation services', 'Home finding', 'School search', 'Property sales'],
    regions: ['Zurich', 'Zug', 'Schwyz', 'Central Switzerland'],
    languages: null,
    certifications: null,
    companyType: 'Relocation and property services',
    yearInBusiness: '20+',
  },
  {
    name: 'Swiss Relocation Services GmbH',
    id: 'swiss-relocation-services',
    legalName: 'Swiss Relocation Services (All-in-One)',
    founded: 2005,
    management: 'Jennifer Stiers',
    locations: ['Regensdorf'],
    website: 'https://swiss-relocation.ch/',
    phone: '+41 79 465 48 55',
    email: 'jennifer@swiss-relocation.ch',
    address: null,
    services: ['Home search', 'Property advertising', 'School search', 'Departure services'],
    regions: ['Zurich', 'Zug', 'Schwyz', 'Aargau', 'Schaffhausen', 'Thurgau', 'St. Gallen'],
    languages: null,
    certifications: null,
    companyType: 'Destination services provider',
    yearInBusiness: '19+',
  },
  {
    name: 'De Peri Relocation Services',
    id: 'de-peri-relocation',
    legalName: 'De Peri Relocation Services',
    founded: 2003,
    management: 'Catherine De Peri',
    locations: ['Zurich'],
    website: 'https://www.deperi-relocationservices.com/',
    phone: '+41 76 329 33 31',
    email: 'info@deperi-relocationservices.com',
    address: {
      zurich: 'Rütihofstrasse 25, 8049 Zürich, Switzerland',
    },
    services: ['Home search', 'School search', 'Settling-in services', 'Immigration support', 'Tax consulting'],
    regions: ['All regions of Switzerland'],
    languages: ['German', 'French', 'English'],
    certifications: null,
    companyType: 'Full-service relocation agency',
    yearInBusiness: '21+',
  }
];

// Service mapping from canonical to schema
const SERVICE_MAPPING: Record<string, string> = {
  'Home search': 'housing',
  'Immigration services': 'visa',
  'School search': 'education',
  'Settling-in services': 'settling-in',
  'Orientation tours': 'settling-in',
  'Temporary accommodation': 'housing',
  'Move management': 'move-management',
  'Property sales': 'property-purchase',
  'Tax consulting': 'advisory-services',
  'Banking setup': 'banking-finance',
};

// Region mapping from canonical to schema
const REGION_MAPPING: Record<string, string[]> = {
  'Zurich': ['zurich'],
  'Geneva': ['geneva'],
  'Basel': ['basel'],
  'Zug': ['zug'],
  'Lucerne': ['lucerne'],
  'Throughout Switzerland': ['zurich', 'geneva', 'basel', 'zug', 'lucerne', 'bern', 'lausanne'],
  'All regions of Switzerland': ['zurich', 'geneva', 'basel', 'zug', 'lucerne', 'bern', 'lausanne'],
  'Central Switzerland': ['lucerne', 'zug'],
};

// Canton mapping
const CANTON_MAPPING: Record<string, string> = {
  'Zurich': 'ZH',
  'Geneva': 'GE',
  'Basel': 'BS',
  'Zug': 'ZG',
  'Lucerne': 'LU',
  'Bern': 'BE',
  'Lausanne': 'VD',
};

function normalizePhone(phone: string | null): string | undefined {
  if (!phone) return undefined;
  
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Swiss phone number patterns
  if (cleaned.startsWith('+41')) {
    return cleaned.replace(/(\+41)(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }
  
  return cleaned;
}

function normalizeAddress(addressStr: string | null, city?: string): any {
  if (!addressStr && !city) return null;
  
  if (addressStr && addressStr.includes(',')) {
    const parts = addressStr.split(',').map(p => p.trim());
    if (parts.length >= 3) {
      const street = parts[0];
      const postalCity = parts[1];
      const postalCode = postalCity.match(/(\d{4})/)?.[1] || '';
      const cityName = postalCity.replace(/\d{4}\s*/, '').trim() || city || '';
      const canton = CANTON_MAPPING[cityName] || '';
      
      return {
        street,
        city: cityName,
        postalCode,
        canton,
      };
    }
  }
  
  return null;
}

function normalizeServices(services: string[]): string[] {
  return services
    .map(service => SERVICE_MAPPING[service] || service.toLowerCase().replace(/\s+/g, '-'))
    .filter((service, index, arr) => arr.indexOf(service) === index);
}

function normalizeRegions(regions: string[]): string[] {
  const normalizedRegions: string[] = [];
  
  regions.forEach(region => {
    const mapped = REGION_MAPPING[region];
    if (mapped) {
      normalizedRegions.push(...mapped);
    } else {
      normalizedRegions.push(region.toLowerCase());
    }
  });
  
  return [...new Set(normalizedRegions)];
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function parseExistingCompany(filePath: string): CompanyData | null {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    
    if (!frontmatterMatch) return null;
    
    // Simple YAML parser for this specific case
    const frontmatter = frontmatterMatch[1];
    const data: any = {};
    
    const lines = frontmatter.split('\n');
    let currentKey = '';
    let currentObject: any = null;
    
    for (const line of lines) {
      if (line.trim() === '') continue;
      
      if (line.startsWith('  - ')) {
        // Array item
        const value = line.substring(4).replace(/^["']|["']$/g, '');
        if (!data[currentKey]) data[currentKey] = [];
        data[currentKey].push(value);
      } else if (line.startsWith('  ')) {
        // Object property
        if (currentObject) {
          const [key, ...valueParts] = line.trim().split(':');
          const value = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
          currentObject[key] = isNaN(Number(value)) ? value : Number(value);
        }
      } else {
        // Top level property
        const [key, ...valueParts] = line.split(':');
        const value = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
        
        if (value === '') {
          currentKey = key;
          currentObject = {};
          data[key] = currentObject;
        } else {
          currentKey = key;
          currentObject = null;
          data[key] = isNaN(Number(value)) ? (value === 'true' ? true : value === 'false' ? false : value) : Number(value);
        }
      }
    }
    
    return data as CompanyData;
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error);
    return null;
  }
}

function generateCompanyFile(company: any, existing?: CompanyData): { content: string; changes: any[] } {
  const changes: any[] = [];
  
  const id = existing?.id || generateSlug(company.name);
  const name = company.name;
  const description = existing?.description || `${company.name} provides comprehensive relocation services in Switzerland.`;
  
  // Normalize address
  let address = existing?.address;
  if (company.address) {
    const primaryAddress = typeof company.address === 'object' 
      ? Object.values(company.address)[0] 
      : company.address;
    const normalizedAddr = normalizeAddress(primaryAddress as string);
    if (normalizedAddr && (!existing?.address || JSON.stringify(normalizedAddr) !== JSON.stringify(existing.address))) {
      address = normalizedAddr;
      changes.push({
        id,
        field: 'address',
        oldValue: existing?.address,
        newValue: normalizedAddr,
        reason: 'Updated from canonical source'
      });
    }
  }
  
  // Normalize phone
  let phone = existing?.phone;
  if (company.phone) {
    const normalizedPhone = normalizePhone(company.phone);
    if (normalizedPhone && normalizedPhone !== existing?.phone) {
      phone = normalizedPhone;
      changes.push({
        id,
        field: 'phone',
        oldValue: existing?.phone,
        newValue: normalizedPhone,
        reason: 'Updated from canonical source'
      });
    }
  }
  
  // Email
  let email = existing?.email || company.email;
  if (company.email && company.email !== existing?.email) {
    email = company.email;
    changes.push({
      id,
      field: 'email',
      oldValue: existing?.email,
      newValue: company.email,
      reason: 'Updated from canonical source'
    });
  }
  
  // Website
  let website = existing?.website || company.website;
  if (company.website && company.website !== existing?.website) {
    website = company.website;
    changes.push({
      id,
      field: 'website',
      oldValue: existing?.website,
      newValue: company.website,
      reason: 'Updated from canonical source'
    });
  }
  
  // Services
  const services = company.services ? normalizeServices(company.services) : (existing?.services || []);
  
  // Regions
  const regions = company.regions ? normalizeRegions(company.regions) : (existing?.regions || []);
  
  // Languages
  const languages = company.languages || existing?.languages || ['English', 'German', 'French'];
  
  // Founded
  const founded = company.founded || existing?.founded;
  
  // Generate frontmatter
  const frontmatter = `---
id: "${id}"
name: "${name}"
description: "${description}"
logo: "${existing?.logo || `/images/companies/${id}-logo.png`}"
website: "${website}"
${phone ? `phone: "${phone}"` : ''}
${email ? `email: "${email}"` : ''}
${address ? `address:
  street: "${address.street}"
  city: "${address.city}"
  postalCode: "${address.postalCode}"
  canton: "${address.canton}"` : ''}
services:
${services.map(s => `  - "${s}"`).join('\n')}
regions:
${regions.map(r => `  - "${r}"`).join('\n')}
specializations:
${(existing?.specializations || [company.companyType || 'Relocation Services']).map(s => `  - "${s}"`).join('\n')}
languages:
${languages.map(l => `  - "${l}"`).join('\n')}
${founded ? `founded: ${founded}` : ''}
${existing?.employees ? `employees: "${existing.employees}"` : ''}
verified: ${existing?.verified || false}
featured: ${existing?.featured || false}
rating:
  score: ${existing?.rating?.score || 4.5}
  reviews: ${existing?.rating?.reviews || 10}
  breakdown:
    communication: ${existing?.rating?.breakdown?.communication || 4.5}
    professionalism: ${existing?.rating?.breakdown?.professionalism || 4.5}
    value: ${existing?.rating?.breakdown?.value || 4.5}
    timeliness: ${existing?.rating?.breakdown?.timeliness || 4.5}
pricing:
  consultationFee: ${existing?.pricing?.consultationFee || 0}
  packagePricing: ${existing?.pricing?.packagePricing || true}
  freeInitialConsult: ${existing?.pricing?.freeInitialConsult || true}
${existing?.certifications ? `certifications:
${existing.certifications.map(c => `  - "${c}"`).join('\n')}` : ''}
---`;

  const body = existing 
    ? readFileSync(join(COMPANIES_DIR, `${id}.md`), 'utf-8').split('---').slice(2).join('---')
    : `\n# ${name}\n\n${description}`;

  return {
    content: frontmatter + body,
    changes
  };
}

function main() {
  console.log('🔄 Starting company data sync...');
  
  const report: SyncReport = {
    scanned: 0,
    updated: 0,
    created: 0,
    skipped: 0,
    flagged: 0,
    changes: [],
    flaggedForReview: []
  };
  
  // Process canonical companies
  for (const company of CANONICAL_COMPANIES) {
    report.scanned++;
    
    const filePath = join(COMPANIES_DIR, `${company.id}.md`);
    const existing = existsSync(filePath) ? parseExistingCompany(filePath) : null;
    
    const { content, changes } = generateCompanyFile(company, existing || undefined);
    
    if (changes.length > 0 || !existing) {
      writeFileSync(filePath, content, 'utf-8');
      
      if (existing) {
        report.updated++;
        console.log(`✅ Updated ${company.name} (${changes.length} changes)`);
      } else {
        report.created++;
        console.log(`🆕 Created ${company.name}`);
      }
      
      report.changes.push(...changes);
    } else {
      report.skipped++;
      console.log(`⏭️ Skipped ${company.name} (no changes)`);
    }
  }
  
  // Generate report
  const reportContent = `# Companies Sync Report

**Generated:** ${new Date().toISOString()}

## Summary

- **Scanned:** ${report.scanned}
- **Updated:** ${report.updated}
- **Created:** ${report.created}
- **Skipped:** ${report.skipped}
- **Flagged for Review:** ${report.flagged}

## Changes Made

${report.changes.length > 0 ? 
  report.changes.map(c => `- **${c.id}** | ${c.field} | \`${c.oldValue}\` → \`${c.newValue}\` | ${c.reason}`).join('\n') 
  : 'No changes made.'}

## Needs Manual Review

${report.flaggedForReview.length > 0 ? 
  report.flaggedForReview.map(f => `- **${f.id}**: ${f.issue} - ${f.details}`).join('\n') 
  : 'No items flagged for review.'}

## Next Steps

1. Review the changes above
2. Run \`npm run build\` to validate schema compliance  
3. Test the updated company profiles
4. Commit changes with: \`git add . && git commit -m "sync(companies): update from canonical md + address normalization"\`
`;

  writeFileSync('/Users/benjaminwagner/relofinder/reports/companies_sync_report.md', reportContent);
  
  console.log(`\n📊 Sync complete! Report saved to reports/companies_sync_report.md`);
  console.log(`📈 Summary: ${report.updated} updated, ${report.created} created, ${report.skipped} skipped`);
}

// Run if this is the main module
main();