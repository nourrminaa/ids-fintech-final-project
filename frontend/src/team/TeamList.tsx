import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import * as api from '../lib/api'
import type { TeamMember, TeamMemberStatus } from '../types'
import Badge from '../shared/Badge'
import Button from '../shared/Button'
import ConfirmDialog from '../shared/ConfirmDialog'
import EmptyState from '../shared/EmptyState'
import usePageMeta from '../shared/usePageMeta'
import LoadingState from '../shared/LoadingState'

export default function TeamList() {
  usePageMeta('Team Members', 'IDS Fintech employees involved in building and supporting the portfolio, searchable by name and department.')

  const { user } = useAuth()
  const isAdmin = user?.role === 'Admin'

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [department, setDepartment] = useState('')
  const [departments, setDepartments] = useState<string[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<TeamMember | null>(null)
  const [pendingDelete, setPendingDelete] = useState<TeamMember | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const result = await api.getTeamMembers({ fullName: name || undefined, department: department || undefined })
      setTeamMembers(result)
      if (!name && !department) {
        setDepartments(Array.from(new Set(result.map((t) => t.department))).sort())
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, department])

  const handleDelete = async () => {
    if (!pendingDelete) return
    await api.deleteTeamMember(pendingDelete.id)
    setPendingDelete(null)
    await load()
  }

  if (loading && teamMembers.length === 0) return <LoadingState label="Loading the team" />

  return (
    <div>
      <div className="flex items-center justify-between max-[413px]:flex-col max-[413px]:items-start gap-3 mb-8">
        <h1 className="page-header text-3xl">Team Members</h1>
        {isAdmin && (
          <Button onClick={() => setShowCreate(true)}>
            <i className="bi bi-plus-lg mr-1"></i>New Team Member
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="search by name"
          className="px-4 py-3 bg-transparent border border-border outline-none focus:border-primary w-full text-base"
        />
        <select value={department} onChange={(e) => setDepartment(e.target.value)} className="px-4 py-3 bg-bg border border-border outline-none focus:border-primary text-base w-full">
          <option value="">All departments</option>
          {departments.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {teamMembers.length === 0 ? (
        <EmptyState message="No team members match your filters." />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {teamMembers.map((t) => (
            <div key={t.id} className="flex flex-col h-full border border-border p-6 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold">{t.fullName}</h3>
                <Badge status={t.status} />
              </div>
              <p className="text-sm opacity-70">{t.jobTitle}</p>
              <p className="text-xs opacity-60 mt-1">{t.department}</p>
              <div className="flex-1" />
              <div className="mt-5 pt-4 border-t border-border">
                <p className="text-xs opacity-60">{t.email}</p>
                {isAdmin && (
                  <div className="flex gap-3 mt-3">
                    <button onClick={() => setEditing(t)} className="text-xs hover:text-primary">
                      <i className="bi bi-pencil mr-1"></i>Edit
                    </button>
                    <button onClick={() => setPendingDelete(t)} className="text-xs text-danger hover:opacity-70">
                      <i className="bi bi-trash mr-1"></i>Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <TeamMemberDialog
          onSave={async (member) => {
            await api.createTeamMember(member)
            setShowCreate(false)
            await load()
          }}
          onClose={() => setShowCreate(false)}
        />
      )}

      {editing && (
        <TeamMemberDialog
          initial={editing}
          onSave={async (member) => {
            await api.updateTeamMember(editing.id, member)
            setEditing(null)
            await load()
          }}
          onClose={() => setEditing(null)}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          message={`Delete ${pendingDelete.fullName}? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  )
}

function TeamMemberDialog({
  initial,
  onSave,
  onClose,
}: {
  initial?: TeamMember
  onSave: (member: Omit<TeamMember, 'id'>) => Promise<void>
  onClose: () => void
}) {
  const [fullName, setFullName] = useState(initial?.fullName || '')
  const [jobTitle, setJobTitle] = useState(initial?.jobTitle || '')
  const [department, setDepartment] = useState(initial?.department || '')
  const [email, setEmail] = useState(initial?.email || '')
  const [status, setStatus] = useState<TeamMemberStatus>(initial?.status || 'Active')
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!fullName.trim() || !jobTitle.trim() || !department.trim() || !email.trim()) {
      setError('All fields except status are required')
      return
    }
    try {
      await onSave({ fullName, jobTitle, department, email, status })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this team member')
    }
  }

  return (
    <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50">
      <div className="bg-bg border border-border p-6 w-full max-w-sm">
        <h3 className="text-lg font-bold mb-4">{initial ? 'Edit Team Member' : 'New Team Member'}</h3>

        <div className="space-y-3">
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="full name" className="w-full px-4 py-3 bg-transparent border border-border outline-none text-base" />
          <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="job title" className="w-full px-4 py-3 bg-transparent border border-border outline-none text-base" />
          <input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="department" className="w-full px-4 py-3 bg-transparent border border-border outline-none text-base" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" className="w-full px-4 py-3 bg-transparent border border-border outline-none text-base" />
          <select value={status} onChange={(e) => setStatus(e.target.value as TeamMemberStatus)} className="w-full px-4 py-3 bg-bg border border-border outline-none text-base">
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          {error && <p className="text-danger text-xs">{error}</p>}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>{initial ? 'Save Changes' : 'Create'}</Button>
        </div>
      </div>
    </div>
  )
}
