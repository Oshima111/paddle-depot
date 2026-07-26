-- Run this SQL in your Supabase Dashboard SQL Editor
-- This adds product options columns to the existing products table

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS has_options BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sizes JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS colors JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS shapes JSONB NOT NULL DEFAULT '[]'::jsonb;


