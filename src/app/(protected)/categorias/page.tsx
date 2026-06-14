import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { CategoriasClient } from './CategoriasClient'
import type { Categoria, Profile } from '@/types'

export default async function CategoriasPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')
  if (profile.role !== 'admin') redirect('/dashboard')

  const { data: categories } = await supabase
    .from('categorias')
    .select('*')
    .order('nome', { ascending: true })

  return (
    <div>
      <Header title="Categories" profile={profile as Profile} />
      <CategoriasClient categories={(categories ?? []) as Categoria[]} />
    </div>
  )
}
