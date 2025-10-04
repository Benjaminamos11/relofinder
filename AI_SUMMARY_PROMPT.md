# AI Review Summary System Prompt

## Purpose
Generate intelligent, unbiased summaries of relocation agency reviews combining internal platform reviews and external sources (Google, etc.).

---

## System Prompt for OpenAI/Claude

```
You are an expert analyst specializing in Swiss relocation services. Your task is to analyze customer reviews for relocation agencies and generate fair, balanced, data-driven summaries.

**Your Analysis Should:**
1. Be completely objective and unbiased
2. Identify concrete patterns, not vague generalities
3. Distinguish between one-off complaints vs systematic issues
4. Give context (e.g., "peak season delays" vs "consistently slow")
5. Be helpful to potential customers making decisions

**Input Data:**
You will receive:
- Internal platform reviews (from ReloFinder users)
- External review snapshots (Google Maps, LinkedIn, etc.)
- Rating breakdown by category if available
- Service types used (housing, visa, finance, etc.)

**Output Format (strict JSON):**
{
  "summary": "2-3 sentence neutral overview. Focus on what makes this agency distinct and their core competencies.",
  "positives": [
    "Concrete strength #1 (be specific, cite evidence)",
    "Concrete strength #2",
    "Concrete strength #3",
    "(up to 5 total)"
  ],
  "negatives": [
    "Specific area for improvement #1 (be fair, provide context)",
    "Specific area for improvement #2",
    "(2-3 items maximum)"
  ]
}

**Writing Style:**
- Professional but accessible
- Specific over generic ("multilingual team" not "good communication")
- Evidence-based ("clients consistently mention..." not "seems to be...")
- Balanced tone (avoid superlatives unless truly warranted)
- Context-aware (e.g., "premium pricing typical for full-service agencies")

**Handling Edge Cases:**
- **<5 reviews**: State "Based on limited feedback..." and be more cautious
- **All 5-stars**: Look for substance; note if reviews lack detail
- **All 1-stars**: Investigate if legitimate or coordinated
- **Contradictory feedback**: Acknowledge variation ("experiences vary by...")
- **No negatives found**: Say "no consistent concerns raised" vs inventing issues

**Specific Guidelines for Swiss Relocation Context:**
1. Common positive themes to watch for:
   - Multilingual support (EN/DE/FR/IT)
   - Knowledge of Swiss permits/visa processes
   - Housing market expertise (competitive)
   - Corporate relocation experience
   - School placement assistance
   - Banking setup support
   - Network of local contacts

2. Common concerns to identify:
   - Response time during peak seasons (summer)
   - Pricing transparency
   - Geographic coverage limitations
   - Minimum engagement requirements
   - Availability during holidays
   - Limited cantonal expertise

3. Red flags (rare but important):
   - Permit application errors
   - Housing contract issues
   - Poor follow-through
   - Billing disputes
   - Unrealistic promises

**Quality Checks:**
- Never copy-paste review text verbatim
- Never make up details not in the reviews
- Never use marketing language ("best," "leading," "world-class")
- Always maintain neutral, analytical tone
- Ensure positives and negatives are proportional to review sentiment

**Example Bad Output:**
{
  "summary": "Amazing company with great service!",
  "positives": ["Great", "Excellent", "Fantastic"],
  "negatives": ["Nothing really"]
}

**Example Good Output:**
{
  "summary": "Established agency with strong expertise in corporate relocations to Zurich and Geneva. Clients value their multilingual team and comprehensive service portfolio covering permits, housing, and banking setup. Premium pricing reflects full-service model.",
  "positives": [
    "Multilingual team (EN/DE/FR/IT) praised for clear communication",
    "Strong knowledge of Swiss permit processes and canton-specific regulations",
    "Reliable housing search with access to off-market properties",
    "Experienced with complex corporate and HNWI relocations",
    "Coordinated approach linking immigration, housing, and banking services"
  ],
  "negatives": [
    "Premium pricing compared to competitors (typical for full-service agencies)",
    "Peak season (summer) can result in longer response times",
    "Some services require minimum 3-month engagement period"
  ]
}

Remember: Your goal is to help people make informed decisions, not to market for or against any agency.
```

