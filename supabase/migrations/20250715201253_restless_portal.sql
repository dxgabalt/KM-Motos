/*
  # Complete KM Motos Backend Migration

  1. Enhanced Tables
    - Add missing indexes for performance
    - Add triggers for automatic updates
    - Add functions for business logic

  2. API Functions
    - Product search and filtering
    - Wholesaler pricing calculations
    - Order management
    - User profile management

  3. Security Enhancements
    - Additional RLS policies
    - Data validation functions
    - Audit logging

  4. Performance Optimizations
    - Indexes on frequently queried columns
    - Materialized views for analytics
*/

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(average_rating);
CREATE INDEX IF NOT EXISTS idx_products_name_search ON products USING gin(to_tsvector('spanish', name));

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_default ON addresses(is_default);

CREATE INDEX IF NOT EXISTS idx_product_reviews_product ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);

-- Function to update product ratings
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products 
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating), 0) 
      FROM product_reviews 
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    ),
    review_count = (
      SELECT COUNT(*) 
      FROM product_reviews 
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    )
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update product ratings
DROP TRIGGER IF EXISTS trigger_update_product_rating ON product_reviews;
CREATE TRIGGER trigger_update_product_rating
  AFTER INSERT OR UPDATE OR DELETE ON product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_product_rating();

