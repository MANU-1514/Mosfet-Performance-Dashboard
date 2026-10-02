import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'YOUR_SUPABASE_URL' && 
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY'
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * SQL Schema Definitions for PostgreSQL / Supabase
 * Copy and run in Supabase SQL Editor to set up cloud database tables:
 */
export const SUPABASE_SQL_SCHEMA = `
-- 1. Simulation Results Table
CREATE TABLE IF NOT EXISTS simulation_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  input_voltage NUMERIC NOT NULL,
  output_voltage NUMERIC NOT NULL,
  load_current NUMERIC NOT NULL,
  switching_frequency NUMERIC NOT NULL,
  duty_cycle NUMERIC NOT NULL,
  conduction_loss NUMERIC NOT NULL,
  switching_loss NUMERIC NOT NULL,
  total_power_loss NUMERIC NOT NULL,
  efficiency NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Hardware Results Table (ThingSpeak Sync)
CREATE TABLE IF NOT EXISTS hardware_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_id BIGINT UNIQUE,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  power_loss NUMERIC,
  efficiency NUMERIC,
  temperature NUMERIC,
  battery_utilization NUMERIC,
  source TEXT DEFAULT 'thingspeak',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Comparison Results Table
CREATE TABLE IF NOT EXISTS comparison_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  sic_power_loss NUMERIC NOT NULL,
  si_power_loss NUMERIC NOT NULL,
  sic_efficiency NUMERIC NOT NULL,
  si_efficiency NUMERIC NOT NULL,
  power_loss_reduction NUMERIC NOT NULL,
  efficiency_improvement NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on timestamps for fast historical queries
CREATE INDEX IF NOT EXISTS idx_hardware_timestamp ON hardware_results(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_simulation_timestamp ON simulation_results(timestamp DESC);
`;
