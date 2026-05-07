-- Migration: Add real-time location columns to batches table
-- Description: Enables the batches table to store the latest known GPS coordinates and location name
-- for high-performance global fleet tracking without expensive history joins.

ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS latitude FLOAT8;
ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS longitude FLOAT8;
ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS last_location TEXT;

-- Index for spatial queries (optional but recommended for large datasets)
CREATE INDEX IF NOT EXISTS idx_batches_location ON public.batches(latitude, longitude) WHERE latitude IS NOT NULL;

-- Enable real-time for these columns
-- (Assuming real-time is already enabled for the batches table)
