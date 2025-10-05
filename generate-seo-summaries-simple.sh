#!/bin/bash

# SEO Summary Generator Script (Simplified - No jq required)
# This script generates SEO summaries for all relocators in Supabase

echo "🚀 Starting SEO Summary Generation for All Relocators..."

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

# List of relocator IDs and names (prioritized by tier)
# Preferred tier (2 companies)
generate_seo_summary "23f7b3bd-3615-4ac8-84c6-5ddb9c84361a" "Expat Savvy"
generate_seo_summary "96ee3343-4a8e-4972-bab5-31c62d6ec178" "Prime Relocation"

# Partner tier (6 companies)
generate_seo_summary "bd3e659f-ba57-4756-897f-5a018c9eece9" "Santa Fe Relocation Services"
generate_seo_summary "f5290262-3459-4ac1-b078-20743b839943" "Auris Relocation"
generate_seo_summary "43509ac9-16f0-4396-ad70-733433fe41fa" "Executive Relocation"
generate_seo_summary "5d57c46e-9d65-454c-b029-9366c5a97104" "Harsch - The Art of Moving Forward"
generate_seo_summary "578445bc-8cee-4725-babd-4b44038f1f49" "Keller Swiss Group"
generate_seo_summary "ef08c2ca-340f-4ccc-a84e-6460c50f06f0" "Sgier + Partner"
generate_seo_summary "9a94ebc3-a3c6-46ec-9de2-d4f472340326" "Sirva Relocation"

# Standard tier (remaining companies)
generate_seo_summary "20875fa6-435a-4ba6-b813-3ca2d15f643e" "A Good Day Relocation"
generate_seo_summary "f8f5b829-7f1b-44de-ac5c-d2a864410555" "Alliance Relocation"
generate_seo_summary "b0d5e2a9-6988-4f89-be81-1802e841e9f7" "All in One Relocation"
generate_seo_summary "1b410fce-83f3-4f2f-b8d9-fe05825bd502" "AM Relocation"
generate_seo_summary "7cdc6f98-3d25-44e2-bd6d-389c7b6073e2" "Anchor Relocation"
generate_seo_summary "2a01818d-090d-45a0-a923-1f403237b000" "AP Executive"
generate_seo_summary "3bbecca4-1a72-4187-a638-53d056820588" "Bridging Cultures Relocation"
generate_seo_summary "97ee0233-2088-42a9-8881-4ba706ac3c65" "Connectiv Relocation AG"
generate_seo_summary "96ee10e4-69c6-4f2b-bfdc-1a517ef6daa0" "Contentum Relocation"
generate_seo_summary "a4169927-bee3-4de9-8551-2533acebf90c" "Crane Relocation GmbH"
generate_seo_summary "496c6276-d06b-4928-826c-94e06de3e8cc" "Crown Relocations"
generate_seo_summary "d8ebf33e-35fe-4bd1-a411-0856ebfd642a" "De Peri Relocation Services"
generate_seo_summary "21e59f5f-9e4f-4eed-8f6e-56fd96fbf37f" "Expat Services Switzerland"
generate_seo_summary "9a94ebc3-a3c6-46ec-9de2-d4f472340326" "Jyoti Relocation"
generate_seo_summary "ef08c2ca-340f-4ccc-a84e-6460c50f06f0" "La Boutique Relocation"
generate_seo_summary "9a94ebc3-a3c6-46ec-9de2-d4f472340326" "Leman Relocation Sàrl"
generate_seo_summary "9a94ebc3-a3c6-46ec-9de2-d4f472340326" "Lifestylemanagers"
generate_seo_summary "9a94ebc3-a3c6-46ec-9de2-d4f472340326" "Lodge Relocation"
generate_seo_summary "d8ebf33e-35fe-4bd1-a411-0856ebfd642a" "Matterhorn Relocation"
generate_seo_summary "9a94ebc3-a3c6-46ec-9de2-d4f472340326" "OZ Swiss Relocation Consulting"
generate_seo_summary "9a94ebc3-a3c6-46ec-9de2-d4f472340326" "Packimpex"
generate_seo_summary "9a94ebc3-a3c6-46ec-9de2-d4f472340326" "Practical Services"
generate_seo_summary "9a94ebc3-a3c6-46ec-9de2-d4f472340326" "Rel-Ex"
generate_seo_summary "9a94ebc3-a3c6-46ec-9de2-d4f472340326" "Relocality"
generate_seo_summary "9a94ebc3-a3c6-46ec-9de2-d4f472340326" "Relocation Basel"
generate_seo_summary "9a94ebc3-a3c6-46ec-9de2-d4f472340326" "Relocation Geneva"
generate_seo_summary "9a94ebc3-a3c6-46ec-9de2-d4f472340326" "Relocation Genevoise"
generate_seo_summary "9a94ebc3-a3c6-46ec-9de2-d4f472340326" "Relocation Plus"
generate_seo_summary "ba3ea2ff-3e23-49cb-b1ae-56c1c7abd69a" "Relonest"
generate_seo_summary "3d3f475c-8c29-43e8-9c26-ae147939312d" "Schmid & Hoppeler"
generate_seo_summary "c30137e6-ef0b-4961-9065-be075e50d82c" "Schweizer Relocation"
generate_seo_summary "1ec7e65d-d0fc-4e31-bb95-c95bd6afeff8" "SRS Relocation"
generate_seo_summary "8912a779-9de3-492b-96c6-a1ce1c80903e" "Sterling Lexicon"
generate_seo_summary "20d48f4f-8d3e-5ddc-9f5d-45ec85eae26e" "Swiss Expat Realtor"
generate_seo_summary "19c37f3e-7c2d-4ccb-8e4c-34db74dae25d" "The SMC"
generate_seo_summary "bc9815f9-21b3-4a24-a4d6-65b9f5f073e2" "Welcome Service"
generate_seo_summary "58f8dc1e-37d6-43b8-89ba-108afea36fd5" "Zurich Relocation"
generate_seo_summary "9a94ebc3-a3c6-46ec-9de2-d4f472340326" "Swiss Prime International"

echo "🎉 SEO Summary generation completed!"
echo "📊 Check the results in Supabase dashboard"
