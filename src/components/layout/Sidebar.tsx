'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { HeadphonesIcon, LayoutDashboard, Ticket, Users, Tag, LogOut } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

interface SidebarProps {
  profile: Profile
}

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tickets', label: 'Tickets', icon: Ticket },
]

const adminLinks = [
  { href: '/agentes', label: 'Agentes', icon: Users },
  { href: '/categorias', label: 'Categorias', icon: Tag },
]

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const links = profile.role === 'admin' ? [...navLinks, ...adminLinks] : navLinks

  const initials = profile.full_name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <aside className="fixed left-0 top-0 h-full w-[240px] bg-white border-r border-gray-200 flex flex-col z-10">
      <div className="flex items-center gap-2 px-4 py-5 border-b border-gray-200">
        <HeadphonesIcon className="h-6 w-6 text-blue-600" />
        <span className="text-lg font-semibold text-gray-900">HelpDesk Pro</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon
                className={`h-5 w-5 shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-gray-200 px-3 py-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.full_name} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{profile.full_name}</p>
            <p className="text-xs text-gray-500 truncate">{profile.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start text-gray-500 hover:text-gray-900 hover:bg-gray-100"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>
    </aside>
  )
}
