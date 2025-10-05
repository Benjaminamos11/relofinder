#!/bin/bash

# Final SEO Summary Generator Script - Last 18 Companies
# This script generates SEO summaries for the final remaining companies

echo "🚀 Generating SEO summaries for final 18 companies..."

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
    
    if echo "$response" | grep -q "summary"; then
        echo "✅ Success: $relocator_name"
    else
        echo "❌ Failed: $relocator_name - $response"
    fi
    
    # Small delay to avoid rate limiting
    sleep 2
}

# Final 18 companies that need SEO summaries
echo "🎯 Processing Partner tier companies first..."

# Partner tier (3 companies)
generate_seo_summary "6d2be863-13f0-4bf8-be84-54a85a24d98e" "Harsch - The Art of Moving Forward"
generate_seo_summary "1730b917-3141-4fea-9e55-c0b289d6d9ee" "Sgier + Partner"
generate_seo_summary "c8d65aa8-be99-4bee-a688-82db96829f6b" "Sirva Relocation"

echo "🎯 Processing Standard tier companies..."

# Standard tier (15 companies)
generate_seo_summary "0fd7d9b4-d7a1-417d-9191-c775459e4db9" "Relocation Basel"
generate_seo_summary "0f3b7727-1132-4885-bf38-eeacc619cbb3" "Relocation Geneva"
generate_seo_summary "04614981-9b1d-4709-805d-ea5874b32b81" "Relocation Genevoise"
generate_seo_summary "69382848-fdc0-4326-9816-5fa5502a3056" "Relocation Plus"
generate_seo_summary "ee57baf3-cc23-445c-a7b1-0e0e23d5387a" "Santa Fe Relocation"
generate_seo_summary "c71db081-383e-4520-9cee-094d8d6a99c4" "Silverline Relocation"
generate_seo_summary "e03da494-62fa-44d7-bd1a-8c714f7d537e" "Silver Nest Relocation"
generate_seo_summary "6c7c8a2e-ed05-41d5-86a5-1d676b0d7526" "Swiss Prime International"
generate_seo_summary "c3e9c57e-3f2e-414e-87ae-573391e17242" "Swiss Relocation Services GmbH"
generate_seo_summary "d1314b27-8d70-42c9-9004-fd6ea4118a91" "The Relocation Company GmbH"
generate_seo_summary "e3561b0f-47d1-49c0-9f5e-a415e4aedc8b" "Touchdown Relocation Services"
generate_seo_summary "bc9815f9-21b3-4a24-a4d6-65b9f5aee395" "Welcome Service"
generate_seo_summary "d36652a1-bb7e-4a0d-b043-3b5844283133" "Xpat Relocation"
generate_seo_summary "7ae20e0b-a1dd-477a-a6b3-66012be180da" "Zug Relocation"
generate_seo_summary "b138d874-2e74-48bb-a7e4-d17911198d4c" "Zweers include GmbH"

echo "🎉 ALL SEO SUMMARIES COMPLETED!"
echo "📊 Final check: SELECT COUNT(*) FROM public.relocators WHERE seo_summary IS NOT NULL;"
echo "🎯 All 58 companies should now have SEO summaries!"
