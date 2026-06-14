-- ================================================================
-- USER PROFILES
-- Automatically created when a user registers
-- ================================================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'customer'
    CHECK (role IN ('admin', 'agent', 'customer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Helper function: reads the current user's role without triggering RLS (avoids infinite
-- recursion in policies that need to query profiles to check permissions)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- RLS: each user sees their own profile; admins see all
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins and agents see all profiles" ON public.profiles;

CREATE POLICY "Admins and agents see all profiles"
  ON public.profiles FOR SELECT
  USING (public.get_current_user_role() IN ('admin', 'agent'));

CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger: automatically creates a profile on user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'customer')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================================================
-- TICKET CATEGORIES
-- ================================================================

CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#6366f1',  -- badge color (hex)
  description TEXT,
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories: any authenticated user can read; only admins can create/edit
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users read categories"
  ON public.categories FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins manage categories"
  ON public.categories FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Initial categories
INSERT INTO public.categories (name, color, description) VALUES
  ('Technical Support', '#ef4444', 'Technical issues with the system'),
  ('Financial', '#f59e0b', 'Questions about billing and payments'),
  ('Commercial', '#10b981', 'New products and services'),
  ('Other', '#6366f1', 'Uncategorized topics');

-- ================================================================
-- TICKETS (SUPPORT CASES)
-- ================================================================

CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero SERIAL UNIQUE,             -- human-readable number: #1, #2, #3...
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'in_progress', 'waiting_for_customer', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category_id UUID REFERENCES public.categories(id),
  customer_id UUID NOT NULL REFERENCES public.profiles(id),  -- who opened the ticket
  agent_id UUID REFERENCES public.profiles(id),              -- who is handling it
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- RLS on tickets (MOST IMPORTANT RULE IN THE SYSTEM)
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Customers see ONLY their own tickets
CREATE POLICY "Customers see only their tickets"
  ON public.tickets FOR SELECT
  USING (
    auth.uid() = customer_id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'agent')
    )
  );

-- Customers create tickets (they themselves are the customer_id)
CREATE POLICY "Customers create tickets"
  ON public.tickets FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

-- Admins and agents update tickets
CREATE POLICY "Admins and agents update tickets"
  ON public.tickets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'agent')
    )
  );

-- ================================================================
-- MESSAGES (CONVERSATION WITHIN EACH TICKET)
-- ================================================================

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  content TEXT NOT NULL,
  internal BOOLEAN DEFAULT false,  -- true = internal note (agents only)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Ticket participants can see messages (customers cannot see internal notes)
CREATE POLICY "Ticket participants see messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tickets t
      WHERE t.id = ticket_id AND (
        auth.uid() = t.customer_id OR
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role IN ('admin', 'agent')
        )
      )
    ) AND (
      -- Customers cannot see internal notes
      internal = false OR
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'agent')
      )
    )
  );

-- Who can write messages on a ticket
CREATE POLICY "Ticket participants write messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM public.tickets t
      WHERE t.id = ticket_id AND (
        auth.uid() = t.customer_id OR
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role IN ('admin', 'agent')
        )
      )
    )
  );

-- ================================================================
-- TICKET EVENTS (AUDIT LOG)
-- ================================================================

CREATE TABLE public.ticket_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  event_type TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ticket_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and agents see ticket events"
  ON public.ticket_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'agent')
    )
  );

CREATE POLICY "Admins and agents insert ticket events"
  ON public.ticket_events FOR INSERT
  WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'agent')
    )
  );

-- ================================================================
-- FUNCTION TO AUTOMATICALLY UPDATE updated_at
-- ================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
