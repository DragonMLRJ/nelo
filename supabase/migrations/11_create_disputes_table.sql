-- Create disputes table
CREATE TABLE IF NOT EXISTS public.disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    seller_id UUID NOT NULL REFERENCES auth.users(id),
    reason TEXT NOT NULL CHECK (reason IN ('item_not_received', 'not_as_described', 'other')),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'seller_replied', 'resolved_refund', 'resolved_no_refund', 'escalated')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create dispute_messages table
CREATE TABLE IF NOT EXISTS public.dispute_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispute_id UUID NOT NULL REFERENCES public.disputes(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id),
    message TEXT NOT NULL,
    attachment_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for disputes
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view disputes they are involved in"
ON public.disputes FOR SELECT
USING (auth.uid() = created_by OR auth.uid() = seller_id);

CREATE POLICY "Users can create disputes for their orders"
ON public.disputes FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update disputes they are involved in"
ON public.disputes FOR UPDATE
USING (auth.uid() = created_by OR auth.uid() = seller_id);

-- RLS Policies for dispute_messages
ALTER TABLE public.dispute_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages for their disputes"
ON public.dispute_messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.disputes
        WHERE disputes.id = dispute_messages.dispute_id
        AND (disputes.created_by = auth.uid() OR disputes.seller_id = auth.uid())
    )
);

CREATE POLICY "Users can send messages to their disputes"
ON public.dispute_messages FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.disputes
        WHERE disputes.id = dispute_messages.dispute_id
        AND (disputes.created_by = auth.uid() OR disputes.seller_id = auth.uid())
    )
    AND auth.uid() = sender_id
);
