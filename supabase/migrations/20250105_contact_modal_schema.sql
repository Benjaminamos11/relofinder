-- ============================================================================
-- Contact Modal Database Schema
-- Tables for quote requests, consultation requests, routing rules, and KPIs
-- ============================================================================

-- Quote Requests Table
CREATE TABLE IF NOT EXISTS quote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_context JSONB NOT NULL, -- {type, serviceName?, regionName?, companyId?, path, ua?, ip_hash?}
  contact JSONB NOT NULL, -- {name, email, phone?, contact_pref?}
  move JSONB NOT NULL, -- {from, to, date, reason}
  services TEXT[] NOT NULL, -- e.g. {'home_search','permits','schools'}
  notes TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'converted', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Consultation Requests Table
CREATE TABLE IF NOT EXISTS consultation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_context JSONB NOT NULL,
  contact JSONB NOT NULL,
  move JSONB NOT NULL,
  services TEXT[] NOT NULL,
  notes TEXT,
  target_company_id TEXT, -- Specific company for consultation
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'scheduled', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partner Routing Rules Table
CREATE TABLE IF NOT EXISTS partner_routing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL,
  service TEXT NOT NULL,
  partner_ids TEXT[] NOT NULL, -- Array of relocator IDs, preferred first
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(region, service)
);

-- KPIs Daily Table (for social proof)
CREATE TABLE IF NOT EXISTS kpis_daily (
  date DATE PRIMARY KEY DEFAULT CURRENT_DATE,
  matches_count INT DEFAULT 0,
  consultations_booked INT DEFAULT 0,
  quotes_sent INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON quote_requests(status);
CREATE INDEX IF NOT EXISTS idx_quote_requests_created ON quote_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_status ON consultation_requests(status);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_created ON consultation_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_company ON consultation_requests(target_company_id);
CREATE INDEX IF NOT EXISTS idx_routing_rules_active ON partner_routing_rules(active) WHERE active = TRUE;
CREATE INDEX IF NOT EXISTS idx_kpis_daily_date ON kpis_daily(date DESC);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_routing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpis_daily ENABLE ROW LEVEL SECURITY;

-- Allow anon users to insert their own requests
CREATE POLICY "Allow anon insert quote_requests" ON quote_requests
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon insert consultation_requests" ON consultation_requests
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow authenticated users to read all
CREATE POLICY "Allow authenticated read quote_requests" ON quote_requests
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated read consultation_requests" ON consultation_requests
  FOR SELECT TO authenticated
  USING (true);

-- Allow service role full access
CREATE POLICY "Allow service role all on quote_requests" ON quote_requests
  FOR ALL TO service_role
  USING (true);

CREATE POLICY "Allow service role all on consultation_requests" ON consultation_requests
  FOR ALL TO service_role
  USING (true);

CREATE POLICY "Allow service role all on partner_routing_rules" ON partner_routing_rules
  FOR ALL TO service_role
  USING (true);

CREATE POLICY "Allow service role all on kpis_daily" ON kpis_daily
  FOR ALL TO service_role
  USING (true);

-- Allow anon to read kpis for social proof
CREATE POLICY "Allow anon read kpis_daily" ON kpis_daily
  FOR SELECT TO anon
  USING (true);

-- Allow anon to read routing rules (for client-side filtering if needed)
CREATE POLICY "Allow anon read partner_routing_rules" ON partner_routing_rules
  FOR SELECT TO anon
  USING (active = true);

-- ============================================================================
-- Triggers for updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_quote_requests_updated_at BEFORE UPDATE ON quote_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultation_requests_updated_at BEFORE UPDATE ON consultation_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partner_routing_rules_updated_at BEFORE UPDATE ON partner_routing_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kpis_daily_updated_at BEFORE UPDATE ON kpis_daily
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Seed Data: Default Routing Rules
-- ============================================================================

INSERT INTO partner_routing_rules (region, service, partner_ids, active) VALUES
  ('zurich', 'home_search', ARRAY['prime-relocation', 'executive-relocation', 'connectiv-relocation'], true),
  ('zurich', 'permits', ARRAY['prime-relocation', 'anchor-relocation'], true),
  ('zurich', 'schools', ARRAY['prime-relocation', 'executive-relocation'], true),
  ('geneva', 'home_search', ARRAY['prime-relocation', 'executive-relocation'], true),
  ('geneva', 'permits', ARRAY['prime-relocation', 'anchor-relocation'], true),
  ('basel', 'home_search', ARRAY['prime-relocation', 'connectiv-relocation'], true),
  ('basel', 'permits', ARRAY['prime-relocation'], true),
  ('zug', 'home_search', ARRAY['prime-relocation', 'executive-relocation'], true),
  ('zug', 'permits', ARRAY['prime-relocation'], true),
  ('default', 'home_search', ARRAY['prime-relocation', 'executive-relocation', 'connectiv-relocation', 'anchor-relocation'], true),
  ('default', 'permits', ARRAY['prime-relocation', 'anchor-relocation'], true),
  ('default', 'schools', ARRAY['prime-relocation', 'executive-relocation'], true),
  ('default', 'temporary', ARRAY['prime-relocation', 'connectiv-relocation'], true),
  ('default', 'settling_in', ARRAY['prime-relocation', 'executive-relocation'], true),
  ('default', 'departure', ARRAY['prime-relocation'], true)
ON CONFLICT (region, service) DO NOTHING;

-- Initialize KPI data for current month
INSERT INTO kpis_daily (date, matches_count, consultations_booked, quotes_sent) VALUES
  (CURRENT_DATE, 12, 8, 45),
  (CURRENT_DATE - INTERVAL '1 day', 15, 10, 52),
  (CURRENT_DATE - INTERVAL '2 days', 18, 12, 61),
  (CURRENT_DATE - INTERVAL '3 days', 14, 9, 48),
  (CURRENT_DATE - INTERVAL '4 days', 16, 11, 55),
  (CURRENT_DATE - INTERVAL '5 days', 13, 7, 42),
  (CURRENT_DATE - INTERVAL '6 days', 11, 6, 38)
ON CONFLICT (date) DO NOTHING;

-- ============================================================================
-- Comments for Documentation
-- ============================================================================

COMMENT ON TABLE quote_requests IS 'Stores quote requests from users comparing multiple partners';
COMMENT ON TABLE consultation_requests IS 'Stores consultation booking requests with specific partners';
COMMENT ON TABLE partner_routing_rules IS 'Defines which partners receive leads based on region and service';
COMMENT ON TABLE kpis_daily IS 'Daily KPI metrics for social proof and analytics';

