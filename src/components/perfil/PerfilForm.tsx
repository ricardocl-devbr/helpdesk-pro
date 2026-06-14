'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@/lib/supabase/client'
import { ROLE_LABELS } from '@/lib/constants'
import type { Profile } from '@/types'

interface PerfilFormProps {
  profile: Profile
}

export function PerfilForm({ profile }: PerfilFormProps) {
  const [fullName, setFullName] = useState(profile.full_name)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)
    setError(null)

    const supabase = createBrowserClient()
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', profile.id)

    if (updateError) {
      setError('Erro ao atualizar perfil. Tente novamente.')
    } else {
      setSuccess(true)
    }

    setLoading(false)
  }

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Informações do Perfil</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="full_name">Nome completo</Label>
            <Input
              id="full_name"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value)
                setSuccess(false)
              }}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" value={profile.email} disabled />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role">Perfil</Label>
            <Input id="role" value={ROLE_LABELS[profile.role]} disabled />
          </div>

          {success && (
            <p className="text-sm text-green-600 font-medium">Perfil atualizado!</p>
          )}
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
