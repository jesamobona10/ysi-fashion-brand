-- ============================================
-- Module: Pre-Order System
-- Adds: pre-order fields to products,
--       order_type to orders,
--       pre_order_notify trigger
-- ============================================

-- 1. PRODUCTS: add pre-order columns
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS pre_order_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS pre_order_release_date timestamptz,
  ADD COLUMN IF NOT EXISTS pre_order_deposit numeric(12,2);

-- 2. ORDERS: add order_type and pre_order_release_date
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS order_type text DEFAULT 'standard'
    CHECK (order_type IN ('standard', 'pre_order')),
  ADD COLUMN IF NOT EXISTS pre_order_release_date timestamptz;

-- 3. NOTIFICATIONS: add pre_order_available type
ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_type_check
    CHECK (type IN (
      'order_update', 'low_stock', 'inventory_alert',
      'review_moderation', 'marketing', 'pre_order_available'
    ));

-- 4. FUNCTION: notify on pre-order stock arrival
CREATE OR REPLACE FUNCTION public.notify_pre_order_available()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  pre_order_record RECORD;
BEGIN
  IF NEW.pre_order_enabled
     AND OLD.pre_order_enabled = NEW.pre_order_enabled
     AND OLD.stock_qty <= 0
     AND NEW.stock_qty > 0
     AND NEW.pre_order_release_date <= now()
  THEN
    FOR pre_order_record IN
      SELECT DISTINCT o.customer_id
      FROM public.orders o
      WHERE o.order_type = 'pre_order'
        AND o.status NOT IN ('cancelled', 'refunded')
        AND EXISTS (
          SELECT 1 FROM public.order_items oi
          WHERE oi.order_id = o.id
            AND oi.product_id = NEW.id
        )
    LOOP
      INSERT INTO public.notifications (user_id, type, title, body, data)
      VALUES (
        pre_order_record.customer_id,
        'pre_order_available',
        'Your pre-order is now available',
        format('"%s" is now in stock and ready for fulfillment.', NEW.name),
        jsonb_build_object(
          'product_id', NEW.id,
          'order_type', 'pre_order',
          'product_name', NEW.name,
          'product_slug', NEW.slug
        )
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

-- 5. TRIGGER: fire when pre-ordered product stock becomes positive
DROP TRIGGER IF EXISTS trigger_pre_order_available ON public.products;
CREATE TRIGGER trigger_pre_order_available
  AFTER UPDATE OF stock_qty ON public.products
  FOR EACH ROW
  WHEN (NEW.pre_order_enabled = true)
  EXECUTE FUNCTION public.notify_pre_order_available();

-- 6. INDEX: for pre-order admin queries
CREATE INDEX IF NOT EXISTS idx_orders_order_type ON public.orders(order_type);
CREATE INDEX IF NOT EXISTS idx_products_pre_order ON public.products(pre_order_enabled)
  WHERE pre_order_enabled = true;
