# Curso: Portfólio do Zero
### Projeto: **HelpDesk Pro** — Sistema de Suporte ao Cliente

> Stack: Next.js 15 · TypeScript · Supabase · Tailwind CSS · shadcn/ui · React Query · Stripe · OpenAI

---

## Por que esse projeto?

Um sistema de suporte/tickets é perfeito para portfólio porque:
- Tem **múltiplos papéis de usuário** (admin, agente, cliente) — demonstra RBAC
- Tem **isolamento de dados por cliente** (RLS) — demonstra segurança real
- Tem **fluxo de status** (aberto → em andamento → resolvido) — demonstra lógica de negócio
- Tem **dashboard com métricas** — demonstra visualização de dados
- É **muito pedido no Upwork** — pequenas empresas precisam disso o tempo todo
- Pode ter **IA** (categorização automática) e **Stripe** (planos) — diferencial premium

Ao terminar o curso, você vai ter um produto que qualquer empresa real poderia usar.

---

## Visão Geral do Curso

| Módulo | O que você constrói | Quando |
|---|---|---|
| **M1 — Fundação** | Setup, banco, auth, layout, primeira página | **Este fim de semana** |
| **M2 — Core CRUD** | Criar/editar/fechar tickets, dashboard de métricas | Semana 1 |
| **M3 — UI Profissional** | Design system, componentes, responsividade | Semana 1-2 |
| **M4 — Dados Avançados** | React Query, filtros, busca, paginação, exportação | Semana 2 |
| **M5 — IA** | Categorização automática, sugestão de respostas | Semana 3 |
| **M6 — Stripe** | Planos de assinatura, limite de tickets por plano | Semana 3-4 |
| **M7 — Portfólio** | Deploy profissional, README, como apresentar no Upwork | Semana 4 |

---

---

# ANTES DE COMEÇAR
# Como se Comunicar com a IA de Forma Eficiente

> Leia isso antes do Módulo 1. É a coisa mais importante do curso.

---

## O Problema que você vai evitar

Nos seus documentos de versão do SGSTEC, um padrão aparece com frequência:

```
Pedido → IA implementa → Não funcionou → Pedido de correção →
Correção parcial → Novo pedido → Funcionou parcialmente →
Outro pedido → Finalmente funcionou
```

Isso é normal. Mas dá para reduzir muito esse ciclo com prompts melhores.

---

## Os 4 Elementos de um Prompt Técnico Perfeito

### Elemento 1: CONTEXTO (onde e o que é)
```
Arquivo: src/app/tickets/page.tsx
Componente: TicketList
Tecnologia: Next.js App Router com TypeScript e Supabase
```

### Elemento 2: OBJETIVO (o que deve funcionar)
```
Quero que a lista de tickets mostre somente os tickets do usuário logado,
ordenados pelo mais recente primeiro, com paginação de 10 por página.
```

### Elemento 3: REFERÊNCIA (onde tem algo parecido já funcionando)
```
A busca de dados de usuário em src/app/perfil/page.tsx já funciona com Supabase.
Use a mesma estrutura de busca.
```

### Elemento 4: RESTRIÇÕES (o que não pode mudar)
```
Não altere o schema do banco.
Não mude o layout existente.
Mantenha o TypeScript estrito (sem 'any').
```

---

## Os 5 Tipos de Prompt que você vai usar

### Tipo 1: Iniciar uma Feature Nova
```
PROJETO: HelpDesk Pro (Next.js 15, TypeScript, Supabase, Tailwind, shadcn/ui)
CONTEXTO: [cole o trecho do ARCHITECTURE.md relevante]
OBJETIVO: Implementar [feature] que deve [comportamento exato]
ARQUIVOS A CRIAR/MODIFICAR: [liste os arquivos]
NÃO ALTERE: [liste o que deve ficar intacto]
```

### Tipo 2: Corrigir um Bug
```
ARQUIVO: [caminho exato]
ERRO: [mensagem de erro completa do terminal ou console]
O QUE EU FIZ: [ação que causou o erro]
O QUE ACONTECEU: [comportamento errado]
O QUE DEVERIA ACONTECER: [comportamento esperado]
SUSPEITA: [se você tiver alguma ideia do problema]
```

### Tipo 3: Pedir Explicação
```
No arquivo [arquivo], na função [função]:
[cole o trecho de código]
O que esse código faz exatamente?
Por que foi feito dessa forma e não de [alternativa]?
```

### Tipo 4: Pedir Revisão
```
Acabei de implementar [feature]. 
Revise o arquivo [arquivo] e me diga:
1. Tem algum problema de segurança?
2. Tem algum problema de performance?
3. O TypeScript está sendo usado corretamente?
4. Há algo que poderia ser feito de forma mais simples?
```

### Tipo 5: Continuar onde parou (nova conversa)
```
CONTEXTO DO PROJETO (do ARCHITECTURE.md):
[cole o conteúdo do ARCHITECTURE.md]

ESTADO ATUAL:
- Implementei: [o que já está pronto]
- Funcionando: [o que já foi testado]
- Próximo passo: [o que quero fazer agora]

TAREFA: [o que você quer fazer]
```

---

## Dica de Ouro: Mantenha o ARCHITECTURE.md atualizado

Toda vez que você implementar algo novo, peça ao Antigravity:
> "Atualize o ARCHITECTURE.md para refletir o que acabou de ser implementado."

Esse arquivo vira o seu "contexto permanente" — você cola ele no início de qualquer nova conversa e a IA já sabe tudo sobre o projeto.

---

---

# MÓDULO 1
# Fundação — Do Zero ao Sistema Funcionando

**Período: Este fim de semana**

**Objetivo do fim de semana:**
- Sexta à noite (2h): Setup completo, banco configurado
- Sábado (4-5h): Autenticação, layout, primeiras páginas
- Domingo (3-4h): Dashboard funcional com dados reais + deploy no Vercel

**O que você vai ter no final:**
✅ Projeto no GitHub
✅ Sistema deployado no Vercel com URL pública
✅ Login funcionando com 3 tipos de usuário (admin, agente, cliente)
✅ Dashboard com cards de métricas
✅ Primeira funcionalidade real (criar e listar tickets)

---

## 1.0 — Ferramentas: Instale o que falta

### 🛠️ Verifique o que você já tem

No terminal do VS Code, verifique cada um:

```bash
node --version    # precisa ser 18.0+
git --version     # já tem
```

