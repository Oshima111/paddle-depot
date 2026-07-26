-- Add product options columns to the products table
-- has_options: enables/disables the Product Options container
-- sizes: JSONB array of available size options (e.g. ["16mm", "14mm"])
-- colors: JSONB array of color objects { name: string, image: string }
-- shapes: JSONB array of available shape options (e.g. ["Elongated", "Hybrid", "Widebody"])

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS has_options BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sizes JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS colors JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS shapes JSONB NOT NULL DEFAULT '[]'::jsonb;

