# HelpDesk Pro — Architecture

**Live URL:** https://helpdesk-pro-tau.vercel.app  
**GitHub:** https://github.com/ricardocl-devbr/helpdesk-pro  
**Status:** Module 1 complete — Module 2 in progress (Steps 2.1, 2.3, 2.4 done)

---

## 1. Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (Radix UI primitives) |
| Icons | lucide-react |
| Backend / DB | Supabase (PostgreSQL) |
| Auth | Supabase Auth via @supabase/ssr |
| Deployment | Vercel |

> **@tanstack/react-query** is installed but not yet used. Will be integrated in Module 4.

---

## 2. Directory Structure

```text
src/
├── app/
│   ├── (protected)/                       ← Route group requiring authentication
│   │   ├── layout.tsx                     ← Auth guard + Sidebar wrapper (Server Component)
│   │   ├── dashboard/
│   │   │   └── page.tsx                   ← Metrics dashboard (Server Component)
│   │   ├── agentes/
│   │   │   ├── page.tsx                   ← Agents list page (Server Component, admin-only)
│   │   │   └── AgentesClient.tsx          ← Table of profiles with role admin/agente (Client Component)
│   │   ├── categorias/
│   │   │   ├── page.tsx                   ← Categories management page (Server Component, admin-only)
│   │   │   └── CategoriasClient.tsx       ← CRUD table; opens CategoryModal (Client Component)
│   │   ├── profile/
│   │   │   └── page.tsx                   ← User profile page (Server Component)
│   │   └── tickets/
│   │       ├── page.tsx                   ← Ticket list (Server Component)
│   │       ├── TicketsClient.tsx          ← Ticket table + New Ticket button (Client Component)
│   │       ├── novo/
│   │       │   └── page.tsx              ← Standalone create-ticket page (Client Component)
│   │       └── [numero]/
│   │           └── page.tsx              ← Ticket detail (Server Component)
│   ├── forgot-password/
│   │   └── page.tsx                       ← Password recovery form (Client Component)
│   ├── login/
│   │   └── page.tsx                       ← Email/password login (Client Component)
│   ├── register/
│   │   └── page.tsx                       ← User registration (Client Component)
│   ├── reset-password/
│   │   └── page.tsx                       ← Password reset confirmation (Client Component)
│   ├── page.tsx                           ← Root redirect
│   ├── layout.tsx                         ← Root layout (Inter font, global providers)
│   ├── globals.css                        ← Tailwind directives + CSS custom properties
│   └── favicon.ico
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx                    ← Fixed 240px sidebar, role-based nav, sign out
│   │   └── Header.tsx                     ← Page title + role badge + user avatar
│   ├── profile/
│   │   └── PerfilForm.tsx                 ← Edit full_name; role is displayed as read-only
│   ├── categories/
│   │   └── CategoryModal.tsx              ← Create/edit category Dialog; name, color picker, description (Client Component)
│   ├── tickets/
│   │   ├── FormularioResposta.tsx         ← Reply form; uses window.location.reload() after INSERT
│   │   ├── NovoTicketModal.tsx            ← Create ticket Dialog with AlertDialog unsaved-changes guard
│   │   ├── TicketActions.tsx              ← Status + priority + agent selects (admin/agente only); logs to ticket_eventos
│   │   └── TicketHistory.tsx             ← Vertical timeline of ticket_eventos with icons and timeAgo
│   └── ui/                               ← shadcn/ui components (do not edit directly)
│       ├── alert-dialog.tsx
│       ├── alert.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── skeleton.tsx
│       ├── sonner.tsx
│       ├── table.tsx
│       └── textarea.tsx
├── lib/
│   ├── constants.ts                       ← STATUS_LABELS/COLORS, PRIORIDADE_LABELS/COLORS, ROLE_LABELS
│   ├── toast.ts                           ← appToast wrapper around sonner for consistent notifications
│   ├── utils.ts                           ← cn() helper (clsx + tailwind-merge)
│   ├── utils/
│   │   └── ticket.ts                      ← getStatusBadgeProps, getPrioridadeBadgeProps, formatDate, timeAgo
│   └── supabase/
│       ├── client.ts                      ← createBrowserClient() — for Client Components
│       └── server.ts                      ← createServerClient() async — for Server Components
├── proxy.ts                               ← Route protection (see Technical Decisions §4.1)
└── types/
    └── index.ts                           ← All TypeScript interfaces and union types
```