Se `node --version` mostrar versão abaixo de 18:
- Acesse [nodejs.org](https://nodejs.org) → baixe a versão LTS

### 🛠️ Instale o VS Code Extensions (se ainda não tiver)

No VS Code → Extensions (Ctrl+Shift+X), instale:
- **ESLint** — sublinha erros de código
- **Prettier** — formata código automaticamente
- **Tailwind CSS IntelliSense** — autocompletar de classes Tailwind
- **TypeScript Error Translator** — explica erros do TypeScript em linguagem humana

### 🛠️ Configure o terminal do VS Code para PowerShell

No VS Code → Settings → procure "terminal.integrated.defaultProfile.windows" → selecione "PowerShell"

---

## 1.1 — Crie o Projeto Next.js

### 🛠️ Abra o terminal do VS Code e execute

```bash
# Vá para a pasta onde ficam seus projetos
cd c:\dev

# Crie o projeto (isso leva 2-3 minutos)
npx create-next-app@latest helpdesk-pro --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

### 📺 O instalador vai perguntar uma coisa só

```
Would you like to use Turbopack for `next dev`? › Yes
```

Responda: **Yes**

### 🛠️ Abra o projeto no VS Code

```bash
cd helpdesk-pro
code .
```

O VS Code vai abrir uma nova janela com o projeto.

### 🛠️ Rode o projeto para ver que funciona

```bash
npm run dev
```

Acesse `localhost:3000`. Você vê a página padrão do Next.js com os logos.

### 📺 Observe a estrutura criada

```
helpdesk-pro/
├── src/
│   └── app/
│       ├── layout.tsx     ← HTML base de toda a aplicação
│       ├── page.tsx       ← Página da rota /
│       └── globals.css    ← Estilos globais
├── public/                ← Imagens e arquivos estáticos
├── next.config.ts         ← Configuração do Next.js
├── tailwind.config.ts     ← Configuração do Tailwind
└── tsconfig.json          ← Configuração do TypeScript
```

### 🛠️ Configure o Git logo no início

```bash
# O projeto já vem com git init. Faça o primeiro commit:
git add .
git commit -m "chore: initial Next.js setup"
```

---

## 1.2 — Instale as Dependências

### 🛠️ Instale tudo de uma vez

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install @tanstack/react-query @tanstack/react-query-devtools
npm install lucide-react
npm install clsx tailwind-merge
```

### 💡 O que cada pacote faz

| Pacote | Para que serve |
|---|---|
| `@supabase/supabase-js` | Conectar ao banco e autenticação |
| `@supabase/ssr` | Versão do Supabase para Next.js (server-side) |
| `@tanstack/react-query` | Cache automático de dados |
| `lucide-react` | Ícones (os mesmos que você usa no SGSTEC) |
| `clsx` + `tailwind-merge` | Utilitários para combinar classes CSS |

### 🛠️ Instale o shadcn/ui (biblioteca de componentes)

```bash
npx shadcn@latest init
```

### 📺 O shadcn vai perguntar algumas coisas

```
Which style would you like to use? › Default
Which color would you like to use as base color? › Slate
Would you like to use CSS variables for colors? › yes
```

### 💡 O que é o shadcn/ui

É uma biblioteca de componentes prontos (botões, tabelas, modais, forms) que você instala **no seu projeto** — não é uma dependência externa. Os componentes ficam em `src/components/ui/` e você pode modificar à vontade.

### 🛠️ Instale os componentes que vai usar

```bash
npx shadcn@latest add button card badge input label textarea select
npx shadcn@latest add table dialog dropdown-menu avatar
npx shadcn@latest add toast alert separator skeleton
```

### 📺 Observe

Veja a pasta `src/components/ui/` — ela foi criada com os componentes. São arquivos normais TypeScript que você pode abrir e ler.

---

## 1.3 — Configure o Supabase

### 🛠️ Crie o projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) → **New Project**
2. Nome: `helpdesk-pro`
3. Senha do banco: anote em lugar seguro
4. Região: East US (ou a mais próxima disponível)
5. Aguarde ~2 minutos

### 🛠️ Pegue as credenciais

No projeto Supabase → **Project Settings → API**:
- Copie: **Project URL** (algo como `https://xxxxx.supabase.co`)
- Copie: **anon public** key

### 🛠️ Crie o arquivo de variáveis de ambiente

Na raiz do projeto `helpdesk-pro`, crie o arquivo `.env.local`:

```bash
# Cole suas credenciais reais aqui
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

> ⚠️ O `.env.local` já está no `.gitignore` — nunca vai para o GitHub. Correto.

---

## 1.4 — Configure o Supabase no Código

### 🛠️ No Antigravity, use este prompt exato:

```
PROJETO: HelpDesk Pro — Next.js 15 com App Router, TypeScript, Supabase

TAREFA: Configure o cliente Supabase para o projeto. Crie:

1. src/lib/supabase/client.ts
   - Exporta função createBrowserClient()
   - Usa @supabase/ssr
   - Para uso em componentes com 'use client'

2. src/lib/supabase/server.ts
   - Exporta função createServerClient()
   - Usa @supabase/ssr com cookies do Next.js
   - Para uso em Server Components e Route Handlers
   - Deve ser async (usar await cookies())

3. src/middleware.ts (na raiz de src/, não dentro de app/)
   - Atualiza a sessão do Supabase em cada requisição
   - Redireciona para /login se não autenticado e tentar acessar /dashboard ou qualquer rota protegida
   - Permite acesso livre a: /, /login, /registro, /api/auth

Use as variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.
Use o padrão oficial do Supabase para Next.js App Router com @supabase/ssr.
```

### 📺 Observe os 3 arquivos criados

Abra cada um e leia. Preste atenção em:
- `client.ts`: usa `createBrowserClient` — roda no browser
- `server.ts`: usa `createServerClient` com `cookies()` — roda no servidor
- `middleware.ts`: intercepta TODAS as requisições antes de chegar nas páginas

### 💡 Por que dois clientes diferentes?

No browser (componentes com `'use client'`), o Supabase lê a sessão do localStorage/cookies do browser.

No servidor (Server Components), não há browser — o Supabase precisa ler os cookies da requisição HTTP.

O `@supabase/ssr` cuida dessa diferença automaticamente.

---

## 1.5 — Crie o Schema do Banco de Dados

### 💡 Pense no banco antes de escrever código

**Quem usa o sistema?**
- `admin` — vê tudo, configura o sistema
- `agente` — responde tickets atribuídos a ele
- `cliente` — abre tickets, vê somente os seus

**Quais dados existem?**
- `profiles` — perfil de cada usuário (nome, role, avatar)
- `tickets` — os chamados (título, descrição, status, prioridade)
- `mensagens` — a conversa dentro de cada ticket
- `categorias` — tipos de problema (técnico, financeiro, comercial)

### 🛠️ Acesse o SQL Editor no Supabase

No projeto `helpdesk-pro` no Supabase → **SQL Editor → New Query**

Cole e execute o SQL abaixo **em partes** (execute um bloco por vez para identificar erros facilmente):

---

**Parte 1: Tabela de Perfis (rode isso primeiro)**

```sql
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

-- RLS: cada usuário vê seu perfil; admins veem todos
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem próprio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins e agentes veem todos os perfis"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'agente')
    )
  );

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
```

**Verificação:** Vá em Table Editor → você deve ver a tabela `profiles`.

---

**Parte 2: Categorias e Tickets**

```sql
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
```

**Verificação:** Table Editor → você deve ver `categorias` e `tickets`.

---

**Parte 3: Mensagens**

```sql
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
```

### 📺 Verifique no Table Editor

Você deve ver 4 tabelas: `profiles`, `categorias`, `tickets`, `mensagens`.
As 4 categorias iniciais já apareceram em `categorias`.

### 🛠️ Salve o schema no projeto

Crie `helpdesk-pro/supabase_schema.sql` e cole todo o SQL acima nele. Commite:

```bash
git add .
git commit -m "chore: add Supabase schema"
```

---

## 1.6 — Crie os Tipos TypeScript

### 🛠️ No Antigravity, use este prompt:

```
PROJETO: HelpDesk Pro — Next.js 15, TypeScript, Supabase

