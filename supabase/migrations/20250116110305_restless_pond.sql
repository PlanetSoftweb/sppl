/*
  # Hostel Management System Schema

  1. New Tables
    - `hostels`
      - `id` (uuid, primary key)
      - `name` (text)
      - `total_students` (integer)
      - `password` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `teams`
      - `id` (uuid, primary key)
      - `hostel_id` (uuid, foreign key)
      - `sport` (text)
      - `max_players` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `players`
      - `id` (uuid, primary key)
      - `team_id` (uuid, foreign key)
      - `name` (text)
      - `role` (text)
      - `jersey_number` (integer)
      - `photo_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create hostel table
CREATE TABLE IF NOT EXISTS hostels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  total_students integer NOT NULL DEFAULT 0,
  password text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id uuid REFERENCES hostels(id) ON DELETE CASCADE,
  sport text NOT NULL CHECK (sport IN ('cricket', 'volleyball', 'kabaddi')),
  max_players integer NOT NULL DEFAULT 15,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL,
  jersey_number integer NOT NULL,
  photo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(team_id, jersey_number)
);

-- Enable RLS
ALTER TABLE hostels ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read hostels"
  ON hostels
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert hostels"
  ON hostels
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read teams"
  ON teams
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert teams"
  ON teams
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read players"
  ON players
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert players"
  ON players
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating timestamps
CREATE TRIGGER update_hostels_updated_at
  BEFORE UPDATE ON hostels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();