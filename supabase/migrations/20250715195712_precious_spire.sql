/*
  # Complete KM Motos Database Schema

  1. New Tables
    - `addresses`: User addresses for delivery
    - `stores`: Physical store locations
    - `wholesaler_requests`: Requests to become wholesaler
    - `wholesaler_pricing`: Special pricing for wholesalers
    - `coupons`: Discount coupons system
    - `support_tickets`: Customer support system
    - `product_reviews`: Product reviews and ratings
    - `payment_methods`: Saved payment methods
    - `delivery_options`: Delivery and pickup options

  2. Enhanced Tables
    - Enhanced `profiles` with wholesaler fields
    - Enhanced `orders` with delivery and payment info
    - Enhanced `products` with reviews and ratings

  3. Security
    - Enable RLS on all tables
    - Add appropriate policies for each user type
*/

-- Addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT 'Casa',
  address_line_1 text NOT NULL,
  address_line_2 text,
  city text NOT NULL,
  state text,
  postal_code text,
  country text DEFAULT 'Honduras',
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Stores table
CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  phone text,
  latitude decimal,
  longitude decimal,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Wholesaler requests table
CREATE TABLE IF NOT EXISTS wholesaler_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  ruc text NOT NULL,
  business_address text NOT NULL,
  city text NOT NULL,
  reference text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  documents jsonb DEFAULT '[]',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Wholesaler pricing table
CREATE TABLE IF NOT EXISTS wholesaler_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id integer REFERENCES products(id) ON DELETE CASCADE,
  min_quantity integer NOT NULL DEFAULT 12,
  unit_price decimal NOT NULL,
  discount_percentage decimal DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  description text,
  discount_type text DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value decimal NOT NULL,
  min_order_amount decimal DEFAULT 0,
  max_uses integer,
  used_count integer DEFAULT 0,
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Product reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id integer REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  comment text,
  is_verified_purchase boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Payment methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('card', 'paypal', 'bank_transfer')),
  provider text,
  last_four text,
  cardholder_name text,
  expiry_month integer,
  expiry_year integer,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Delivery options table
CREATE TABLE IF NOT EXISTS delivery_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price decimal DEFAULT 0,
  estimated_days integer DEFAULT 5,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Add new columns to existing tables
DO $$
BEGIN
  -- Add wholesaler fields to profiles
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_wholesaler') THEN
    ALTER TABLE profiles ADD COLUMN is_wholesaler boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'business_name') THEN
    ALTER TABLE profiles ADD COLUMN business_name text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'ruc') THEN
    ALTER TABLE profiles ADD COLUMN ruc text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'document_id') THEN
    ALTER TABLE profiles ADD COLUMN document_id text;
  END IF;

  -- Add delivery and payment fields to orders
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'delivery_address_id') THEN
    ALTER TABLE orders ADD COLUMN delivery_address_id uuid REFERENCES addresses(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'delivery_option_id') THEN
    ALTER TABLE orders ADD COLUMN delivery_option_id uuid REFERENCES delivery_options(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payment_method') THEN
    ALTER TABLE orders ADD COLUMN payment_method text DEFAULT 'cash_on_delivery';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'delivery_fee') THEN
    ALTER TABLE orders ADD COLUMN delivery_fee decimal DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'coupon_code') THEN
    ALTER TABLE orders ADD COLUMN coupon_code text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'discount_amount') THEN
    ALTER TABLE orders ADD COLUMN discount_amount decimal DEFAULT 0;
  END IF;

  -- Add review fields to products
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'average_rating') THEN
    ALTER TABLE products ADD COLUMN average_rating decimal DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'review_count') THEN
    ALTER TABLE products ADD COLUMN review_count integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sizes') THEN
    ALTER TABLE products ADD COLUMN sizes jsonb DEFAULT '[]';
  END IF;
END $$;

-- Insert default data
INSERT INTO stores (name, address, city, phone) VALUES
  ('KM Motos Lima', 'Jr. Miguel Grau 129', 'Lima', '9400-1163'),
  ('KM Motos San Isidro', 'Av. Arequipa 1234', 'San Isidro', '9400-1164'),
  ('KM Motos Surco', 'Av. Primavera 567', 'Surco', '9400-1165')
ON CONFLICT DO NOTHING;

INSERT INTO delivery_options (name, description, price, estimated_days) VALUES
  ('Delivery Estándar', 'Entrega en 5 días hábiles', 0, 5),
  ('Delivery Express', 'Entrega en 2 días hábiles', 15, 2),
  ('Recojo en Tienda', 'Recoge tu pedido en cualquier tienda', 0, 1)
ON CONFLICT DO NOTHING;

-- Enable RLS on all tables
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE wholesaler_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE wholesaler_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_options ENABLE ROW LEVEL SECURITY;

-- RLS Policies for addresses
CREATE POLICY "Users can manage own addresses"
  ON addresses
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for stores (public read)
CREATE POLICY "Anyone can read stores"
  ON stores
  FOR SELECT
  TO public
  USING (is_active = true);

-- RLS Policies for wholesaler_requests
CREATE POLICY "Users can manage own wholesaler requests"
  ON wholesaler_requests
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for wholesaler_pricing (public read)
CREATE POLICY "Anyone can read wholesaler pricing"
  ON wholesaler_pricing
  FOR SELECT
  TO public
  USING (true);

-- RLS Policies for coupons (public read active coupons)
CREATE POLICY "Anyone can read active coupons"
  ON coupons
  FOR SELECT
  TO public
  USING (is_active = true AND (valid_until IS NULL OR valid_until > now()));

-- RLS Policies for support_tickets
CREATE POLICY "Users can manage own support tickets"
  ON support_tickets
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for product_reviews
CREATE POLICY "Anyone can read product reviews"
  ON product_reviews
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can manage own reviews"
  ON product_reviews
  FOR INSERT, UPDATE, DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for payment_methods
CREATE POLICY "Users can manage own payment methods"
  ON payment_methods
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for delivery_options (public read)
CREATE POLICY "Anyone can read delivery options"
  ON delivery_options
  FOR SELECT
  TO public
  USING (is_active = true);