TAREFA: Crie o arquivo src/types/index.ts com os tipos TypeScript
correspondentes ao schema do banco abaixo.

SCHEMA:
- profiles: id(UUID), email, full_name, avatar_url, role('admin'|'agente'|'cliente'), created_at, updated_at
- categorias: id(UUID), nome, cor, descricao, created_at
- tickets: id(UUID), numero(number), titulo, descricao, 
  status('aberto'|'em_andamento'|'aguardando_cliente'|'resolvido'|'fechado'),
  prioridade('baixa'|'media'|'alta'|'urgente'),
  categoria_id(UUID), cliente_id(UUID), agente_id(UUID|null),
  created_at, updated_at, resolved_at(null|timestamp)
- mensagens: id(UUID), ticket_id(UUID), autor_id(UUID), 
  conteudo, interno(boolean), created_at

TAMBÉM CRIE:
- Tipo TicketComDetalhes: ticket + categoria (objeto aninhado) + 
  cliente (objeto Profile aninhado) + agente (Profile|null aninhado)
- Tipo MensagemComAutor: mensagem + autor (Profile aninhado)
- Tipo StatusTicket e PrioridadeTicket como union types
- Tipo DashboardStats: { total: number, abertos: number, em_andamento: number, resolvidos: number, tempo_medio_resposta: number }

Use apenas tipos e interfaces TypeScript nativos, sem bibliotecas externas.
```

---

## 1.7 — Crie o Design System e Utilitários

### 🛠️ No Antigravity:

```
PROJETO: HelpDesk Pro — Next.js 15, TypeScript, Tailwind

TAREFA: Crie os seguintes arquivos utilitários:

1. src/lib/utils.ts
   - Função cn() que combina clsx e tailwind-merge (para combinar classes CSS)
   - Função formatarData(date: string): string — formata para "12 jun. 2026 às 14:30"
   - Função formatarDataRelativa(date: string): string — "há 2 horas", "há 3 dias"
   - Função formatarNumeroTicket(numero: number): string — "#0042"

2. src/lib/constants.ts
   - Objeto STATUS_LABELS: mapeia status do banco para texto PT-BR e cor Tailwind
     (ex: aberto → { label: 'Aberto', color: 'bg-blue-500', textColor: 'text-blue-700' })
   - Objeto PRIORIDADE_LABELS: similar para prioridades
   - Array MENU_ITEMS com as rotas do sidebar por role

NÃO crie componentes ainda, apenas os utilitários.
```

---

## 1.8 — Crie o Layout Base

### 🛠️ Primeiro, substitua o CSS global

Abra `src/app/globals.css` e **substitua todo o conteúdo** por:

```css
@import "tailwindcss";

@layer base {
  :root {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
    --radius: 0.5rem;
  }
}

@layer base {
  * { @apply border-border; }
  body {
    @apply bg-background text-foreground;
    font-family: 'Inter', sans-serif;
  }
}
```

### 🛠️ Atualize o layout raiz

Abra `src/app/layout.tsx` e **substitua** com:

```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'HelpDesk Pro',
  description: 'Sistema profissional de suporte ao cliente',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
```

---

## 1.9 — Crie as Páginas de Autenticação

### 🛠️ No Antigravity:

```
PROJETO: HelpDesk Pro — Next.js 15, TypeScript, Supabase, Tailwind, shadcn/ui

TAREFA: Crie as páginas de autenticação. Leia os arquivos abaixo para entender o contexto:
- src/lib/supabase/client.ts (cliente Supabase para browser)
- src/types/index.ts (tipos TypeScript)

CRIE:
1. src/app/login/page.tsx
   - Formulário: email + senha + botão "Entrar"
   - Link "Não tem conta? Registre-se" → /registro
   - Usa Supabase Auth (signInWithPassword)
   - Redireciona para /dashboard após login com sucesso
   - Mostra erro inline se credenciais erradas
   - Design: tema escuro, logo "HP" no topo, card centralizado na tela

2. src/app/registro/page.tsx  
   - Formulário: nome completo + email + senha + confirmar senha + tipo de conta (cliente/agente)
   - Usa Supabase Auth (signUp) com metadata {full_name, role}
   - Redireciona para /dashboard após registro
   - Validação: senhas iguais, mínimo 6 caracteres
   - Design: mesmo estilo do login

NÃO crie a lógica server-side ainda, use apenas o cliente browser com 'use client'.
Use os componentes do shadcn/ui (Button, Input, Label, Card).
```

### 📺 Teste as páginas

```bash
npm run dev
```

Acesse `localhost:3000/login` e `localhost:3000/registro`. As páginas devem aparecer com design escuro.

### 🛠️ Crie um usuário de teste

1. Acesse `localhost:3000/registro`
2. Registre-se como admin: seu e-mail, senha, selecione "agente"
3. No Supabase → Authentication → Users — você deve ver o usuário criado
4. No Table Editor → profiles — você deve ver o perfil criado automaticamente pelo trigger

### 🛠️ Mude o usuário para admin

No Supabase → SQL Editor:
```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'seu-email@aqui.com';
```

---

## 1.10 — Crie o Layout do Dashboard (Sidebar + Header)

### 🛠️ No Antigravity:

```
PROJETO: HelpDesk Pro — Next.js 15, TypeScript, Supabase, Tailwind, shadcn/ui

CONTEXTO DOS ARQUIVOS:
- src/lib/supabase/server.ts — cliente Supabase para servidor
- src/lib/constants.ts — MENU_ITEMS com rotas por role
- src/types/index.ts — tipo Profile

TAREFA: Crie o layout do dashboard. Leia todos os arquivos existentes primeiro.

CRIE:
1. src/app/(dashboard)/layout.tsx
   - Layout com sidebar fixa na esquerda + área de conteúdo à direita
   - Server Component: busca o perfil do usuário logado via Supabase server
   - Se não autenticado, redireciona para /login
   - Passa o profile como prop para os componentes filhos

2. src/components/layout/Sidebar.tsx (com 'use client')
   - Logo "HelpDesk Pro" no topo com ícone
   - Links de navegação filtrados pela role do usuário (use MENU_ITEMS)
   - Link ativo destacado visualmente
   - Avatar do usuário + nome + role no rodapé
   - Botão de logout que chama Supabase signOut e redireciona para /login
   - Design: fundo slate-900, largura 240px, bordas arredondadas nos links

