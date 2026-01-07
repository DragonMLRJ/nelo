-- 1. Create CONVERSATIONS Table (UUID)
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  participant1_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant2_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id bigint REFERENCES public.products(id) ON DELETE SET NULL,
  last_message_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(participant1_id, participant2_id, product_id)
);

-- Trigger for updated_at
CREATE TRIGGER handle_updated_at_conversations
BEFORE UPDATE ON public.conversations
FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);

-- RLS for Conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
-- Users can see conversations they are part of
CREATE POLICY "Users can view their conversations" ON public.conversations
FOR ALL USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- 2. Create MESSAGES Table (UUID)
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  attachment_url text,
  attachment_type text,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
-- Users can see messages in their conversations
CREATE POLICY "Users can view messages in their conversations" ON public.messages
FOR SELECT USING (
  exists (
    select 1 from public.conversations 
    where id = messages.conversation_id 
    and (participant1_id = auth.uid() or participant2_id = auth.uid())
  )
);
-- Users can insert messages if they are the sender
CREATE POLICY "Users can send messages" ON public.messages
FOR INSERT WITH CHECK (auth.uid() = sender_id);
-- Users can update (mark as read) if they are receiver
CREATE POLICY "Users can update received messages" ON public.messages
FOR UPDATE USING (auth.uid() = receiver_id);

-- 3. Enable Realtime for New Tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
