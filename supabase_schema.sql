-- ================================================================
-- USER PROFILES
-- Automatically created when a user registers
-- ================================================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'cliente'
    CHECK (role IN ('admin', 'agente', 'cliente')),
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

CREATE POLICY "Usuários veem próprio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins e agentes veem todos os perfis" ON public.profiles;

CREATE POLICY "Admins e agentes veem todos os perfis"
  ON public.profiles FOR SELECT
  USING (public.get_current_user_role() IN ('admin', 'agente'));

CREATE POLICY "Usuários atualizam próprio perfil"
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
    COALESCE(new.raw_user_meta_data->>'role', 'cliente')
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

CREATE TABLE public.categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  cor TEXT DEFAULT '#6366f1',  -- badge color (hex)
  descricao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories: any authenticated user can read; only admins can create/edit
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Autenticados leem categorias"
  ON public.categorias FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins gerenciam categorias"
  ON public.categorias FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Initial categories
INSERT INTO public.categorias (nome, cor, descricao) VALUES
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
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'aberto'
    CHECK (status IN ('aberto', 'em_andamento', 'aguardando_cliente', 'resolvido', 'fechado')),
  prioridade TEXT NOT NULL DEFAULT 'media'
    CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente')),
  categoria_id UUID REFERENCES public.categorias(id),
  cliente_id UUID NOT NULL REFERENCES public.profiles(id),  -- who opened the ticket
  agente_id UUID REFERENCES public.profiles(id),            -- who is handling it
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- RLS on tickets (MOST IMPORTANT RULE IN THE SYSTEM)
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Customers see ONLY their own tickets
CREATE POLICY "Clientes veem somente seus tickets"
  ON public.tickets FOR SELECT
  USING (
    auth.uid() = cliente_id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'agente')
    )
  );

-- Customers create tickets (they themselves are the cliente_id)
CREATE POLICY "Clientes criam tickets"
  ON public.tickets FOR INSERT
  WITH CHECK (auth.uid() = cliente_id);

-- Admins and agents update tickets
CREATE POLICY "Admins e agentes atualizam tickets"
  ON public.tickets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'agente')
    )
  );

-- ================================================================
-- MESSAGES (CONVERSATION WITHIN EACH TICKET)
-- ================================================================

CREATE TABLE public.mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  autor_id UUID NOT NULL REFERENCES public.profiles(id),
  conteudo TEXT NOT NULL,
  interno BOOLEAN DEFAULT false,  -- true = internal note (agents only)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;

-- Ticket participants can see messages (customers cannot see internal notes)
CREATE POLICY "Veem mensagens do ticket"
  ON public.mensagens FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tickets t
      WHERE t.id = ticket_id AND (
        auth.uid() = t.cliente_id OR
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role IN ('admin', 'agente')
        )
      )
    ) AND (
      -- Customers cannot see internal notes
      interno = false OR
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'agente')
      )
    )
  );

-- Who can write messages on a ticket
CREATE POLICY "Participantes escrevem mensagens"
  ON public.mensagens FOR INSERT
  WITH CHECK (
    auth.uid() = autor_id AND
    EXISTS (
      SELECT 1 FROM public.tickets t
      WHERE t.id = ticket_id AND (
        auth.uid() = t.cliente_id OR
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role IN ('admin', 'agente')
        )
      )
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
