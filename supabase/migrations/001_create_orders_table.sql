-- Create orders table for payment processing
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price > 0),
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount > 0),
  shipping_cost DECIMAL(10,2) DEFAULT 0 CHECK (shipping_cost >= 0),
  commission_fee DECIMAL(10,2) NOT NULL CHECK (commission_fee >= 0),
  net_amount DECIMAL(10,2) NOT NULL CHECK (net_amount > 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled', 'disputed', 'refunded')),
  payment_intent_id TEXT UNIQUE,
  payment_method_id TEXT,
  shipping_address JSONB,
  tracking_number TEXT,
  estimated_delivery DATE,
  actual_delivery DATE,
  escrow_release_date TIMESTAMP WITH TIME ZONE,
  dispute_deadline TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_seller_id ON orders(seller_id);
CREATE INDEX idx_orders_product_id ON orders(product_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_intent_id ON orders(payment_intent_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (
    auth.uid() IN (
      (SELECT auth_id FROM users WHERE id = buyer_id),
      (SELECT auth_id FROM users WHERE id = seller_id)
    )
  );

CREATE POLICY "Users can create orders as buyers" ON orders
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT auth_id FROM users WHERE id = buyer_id)
  );

CREATE POLICY "Sellers can update their orders" ON orders
  FOR UPDATE USING (
    auth.uid() = (SELECT auth_id FROM users WHERE id = seller_id)
  );

CREATE POLICY "Admins can manage all orders" ON orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for orders table
CREATE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON orders 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate net amount
CREATE OR REPLACE FUNCTION calculate_net_amount()
RETURNS TRIGGER AS $$
BEGIN
  NEW.net_amount = NEW.total_amount - NEW.commission_fee;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically calculate net amount
CREATE TRIGGER calculate_net_amount_trigger
  BEFORE INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION calculate_net_amount();

-- Create function to set escrow and dispute dates
CREATE OR REPLACE FUNCTION set_escrow_dates()
RETURNS TRIGGER AS $$
BEGIN
  -- Set escrow release date to 7 days after delivery confirmation
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    NEW.escrow_release_date = NOW() + INTERVAL '7 days';
    NEW.dispute_deadline = NOW() + INTERVAL '14 days';
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to set escrow dates when order is delivered
CREATE TRIGGER set_escrow_dates_trigger
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_escrow_dates();
