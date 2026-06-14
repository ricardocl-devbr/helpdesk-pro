# HelpDesk Pro

**A full-stack customer support SaaS built with Next.js and Supabase**

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38BDF8?style=flat-square&logo=tailwindcss)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000?style=flat-square&logo=vercel)

---

## Overview

HelpDesk Pro is a production-ready customer support platform that enables businesses to manage support tickets and communicate with customers in one centralized place. Built with a modern, type-safe stack, it features role-based access control and database-level data isolation out of the box. It is designed for small businesses and startups that need a reliable, scalable support system without the complexity of enterprise tools.

---

## Features

- **Multi-role authentication** — Separate access levels for Admins, Agents, and Customers, each with a tailored experience
- **Row Level Security** — Supabase RLS policies enforce data isolation at the database level; customers can only ever see their own tickets
- **Ticket management** — Create, view, and manage support tickets with status tracking (Open, In Progress, Resolved, Closed) and priority levels
- **Real-time conversation** — Threaded reply system inside each ticket for back-and-forth communication between customers and agents
- **Dashboard with metrics** — At-a-glance overview of open tickets, response times, and support activity
- **Clean, accessible UI** — Built with shadcn/ui components on top of Tailwind CSS for a polished, consistent interface

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth |
| Authorization | Supabase Row Level Security |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- A [Supabase](https://supabase.com) account (free tier works)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/helpdesk-pro.git
   cd helpdesk-pro
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env.local` file in the project root:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   Both values are available in your Supabase project under **Settings → API**.

4. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Architecture Highlights

### Protected Route Groups

All authenticated pages live inside the `(protected)` route group with a shared layout that validates the user session on every request. Unauthenticated users are redirected to `/login` before any protected page renders, with no client-side flash.

### Row Level Security (RLS)

Data access is enforced at the PostgreSQL level using Supabase RLS policies. Even if application-level authorization were bypassed, the database itself would reject unauthorized reads and writes. This makes the authorization model auditable and tamper-resistant by design.

### User Roles

| Role | Capabilities |
|---|---|
| **Admin** | Full access — manage agents, view all tickets, configure the system |
| **Agent** | View and respond to assigned tickets, update status and priority |
| **Customer** | Create tickets and follow up on their own support requests only |

---

## Screenshots

*(Screenshots coming soon)*

---

## License

This project is licensed under the [MIT License](LICENSE).
