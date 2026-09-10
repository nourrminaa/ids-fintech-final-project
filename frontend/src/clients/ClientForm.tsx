import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useData } from '../context/DataContext'
import Button from '../shared/Button'
import usePageMeta from '../shared/usePageMeta'
import LoadingState from '../shared/LoadingState'
import type { ClientStatus } from '../types'

export default function ClientForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { clients, addClient, updateClient, loadingClients } = useData()
  const existing = id ? clients.find((c) => c.id === Number(id)) : undefined
  usePageMeta(
    existing ? `Edit ${existing.companyName}` : 'New Client',
    existing ? `Update the details for ${existing.companyName}.` : 'Add a new client to the portal.'
  )

  const [companyName, setCompanyName] = useState('')
  const [country, setCountry] = useState('')
  const [contactInformation, setContactInformation] = useState('')
  const [status, setStatus] = useState<ClientStatus>('Onboarding')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (existing) {
      setCompanyName(existing.companyName)
      setCountry(existing.country)
      setContactInformation(existing.contactInformation)
      setStatus(existing.status)
      setNotes(existing.notes)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing?.id])

  if (id && loadingClients && !existing) return <LoadingState label="Loading client" />

  const validate = () => {
    const next: Record<string, string> = {}
    if (!companyName.trim()) next.companyName = 'Company name is required'
    if (!country.trim()) next.country = 'Country is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const client = { companyName, country, contactInformation, status, notes }

    if (existing) {
      await updateClient(existing.id, client)
      navigate(`/clients/${existing.id}`)
    } else {
      const created = await addClient(client)
      navigate(`/clients/${created.id}`)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="page-header text-3xl mb-8">{existing ? 'Edit Client' : 'New Client'}</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Company Name" error={errors.companyName}>
          <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={errors.companyName ? errorClass : inputClass} aria-invalid={!!errors.companyName} />
        </Field>

        <Field label="Country" error={errors.country}>
          <input value={country} onChange={(e) => setCountry(e.target.value)} className={errors.country ? errorClass : inputClass} aria-invalid={!!errors.country} />
        </Field>

        <Field label="Contact Information" hint="name, email, phone">
          <textarea value={contactInformation} onChange={(e) => setContactInformation(e.target.value)} className={inputClass} rows={2} placeholder="Rita Haddad, rita.haddad@abcbank.com, +961 1 234 567" />
        </Field>

        <Field label="Status">
          <select value={status} onChange={(e) => setStatus(e.target.value as ClientStatus)} className={inputClass}>
            <option value="Active">Active</option>
            <option value="Onboarding">Onboarding</option>
            <option value="Inactive">Inactive</option>
          </select>
        </Field>

        <Field label="Notes">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} rows={2} />
        </Field>

        <div className="flex gap-3 pt-2">
          <Button type="submit">{existing ? 'Save Changes' : 'Create Client'}</Button>
          <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}

const inputClass = 'w-full px-4 py-3 bg-transparent border border-border outline-none focus:border-primary text-base'
const errorClass = 'w-full px-4 py-3 bg-transparent border border-danger outline-none focus:border-danger text-base'

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-base mb-2 font-bold">
        {label} {hint && <span className="opacity-50 text-xs font-normal">({hint})</span>}
      </label>
      {children}
      {error && <p className="text-danger text-xs mt-1">{error}</p>}
    </div>
  )
}