3. src/components/layout/Header.tsx (com 'use client')
   - Título da página atual (baseado na rota)
   - Botão de criar novo ticket (somente para role 'cliente')
   - Indicador de notificações (badge com número — por enquanto estático)

USE o Route Group (dashboard) com os parênteses para o grupo de rotas protegidas.
Use os tipos do TypeScript de src/types/index.ts.
```

### 📺 Observe a estrutura de pastas criada

```
src/app/
├── (dashboard)/          ← Route Group (não aparece na URL)
│   ├── layout.tsx        ← Layout do dashboard
│   └── dashboard/
│       └── page.tsx      ← Rota: /dashboard
├── login/
│   └── page.tsx
├── registro/
│   └── page.tsx
└── layout.tsx            ← Layout raiz
```

### 📺 Teste o redirect

Acesse `localhost:3000`. O middleware deve redirecionar para `/login`.
Faça login. Deve ir para `/dashboard`.

---

## 1.11 — Crie o Dashboard com Métricas Reais

### 🛠️ No Antigravity:

```
PROJETO: HelpDesk Pro — Next.js 15, TypeScript, Supabase

CONTEXTO: Leia estes arquivos:
- src/lib/supabase/server.ts
- src/types/index.ts (tipo DashboardStats)
- src/lib/utils.ts (formatarData, formatarNumeroTicket)
- src/lib/constants.ts (STATUS_LABELS, PRIORIDADE_LABELS)

TAREFA: Crie o dashboard principal.

1. src/app/(dashboard)/dashboard/page.tsx (Server Component)
   - Busca estatísticas do banco:
     * Total de tickets
     * Tickets por status (aberto, em_andamento, resolvido)
     * Tickets criados nos últimos 7 dias
     * Tickets abertos há mais de 48h sem resposta (urgentes)
   - Para role 'cliente': mostra SOMENTE os tickets do próprio cliente
   - Para role 'admin'/'agente': mostra dados globais
   - Passa os dados como props para componentes client

2. src/components/dashboard/StatsCards.tsx (com 'use client')
   - 4 cards de métricas: Total | Abertos | Em Andamento | Resolvidos
   - Cada card tem: ícone (lucide-react) + número grande + label + variação (ex: "+3 hoje")
   - Design: fundo slate-800, border sutil, hover com elevação

3. src/components/dashboard/TicketsRecentes.tsx (com 'use client')
   - Tabela com os 5 tickets mais recentes
   - Colunas: #número | Título | Status (badge colorido) | Prioridade | Data
   - Linha clicável que vai para /tickets/[id]
   - Se não tem tickets: empty state com ícone e mensagem "Nenhum ticket ainda"

USE os componentes shadcn/ui (Card, Badge, Table).
USE as funções de formatação de src/lib/utils.ts.
USE as cores de STATUS_LABELS e PRIORIDADE_LABELS de constants.ts.
```

### 📺 Observe o resultado

Acesse `localhost:3000/dashboard`. Você deve ver:
- 4 cards de métricas (com zeros por enquanto — ainda não tem tickets)
- Tabela de tickets recentes com o empty state

---

## 1.12 — Crie a Página de Tickets (Lista e Criação)

### 🛠️ No Antigravity:

```
PROJETO: HelpDesk Pro — Next.js 15, TypeScript, Supabase

CONTEXTO: Leia todos os arquivos existentes em src/. Preste atenção especial em:
- src/types/index.ts
- src/lib/constants.ts (STATUS_LABELS, PRIORIDADE_LABELS)
- src/lib/supabase/server.ts e client.ts

TAREFA: Crie o sistema de tickets.

1. src/app/(dashboard)/tickets/page.tsx (Server Component)
   - Busca tickets do banco (respeitando RLS — cliente vê só seus tickets)
   - Faz JOIN com categorias e profiles (cliente e agente)
   - Aceita query params: ?status=aberto&prioridade=alta&busca=texto
   - Passa dados para componente client

2. src/components/tickets/TicketList.tsx (com 'use client')
   - Lista de tickets com cards (não tabela desta vez)
   - Cada card mostra: #número, título, status (badge), prioridade (badge colorido),
     categoria, nome do cliente, data de abertura, agente atribuído (ou "Sem agente")
   - Filtros na barra superior: Status | Prioridade | busca por texto
   - Mudança de filtro atualiza a URL (useRouter e useSearchParams)
   - Botão "Novo Ticket" no canto superior direito (somente para clientes)

3. src/app/(dashboard)/tickets/novo/page.tsx (com 'use client')
   - Formulário para criar ticket:
     * Título (input texto)
     * Categoria (select com as categorias do banco)
     * Prioridade (select: baixa/média/alta/urgente)
     * Descrição (textarea grande)
     * Botão Enviar
   - Ao enviar: insere no banco com cliente_id = usuário logado
   - Após criar: redireciona para /tickets/[id] do ticket criado
   - Usa o cliente browser (createBrowserClient)

USE os componentes shadcn/ui.
USE os tipos TypeScript corretos.
Implemente tratamento de erros com mensagens visíveis ao usuário.
```

### 🛠️ Teste criando um ticket

1. Acesse `localhost:3000/tickets/novo`
2. Preencha o formulário e envie
3. Você deve ser redirecionado para a página do ticket criado
4. Volte ao dashboard — o contador deve mostrar 1 ticket

### 📺 Observe no Supabase

Table Editor → `tickets`. Você vê o ticket criado com o `cliente_id` correto.

---

## 1.13 — Crie a Página de Detalhes do Ticket

### 🛠️ No Antigravity:

```
PROJETO: HelpDesk Pro — Next.js 15, TypeScript, Supabase

CONTEXTO: Leia todos os arquivos existentes em src/.

TAREFA: Crie a página de detalhes e conversa do ticket.

1. src/app/(dashboard)/tickets/[id]/page.tsx (Server Component)
   - Busca o ticket pelo ID com JOIN em profiles (cliente, agente) e categorias
   - Busca todas as mensagens com JOIN no autor (profiles)
   - Se o ticket não existe ou usuário não tem acesso: redireciona para /tickets
   - Passa dados para componentes client

2. src/components/tickets/TicketHeader.tsx (com 'use client')
   - Mostra: #número, título, badges de status e prioridade, categoria
   - Para admin/agente: dropdown para mudar status e atribuir agente
   - Data de abertura e tempo aberto (ex: "Aberto há 2 dias")

3. src/components/tickets/ConversaTicket.tsx (com 'use client')
   - Lista as mensagens cronologicamente
   - Cada mensagem: avatar + nome + data + conteúdo
   - Mensagens do cliente: alinhadas à esquerda, fundo slate-700
   - Mensagens do agente: alinhadas à direita, fundo blue-900
   - Notas internas (interno=true): fundo amarelo discreto, visíveis só p/ agentes
   - Campo de resposta no final:
     * Textarea para digitar a resposta
     * Para agente/admin: checkbox "Nota interna"
     * Botão "Enviar Resposta"
   - Ao enviar: insere mensagem no banco e atualiza a lista sem recarregar a página

