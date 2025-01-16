/*
  # Sports Event Management System Schema

  1. New Tables
    - hostels
      - Basic hostel information
    - teams
      - Sports teams for each hostel
    - volunteers
      - Event volunteer information
    - revenues
      - Revenue tracking for events

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create hostels table
CREATE TABLE IF NOT EXISTS hostels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  warden_name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id UUID REFERENCES hostels(id),
  sport TEXT NOT NULL CHECK (sport IN ('VOLLEYBALL', 'KABADDI', 'CRICKET')),
  captain_name TEXT NOT NULL,
  team_size INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create volunteers table
CREATE TABLE IF NOT EXISTS volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  email TEXT NOT NULL,
  assigned_sport TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create revenues table
CREATE TABLE IF NOT EXISTS revenues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('TICKET_SALES', 'SPONSORSHIP', 'OTHER')),
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE hostels ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenues ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read access to all authenticated users for hostels"
  ON hostels FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read access to all authenticated users for teams"
  ON teams FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read access to all authenticated users for volunteers"
  ON volunteers FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read access to all authenticated users for revenues"
  ON revenues FOR SELECT TO authenticated USING (true);

-- Add policies for insert/update/delete (restricted to admin role)
CREATE POLICY "Allow full access to admin users for hostels"
  ON hostels FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow full access to admin users for teams"
  ON teams FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow full access to admin users for volunteers"
  ON volunteers FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow full access to admin users for revenues"
  ON revenues FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');