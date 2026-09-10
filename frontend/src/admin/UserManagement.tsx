import { useEffect, useState } from "react";
import * as api from "../lib/api";
import Badge from "../shared/Badge";
import Button from "../shared/Button";
import type { UserRole, User, TeamMember } from "../types";
import usePageMeta from "../shared/usePageMeta";
import LoadingState from "../shared/LoadingState";

export default function UserManagement() {
  usePageMeta(
    "User Management",
    "Create login accounts, assign roles and activate or deactivate people who can access the portal.",
  );

  const [users, setUsers] = useState<User[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "inactive">(
    "",
  );

  const loadUsers = async () => {
    const [userList, teamMemberList] = await Promise.all([api.getUsers(), api.getTeamMembers()]);
    setUsers(userList);
    setTeamMembers(teamMemberList);
  };

  useEffect(() => {
    setLoading(true);
    loadUsers().finally(() => setLoading(false));
  }, []);

  const handleCreate = async (email: string, password: string, role: UserRole, teamMemberId: number | null) => {
    await api.createUser(email, password, role, teamMemberId);
    await loadUsers();
  };

  const handleToggleActive = async (u: User) => {
    await api.updateUser(u.id, { isActive: !u.isActive });
    await loadUsers();
  };

  const handleSetRole = async (id: number, role: UserRole) => {
    await api.updateUser(id, { role });
    await loadUsers();
  };

  const handleSetTeamMember = async (id: number, teamMemberId: number) => {
    await api.updateUser(id, { teamMemberId });
    await loadUsers();
  };

  const filtered = users.filter((u) => {
    const matchesSearch = u.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "active"
        ? u.isActive
        : statusFilter === "inactive"
          ? !u.isActive
          : true;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <LoadingState label="Loading users" />;

  return (
    <div>
      <div className="flex items-center justify-between max-[413px]:flex-col max-[413px]:items-start gap-3 mb-8">
        <h1 className="page-header text-3xl">User Management</h1>
        <Button onClick={() => setShowCreate(true)}>
          <i className="bi bi-plus-lg mr-1"></i>New User
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="search by email"
          className="px-4 py-3 bg-transparent border border-border outline-none focus:border-primary w-full text-base"
        />
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as "" | "active" | "inactive")
          }
          className="px-4 py-3 bg-bg border border-border outline-none focus:border-primary text-base w-full"
        >
          <option value="">All statuses</option>
          <option value="active">Active only</option>
          <option value="inactive">Inactive only</option>
        </select>
      </div>

      <div className="border-t border-border">
        {filtered.length === 0 && (
          <p className="py-8 text-center opacity-60">
            No users match your search.
          </p>
        )}
        {filtered.map((u) => {
          const member = teamMembers.find((t) => t.id === u.teamMemberId);
          return (
            <div
              key={u.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between py-5 border-b border-border gap-4"
            >
              <div className="min-w-0">
                <p className="text-base font-bold truncate">{u.email}</p>
                <select
                  value={u.teamMemberId ?? ""}
                  onChange={(e) => handleSetTeamMember(u.id, Number(e.target.value))}
                  className="mt-1 px-2 py-1 bg-bg border border-border text-xs outline-none focus:border-primary"
                >
                  <option value="" disabled>
                    {member ? member.fullName : "No linked team member"}
                  </option>
                  {teamMembers.map((t) => (
                    <option key={t.id} value={t.id}>{t.fullName}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <select
                  value={u.role}
                  onChange={(e) =>
                    handleSetRole(u.id, e.target.value as UserRole)
                  }
                  className="px-3 py-2 bg-bg border border-border text-sm outline-none focus:border-primary w-36"
                >
                  <option value="Admin">Admin</option>
                  <option value="Employee">Employee</option>
                </select>

                {/* fixed width column so the row never shifts when the label changes */}
                <div className="w-24 flex justify-center">
                  <Badge status={u.isActive ? "Active" : "Inactive"} />
                </div>

                <div className="w-36">
                  <button
                    onClick={() => handleToggleActive(u)}
                    className="w-full px-4 py-2 text-sm border border-border text-text hover:border-primary transition-colors"
                  >
                    {u.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showCreate && (
        <CreateUserDialog
          teamMembers={teamMembers}
          onCreate={handleCreate}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  );
}

function CreateUserDialog({
  teamMembers,
  onCreate,
  onClose,
}: {
  teamMembers: TeamMember[];
  onCreate: (email: string, password: string, role: UserRole, teamMemberId: number | null) => Promise<void>;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("Employee");
  const [teamMemberId, setTeamMemberId] = useState<number | "">("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required");
      return;
    }
    if (!email.includes("@")) {
      setError("Enter a valid email");
      return;
    }
    try {
      await onCreate(email, password, role, teamMemberId ? Number(teamMemberId) : null);
      onClose();
    } catch (err) {
      setError(err instanceof api.ApiError ? err.message : "Could not create the user");
    }
  };

  return (
    <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50">
      <div className="bg-bg border border-border p-6 w-full max-w-sm">
        <h3 className="text-lg font-bold mb-4">New User</h3>

        <div className="space-y-3">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email"
            className="w-full px-4 py-3 bg-transparent border border-border outline-none text-base"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            className="w-full px-4 py-3 bg-transparent border border-border outline-none text-base"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full px-4 py-3 bg-bg border border-border outline-none text-base"
          >
            <option value="Admin">Admin</option>
            <option value="Employee">Employee</option>
          </select>
          <select
            value={teamMemberId}
            onChange={(e) => setTeamMemberId(e.target.value ? Number(e.target.value) : "")}
            className="w-full px-4 py-3 bg-bg border border-border outline-none text-base"
          >
            <option value="">No linked team member</option>
            {teamMembers.map((t) => (
              <option key={t.id} value={t.id}>{t.fullName}</option>
            ))}
          </select>
          {error && <p className="text-danger text-xs">{error}</p>}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create</Button>
        </div>
      </div>
    </div>
  );
}