USE useOptimistic do React para atualização imediata da lista ao enviar mensagem.
USE os tipos TypeScript de src/types/index.ts.
```

### 📺 Teste o fluxo completo

1. Acesse a página do ticket criado
2. Escreva uma mensagem e envie
3. No Supabase → `mensagens` → você vê a mensagem
4. Mude o status do ticket para "em_andamento"
5. No Supabase → `tickets` → o status foi atualizado

---

## 1.14 — Configure o React Query

### 🛠️ No Antigravity:

```
PROJETO: HelpDesk Pro — Next.js 15, TypeScript

TAREFA: Configure o React Query (TanStack Query) no projeto.

1. Crie src/providers/QueryProvider.tsx (com 'use client')
   - Cria o QueryClient com staleTime de 60 segundos
   - Exporta o componente QueryProvider que envolve os children com QueryClientProvider
   - Inclui ReactQueryDevtools somente em development

2. Atualize src/app/layout.tsx
   - Importe e use o QueryProvider envolvendo o {children}

NÃO precisa converter as páginas existentes para usar useQuery agora.
Apenas configure o provider para estar disponível quando precisar.
```

---

## 1.15 — Prepare para o Deploy

### 🛠️ Crie o README.md profissional

```bash
# No Antigravity:
```

```
PROJETO: HelpDesk Pro — Next.js 15, TypeScript, Supabase

TAREFA: Crie um README.md profissional em inglês para o repositório GitHub.

O README deve ter:
1. Badge de status (deployed on Vercel)
2. Screenshot placeholder (escreva: [screenshot coming soon])
3. Descrição do projeto em 2-3 parágrafos
4. Lista de features implementadas com emojis
5. Stack tecnológico com links
6. Seção "Getting Started" com instruções de instalação:
   - Clone the repo
   - npm install
   - Set up .env.local (com as variáveis necessárias)
   - Run Supabase schema (link para supabase_schema.sql)
   - npm run dev
7. Seção de variáveis de ambiente necessárias
8. Seção "Architecture" com diagrama em ASCII
9. Licença MIT

Escreva em inglês profissional. O readme deve impressionar clientes no Upwork.
```

### 🛠️ Faça o commit final e push

```bash
git add .
git commit -m "feat: complete helpdesk MVP with auth, dashboard, and tickets"
git push origin main
```

> Se ainda não tiver o repositório no GitHub:
> No GitHub → New Repository → "helpdesk-pro" → siga as instruções de push

---

## 1.16 — Deploy no Vercel

### 🛠️ Deploy

1. Acesse [vercel.com](https://vercel.com) → **Add New → Project**
2. Importe o repositório `helpdesk-pro` do GitHub
3. Vercel detecta Next.js automaticamente
4. **IMPORTANTE — Adicione as variáveis de ambiente:**
   - `NEXT_PUBLIC_SUPABASE_URL` → sua URL do Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → sua chave anon

5. Clique em **Deploy**

### 📺 Aguarde o deploy (~2 minutos)

A Vercel vai mostrar uma URL pública. Teste:
- Login funciona?
- Criar ticket funciona?
- O RLS está funcionando? (logue como um segundo usuário)

### 🛠️ Configure o Supabase para aceitar o domínio do Vercel

No Supabase → **Authentication → URL Configuration**:
- **Site URL**: `https://helpdesk-pro-xxx.vercel.app` (sua URL da Vercel)
- **Redirect URLs**: adicione `https://helpdesk-pro-xxx.vercel.app/**`

---

## 1.17 — Teste o RLS com dois usuários

### 🛠️ Teste de segurança real

1. Registre um segundo usuário no sistema (`/registro`) como "cliente"
2. No Supabase → SQL Editor, faça esse segundo usuário criar um ticket:
   ```sql
   -- Você vai usar a interface web mesmo
   ```
3. Entre com o primeiro usuário (admin)
4. Admin vê os tickets dos dois usuários? Deve ver.
5. Entre com o segundo usuário
6. Ele vê os tickets do primeiro usuário? **Não deve ver.**

### 📺 Se o RLS estiver funcionando

Cada usuário vê somente o que deveria ver — sem nenhuma lógica no frontend para isso. O banco rejeita a query automaticamente.

💡 **Isso é o que você vai mostrar no Upwork:** "Implementei Row Level Security no Supabase, garantindo que dados de um cliente nunca sejam visíveis para outro, independentemente de bugs no frontend."

---

## Revisão do Fim de Semana

### ✅ O que você construiu

- **Projeto completo no GitHub** com README profissional
- **Sistema deployado no Vercel** com URL pública
- **Autenticação** com registro, login, 3 roles
- **RLS funcionando** — isolamento de dados por cliente
- **Dashboard** com métricas reais do banco
- **CRUD de tickets** — criar, listar, visualizar, responder
- **Conversa em tempo real** dentro do ticket
- **TypeScript** em todo o projeto
- **shadcn/ui** — componentes profissionais
- **Middleware** de proteção de rotas

### 🛠️ Antes de fechar o computador

```bash
# Garantia: faça um commit final
git add .
git commit -m "chore: end of weekend - MVP complete"
git push
```

---

---

# MODULE 2
# Core Features — Full Implementation Guide

**Estimated time: 1 week**

---

## STEP 2.1 — CHANGE STATUS AND ASSIGN AGENT IN TICKET

**GOAL:** Admin/Agent can change ticket status, priority and assign an agent directly from the ticket detail page.

### PROMPT FOR CLAUDE CODE:

```
PROJECT: HelpDesk Pro
STACK: Next.js 16, TypeScript, Supabase, Tailwind, shadcn/ui
ARCHITECTURE: [paste ARCHITECTURE.md]

TASK: Add ticket management actions to the ticket detail page.

1. CREATE src/components/tickets/TicketActions.tsx
   - Client Component ('use client')
   - Props: ticket (Ticket), currentUserRole (string), agentList (Profile[])
   - Only renders if currentUserRole is 'admin' or 'agent'
   - Three Select components from shadcn/ui:
     * Status: Open, In Progress, Waiting for Customer, Resolved, Closed
     * Priority: Low, Medium, High, Urgent
     * Assigned Agent: dropdown with agent names (or "Unassigned")
   - Each select: onChange calls UPDATE on tickets table via createBrowserClient
   - Show loading state while saving
   - Show "Saved!" confirmation after each change
   - On success: router.refresh() to update server components

2. UPDATE src/app/(protected)/tickets/[numero]/page.tsx
   - Fetch agents list:
     .from('profiles')
     .select('id, full_name, email, role')
     .in('role', ['admin', 'agent'])
   - Pass ticket, profile.role and agentList to <TicketActions />
   - Render <TicketActions /> inside the Details card on the right column

IMPORTANT:
- Use STATUS_LABELS and PRIORITY_LABELS from constants.ts
- Keep TypeScript strict
- TicketActions only visible to admin/agent, invisible to customer
```

