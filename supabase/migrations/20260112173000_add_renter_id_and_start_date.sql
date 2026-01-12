-- Migration: Add Renter ID and Rental Start Date to Orders
-- Created: 2026-01-12

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS renter_id_url text,
ADD COLUMN IF NOT EXISTS rental_start_date timestamptz;
