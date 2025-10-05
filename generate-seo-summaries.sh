#!/bin/bash

# SEO Summary Generator Script
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

# Get all relocators without SEO summaries
echo "📊 Fetching relocators without SEO summaries..."

relocators=$(curl -s -X POST \
    "$SUPABASE_URL/rest/v1/rpc/get_relocators_without_seo_summary" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "apikey: $AUTH_TOKEN")

# If the RPC doesn't exist, we'll use a direct query
if [ $? -ne 0 ]; then
    echo "📋 Using direct query to get relocators..."
    
    # Get relocators without SEO summaries (prioritized by tier)
    relocators=$(curl -s -X GET \
        "$SUPABASE_URL/rest/v1/relocators?select=id,name,tier&seo_summary=is.null&order=tier.desc,name.asc" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -H "apikey: $AUTH_TOKEN")
fi

echo "Found relocators to process:"
echo "$relocators" | jq -r '.[] | "\(.tier) - \(.name) - \(.id)"'

# Process each relocator
echo "$relocators" | jq -r '.[] | "\(.id)|\(.name)"' | while IFS='|' read -r id name; do
    generate_seo_summary "$id" "$name"
done

echo "🎉 SEO Summary generation completed!"
echo "📊 Check the results in Supabase dashboard"