### VERIFY:
- [ ] Admin logs in → opens a ticket → can change status
- [ ] Status badge updates after change
- [ ] Customer logs in → no TicketActions component visible
- [ ] Agent dropdown shows all agents/admins

---

## STEP 2.2 — DATABASE: ticket_events TABLE

**GOAL:** Create audit trail table to log all ticket changes.

### RUN IN SUPABASE SQL EDITOR:

```sql
-- ================================================================
-- TICKET EVENTS (AUDIT TRAIL)
-- Logs every status, priority and agent change on a ticket
-- ================================================================

CREATE TABLE public.ticket_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  changed_by UUID NOT NULL REFERENCES public.profiles(id),
  field TEXT NOT NULL,      -- 'status', 'priority', 'agent_id'
  old_value TEXT,           -- previous value
  new_value TEXT,           -- new value
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ticket_events ENABLE ROW LEVEL SECURITY;

-- Ticket participants see the event history
CREATE POLICY "Participants see ticket events"
  ON public.ticket_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tickets t
      WHERE t.id = ticket_id AND (
        auth.uid() = t.customer_id OR
        get_current_user_role() IN ('admin', 'agent')
      )
    )
  );

-- Only admin/agent can insert events
CREATE POLICY "Agents insert ticket events"
  ON public.ticket_events FOR INSERT
  WITH CHECK (get_current_user_role() IN ('admin', 'agent'));
```

Then update `supabase_schema.sql` with this new table.

### VERIFY:
- [ ] Table editor shows ticket_events table
- [ ] RLS policies visible in Authentication → Policies

---

## STEP 2.3 — TICKET HISTORY UI + AUTO-LOGGING

**GOAL:** Every status/priority/agent change is logged and shown as a timeline in the ticket detail page.

### PROMPT FOR CLAUDE CODE:

```
PROJECT: HelpDesk Pro
ARCHITECTURE: [paste ARCHITECTURE.md]

TASK: Implement ticket change history.

1. UPDATE src/components/tickets/TicketActions.tsx
   - After each successful UPDATE on tickets table, INSERT into ticket_events:
     {
       ticket_id: ticket.id,
       changed_by: currentUser.id,
       field: 'status' | 'priority' | 'agent_id',
       old_value: previousValue,
       new_value: newValue
     }
   - Store previous values in state before updating

2. CREATE src/components/tickets/TicketTimeline.tsx
   - Client Component
   - Props: events (ticket_events[]), agents (Profile[])
   - Renders a vertical timeline below the conversation
   - Each event shows:
     * Icon (use lucide-react: ArrowRight, User, Flag)
     * Text: "[Agent name] changed [field] from [old] to [new]"
     * Time: timeAgo(event.created_at) from src/lib/utils/ticket.ts
   - Use human-readable labels:
     * field 'status' → use STATUS_LABELS
     * field 'priority' → use PRIORITY_LABELS
     * field 'agent_id' → look up agent name from agents list

3. UPDATE src/app/(protected)/tickets/[numero]/page.tsx
   - Fetch ticket events:
     .from('ticket_events')
     .select('*, changed_by_profile:profiles(id, full_name)')
     .eq('ticket_id', ticket.id)
     .order('created_at', { ascending: true })
   - Pass events to <TicketTimeline />
   - Render <TicketTimeline /> below <FormularioResposta />

IMPORTANT:
- Add ticket_events to src/types/index.ts:
  interface TicketEvent {
    id: string
    ticket_id: string
    changed_by: string
    field: 'status' | 'priority' | 'agent_id'
    old_value: string | null
    new_value: string | null
    created_at: string
    changed_by_profile?: { id: string; full_name: string }
  }
```

### VERIFY:
- [ ] Change ticket status → event appears in timeline
- [ ] Change priority → event appears
- [ ] Assign agent → event appears with agent name
- [ ] Customer can see the timeline (public events)

---

## STEP 2.4 — AGENTS PAGE (/agents)

**GOAL:** Admin can view, invite and manage agents.

### PROMPT FOR CLAUDE CODE:

```
PROJECT: HelpDesk Pro
ARCHITECTURE: [paste ARCHITECTURE.md]

TASK: Create the agents management page.

1. CREATE src/app/(protected)/agents/page.tsx
   - Server Component
   - Redirect to /dashboard if profile.role !== 'admin'
   - Fetch all agents and admins:
     .from('profiles')
     .select('*')
     .in('role', ['admin', 'agent'])
     .order('created_at', { ascending: true })
   - Render Header with title="Agents"
   - Pass agents to <AgentsClient agents={agents} />

2. CREATE src/app/(protected)/agents/AgentsClient.tsx
   - Client Component
   - "Invite Agent" button (opens modal — placeholder for now)
   - Table with columns:
     * Avatar (initial letter)
     * Name
     * Email
     * Role (Badge: Admin/Agent)
     * Member since (formatted date)
   - For now: no actions (invite flow comes later)

3. CREATE src/app/(protected)/categories/page.tsx
   - Server Component
   - Redirect to /dashboard if profile.role !== 'admin'
   - Fetch all categories
   - Render Header with title="Categories"
   - Table: Color (circle), Name, Description, Actions (Edit, Delete)
   - "New Category" button → opens modal

4. CREATE src/components/categories/CategoryModal.tsx
   - Dialog modal for create/edit
   - Fields: Name (Input), Color (Input type="color"), Description (Textarea)
   - On create: INSERT into categories
   - On edit: UPDATE categories
   - On delete: DELETE with AlertDialog confirmation
   - On success: window.location.reload()

IMPORTANT:
- Both pages admin-only (redirect non-admins to /dashboard)
- Keep TypeScript strict
```

### VERIFY:
- [ ] Login as admin → Agents page shows all agents/admins
- [ ] Login as customer → /agents redirects to /dashboard
- [ ] Categories page shows initial categories
- [ ] Can create a new category with color picker
- [ ] Can edit category name/color/description
- [ ] Can delete category (with confirmation)

---

## STEP 2.5 — ADVANCED FILTERS ON TICKET LIST

**GOAL:** Filter tickets by status, priority, category and search by title/description.

### PROMPT FOR CLAUDE CODE:

```
PROJECT: HelpDesk Pro
ARCHITECTURE: [paste ARCHITECTURE.md]

TASK: Add filters and search to the ticket list.

1. CREATE src/components/tickets/TicketFilters.tsx
   - Client Component
   - Filter controls:
     * Search input (searches title) with debounce 300ms
     * Status select (All, Open, In Progress, Waiting, Resolved, Closed)
     * Priority select (All, Low, Medium, High, Urgent)
     * Category select (All + list from categories table)
   - On change: updates URL search params using useRouter + useSearchParams
     Example: /tickets?status=open&priority=high&search=login

2. UPDATE src/app/(protected)/tickets/page.tsx
   - Read searchParams from page props
   - Apply filters to Supabase query:
     * search: .ilike('title', '%${search}%')
     * status: .eq('status', status)
     * priority: .eq('priority', priority)
     * category: .eq('category_id', categoryId)
   - Pass active filters to TicketsClient for display

3. UPDATE src/app/(protected)/tickets/TicketsClient.tsx
   - Render <TicketFilters /> above the ticket table
   - Show active filter count badge on filter button

IMPORTANT:
- Filters work via URL params (shareable, browser back button works)
- Server-side filtering (not client-side) for performance
- Empty state message changes based on active filters:
  "No tickets found" vs "No tickets match your filters"
```

