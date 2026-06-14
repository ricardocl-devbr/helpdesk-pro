-- ================================================================
-- PERFIS DE USUÁRIO
-- Criado automaticamente quando um usuário se registra
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

-- Função auxiliar: lê o role do usuário atual sem acionar RLS (evita recursão infinita
-- nas policies que precisam consultar profiles para verificar permissões)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- RLS: cada usuário vê seu perfil; admins veem todos
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem próprio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins e agentes veem todos os perfis"
  ON public.profiles FOR SELECT
  USING (public.get_current_user_role() IN ('admin', 'agente'));

CREATE POLICY "Usuários atualizam próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger: cria perfil automaticamente ao registrar
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
-- CATEGORIAS DE TICKET
-- ================================================================

CREATE TABLE public.categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  cor TEXT DEFAULT '#6366f1',  -- cor para badge (hex)
  descricao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categorias: qualquer autenticado lê; somente admin cria/edita
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Autenticados leem categorias"
  ON public.categorias FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins gerenciam categorias"
  ON public.categorias FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Categorias iniciais
INSERT INTO public.categorias (nome, cor, descricao) VALUES
  ('Suporte Técnico', '#ef4444', 'Problemas técnicos com o sistema'),
  ('Financeiro', '#f59e0b', 'Dúvidas sobre cobranças e pagamentos'),
  ('Comercial', '#10b981', 'Novos produtos e serviços'),
  ('Outros', '#6366f1', 'Assuntos não categorizados');

-- ================================================================
-- TICKETS (OS CHAMADOS)
-- ================================================================

CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero SERIAL UNIQUE,             -- número legível: #1, #2, #3...
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'aberto'
    CHECK (status IN ('aberto', 'em_andamento', 'aguardando_cliente', 'resolvido', 'fechado')),
  prioridade TEXT NOT NULL DEFAULT 'media'
    CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente')),
  categoria_id UUID REFERENCES public.categorias(id),
  cliente_id UUID NOT NULL REFERENCES public.profiles(id),  -- quem abriu
  agente_id UUID REFERENCES public.profiles(id),            -- quem está atendendo
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- RLS nos tickets (REGRA MAIS IMPORTANTE DO SISTEMA)
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Clientes veem SOMENTE seus tickets
CREATE POLICY "Clientes veem somente seus tickets"
  ON public.tickets FOR SELECT
  USING (
    auth.uid() = cliente_id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'agente')
    )
  );

-- Clientes criam tickets (eles mesmos são o cliente_id)
CREATE POLICY "Clientes criam tickets"
  ON public.tickets FOR INSERT
  WITH CHECK (auth.uid() = cliente_id);

-- Admins e agentes atualizam tickets
CREATE POLICY "Admins e agentes atualizam tickets"
  ON public.tickets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'agente')
    )
  );

-- ================================================================
-- MENSAGENS (CONVERSA DENTRO DE CADA TICKET)
-- ================================================================

CREATE TABLE public.mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  autor_id UUID NOT NULL REFERENCES public.profiles(id),
  conteudo TEXT NOT NULL,
  interno BOOLEAN DEFAULT false,  -- true = nota interna (somente agentes)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;

-- Participantes do ticket veem as mensagens (exceto notas internas para clientes)
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
      -- Clientes não veem notas internas
      interno = false OR
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'agente')
      )
    )
  );

-- Quem pode escrever mensagens no ticket
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
-- FUNÇÃO PARA ATUALIZAR updated_at AUTOMATICAMENTE
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