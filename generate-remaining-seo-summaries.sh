#!/bin/bash

# SEO Summary Generator Script - Remaining Companies
# This script generates SEO summaries for the remaining 28 companies

echo "🚀 Generating SEO summaries for remaining companies..."

# Supabase configuration
SUPABASE_URL="https://yrkdgsswjnrrprfsmllr.supabase.co"
AUTH_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlya2Rnc3N3am5ycnByZnNtbGxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5MTU4MzIsImV4cCI6MjA1MTQ5MTgzMn0.7BlX7lS9eOesqW7TAAAAKlc068Ria-7rCjOwvaywctE"

# Function to generate SEO summary for a single relocator
generate_seo_summary() {
    local relocator_id="$1"
    local relocator_name="$2"
    
    echo "📝 Generating SEO summary for: $relocator_name"
    
    response=$(curl -s -X POST \
        "$SUPABASE_URL/functions/v1/generate-seo-summary" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d "{\"relocator_id\": \"$relocator_id\"}")
    
    if echo "$response" | grep -q "success"; then
        echo "✅ Success: $relocator_name"
    else
        echo "❌ Failed: $relocator_name - $response"
    fi
    
    # Small delay to avoid rate limiting
    sleep 2
}

# Remaining companies that need SEO summaries
generate_seo_summary "96f6deec-0e6f-4297-8187-6eaf2d21fa29" "Crown Relocations"
generate_seo_summary "8bb97fdd-32b9-4da0-8c11-fc44c61fa11e" "De Peri Relocation Services"
generate_seo_summary "4b3416b3-1bd3-4fa8-adae-7815a3005625" "Expat Services Switzerland"
generate_seo_summary "ae020710-a973-41d4-85a4-a42a13590c62" "Leman Relocation Sàrl"
generate_seo_summary "3ecddb8a-bc21-428a-a07a-26f181871464" "Lifestylemanagers"
generate_seo_summary "777f5eba-57b2-4c75-9213-281c154c50b3" "OZ Swiss Relocation Consulting"
generate_seo_summary "e9fc5fc7-ac6d-4e01-971a-2c65af35fe04" "Packimpex"
generate_seo_summary "7cc0a510-27ca-44cf-b96c-93c84ec3ea17" "Practical Services"
generate_seo_summary "91faa6ef-59f7-4df1-91ff-cba71b5c39a6" "Rel-Ex"
generate_seo_summary "fc03f214-f750-4304-80b7-75b12e8af4a0" "Relocality"

echo "🎉 Batch 1 completed! Continuing with remaining companies..."

# Continue with more companies (you can add more IDs here as needed)
# Add more companies from the remaining list...

echo "📊 Check progress with: SELECT COUNT(*) FROM public.relocators WHERE seo_summary IS NOT NULL;"
