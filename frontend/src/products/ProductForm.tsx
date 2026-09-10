import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useData } from '../context/DataContext'
import Button from '../shared/Button'
import usePageMeta from '../shared/usePageMeta'
import LoadingState from '../shared/LoadingState'
import type { LifecycleStatus, Criticality } from '../types'

export default function ProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { products, addProduct, updateProduct, loadingProducts } = useData()
  const existing = id ? products.find((p) => p.id === Number(id)) : undefined
  usePageMeta(
    existing ? `Edit ${existing.name}` : 'New Product',
    existing ? `Update the details for ${existing.name}.` : 'Add a new product to the portal.'
  )

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [businessPurpose, setBusinessPurpose] = useState('')
  const [lifecycleStatus, setLifecycleStatus] = useState<LifecycleStatus>('Planned')
  const [currentVersion, setCurrentVersion] = useState('')
  const [criticality, setCriticality] = useState<Criticality>('Medium')
  const [supportedMarkets, setSupportedMarkets] = useState('')
  const [technologies, setTechnologies] = useState('')
  const [notes, setNotes] = useState(existing?.notes || '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (existing) {
      setName(existing.name)
      setDescription(existing.description)
      setBusinessPurpose(existing.businessPurpose)
      setLifecycleStatus(existing.lifecycleStatus)
      setCurrentVersion(existing.currentVersion)
      setCriticality(existing.criticality)
      setSupportedMarkets(existing.supportedMarkets.join(', '))
      setTechnologies(existing.technologies.join(', '))
    }
    // only ever run this when the record we are editing actually changes,
    // not on every render, or typing in the form would keep getting overwritten
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing?.id])

  // still waiting on the product list to come back and we are in edit mode,
  // do not render blank fields as if this were a brand new product
  if (id && loadingProducts && !existing) return <LoadingState label="Loading product" />

  const validate = () => {
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = 'Product name is required'
    if (!description.trim()) next.description = 'Description is required'
    if (!currentVersion.trim()) next.currentVersion = 'Current version is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const product = {
      name,
      description,
      businessPurpose,
      lifecycleStatus,
      currentVersion,
      criticality,
      supportedMarkets: supportedMarkets.split(',').map((s) => s.trim()).filter(Boolean),
      technologies: technologies.split(',').map((s) => s.trim()).filter(Boolean),
      notes,
    }

    if (existing) {
      await updateProduct(existing.id, product)
      navigate(`/products/${existing.id}`)
    } else {
      const created = await addProduct(product)
      navigate(`/products/${created.id}`)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="page-header text-3xl mb-6">{existing ? 'Edit Product' : 'New Product'}</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Product Name" error={errors.name}>
          <input value={name} onChange={(e) => setName(e.target.value)} className={errors.name ? errorClass : inputClass} aria-invalid={!!errors.name} />
        </Field>

        <Field label="Description" error={errors.description}>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={errors.description ? errorClass : inputClass} rows={2} aria-invalid={!!errors.description} />
        </Field>

        <Field label="Business Purpose">
          <textarea value={businessPurpose} onChange={(e) => setBusinessPurpose(e.target.value)} className={inputClass} rows={2} />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Lifecycle Status">
            <select value={lifecycleStatus} onChange={(e) => setLifecycleStatus(e.target.value as LifecycleStatus)} className={inputClass}>
              <option value="Active">Active</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Planned">Planned</option>
              <option value="Deprecated">Deprecated</option>
            </select>
          </Field>

          <Field label="Current Version" error={errors.currentVersion}>
            <input value={currentVersion} onChange={(e) => setCurrentVersion(e.target.value)} className={errors.currentVersion ? errorClass : inputClass} placeholder="e.g. 1.0" aria-invalid={!!errors.currentVersion} />
          </Field>
        </div>

        <Field label="Criticality">
          <select value={criticality} onChange={(e) => setCriticality(e.target.value as Criticality)} className={inputClass}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </Field>

        <Field label="Supported Markets" hint="comma separated">
          <input value={supportedMarkets} onChange={(e) => setSupportedMarkets(e.target.value)} className={inputClass} placeholder="Lebanon, UAE" />
        </Field>

        <Field label="Technologies" hint="comma separated">
          <input value={technologies} onChange={(e) => setTechnologies(e.target.value)} className={inputClass} placeholder=".NET, React" />
        </Field>

        <Field label="Notes">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} rows={2} />
        </Field>

        <div className="flex gap-3 pt-2">
          <Button type="submit">{existing ? 'Save Changes' : 'Create Product'}</Button>
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
        {label} {hint && <span className="opacity-50 text-xs">({hint})</span>}
      </label>
      {children}
      {error && <p className="text-danger text-xs mt-1">{error}</p>}
    </div>
  )
}