### VERIFY:
- [ ] Search "test" → only tickets with "test" in title appear
- [ ] Filter by status "Open" → only open tickets
- [ ] Combine filters → works correctly
- [ ] Clear filters → all tickets return
- [ ] URL updates when filtering (can share filtered URL)

---

## STEP 2.6 — REALTIME MESSAGES

**GOAL:** New messages appear instantly without page reload.

### SETUP FIRST (in Supabase):
1. Go to Supabase → Database → Replication
2. Enable Realtime for the 'messages' table
3. Save changes

### PROMPT FOR CLAUDE CODE:

```
PROJECT: HelpDesk Pro
ARCHITECTURE: [paste ARCHITECTURE.md]

TASK: Add real-time message updates to the ticket conversation.

1. CREATE src/components/tickets/TicketConversation.tsx
   - Client Component ('use client')
   - Props: initialMessages (Message[]), ticketId (string), currentUser (Profile), ticket (Ticket)
   - State: messages (starts with initialMessages)
   - On mount: subscribe to Supabase Realtime:

     const channel = supabase
       .channel(`ticket-${ticketId}`)
       .on('postgres_changes', {
         event: 'INSERT',
         schema: 'public',
         table: 'messages',
         filter: `ticket_id=eq.${ticketId}`
       }, async (payload) => {
         // Fetch full message with author profile
         const { data } = await supabase
           .from('messages')
           .select('*, author:profiles(id, full_name, avatar_url, role)')
           .eq('id', payload.new.id)
           .single()
         if (data) setMessages(prev => [...prev, data])
       })
       .subscribe()

   - On unmount: supabase.removeChannel(channel)
   - Auto-scroll to bottom when new message arrives (useEffect on messages)
   - Renders the conversation (same UI as current ticket detail page)
   - Renders <FormularioResposta /> at the bottom

2. UPDATE src/components/tickets/FormularioResposta.tsx
   - After successful INSERT: clear textarea only (no window.location.reload())
   - Realtime subscription handles showing the new message

3. UPDATE src/app/(protected)/tickets/[numero]/page.tsx
   - Replace inline conversation JSX with <TicketConversation />
   - Pass initialMessages, ticketId, currentUser (profile), ticket as props

IMPORTANT:
- Auto-scroll behavior: smooth scroll to bottom ref after new message
- Handle the case where the current user sends a message
  (avoid showing duplicate — realtime fires for everyone including sender)
  Solution: check if message.id already exists in state before adding
```

### VERIFY:
- [ ] Open same ticket in two browser tabs/windows
- [ ] Send message in tab 1 → appears instantly in tab 2
- [ ] No duplicate messages
- [ ] Auto-scrolls to new message
- [ ] Page does NOT reload after sending

---

## STEP 2.7 — EMAIL NOTIFICATIONS (Optional/Advanced)

**GOAL:** Customer receives email when agent replies.

> NOTE: Most complex step — skip if time is short, revisit in Module 7.

### SETUP:
1. Create account at resend.com (free: 3000 emails/month)
2. Get API key from Resend dashboard
3. Add to Supabase secrets: `npx supabase secrets set RESEND_API_KEY=re_xxxxx`

### PROMPT FOR CLAUDE CODE:

```
PROJECT: HelpDesk Pro
ARCHITECTURE: [paste ARCHITECTURE.md]

TASK: Create email notification system using
Supabase Edge Functions and Resend.

1. CREATE supabase/functions/notify-reply/index.ts
   - Supabase Edge Function (Deno runtime)
   - Triggered via Database Webhook (configured in Supabase dashboard)
   - Receives: new message row from messages table
   - Fetches: ticket + customer email + agent name
   - Sends email via Resend API:
     * To: customer email
     * Subject: New reply on ticket #[number]: [title]
     * Body: [Agent name] replied to your ticket.
             Message: [first 200 chars of content]
             View ticket: https://helpdesk-pro-tau.vercel.app/tickets/[number]
   - Skip if message.internal === true
   - Skip if author is the customer themselves

2. DEPLOY the function:
   npx supabase functions deploy notify-reply

3. SET UP Database Webhook in Supabase:
   Database → Webhooks → Create webhook
   - Table: messages
   - Event: INSERT
   - Function URL: [your edge function URL]
```

### VERIFY:
- [ ] Customer creates ticket
- [ ] Admin/Agent replies
- [ ] Customer receives email with reply preview and link
- [ ] Internal notes do NOT trigger email
- [ ] Customer replies do NOT trigger email to themselves

---

## STEP 2.8 — INTERNAL NOTES

**GOAL:** Agents can leave private notes invisible to customers.

### PROMPT FOR CLAUDE CODE:

```
PROJECT: HelpDesk Pro
ARCHITECTURE: [paste ARCHITECTURE.md]

TASK: Add internal notes feature to ticket conversation.

1. UPDATE src/components/tickets/FormularioResposta.tsx
   - Props: add currentUserRole (string)
   - If role is 'admin' or 'agent': show toggle below textarea:
     [ ] Mark as internal note (only visible to agents)
   - State: isInternal (boolean, default false)
   - On submit: pass internal: isInternal to INSERT

2. UPDATE src/app/(protected)/tickets/[numero]/page.tsx
   - Pass currentUserRole to FormularioResposta
   - For admin/agent: fetch ALL messages (remove .eq('internal', false) filter)
   - For customer: keep filtering .eq('internal', false)

3. UPDATE src/components/tickets/TicketConversation.tsx
   - Internal messages: render with amber/yellow background
   - Add "Internal note" label badge on internal messages
   - Internal messages only visible when currentUserRole is admin/agent

IMPORTANT:
- Database already supports internal=true (messages table)
- RLS already hides internal messages from customers
- Visual distinction is critical: customers must never see internal notes
```

### VERIFY:
- [ ] Admin writes internal note → shows with yellow background
- [ ] Login as customer → internal note NOT visible
- [ ] Login as agent → internal note visible with "Internal note" badge
- [ ] Realtime: internal note appears instantly for agents

---

## RECOMMENDED ORDER AND TIME ESTIMATE:

| Day | Time | Step |
|-----|------|------|
| Day 1 | 2-3h | Step 2.1 — Status/Priority/Agent actions |
| Day 2 | 1h   | Step 2.2 — Database: ticket_events table |
| Day 2 | 2h   | Step 2.3 — History UI + auto-logging |
| Day 3 | 2-3h | Step 2.4 — Agents + Categories pages |
| Day 4 | 2h   | Step 2.5 — Filters and search |
| Day 5 | 2-3h | Step 2.6 — Realtime messages |
| Day 6 | 2h   | Step 2.8 — Internal notes |
| Day 7 | 3-4h | Step 2.7 — Email (optional, can skip) |

