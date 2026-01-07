-- Create CONVERSATIONS Table
CREATE TABLE public.conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  participant1_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  participant2_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id bigint REFERENCES public.products(id) ON DELETE SET NULL,
  last_message_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(participant1_id, participant2_id, product_id)
);

-- Index for fast lookup of user's conversations
CREATE INDEX idx_conversations_p1 ON public.conversations(participant1_id);
CREATE INDEX idx_conversations_p2 ON public.conversations(participant2_id);
CREATE INDEX idx_conversations_updated ON public.conversations(last_message_at DESC);

-- Trigger for updated_at on conversations
CREATE TRIGGER handle_updated_at_conversations
BEFORE UPDATE ON public.conversations
FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);

-- Update MESSAGES Table (if not already compatible)
-- We need to link messages to conversations
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE;

-- If messages table uses bigint ID, we might want to keep it or switch to UUID. 
-- For consistency with new tables often UUID is better, but let's stick to existing schema if possible to minimize migration pain.
-- However, strict foreign key to conversation (UUID) is needed.

-- RLS POLICIES (Enable Row Level Security)

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policies for Conversations
CREATE POLICY "Users can view their own conversations"
ON public.conversations FOR SELECT
USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

CREATE POLICY "Users can insert conversations they are part of"
ON public.conversations FOR INSERT
WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);

CREATE POLICY "Users can update their own conversations"
ON public.conversations FOR UPDATE
USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- Policies for Messages
CREATE POLICY "Users can view messages in their conversations"
ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
    AND (c.participant1_id = auth.uid() OR c.participant2_id = auth.uid())
  )
);

CREATE POLICY "Users can insert messages into their conversations"
ON public.messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
    AND (c.participant1_id = auth.uid() OR c.participant2_id = auth.uid())
  )
);

-- REALTIME SETUP
-- Enable Realtime for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
