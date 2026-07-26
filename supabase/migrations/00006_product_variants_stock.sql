-- Add stock_status column to product_variants table
-- Each variant can have its own stock status independent of the parent product
-- Existing variants default to 'In Stock'

ALTER TABLE product_variants
  ADD COLUMN IF NOT EXISTS stock_status TEXT NOT NULL DEFAULT 'In Stock'
  CHECK (stock_status IN ('In Stock', 'Low Stock', 'Out of Stock'));

-- Update existing rows that may have been created before this migration
UPDATE product_variants SET stock_status = 'In Stock' WHERE stock_status IS NULL;