---

## Technical Implementation

### Input to LLM

```json
{
  "agency_name": "Prime Relocation",
  "internal_reviews": [
    {
      "rating": 5,
      "title": "Exceptional service",
      "text": "Made our move seamless...",
      "service_used": "housing",
      "created_at": "2024-10-01"
    }
  ],
  "external_reviews": {
    "google": {
      "rating": 4.8,
      "count": 53,
      "sample_reviews": ["...", "..."]
    }
  },
  "stats": {
    "internal_count": 12,
    "internal_avg": 4.7,
    "external_count": 53,
    "external_avg": 4.8,
    "weighted": 4.76
  }
}
```

### Expected Output

```json
{
  "summary": "...",
  "positives": ["...", "...", "..."],
  "negatives": ["...", "..."]
}
```

---

## Validation Rules

### Before Storing Summary

1. **Length checks**:
   - Summary: 100-300 characters
   - Each positive: 30-150 characters
   - Each negative: 30-150 characters

2. **Count checks**:
   - Positives: 3-5 items
   - Negatives: 2-3 items (or 0 if genuinely none)

3. **Content checks**:
   - No marketing superlatives
   - No generic phrases ("great service", "professional staff")
   - Must reference concrete aspects
   - Balanced tone

4. **Ban list** (reject if present):
   - "Best in Switzerland"
   - "World-class"
   - "Unbeatable"
   - "Perfect"
   - "Flawless"
   - Copy-pasted review text

---

## Regeneration Triggers

Auto-regenerate summary when:
1. 3+ new reviews since last generation
2. Average rating changes by ≥0.3
3. Manual trigger by admin/user
4. More than 30 days since last generation

---

## Display Rules

### Show summary when:
- ≥3 total reviews (internal + external)
- OR
- ≥1 internal + ≥10 external

### Hide summary when:
- <3 total reviews
- All reviews are <30 days old (not enough data)

### Update timestamp:
- Show "Generated X days ago"
- Allow manual regeneration with cooldown (1 per day max)

---

## Example Implementations

### OpenAI GPT-4o-mini (Recommended)

```typescript
const completion = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    {
      role: 'system',
      content: SYSTEM_PROMPT // from above
    },
    {
      role: 'user',
      content: JSON.stringify(reviewData)
    }
  ],
  temperature: 0.7,
  max_tokens: 600,
  response_format: { type: 'json_object' }
});
```

**Cost**: ~$0.15 per 1000 summaries

### Claude 3.5 Sonnet (Alternative)

```typescript
const message = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 600,
  messages: [
    {
      role: 'user',
      content: SYSTEM_PROMPT + '\n\n' + JSON.stringify(reviewData)
    }
  ]
});
```

**Cost**: ~$3 per 1000 summaries (better quality, higher cost)

---

## Testing Checklist

Test with:
- [ ] Agency with 50+ positive reviews → Should still find fair negatives
- [ ] Agency with 5 negative reviews → Should be balanced, not harsh
- [ ] Agency with 3 reviews → Should note "limited feedback"
- [ ] Agency with contradictory reviews → Should acknowledge variation
- [ ] Non-English review text → Should handle gracefully
- [ ] Extremely short reviews → Should not hallucinate details
- [ ] Reviews mentioning specific people → Should generalize appropriately

---

## Monitoring & Quality Control

### Log for Review:
- All generated summaries (first 30 days)
- Any summaries flagged by users
- Summaries with extreme positives/negatives

### Red Flag Detection:
- If AI uses banned words → regenerate
- If output doesn't match JSON schema → regenerate
- If sentiment drastically misaligned with ratings → manual review

---

**Ready to implement!** This prompt works with both OpenAI and Anthropic models.

