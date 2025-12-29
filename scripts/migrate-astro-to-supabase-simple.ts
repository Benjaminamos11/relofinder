#!/usr/bin/env node
/**
 * Migration Script: Astro Content Collection → Supabase relocators table
 * 
 * Simple version that reads markdown files and syncs to Supabase
 * 
 * Usage: npx tsx scripts/migrate-astro-to-supabase-simple.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Please set PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface MigrationReport {
  total: number;
  updated: number;
  skipped: number;
  errors: Array<{ company: string; error: string }>;
}

/**
 * Simple YAML frontmatter parser
 */
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
    
    // Skip empty lines
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
      
      // Reset array state
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
        currentObject[key.trim()] = isNaN(Number(value)) ? value : Number(value);
      }
    }
  }
  
  return result;
}

/**
 * Transform Astro data to Supabase format
 */
function transformToSupabase(data: Record<string, any>) {
  return {
    // Basic fields
    name: data.name,
    email: data.email || null,
    phone: data.phone || null,
    website: data.website || null,
    
    // Arrays
    languages: Array.isArray(data.languages) ? data.languages : [],
    certifications: Array.isArray(data.certifications) ? data.certifications : [],
    
    // Pricing model (JSONB)
    pricing_model: data.pricing ? {
      consultationFee: data.pricing.consultationFee || 0,
      packagePricing: data.pricing.packagePricing || false,
      freeInitialConsult: data.pricing.freeInitialConsult !== false,
    } : null,
    
    // Rating breakdown (JSONB)
    rating_breakdown: data.rating?.breakdown ? {
      communication: data.rating.breakdown.communication || 0,
      professionalism: data.rating.breakdown.professionalism || 0,
      value: data.rating.breakdown.value || 0,
      timeliness: data.rating.breakdown.timeliness || 0,
    } : null,
    
    // Content blocks (JSONB)
    content_blocks: {
      highlights: Array.isArray(data.highlights) ? data.highlights.map((h: any) => ({
        title: h.title || '',
        icon: h.icon || null,
        points: Array.isArray(h.points) ? h.points : [],
      })) : [],
      milestones: Array.isArray(data.milestones) ? data.milestones.map((m: any) => ({
        year: m.year || 0,
        event: m.event || '',
      })) : [],
      process: Array.isArray(data.process) ? data.process.map((p: any) => ({
        step: p.step || 0,
        title: p.title || '',
        description: p.description || '',
        duration: p.duration || null,
        icon: p.icon || null,
      })) : [],
      faqs: Array.isArray(data.faqs) ? data.faqs.map((f: any) => ({
        question: f.question || '',
        answer: f.answer || '',
      })) : [],
    },
    
    // Social proof (JSONB)
    social_proof: {
      stats: Array.isArray(data.stats) ? data.stats.map((s: any) => ({
        label: s.label || '',
        value: s.value || '',
        icon: s.icon || null,
      })) : [],
      testimonials: Array.isArray(data.testimonials) ? data.testimonials.map((t: any) => ({
        author: t.author || '',
        role: t.role || '',
        rating: t.rating || 0,
        quote: t.quote || '',
      })) : [],
    },
    
    // SEO
    meta_description: data.seoDescription || data.description || null,
    
    // Additional fields
    ...(data.founded && { year_founded: data.founded }),
    ...(data.googleMyBusinessUrl && { google_maps_url: data.googleMyBusinessUrl }),
  };
}

/**
 * Main migration function
 */
async function migrateCompanies() {
  console.log('🔄 Starting migration from Astro content collection to Supabase...\n');
  
  const report: MigrationReport = {
    total: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };
  
  try {
    const companiesDir = join(__dirname, '..', 'src', 'content', 'companies');
    const companyFiles = readdirSync(companiesDir).filter(f => f.endsWith('.md'));
    
    console.log(`📁 Found ${companyFiles.length} company files\n`);
    report.total = companyFiles.length;
    
    for (const file of companyFiles) {
      const filePath = join(companiesDir, file);
      const content = readFileSync(filePath, 'utf-8');
      
      try {
        const frontmatter = parseFrontmatter(content);
        
        if (!frontmatter.name) {
          console.log(`⚠️  Skipping ${file} - no name found`);
          report.skipped++;
          continue;
        }
        
        const companyName = frontmatter.name;
        
        // Find existing relocator by name
        const { data: existingRelocator, error: findError } = await supabase
          .from('relocators')
          .select('id, name')
          .ilike('name', companyName)
          .limit(1)
          .maybeSingle();
        
        if (findError) {
          throw findError;
        }
        
        if (!existingRelocator) {
          console.log(`⚠️  Company not found in Supabase: ${companyName} (skipping)`);
          report.skipped++;
          continue;
        }
        
        // Transform and update
        const updateData = transformToSupabase(frontmatter);
        
        const { error: updateError } = await supabase
          .from('relocators')
          .update(updateData)
          .eq('id', existingRelocator.id);
        
        if (updateError) {
          throw updateError;
        }
        
        console.log(`✅ Updated: ${companyName}`);
        report.updated++;
        
      } catch (error: any) {
        const errorMsg = error.message || String(error);
        console.error(`❌ Error processing ${file}:`, errorMsg);
        report.errors.push({
          company: file,
          error: errorMsg,
        });
      }
    }
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary');
    console.log('='.repeat(60));
    console.log(`Total companies: ${report.total}`);
    console.log(`✅ Updated: ${report.updated}`);
    console.log(`⏭️  Skipped: ${report.skipped}`);
    console.log(`❌ Errors: ${report.errors.length}`);
    
    if (report.errors.length > 0) {
      console.log('\n⚠️  Errors:');
      report.errors.forEach(({ company, error }) => {
        console.log(`  - ${company}: ${error}`);
      });
    }
    
    // Save report
    const reportPath = join(__dirname, '..', 'reports', 'migration-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Report saved to: reports/migration-report.json`);
    console.log('\n✨ Migration complete!');
    
  } catch (error: any) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run migration
migrateCompanies().catch(console.error);




