-- Create orders and escrow system
-- This migration creates the orders table and escrow functionality for secure B2B transactions

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price > 0),
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount > 0),
    shipping_cost DECIMAL(10,2) DEFAULT 0 CHECK (shipping_cost >= 0),
    commission_fee DECIMAL(10,2) NOT NULL CHECK (commission_fee >= 0),
    net_amount DECIMAL(10,2) NOT NULL CHECK (net_amount > 0),
    shipping_address JSONB NOT NULL,
    payment_intent_id TEXT UNIQUE,
    payment_method_id TEXT,
    order_status TEXT NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled', 'disputed', 'refunded')),
    escrow_status TEXT DEFAULT 'pending' CHECK (escrow_status IN ('pending', 'held', 'released', 'refunded', 'disputed')),
    escrow_release_date TIMESTAMPTZ,
    delivery_confirmation_date TIMESTAMPTZ,
    dispute_deadline TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create escrow_transactions table for tracking escrow movements
CREATE TABLE IF NOT EXISTS public.escrow_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('hold', 'release', 'refund', 'dispute')),
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    stripe_transfer_id TEXT,
    stripe_refund_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    reason TEXT,
    processed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- Create disputes table for handling order disputes
CREATE TABLE IF NOT EXISTS public.disputes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    complainant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    respondent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    description TEXT NOT NULL,
    evidence JSONB DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'closed')),
    resolution TEXT,
    resolved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON public.orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON public.orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_escrow_status ON public.orders(escrow_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_intent_id ON public.orders(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);

CREATE INDEX IF NOT EXISTS idx_escrow_transactions_order_id ON public.escrow_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_type ON public.escrow_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_status ON public.escrow_transactions(status);

CREATE INDEX IF NOT EXISTS idx_disputes_order_id ON public.disputes(order_id);
CREATE INDEX IF NOT EXISTS idx_disputes_complainant_id ON public.disputes(complainant_id);
CREATE INDEX IF NOT EXISTS idx_disputes_respondent_id ON public.disputes(respondent_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON public.disputes(status);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for orders
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
CREATE POLICY "Users can create orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
CREATE POLICY "Users can update their own orders" ON public.orders
    FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Admin policies for orders
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders" ON public.orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;
CREATE POLICY "Admins can update all orders" ON public.orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Create RLS policies for escrow_transactions
DROP POLICY IF EXISTS "Users can view escrow transactions for their orders" ON public.escrow_transactions;
CREATE POLICY "Users can view escrow transactions for their orders" ON public.escrow_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE id = order_id 
            AND (buyer_id = auth.uid() OR seller_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "System can create escrow transactions" ON public.escrow_transactions;
CREATE POLICY "System can create escrow transactions" ON public.escrow_transactions
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage escrow transactions" ON public.escrow_transactions;
CREATE POLICY "Admins can manage escrow transactions" ON public.escrow_transactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Create RLS policies for disputes
DROP POLICY IF EXISTS "Users can view disputes they're involved in" ON public.disputes;
CREATE POLICY "Users can view disputes they're involved in" ON public.disputes
    FOR SELECT USING (auth.uid() = complainant_id OR auth.uid() = respondent_id);

DROP POLICY IF EXISTS "Users can create disputes" ON public.disputes;
CREATE POLICY "Users can create disputes" ON public.disputes
    FOR INSERT WITH CHECK (auth.uid() = complainant_id);

DROP POLICY IF EXISTS "Users can update disputes they're involved in" ON public.disputes;
CREATE POLICY "Users can update disputes they're involved in" ON public.disputes
    FOR UPDATE USING (auth.uid() = complainant_id OR auth.uid() = respondent_id);

DROP POLICY IF EXISTS "Admins can manage all disputes" ON public.disputes;
CREATE POLICY "Admins can manage all disputes" ON public.disputes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_orders_updated_at();

CREATE OR REPLACE FUNCTION update_disputes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_disputes_updated_at ON public.disputes;
CREATE TRIGGER update_disputes_updated_at
    BEFORE UPDATE ON public.disputes
    FOR EACH ROW
    EXECUTE FUNCTION update_disputes_updated_at();

-- Create function to calculate escrow release date
CREATE OR REPLACE FUNCTION calculate_escrow_release_date(order_date TIMESTAMPTZ)
RETURNS TIMESTAMPTZ AS $$
BEGIN
    -- Release funds 7 days after order creation (configurable)
    RETURN order_date + INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate dispute deadline
CREATE OR REPLACE FUNCTION calculate_dispute_deadline(order_date TIMESTAMPTZ)
RETURNS TIMESTAMPTZ AS $$
BEGIN
    -- Disputes must be filed within 14 days of order creation
    RETURN order_date + INTERVAL '14 days';
END;
$$ LANGUAGE plpgsql;

-- Create function to automatically set escrow dates when order is created
CREATE OR REPLACE FUNCTION set_escrow_dates()
RETURNS TRIGGER AS $$
BEGIN
    NEW.escrow_release_date = calculate_escrow_release_date(NEW.created_at);
    NEW.dispute_deadline = calculate_dispute_deadline(NEW.created_at);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_escrow_dates_trigger ON public.orders;
CREATE TRIGGER set_escrow_dates_trigger
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION set_escrow_dates();

-- Create function to handle order status updates
CREATE OR REPLACE FUNCTION handle_order_status_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Update escrow status based on order status
    IF NEW.order_status = 'paid' AND OLD.order_status = 'pending' THEN
        NEW.escrow_status = 'held';
    ELSIF NEW.order_status = 'delivered' AND OLD.order_status = 'shipped' THEN
        NEW.escrow_status = 'released';
        NEW.delivery_confirmation_date = NOW();
    ELSIF NEW.order_status = 'disputed' THEN
        NEW.escrow_status = 'disputed';
    ELSIF NEW.order_status = 'refunded' THEN
        NEW.escrow_status = 'refunded';
    ELSIF NEW.order_status = 'cancelled' AND OLD.order_status = 'pending' THEN
        NEW.escrow_status = 'refunded';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS handle_order_status_update_trigger ON public.orders;
CREATE TRIGGER handle_order_status_update_trigger
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    WHEN (OLD.order_status IS DISTINCT FROM NEW.order_status)
    EXECUTE FUNCTION handle_order_status_update();

-- Create function to get order statistics for admin
CREATE OR REPLACE FUNCTION get_order_stats()
RETURNS TABLE (
    total_orders BIGINT,
    total_revenue DECIMAL(10,2),
    total_commission DECIMAL(10,2),
    orders_by_status JSONB,
    escrow_by_status JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(SUM(commission_fee), 0) as total_commission,
        jsonb_object_agg(order_status, count) as orders_by_status,
        jsonb_object_agg(escrow_status, count) as escrow_by_status
    FROM (
        SELECT 
            order_status, 
            escrow_status,
            COUNT(*) as count
        FROM public.orders
        GROUP BY order_status, escrow_status
    ) status_counts;
END;
$$ LANGUAGE plpgsql;

-- Create function to get seller earnings
CREATE OR REPLACE FUNCTION get_seller_earnings(seller_uuid UUID)
RETURNS TABLE (
    total_orders BIGINT,
    total_revenue DECIMAL(10,2),
    total_commission DECIMAL(10,2),
    net_earnings DECIMAL(10,2),
    pending_earnings DECIMAL(10,2),
    released_earnings DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(SUM(commission_fee), 0) as total_commission,
        COALESCE(SUM(net_amount), 0) as net_earnings,
        COALESCE(SUM(net_amount) FILTER (WHERE escrow_status = 'held'), 0) as pending_earnings,
        COALESCE(SUM(net_amount) FILTER (WHERE escrow_status = 'released'), 0) as released_earnings
    FROM public.orders
    WHERE seller_id = seller_uuid;
END;
$$ LANGUAGE plpgsql;

-- Create function to get buyer order history
CREATE OR REPLACE FUNCTION get_buyer_orders(buyer_uuid UUID)
RETURNS TABLE (
    order_id UUID,
    product_title TEXT,
    seller_name TEXT,
    quantity INTEGER,
    total_amount DECIMAL(10,2),
    order_status TEXT,
    escrow_status TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id as order_id,
        p.title as product_title,
        u.full_name as seller_name,
        o.quantity,
        o.total_amount,
        o.order_status,
        o.escrow_status,
        o.created_at
    FROM public.orders o
    JOIN public.products p ON o.product_id = p.id
    JOIN auth.users u ON o.seller_id = u.id
    WHERE o.buyer_id = buyer_uuid
    ORDER BY o.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Update notifications table to include order types
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('message', 'review', 'listing_update', 'admin_alert', 'system', 'order_update', 'dispute_update', 'order', 'payment', 'escrow'));

-- Create notification triggers for orders
CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER AS $$
DECLARE
    product_title TEXT;
    buyer_name TEXT;
BEGIN
    -- Get product title
    SELECT title INTO product_title
    FROM public.products
    WHERE id = NEW.product_id;
    
    -- Get buyer name
    SELECT full_name INTO buyer_name
    FROM auth.users
    WHERE id = NEW.buyer_id;
    
    -- Notify seller
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (
        NEW.seller_id,
        'order',
        'New Order Received',
        buyer_name || ' placed an order for ' || NEW.quantity || ' units of ' || product_title,
        jsonb_build_object(
            'order_id', NEW.id,
            'product_id', NEW.product_id,
            'buyer_id', NEW.buyer_id,
            'quantity', NEW.quantity,
            'total_amount', NEW.total_amount
        )
    );
    
    -- Notify buyer
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (
        NEW.buyer_id,
        'order',
        'Order Confirmed',
        'Your order for ' || product_title || ' has been confirmed',
        jsonb_build_object(
            'order_id', NEW.id,
            'product_id', NEW.product_id,
            'seller_id', NEW.seller_id,
            'quantity', NEW.quantity,
            'total_amount', NEW.total_amount
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notify_new_order_trigger ON public.orders;
CREATE TRIGGER notify_new_order_trigger
    AFTER INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_order();

-- Create notification trigger for escrow releases
CREATE OR REPLACE FUNCTION notify_escrow_release()
RETURNS TRIGGER AS $$
DECLARE
    product_title TEXT;
BEGIN
    -- Only notify on escrow release
    IF NEW.escrow_status = 'released' AND OLD.escrow_status = 'held' THEN
        -- Get product title
        SELECT title INTO product_title
        FROM public.products
        WHERE id = NEW.product_id;
        
        -- Notify seller
        INSERT INTO public.notifications (user_id, type, title, message, data)
        VALUES (
            NEW.seller_id,
            'escrow',
            'Payment Released',
            'Your payment for ' || product_title || ' has been released from escrow',
            jsonb_build_object(
                'order_id', NEW.id,
                'product_id', NEW.product_id,
                'amount', NEW.net_amount
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notify_escrow_release_trigger ON public.orders;
CREATE TRIGGER notify_escrow_release_trigger
    AFTER UPDATE ON public.orders
    FOR EACH ROW
    WHEN (OLD.escrow_status IS DISTINCT FROM NEW.escrow_status)
    EXECUTE FUNCTION notify_escrow_release();