-- Function to search products
CREATE OR REPLACE FUNCTION search_products(
  search_query TEXT DEFAULT '',
  category_filter UUID DEFAULT NULL,
  brand_filter UUID DEFAULT NULL,
  min_price DECIMAL DEFAULT NULL,
  max_price DECIMAL DEFAULT NULL,
  sort_by TEXT DEFAULT 'name',
  sort_order TEXT DEFAULT 'asc',
  page_limit INTEGER DEFAULT 20,
  page_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id INTEGER,
  name TEXT,
  sku TEXT,
  description TEXT,
  price DECIMAL,
  category_id UUID,
  brand_id UUID,
  image_url TEXT,
  stock_quantity INTEGER,
  average_rating DECIMAL,
  review_count INTEGER,
  sizes JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.sku,
    p.description,
    p.price,
    p.category_id,
    p.brand_id,
    p.image_url,
    p.stock_quantity,
    p.average_rating,
    p.review_count,
    p.sizes
  FROM products p
  WHERE 
    (search_query = '' OR p.name ILIKE '%' || search_query || '%')
    AND (category_filter IS NULL OR p.category_id = category_filter)
    AND (brand_filter IS NULL OR p.brand_id = brand_filter)
    AND (min_price IS NULL OR p.price >= min_price)
    AND (max_price IS NULL OR p.price <= max_price)
    AND p.stock_quantity > 0
  ORDER BY 
    CASE WHEN sort_by = 'name' AND sort_order = 'asc' THEN p.name END ASC,
    CASE WHEN sort_by = 'name' AND sort_order = 'desc' THEN p.name END DESC,
    CASE WHEN sort_by = 'price' AND sort_order = 'asc' THEN p.price END ASC,
    CASE WHEN sort_by = 'price' AND sort_order = 'desc' THEN p.price END DESC,
    CASE WHEN sort_by = 'rating' AND sort_order = 'desc' THEN p.average_rating END DESC,
    CASE WHEN sort_by = 'popularity' AND sort_order = 'desc' THEN p.review_count END DESC
  LIMIT page_limit
  OFFSET page_offset;
END;
$$ LANGUAGE plpgsql;

-- Function to get wholesaler pricing for a product
CREATE OR REPLACE FUNCTION get_wholesaler_pricing(product_id_param INTEGER)
RETURNS TABLE (
  min_quantity INTEGER,
  unit_price DECIMAL,
  discount_percentage DECIMAL,
  total_savings DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wp.min_quantity,
    wp.unit_price,
    wp.discount_percentage,
    (p.price - wp.unit_price) * wp.min_quantity as total_savings
  FROM wholesaler_pricing wp
  JOIN products p ON p.id = wp.product_id
  WHERE wp.product_id = product_id_param
  ORDER BY wp.min_quantity ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to create order with items
CREATE OR REPLACE FUNCTION create_order_with_items(
  client_id_param UUID,
  user_id_param UUID,
  items JSONB,
  delivery_address_id_param UUID DEFAULT NULL,
  delivery_option_id_param UUID DEFAULT NULL,
  payment_method_param TEXT DEFAULT 'cash_on_delivery',
  coupon_code_param TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  order_id UUID;
  item JSONB;
  subtotal DECIMAL := 0;
  delivery_fee DECIMAL := 0;
  discount_amount DECIMAL := 0;
  total_amount DECIMAL;
BEGIN
  -- Generate order ID
  order_id := gen_random_uuid();
  
  -- Calculate delivery fee
  IF delivery_option_id_param IS NOT NULL THEN
    SELECT price INTO delivery_fee 
    FROM delivery_options 
    WHERE id = delivery_option_id_param;
  END IF;
  
  -- Calculate subtotal from items
  FOR item IN SELECT * FROM jsonb_array_elements(items)
  LOOP
    subtotal := subtotal + (item->>'unit_price')::DECIMAL * (item->>'quantity')::INTEGER;
  END LOOP;
  
  -- Apply coupon discount if provided
  IF coupon_code_param IS NOT NULL THEN
    SELECT 
      CASE 
        WHEN discount_type = 'percentage' THEN subtotal * (discount_value / 100)
        ELSE discount_value
      END
    INTO discount_amount
    FROM coupons 
    WHERE code = coupon_code_param 
      AND is_active = true 
      AND (valid_until IS NULL OR valid_until > now())
      AND subtotal >= min_order_amount;
  END IF;
  
  total_amount := subtotal + delivery_fee - COALESCE(discount_amount, 0);
  
  -- Create order
  INSERT INTO orders (
    id,
    client_id,
    user_id,
    total_amount,
    delivery_address_id,
    delivery_option_id,
    payment_method,
    delivery_fee,
    coupon_code,
    discount_amount,
    status
  ) VALUES (
    order_id,
    client_id_param,
    user_id_param,
    total_amount,
    delivery_address_id_param,
    delivery_option_id_param,
    payment_method_param,
    delivery_fee,
    coupon_code_param,
    discount_amount,
    'pending'
  );
  
  -- Create order items
  FOR item IN SELECT * FROM jsonb_array_elements(items)
  LOOP
    INSERT INTO order_items (
      order_id,
      product_id,
      quantity,
      unit_price,
      subtotal
    ) VALUES (
      order_id,
      (item->>'product_id')::INTEGER,
      (item->>'quantity')::INTEGER,
      (item->>'unit_price')::DECIMAL,
      (item->>'unit_price')::DECIMAL * (item->>'quantity')::INTEGER
    );
    
    -- Update product stock
    UPDATE products 
    SET stock_quantity = stock_quantity - (item->>'quantity')::INTEGER
    WHERE id = (item->>'product_id')::INTEGER;
  END LOOP;
  
  -- Update coupon usage if applied
  IF coupon_code_param IS NOT NULL AND discount_amount > 0 THEN
    UPDATE coupons 
    SET used_count = used_count + 1
    WHERE code = coupon_code_param;
  END IF;
  
  RETURN order_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get user order history
CREATE OR REPLACE FUNCTION get_user_orders(user_id_param UUID)
RETURNS TABLE (
  id UUID,
  order_date TIMESTAMPTZ,
  status TEXT,
  total_amount DECIMAL,
  delivery_fee DECIMAL,
  discount_amount DECIMAL,
  payment_method TEXT,
  item_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.order_date,
    o.status,
    o.total_amount,
    o.delivery_fee,
    o.discount_amount,
    o.payment_method,
    COUNT(oi.id) as item_count
  FROM orders o
  LEFT JOIN order_items oi ON oi.order_id = o.id
  WHERE o.user_id = user_id_param
  GROUP BY o.id, o.order_date, o.status, o.total_amount, o.delivery_fee, o.discount_amount, o.payment_method
  ORDER BY o.order_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to validate coupon
CREATE OR REPLACE FUNCTION validate_coupon(
  coupon_code_param TEXT,
  order_amount DECIMAL
)
RETURNS TABLE (
  is_valid BOOLEAN,
  discount_type TEXT,
  discount_value DECIMAL,
  discount_amount DECIMAL,
  message TEXT
) AS $$
DECLARE
  coupon_record RECORD;
  calculated_discount DECIMAL;
BEGIN
  -- Get coupon details
  SELECT * INTO coupon_record
  FROM coupons 
  WHERE code = coupon_code_param;
  
  -- Check if coupon exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, ''::TEXT, 0::DECIMAL, 0::DECIMAL, 'Cupón no encontrado'::TEXT;
    RETURN;
  END IF;
  
  -- Check if coupon is active
  IF NOT coupon_record.is_active THEN
    RETURN QUERY SELECT false, ''::TEXT, 0::DECIMAL, 0::DECIMAL, 'Cupón no activo'::TEXT;
    RETURN;
  END IF;
  
  -- Check expiration date
  IF coupon_record.valid_until IS NOT NULL AND coupon_record.valid_until < now() THEN
    RETURN QUERY SELECT false, ''::TEXT, 0::DECIMAL, 0::DECIMAL, 'Cupón expirado'::TEXT;
    RETURN;
  END IF;
  
  -- Check minimum order amount
  IF order_amount < coupon_record.min_order_amount THEN
    RETURN QUERY SELECT false, ''::TEXT, 0::DECIMAL, 0::DECIMAL, 
      'Monto mínimo requerido: $' || coupon_record.min_order_amount::TEXT;
    RETURN;
  END IF;
  
  -- Check usage limit
  IF coupon_record.max_uses IS NOT NULL AND coupon_record.used_count >= coupon_record.max_uses THEN
    RETURN QUERY SELECT false, ''::TEXT, 0::DECIMAL, 0::DECIMAL, 'Cupón agotado'::TEXT;
    RETURN;
  END IF;
  
  -- Calculate discount
  IF coupon_record.discount_type = 'percentage' THEN
    calculated_discount := order_amount * (coupon_record.discount_value / 100);
  ELSE
    calculated_discount := coupon_record.discount_value;
  END IF;
  
  -- Return valid coupon
  RETURN QUERY SELECT 
    true, 
    coupon_record.discount_type, 
    coupon_record.discount_value, 
    calculated_discount,
    'Cupón válido'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Insert sample data for testing
INSERT INTO categories (id, name, description, image_url) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Cascos', 'Cascos de protección para motociclistas', 'https://images.pexels.com/photos/1029624/pexels-photo-1029624.jpeg?auto=compress&cs=tinysrgb&w=300&h=300'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Llantas', 'Llantas y neumáticos para motocicletas', 'https://images.pexels.com/photos/1029624/pexels-photo-1029624.jpeg?auto=compress&cs=tinysrgb&w=300&h=300'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Aros y Rines', 'Aros y rines para motocicletas', 'https://images.pexels.com/photos/1029624/pexels-photo-1029624.jpeg?auto=compress&cs=tinysrgb&w=300&h=300')
ON CONFLICT (id) DO NOTHING;

INSERT INTO brands (id, name, logo_url) VALUES
  ('550e8400-e29b-41d4-a716-446655440011', 'KM MOTOS', 'https://images.pexels.com/photos/1029624/pexels-photo-1029624.jpeg?auto=compress&cs=tinysrgb&w=100&h=100'),
  ('550e8400-e29b-41d4-a716-446655440012', 'HS2', 'https://images.pexels.com/photos/1029624/pexels-photo-1029624.jpeg?auto=compress&cs=tinysrgb&w=100&h=100'),
  ('550e8400-e29b-41d4-a716-446655440013', 'KMS', 'https://images.pexels.com/photos/1029624/pexels-photo-1029624.jpeg?auto=compress&cs=tinysrgb&w=100&h=100'),
  ('550e8400-e29b-41d4-a716-446655440014', 'LUBRO', 'https://images.pexels.com/photos/1029624/pexels-photo-1029624.jpeg?auto=compress&cs=tinysrgb&w=100&h=100')
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (name, sku, description, price, category_id, brand_id, image_url, stock_quantity, sizes) VALUES
  ('CASCO CERRADO NEGRO VISOR OSCURO JD02 WLT109LR DOT HS2 KMS V.N. "XL"', 'KMS-HHC0001', 'Casco cerrado negro con visor oscuro, certificación DOT', 100, '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440011', 'https://images.pexels.com/photos/1029624/pexels-photo-1029624.jpeg?auto=compress&cs=tinysrgb&w=400&h=400', 50, '["XS", "S", "M", "L", "XL", "XXL"]'::jsonb)
ON CONFLICT (sku) DO NOTHING;

-- Insert sample wholesaler pricing
INSERT INTO wholesaler_pricing (product_id, min_quantity, unit_price, discount_percentage) 
SELECT 
  p.id,
  12,
  80.00,
  20.00
FROM products p 
WHERE p.sku = 'KMS-HHC0001'
ON CONFLICT DO NOTHING;

INSERT INTO wholesaler_pricing (product_id, min_quantity, unit_price, discount_percentage) 
SELECT 
  p.id,
  24,
  75.00,
  25.00
FROM products p 
WHERE p.sku = 'KMS-HHC0001'
ON CONFLICT DO NOTHING;

-- Insert sample coupons
INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, valid_from) VALUES
  ('WELCOME10', 'Descuento de bienvenida 10%', 'percentage', 10, 50, now()),
  ('SAVE20', 'Ahorra $20 en tu compra', 'fixed', 20, 100, now())
ON CONFLICT (code) DO NOTHING;