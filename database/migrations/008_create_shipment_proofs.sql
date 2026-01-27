-- Migration: Add Shipment Proofs Table and Update Orders Table
-- Description: Implements mandatory proof of shipment and delivery system
-- Created: 2026-01-26

-- Create shipment_proofs table
CREATE TABLE IF NOT EXISTS shipment_proofs (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  proof_type VARCHAR(20) NOT NULL CHECK (proof_type IN ('shipment', 'delivery')),
  submitted_by INTEGER NOT NULL REFERENCES profiles(id),
  proof_method VARCHAR(50) NOT NULL, -- 'photo', 'tracking_number', 'signature', 'receipt'
  proof_data JSONB NOT NULL, -- Flexible storage: tracking_number, carrier, description, etc.
  file_url TEXT, -- URL to uploaded file (photo, PDF, etc.)
  notes TEXT,
  submitted_at TIMESTAMP DEFAULT NOW(),
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP,
  verified_by INTEGER REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_shipment_proofs_order ON shipment_proofs(order_id);
CREATE INDEX IF NOT EXISTS idx_shipment_proofs_type ON shipment_proofs(proof_type);
CREATE INDEX IF NOT EXISTS idx_shipment_proofs_submitted_by ON shipment_proofs(submitted_by);

-- Add proof tracking columns to orders table
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS shipment_proof_required BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS shipment_proof_submitted BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS shipment_proof_submitted_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS delivery_proof_required BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS delivery_proof_submitted BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS delivery_proof_submitted_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS proof_validation_status VARCHAR(20) DEFAULT 'pending' 
    CHECK (proof_validation_status IN ('pending', 'shipment_pending', 'delivery_pending', 'validated', 'disputed'));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_shipment_proof_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_update_shipment_proof_timestamp
  BEFORE UPDATE ON shipment_proofs
  FOR EACH ROW
  EXECUTE FUNCTION update_shipment_proof_updated_at();

-- Add comments for documentation
COMMENT ON TABLE shipment_proofs IS 'Stores proof of shipment and delivery for orders';
COMMENT ON COLUMN shipment_proofs.proof_type IS 'Type of proof: shipment (seller) or delivery (buyer)';
COMMENT ON COLUMN shipment_proofs.proof_method IS 'Method used: photo, tracking_number, signature, or receipt';
COMMENT ON COLUMN shipment_proofs.proof_data IS 'JSON data containing proof details (tracking number, carrier, etc.)';
COMMENT ON COLUMN orders.proof_validation_status IS 'Overall validation status of order proofs';
