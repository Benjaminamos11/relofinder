/*
  # Add Analytics and Admin Features

  1. New Tables
    - `page_views` - Track page views and analytics
    - `company_analytics` - Store company-specific analytics
    - `admin_settings` - Store admin configuration
    
  2. Security
    - Enable RLS on all tables
    - Add policies for admin access
    - Add policies for company access to their own analytics
*/

-- Create page_views table
CREATE TABLE IF NOT EXISTS page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  company_id uuid REFERENCES relocators(id),
  referrer text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Create company_analytics table
CREATE TABLE IF NOT EXISTS company_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES relocators(id) NOT NULL,
  views_count integer DEFAULT 0,
  contact_form_submissions integer DEFAULT 0,
  last_updated timestamptz DEFAULT now()
);

-- Create admin_settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Admin policies
CREATE POLICY "Admin users can do everything on page_views"
  ON page_views
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

CREATE POLICY "Admin users can do everything on company_analytics"
  ON company_analytics
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

CREATE POLICY "Admin users can do everything on admin_settings"
  ON admin_settings
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

-- Company policies
CREATE POLICY "Companies can view their own analytics"
  ON company_analytics
  FOR SELECT
  TO authenticated
  USING (company_id IN (
    SELECT id FROM relocators WHERE internal_email = auth.email()
  ));