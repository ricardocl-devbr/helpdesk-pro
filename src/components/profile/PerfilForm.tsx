'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
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
      setError('Error updating profile. Please try again.')
    } else {
      setSuccess(true)
      router.refresh()
    }

    setLoading(false)
  }

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Profile Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="full_name">Full name</Label>
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
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={profile.email} disabled />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role">Role</Label>
            <Input id="role" value={ROLE_LABELS[profile.role]} disabled />
          </div>

          {success && (
            <p className="text-sm text-green-600 font-medium">Profile updated!</p>
          )}
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
