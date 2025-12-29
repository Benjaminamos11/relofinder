#!/usr/bin/env node
/**
 * Migration Script using MCP Supabase Server
 * Reads Astro content collection and migrates to Supabase
 */

import { readdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simple YAML parser
function parseFrontmatter(content: string): Record<string, any> {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return {};
  
  const frontmatter = frontmatterMatch[1];
  const result: Record<string, any> = {};
  const lines = frontmatter.split('\n');
  
  let currentKey = '';
  let currentObject: any = null;
  let currentArray: any[] = [];
  let inArray = false;
  let indentLevel = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const currentIndent = line.length - line.trimStart().length;
    
    if (!trimmed) continue;
    
    // Array item
    if (trimmed.startsWith('- ')) {
      const value = trimmed.substring(2).replace(/^["']|["']$/g, '');
      if (inArray) {
        currentArray.push(value);
      } else {
        inArray = true;
        currentArray = [value];
        result[currentKey] = currentArray;
      }
      continue;
    }
    
    // Key-value pair
    if (trimmed.includes(':') && !trimmed.startsWith('-')) {
      const [key, ...valueParts] = trimmed.split(':');
      const value = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
      
      inArray = false;
      currentArray = [];
      
      // Nested object
      if (value === '' && i + 1 < lines.length && lines[i + 1].trim().startsWith('-')) {
        currentKey = key.trim();
        currentObject = {};
        result[currentKey] = currentObject;
        indentLevel = currentIndent;
        continue;
      }
      
      // Simple value
      currentKey = key.trim();
      if (value === 'true') {
        result[currentKey] = true;
      } else if (value === 'false') {
        result[currentKey] = false;
      } else if (value === '' || value === 'null') {
        result[currentKey] = null;
      } else if (!isNaN(Number(value)) && value !== '') {
        result[currentKey] = Number(value);
      } else {
        result[currentKey] = value;
      }
    } else if (currentIndent > indentLevel && currentObject) {
      // Nested object property
      const [key, ...valueParts] = trimmed.split(':');
      const value = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
      if (value !== '') {
        if (!currentObject[key.trim()]) {
          currentObject[key.trim()] = {};
        }
        const nestedKey = trimmed.split(':')[0]?.trim();
        const nestedValue = trimmed.split(':').slice(1).join(':').trim().replace(/^["']|["']$/g, '');
        if (nestedKey && nestedValue !== '') {
          currentObject[nestedKey] = isNaN(Number(nestedValue)) ? nestedValue : Number(nestedValue);
        }
      }
    }
  }
  
  return result;
}

// Transform to SQL update
function generateUpdateSQL(companyName: string, data: Record<string, any>): string {
  const updates: string[] = [];
  
  // Languages
  if (Array.isArray(data.languages) && data.languages.length > 0) {
    const languagesArray = data.languages.map((l: string) => `'${l.replace(/'/g, "''")}'`).join(',');
    updates.push(`languages = ARRAY[${languagesArray}]::TEXT[]`);
  }
  
  // Certifications
  if (Array.isArray(data.certifications) && data.certifications.length > 0) {
    const certsArray = data.certifications.map((c: string) => `'${c.replace(/'/g, "''")}'`).join(',');
    updates.push(`certifications = ARRAY[${certsArray}]::TEXT[]`);
  }
  
  // Pricing model
  if (data.pricing) {
    const pricing = {
      consultationFee: data.pricing.consultationFee || 0,
      packagePricing: data.pricing.packagePricing || false,
      freeInitialConsult: data.pricing.freeInitialConsult !== false
    };
    updates.push(`pricing_model = '${JSON.stringify(pricing).replace(/'/g, "''")}'::JSONB`);
  }
  
  // Rating breakdown
  if (data.rating?.breakdown) {
    const breakdown = {
      communication: data.rating.breakdown.communication || 0,
      professionalism: data.rating.breakdown.professionalism || 0,
      value: data.rating.breakdown.value || 0,
      timeliness: data.rating.breakdown.timeliness || 0
    };
    updates.push(`rating_breakdown = '${JSON.stringify(breakdown).replace(/'/g, "''")}'::JSONB`);
  }
  
  // Content blocks
  const contentBlocks: any = {
    highlights: Array.isArray(data.highlights) ? data.highlights : [],
    milestones: Array.isArray(data.milestones) ? data.milestones : [],
    process: Array.isArray(data.process) ? data.process : [],
    faqs: Array.isArray(data.faqs) ? data.faqs : []
  };
  updates.push(`content_blocks = '${JSON.stringify(contentBlocks).replace(/'/g, "''")}'::JSONB`);
  
  // Social proof
  const socialProof: any = {
    stats: Array.isArray(data.stats) ? data.stats : [],
    testimonials: Array.isArray(data.testimonials) ? data.testimonials : []
  };
  updates.push(`social_proof = '${JSON.stringify(socialProof).replace(/'/g, "''")}'::JSONB`);
  
  // Meta description
  if (data.seoDescription || data.description) {
    const metaDesc = (data.seoDescription || data.description || '').replace(/'/g, "''");
    updates.push(`meta_description = '${metaDesc}'`);
  }
  
  if (updates.length === 0) return '';
  
  return `UPDATE relocators SET ${updates.join(', ')} WHERE name ILIKE '${companyName.replace(/'/g, "''")}';`;
}

// Main function
async function main() {
  const companiesDir = join(__dirname, '..', 'src', 'content', 'companies');
  const companyFiles = readdirSync(companiesDir).filter(f => f.endsWith('.md'));
  
  console.log(`📁 Found ${companyFiles.length} company files\n`);
  
  const sqlStatements: string[] = [];
  const report = {
    total: companyFiles.length,
    processed: 0,
    skipped: 0,
    errors: [] as Array<{ file: string; error: string }>
  };
  
  for (const file of companyFiles) {
    try {
      const filePath = join(companiesDir, file);
      const content = readFileSync(filePath, 'utf-8');
      const frontmatter = parseFrontmatter(content);
      
      if (!frontmatter.name) {
        console.log(`⚠️  Skipping ${file} - no name found`);
        report.skipped++;
        continue;
      }
      
      const sql = generateUpdateSQL(frontmatter.name, frontmatter);
      if (sql) {
        sqlStatements.push(sql);
        console.log(`✅ Prepared: ${frontmatter.name}`);
        report.processed++;
      } else {
        console.log(`⚠️  No updates for: ${frontmatter.name}`);
        report.skipped++;
      }
    } catch (error: any) {
      console.error(`❌ Error processing ${file}:`, error.message);
      report.errors.push({ file, error: error.message });
    }
  }
  
  // Write SQL file
  const sqlFile = join(__dirname, '..', 'migration-updates.sql');
  const sqlContent = `-- Migration SQL generated from Astro content collection
-- Generated: ${new Date().toISOString()}
-- Total companies: ${report.total}
-- Processed: ${report.processed}
-- Skipped: ${report.skipped}

${sqlStatements.join('\n\n')}
`;
  
  require('fs').writeFileSync(sqlFile, sqlContent);
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total: ${report.total}`);
  console.log(`   Processed: ${report.processed}`);
  console.log(`   Skipped: ${report.skipped}`);
  console.log(`   Errors: ${report.errors.length}`);
  console.log(`\n📄 SQL file written to: migration-updates.sql`);
  console.log(`\n💡 Next step: Use MCP Supabase to execute these SQL statements`);
}

main().catch(console.error);