---

## SESSION START PROMPT TEMPLATE (use every session):

```
PROJECT: HelpDesk Pro
STACK: Next.js 16, TypeScript, Supabase, Tailwind, shadcn/ui
Live URL: https://helpdesk-pro-tau.vercel.app
Local: C:\dev\piloto

ARCHITECTURE:
[paste ARCHITECTURE.md content here]

ALREADY IMPLEMENTED:
[list what's done from Module 1 + Module 2 steps completed]

TODAY'S SESSION:
Implement Step 2.X — [name]

Before starting, read the relevant files and tell me:
1. Which files will you create/modify?
2. Any new dependencies needed?
3. Any potential issues I should know about?

AT THE END OF THIS SESSION:
- Update ARCHITECTURE.md to reflect what was implemented
- Update supabase_schema.sql if any DB changes were made
- Suggest a git commit message
```

---

# MÓDULOS 3-7 — VISÃO GERAL

*(Desenvolva durante as semanas seguintes)*

---


## Módulo 3 — UI/UX Profissional
**Semana 1-2**

### O que você vai implementar:
- **Design System completo** — paleta de cores, tipografia, espaçamento
- **Componente DataTable** reutilizável (ordena, pagina, exporta)
- **Mobile responsivo** — sidebar como drawer no mobile
- **Skeleton Loaders** — loading state profissional
- **Toast Notifications** — feedback visual de ações
- **Empty States** — páginas sem dados com ilustração e call-to-action
- **Dark/Light mode toggle**

### O que você vai aprender:
- Estratégia de componentes: quando criar, quando reutilizar
- `@container` queries do Tailwind
- Animações com Tailwind (`animate-*`)
- Acessibilidade básica (ARIA labels, focus management)

---

## Módulo 4 — Dados Avançados com React Query
**Semana 2**

### O que você vai implementar:
- **React Query em todas as listas** — cache, refetch, invalidação
- **Paginação server-side** — query params na URL
- **Busca full-text** com debounce (espera digitar antes de buscar)
- **Exportação para CSV** — tickets filtrados
- **Relatórios** — gráficos com tempo de resolução, volume por categoria
- **Infinite scroll** como alternativa à paginação

### O que você vai aprender:
- `useQuery`, `useMutation`, `useInfiniteQuery`
- Invalidação de cache após mutações
- `useDebounce` custom hook
- Recharts para gráficos

---

## Módulo 5 — IA com OpenAI
**Semana 3**

### O que você vai implementar:
- **Categorização automática** — quando cliente cria ticket, IA sugere a categoria
- **Sugestão de resposta** — agente clica em "Sugerir resposta" e a IA gera um rascunho
- **Análise de sentimento** — ticket marcado como "cliente insatisfeito" automaticamente
- **Resumo do ticket** — IA resume a conversa longa em 3 linhas

### O que você vai aprender:
- OpenAI Chat Completions API
- Streaming de resposta (a resposta aparece palavra por palavra)
- `response_format: { type: 'json_object' }` para respostas estruturadas
- Prompt engineering para casos de uso específicos
- Rate limiting e custos (como controlar)

---

## Módulo 6 — Stripe: Planos e Pagamentos
**Semana 3-4**

### O que você vai implementar:
- **3 planos**: Gratuito (5 tickets/mês), Pro (50 tickets/mês), Enterprise (ilimitado)
- **Checkout do Stripe** — botão de upgrade → página de pagamento
- **Webhook** — Stripe avisa quando pagamento confirma → libera o plano no banco
- **Portal do cliente** — gerenciar assinatura, cancelar, ver faturas
- **Controle de limite** — bloqueia criação de ticket quando atingiu o limite do plano
- **Tabela de preços** landing page

### O que você vai aprender:
- Stripe Checkout Sessions
- Stripe Webhooks (como verificar que veio do Stripe)
- Stripe Customer Portal
- Gestão de estado de assinatura no banco

---

## Módulo 7 — Deploy Profissional e Portfólio
**Semana 4**

### O que você vai implementar:
- **Landing page** — apresenta o produto para novos visitantes
- **Domínio customizado** (opcional, ~R$50/ano)
- **Analytics** — Vercel Analytics para ver quem visita
- **SEO básico** — meta tags, og:image
- **Dados de demonstração** — seed do banco com dados realistas para mostrar para clientes

### O que você vai aprender:
- Como fazer seed de banco com dados de teste
- next/og para gerar imagens de preview dinâmicas
- Como apresentar um projeto no Upwork (texto da proposta em inglês)
- Como criar um caso de estudo: problema → solução → resultado

---

---

# GUIA: Como Continuar Depois do Módulo 1

## Ao começar cada módulo:

### 1. Leia o ARCHITECTURE.md atualizado
Peça ao Antigravity para atualizá-lo ao final de cada sessão.

### 2. Crie um branch antes de começar
```bash
git checkout -b modulo-2/realtime
```

### 3. Use este prompt padrão de início de sessão

```
PROJETO: HelpDesk Pro
STACK: Next.js 15, TypeScript, Supabase, Tailwind, shadcn/ui, React Query

ARCHITECTURE.MD:
[cole o conteúdo do ARCHITECTURE.md aqui]

O QUE JÁ FOI IMPLEMENTADO:
[liste o que está funcionando]

SESSÃO DE HOJE:
Quero implementar [feature específica].
Antes de começar, leia os arquivos relevantes e me diga:
1. Quais arquivos você vai criar/modificar?
2. Tem alguma dependência que precisa ser instalada?
3. Há algum problema potencial que devo saber antes?
```

### 4. Teste SEMPRE antes de commitar
```bash
npm run build   # garante que não tem erros de TypeScript
npm run dev     # testa manualmente no browser
```

### 5. Commit ao final de cada feature
```bash
git add .
git commit -m "feat: [o que foi feito de forma clara]"
git push
```

---

## Checklist do Portfólio Final

Ao terminar o Módulo 7, você deve conseguir dizer para um cliente no Upwork:

✅ "Built a multi-tenant helpdesk SaaS with Next.js 15 and Supabase"
✅ "Implemented Row Level Security ensuring complete data isolation between clients"
✅ "Integrated OpenAI for automatic ticket categorization and response suggestions"
✅ "Built subscription management with Stripe including webhooks and customer portal"
✅ "Achieved real-time ticket updates using Supabase Realtime channels"
✅ "Deployed on Vercel with TypeScript throughout the entire codebase"

E você pode mostrar:
- 🔗 URL pública do sistema rodando
- 📦 Repositório GitHub com README profissional
- 📝 Código limpo com TypeScript e comentários

---

*Última atualização: Junho 2026 — Módulo 1 completo*