---

## 3. Database Schema (Supabase)

All tables have Row Level Security (RLS) enabled.

### Tables

**`profiles`** — Linked to `auth.users` via trigger. Created automatically on registration.
```
id           UUID PK → auth.users (ON DELETE CASCADE)
email        TEXT NOT NULL
full_name    TEXT
avatar_url   TEXT (nullable)
role         TEXT  CHECK ('admin' | 'agente' | 'cliente')  DEFAULT 'cliente'
created_at   TIMESTAMPTZ DEFAULT NOW()
updated_at   TIMESTAMPTZ  (auto-updated by trigger)
```

**`categorias`** — Ticket categories with display color.
```
id           UUID PK
nome         TEXT UNIQUE
cor          TEXT  (hex color, e.g. '#ef4444')
descricao    TEXT (nullable)
ativa        BOOLEAN NOT NULL DEFAULT true
created_at   TIMESTAMPTZ DEFAULT NOW()
```
Pre-seeded: Suporte Técnico (#ef4444), Financeiro (#f59e0b), Comercial (#10b981), Outros (#6366f1)

**`tickets`** — Core support request entity.
```
id           UUID PK
numero       SERIAL UNIQUE  ← human-readable, used in URLs: /tickets/1
titulo       TEXT NOT NULL
descricao    TEXT NOT NULL
status       TEXT  CHECK ('aberto'|'em_andamento'|'aguardando_cliente'|'resolvido'|'fechado')  DEFAULT 'aberto'
prioridade   TEXT  CHECK ('baixa'|'media'|'alta'|'urgente')  DEFAULT 'media'
categoria_id UUID → categorias (nullable)
cliente_id   UUID NOT NULL → profiles  ← ticket owner
agente_id    UUID → profiles (nullable)  ← assigned agent
created_at   TIMESTAMPTZ DEFAULT NOW()
updated_at   TIMESTAMPTZ  (auto-updated by trigger)
resolved_at  TIMESTAMPTZ (nullable)
```

**`mensagens`** — Conversation thread inside each ticket.
```
id           UUID PK
ticket_id    UUID NOT NULL → tickets (ON DELETE CASCADE)
autor_id     UUID NOT NULL → profiles
conteudo     TEXT NOT NULL
interno      BOOLEAN DEFAULT false  ← true = agent-only internal note; hidden from customers by RLS
created_at   TIMESTAMPTZ DEFAULT NOW()
```

**`ticket_eventos`** — Audit trail for status/priority/agent changes.
```
id           UUID PK
ticket_id    UUID NOT NULL → tickets (ON DELETE CASCADE)
autor_id     UUID NOT NULL → profiles
tipo_evento  TEXT NOT NULL  (e.g. 'status_changed', 'prioridade_changed', 'agente_assigned')
valor_antigo TEXT (nullable)  ← previous value
valor_novo   TEXT (nullable)  ← new value
created_at   TIMESTAMPTZ DEFAULT NOW()
```
> Columns confirmed. `TicketActions` inserts rows directly from the client on each change (Step 2.3 complete). A DB trigger for server-side auto-logging is not required.

### RLS Policies Summary

| Table | Who | Allowed |
|---|---|---|
| `profiles` | owner | SELECT own row, UPDATE own row |
| `profiles` | admin / agente | SELECT all rows |
| `categorias` | any authenticated | SELECT |
| `categorias` | admin | INSERT, UPDATE, DELETE |
| `tickets` | cliente | SELECT own tickets (cliente_id = auth.uid()); INSERT own tickets |
| `tickets` | admin / agente | SELECT all; UPDATE all |
| `mensagens` | ticket participant (cliente) | SELECT where interno = false; INSERT |
| `mensagens` | admin / agente | SELECT all (including interno = true); INSERT |
| `ticket_eventos` | ticket participant | SELECT |
| `ticket_eventos` | admin / agente | INSERT |

### DB Functions & Triggers

| Name | Type | Purpose |
|---|---|---|
| `handle_new_user()` | Trigger on `auth.users` INSERT | Creates `profiles` row from auth metadata |
| `handle_updated_at()` | Trigger on `tickets` + `profiles` UPDATE | Sets `updated_at = NOW()` |
| `get_current_user_role()` | Helper function (SECURITY DEFINER) | Returns current user's role without triggering RLS recursion on `profiles` |

---

## 4. Important Technical Decisions

### 4.1 `proxy.ts` Instead of `middleware.ts`
Next.js 16 changed the middleware convention. Route protection logic lives in `src/proxy.ts`, which exports `proxy()` and `config.matcher`. It is wired to the Next.js request lifecycle via `next.config.ts`. Do not rename it to `middleware.ts`.

### 4.2 Supabase Key Format: `sb_publishable_`
Supabase now issues API keys with the `sb_publishable_` prefix instead of the legacy `eyJ...` JWT format. The `.env.local` anon key must use the new format or the client will silently fail.

### 4.3 Auth Redirects: `window.location.href` Instead of `router.push`
In client components where the Supabase session may be stale after a sign-out or expiry, `window.location.href = '/login'` is used to force a full page reload. `router.push` only updates the client-side router and does not clear the in-memory session state.

### 4.4 Post-mutation Refresh: `window.location.reload()` in `FormularioResposta`
After a reply INSERT, `window.location.reload()` is called to re-fetch messages from the server. This is intentional for Module 1 simplicity. It will be replaced by Supabase Realtime subscription in Module 2 (Step 2.6). `TicketActions` already uses the preferred `router.refresh()` pattern for its mutations.

### 4.5 Ticket URLs Use `numero` (Serial Int), Not UUID
Tickets are accessed via their human-readable serial number: `/tickets/42`. The `numero` column is `SERIAL UNIQUE`. The detail page queries with `.eq('numero', Number(numero))`. Never use the UUID in URLs.

### 4.6 Route Group `(protected)` for Authenticated Pages
All authenticated pages live under `src/app/(protected)/`. The layout verifies the session and fetches the profile before rendering children. The folder name `(protected)` does not appear in URLs.

### 4.7 `AlertDialog` for Unsaved Changes Guard in Modals
`NovoTicketModal` intercepts Dialog close events when the form has any data and shows an `AlertDialog` confirmation ("Discard changes?") before allowing the user to exit. This prevents accidental data loss.

### 4.8 `get_current_user_role()` Avoids RLS Infinite Recursion
RLS policies on `tickets` and `mensagens` check the current user's role by querying `profiles`. Without the helper function, this creates infinite recursion (policy → query profiles → policy fires again). The `SECURITY DEFINER` function bypasses RLS when fetching the role.

### 4.9 Internal Notes: DB Ready, UI Not Implemented
`mensagens.interno` and the RLS policy that hides internal messages from `cliente` are already in place. `FormularioResposta` currently hardcodes `interno: false`. The toggle UI is a Module 2 task (Step 2.8).

### 4.10 Category Soft-Delete via `ativa` Flag
Categories have an `ativa BOOLEAN NOT NULL DEFAULT true` column. Inactive categories are hidden from ticket creation forms but are preserved in existing tickets so historical data is not broken. Hard delete is only allowed when no tickets reference the category — `CategoriasClient` checks for linked tickets before issuing a `DELETE`.

### 4.11 `appToast` Wrapper Around Sonner
`src/lib/toast.ts` exports `appToast` (with `.success`, `.error`, `.info` methods) as a thin wrapper around the `sonner` toast library. All components use `appToast` instead of calling `sonner` directly, keeping notification style consistent and making the underlying library easy to swap.

---

## 5. Authentication Flow

```
/register → supabase.auth.signUp() → trigger creates profiles row (role: 'cliente')
                                    → window.location.href = '/dashboard'

/login    → supabase.auth.signInWithPassword()
                                    → window.location.href = '/dashboard'

Every request → proxy.ts calls supabase.auth.getUser()
             → if no session + non-public route → redirect /login

(protected)/layout.tsx → re-validates session → fetches profile → renders Sidebar
```

**Public routes** (no auth required): `/`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/api/auth/**`

---

## 6. Pages and Components

### Pages

| Route | File | Type | Description |
|---|---|---|---|
| `/login` | `app/login/page.tsx` | Client | Email/password login |
| `/register` | `app/register/page.tsx` | Client | Registration; default role: `cliente` |
| `/forgot-password` | `app/forgot-password/page.tsx` | Client | Sends password reset email |
| `/reset-password` | `app/reset-password/page.tsx` | Client | Handles reset confirmation link |
| `/dashboard` | `app/(protected)/dashboard/page.tsx` | Server | 4 metric cards + recent tickets list; scoped by role |
| `/tickets` | `app/(protected)/tickets/page.tsx` | Server | Fetches ticket list; scoped by role; passes to `TicketsClient` |
| `/tickets/[numero]` | `app/(protected)/tickets/[numero]/page.tsx` | Server | Conversation, reply form, event history, actions card |
| `/tickets/novo` | `app/(protected)/tickets/novo/page.tsx` | Client | Standalone create-ticket form |
| `/profile` | `app/(protected)/profile/page.tsx` | Server | Edit full_name; role shown as read-only |
| `/agentes` | `app/(protected)/agentes/page.tsx` | Server | Admin-only; lists all profiles with role `admin` or `agente` |
| `/categorias` | `app/(protected)/categorias/page.tsx` | Server | Admin-only; create, edit, deactivate and delete categories |

### Components

| Component | File | Type | Description |
|---|---|---|---|
| `Sidebar` | `components/layout/Sidebar.tsx` | Client | Fixed 240px sidebar; admin sees Agents + Categories links (→ `/agentes`, `/categorias` — currently 404) |
| `Header` | `components/layout/Header.tsx` | Client | Page title, role badge, user avatar |
| `TicketsClient` | `app/(protected)/tickets/TicketsClient.tsx` | Client | Ticket table with colored status/priority badges; "New Ticket" button opens `NovoTicketModal` |
| `NovoTicketModal` | `components/tickets/NovoTicketModal.tsx` | Client | Dialog for creating tickets; fetches categories on open; AlertDialog unsaved-changes guard |
| `FormularioResposta` | `components/tickets/FormularioResposta.tsx` | Client | Reply textarea + Send button; hardcodes `interno: false`; calls `window.location.reload()` on success |
| `TicketActions` | `components/tickets/TicketActions.tsx` | Client | Status + priority + agent selects; visible to admin/agente only; logs each change to `ticket_eventos`; calls `router.refresh()` |
| `TicketHistory` | `components/tickets/TicketHistory.tsx` | Client | Vertical timeline of `ticket_eventos`; maps event types to icons and human-readable text using `timeAgo` |
| `AgentesClient` | `app/(protected)/agentes/AgentesClient.tsx` | Client | Table listing agents/admins; fetched from `profiles` filtered by role |
| `CategoriasClient` | `app/(protected)/categorias/CategoriasClient.tsx` | Client | Category CRUD table; deactivate toggle; opens `CategoryModal`; guards hard delete when tickets are linked |
| `CategoryModal` | `components/categories/CategoryModal.tsx` | Client | Dialog for create/edit category; fields: name, color picker, description |
| `PerfilForm` | `components/profile/PerfilForm.tsx` | Client | Edit full_name; displays role as read-only badge |

---

## 7. Module 2 — Progress

| Feature | Step | Status |
|---|---|---|
| `TicketActions`: status + priority + agent | 2.1 | ✅ Done |
| `TicketHistory` timeline | 2.3 | ✅ Done |
| `/agentes` page | 2.4 | ✅ Done |
| `/categorias` page | 2.4 | ✅ Done |
| Filters and search on ticket list | 2.5 | Pending — no filters; all tickets shown unsorted |
| Realtime messages | 2.6 | Pending — `FormularioResposta` uses `window.location.reload()` |
| Email notifications | 2.7 | Pending — planned via Supabase Edge Functions + Resend |
| Internal notes toggle | 2.8 | Pending — DB field + RLS ready; `FormularioResposta` hardcodes `interno: false` |

---

## 8. Test Users

| Name | Email | Role |
|---|---|---|
| Ricardo Agente | r_camargos@hotmail.com | `agente` |
| Ricardo Admin | ricardocl.ufu@gmail.com | `admin` |
| Ricardo Cliente | ricardocl.note@gmail.com | `cliente` |

---

## 9. Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_[...]
```

---

*Last updated: June 2026 — Module 2 Steps 2.1, 2.3, 2.4 complete; 2.5, 2.6, 2.7, 2.8 pending*
