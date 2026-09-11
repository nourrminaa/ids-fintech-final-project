import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";
import * as api from "../lib/api";
import Badge from "../shared/Badge";
import Button from "../shared/Button";
import EmptyState from "../shared/EmptyState";
import ConfirmDialog from "../shared/ConfirmDialog";
import type {
  DeploymentStatus,
  SupportTier,
  ClientDetails as ClientDetailsType,
  Environment,
  EnvironmentType,
} from "../types";
import usePageMeta from "../shared/usePageMeta";
import LoadingState from "../shared/LoadingState";

export default function ClientDetails() {
  const { id } = useParams();
  const clientId = Number(id);
  const navigate = useNavigate();
  const { deleteClient } = useData();

  const [details, setDetails] = useState<ClientDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [showAddDeployment, setShowAddDeployment] = useState(false);
  const [envDialog, setEnvDialog] = useState<{
    deploymentId: number;
    environment?: Environment;
  } | null>(null);

  const loadDetails = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await api.getClientDetails(clientId);
      setDetails(data);
      setNotFound(false);
    } catch (err) {
      if (err instanceof api.ApiError && err.status === 404) {
        setNotFound(true);
      } else {
        console.error("failed to load client details", err);
        setLoadError(
          err instanceof api.ApiError
            ? err.message
            : "Could not reach the server",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  usePageMeta(
    details ? details.client.companyName : "Client Not Found",
    details
      ? `Products, deployments and the responsible team for ${details.client.companyName}.`
      : "This client could not be found.",
  );

  if (loading) return <LoadingState label="Loading client" />;
  if (loadError)
    return <EmptyState message={`Could not load this client: ${loadError}`} />;
  if (notFound || !details) return <EmptyState message="Client not found." />;

  const { client, deployments, responsibleTeam } = details;
  const usedProducts = Array.from(
    new Map(
      deployments.map((d) => [
        d.productId,
        { id: d.productId, name: d.productName },
      ]),
    ).values(),
  );

  const handleDelete = async () => {
    await deleteClient(client.id);
    navigate("/clients");
  };

  const handleToggleModule = async (
    deploymentId: number,
    moduleId: number,
    currentlyOn: boolean,
  ) => {
    if (currentlyOn) {
      await api.disableModule(client.id, deploymentId, moduleId);
    } else {
      await api.enableModule(client.id, deploymentId, moduleId);
    }
    await loadDetails();
  };

  const handleRemoveEnvironment = async (environmentId: number) => {
    await api.deleteEnvironment(client.id, environmentId);
    await loadDetails();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="page-header text-3xl mb-2">{client.companyName}</h1>
          <p className="opacity-70 text-base">{client.country}</p>
        </div>
        <div className="flex justify-between sm:justify-end gap-2 shrink-0 w-full sm:w-auto">
          <Link to={`/clients/${client.id}/edit`} className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">
              <i className="bi bi-pencil mr-1"></i>Edit
            </Button>
          </Link>
          <Button
            variant="danger"
            className="w-full sm:w-auto"
            onClick={() => setShowDelete(true)}
          >
            <i className="bi bi-trash mr-1"></i>Delete
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div className="border border-border p-6">
          <h2 className="text-base font-bold opacity-70 mb-4">
            Client Information
          </h2>
          <dl className="space-y-3 text-sm">
            <Row label="Status">
              <Badge status={client.status} />
            </Row>
            <Row label="Contact Information">{client.contactInformation}</Row>
            {client.notes && <Row label="Notes">{client.notes}</Row>}
          </dl>
        </div>

        <div className="border border-border p-6">
          <h2 className="text-base font-bold opacity-70 mb-4">Products Used</h2>
          {usedProducts.length === 0 ? (
            <EmptyState message="No products assigned yet." />
          ) : (
            <ul className="space-y-2">
              {usedProducts.map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/products/${p.id}`}
                    className="text-sm hover:text-primary"
                  >
                    <i className="bi bi-box-seam mr-2"></i>
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold opacity-70">Deployments</h2>
          <Button variant="outline" onClick={() => setShowAddDeployment(true)}>
            <i className="bi bi-plus-lg mr-1"></i>Assign Product
          </Button>
        </div>

        {deployments.length === 0 ? (
          <EmptyState message="No deployments yet." />
        ) : (
          <div className="space-y-4">
            {deployments.map((d) => (
              <div key={d.id} className="border border-border p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-base">
                    <span className="font-bold">{d.productName}</span>{" "}
                    <span className="opacity-60 text-sm">
                      v{d.productVersion}
                    </span>
                  </p>
                  <Badge status={d.deploymentStatus} />
                </div>
                <p className="text-xs opacity-60 mb-4">
                  Go live {d.goLiveDate || "not set"}, {d.supportTier} support
                </p>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs opacity-60">Environments</p>
                    <button
                      onClick={() => setEnvDialog({ deploymentId: d.id })}
                      className="text-xs hover:text-primary"
                    >
                      <i className="bi bi-plus-lg mr-1"></i>Add Environment
                    </button>
                  </div>
                  {d.environments.length === 0 ? (
                    <p className="text-xs opacity-50">No environments yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {d.environments.map((e) => (
                        <div
                          key={e.id}
                          className="flex items-center justify-between gap-2 border border-border px-3 py-2"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Badge status={e.environmentType} />
                            <span className="text-xs truncate">
                              {e.environmentName}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() =>
                                setEnvDialog({
                                  deploymentId: d.id,
                                  environment: e,
                                })
                              }
                              aria-label={`edit ${e.environmentName}`}
                              className="icon-btn text-sm"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              onClick={() => handleRemoveEnvironment(e.id)}
                              aria-label={`remove ${e.environmentName}`}
                              className="icon-btn text-sm"
                            >
                              <i className="bi bi-x-lg"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {d.availableModules.length > 0 && (
                  <div>
                    <p className="text-xs opacity-60 mb-2">Enabled modules</p>
                    <div className="flex flex-wrap gap-2">
                      {d.availableModules.map((m) => {
                        const on = d.enabledModuleIds.includes(m.id);
                        return (
                          <button
                            key={m.id}
                            onClick={() => handleToggleModule(d.id, m.id, on)}
                            className={`px-3 py-1 text-xs border transition-colors ${on ? "border-primary text-primary" : "border-border opacity-50"}`}
                          >
                            {on ? (
                              <i className="bi bi-check-lg mr-1"></i>
                            ) : null}
                            {m.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-base font-bold opacity-70 mb-4">
          Responsible Team
        </h2>
        {responsibleTeam.length === 0 ? (
          <EmptyState message="No team members assigned." />
        ) : (
          <ul className="grid md:grid-cols-2 gap-3">
            {responsibleTeam.map((r) => (
              <li
                key={r.teamMemberId}
                className="border border-border p-4 text-sm"
              >
                <p className="font-bold">{r.teamMemberName}</p>
                <p className="opacity-60 text-xs">{r.responsibility}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showDelete && (
        <ConfirmDialog
          message={`Delete ${client.companyName}? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}

      {showAddDeployment && (
        <AddDeploymentDialog
          clientId={client.id}
          onAdded={loadDetails}
          onClose={() => setShowAddDeployment(false)}
        />
      )}

      {envDialog && (
        <EnvironmentDialog
          clientId={client.id}
          deploymentId={envDialog.deploymentId}
          environment={envDialog.environment}
          onSaved={loadDetails}
          onClose={() => setEnvDialog(null)}
        />
      )}
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="opacity-60 shrink-0">{label}</dt>
      <dd className="text-right min-w-0 break-words">{children}</dd>
    </div>
  );
}

function AddDeploymentDialog({
  clientId,
  onAdded,
  onClose,
}: {
  clientId: number;
  onAdded: () => Promise<void>;
  onClose: () => void;
}) {
  const { products } = useData();
  const [productId, setProductId] = useState(products[0]?.id ?? 0);
  const [productVersion, setProductVersion] = useState("");
  const [goLiveDate, setGoLiveDate] = useState("");
  const [deploymentStatus, setDeploymentStatus] =
    useState<DeploymentStatus>("In Progress");
  const [supportTier, setSupportTier] = useState<SupportTier>("Standard");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!productVersion.trim() || !goLiveDate.trim()) {
      setError("Version and go live date are required");
      return;
    }
    await api.addDeployment(clientId, {
      productId,
      productVersion,
      goLiveDate,
      deploymentStatus,
      supportTier,
      clientSpecificNotes: "",
    });
    await onAdded();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50">
      <div className="bg-bg border border-border p-6 w-full max-w-sm">
        <h3 className="text-lg font-bold mb-4">Assign a Product</h3>

        <div className="space-y-3">
          <select
            value={productId}
            onChange={(e) => setProductId(Number(e.target.value))}
            className="w-full px-3 py-2 bg-bg border border-border outline-none text-sm"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <input
            value={productVersion}
            onChange={(e) => setProductVersion(e.target.value)}
            placeholder="version, e.g. 3.2"
            className="w-full px-3 py-2 bg-transparent border border-border outline-none text-sm"
          />
          <input
            type="date"
            value={goLiveDate}
            onChange={(e) => setGoLiveDate(e.target.value)}
            className="w-full px-3 py-2 bg-transparent border border-border outline-none text-sm"
          />
          <select
            value={deploymentStatus}
            onChange={(e) =>
              setDeploymentStatus(e.target.value as DeploymentStatus)
            }
            className="w-full px-3 py-2 bg-bg border border-border outline-none text-sm"
          >
            <option value="In Progress">In Progress</option>
            <option value="UAT">UAT</option>
            <option value="Production">Production</option>
            <option value="Suspended">Suspended</option>
          </select>
          <select
            value={supportTier}
            onChange={(e) => setSupportTier(e.target.value as SupportTier)}
            className="w-full px-3 py-2 bg-bg border border-border outline-none text-sm"
          >
            <option value="Standard">Standard</option>
            <option value="Priority">Priority</option>
            <option value="Premium">Premium</option>
          </select>
          {error && <p className="text-danger text-xs">{error}</p>}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Assign</Button>
        </div>
      </div>
    </div>
  );
}

// used for both "add a new environment" (no environment prop) and "edit an
// existing one" (environment prop pre-fills every field), same dialog either
// way, only the submit call and the title text change
function EnvironmentDialog({
  clientId,
  deploymentId,
  environment,
  onSaved,
  onClose,
}: {
  clientId: number;
  deploymentId: number;
  environment?: Environment;
  onSaved: () => Promise<void>;
  onClose: () => void;
}) {
  const [environmentName, setEnvironmentName] = useState(
    environment?.environmentName ?? "",
  );
  const [environmentType, setEnvironmentType] = useState<EnvironmentType>(
    environment?.environmentType ?? "Development",
  );
  const [purpose, setPurpose] = useState(environment?.purpose ?? "");
  const [serverName, setServerName] = useState(environment?.serverName ?? "");
  const [operatingSystem, setOperatingSystem] = useState(
    environment?.operatingSystem ?? "",
  );
  const [applicationUrl, setApplicationUrl] = useState(
    environment?.applicationUrl ?? "",
  );
  const [databaseInfo, setDatabaseInfo] = useState(
    environment?.databaseInfo ?? "",
  );
  const [monitoringLink, setMonitoringLink] = useState(
    environment?.monitoringLink ?? "",
  );
  const [accessInstructions, setAccessInstructions] = useState(
    environment?.accessInstructions ?? "",
  );
  const [notes, setNotes] = useState(environment?.notes ?? "");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!environmentName.trim()) {
      setError("Environment name is required");
      return;
    }

    const payload = {
      environmentName,
      environmentType,
      purpose,
      serverName,
      operatingSystem,
      applicationUrl,
      databaseInfo,
      monitoringLink,
      accessInstructions,
      notes,
    };

    if (environment) {
      await api.updateEnvironment(
        clientId,
        environment.id,
        deploymentId,
        payload,
      );
    } else {
      await api.addEnvironment(clientId, deploymentId, payload);
    }
    await onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50 p-4">
      <div className="bg-bg border border-border p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold mb-4">
          {environment ? "Edit Environment" : "Add Environment"}
        </h3>

        <div className="space-y-3">
          <input
            value={environmentName}
            onChange={(e) => setEnvironmentName(e.target.value)}
            placeholder="environment name, e.g. Production"
            className="w-full px-3 py-2 bg-transparent border border-border outline-none text-sm"
          />
          <select
            value={environmentType}
            onChange={(e) =>
              setEnvironmentType(e.target.value as EnvironmentType)
            }
            className="w-full px-3 py-2 bg-bg border border-border outline-none text-sm"
          >
            <option value="Development">Development</option>
            <option value="Testing">Testing</option>
            <option value="UAT">UAT</option>
            <option value="Production">Production</option>
          </select>
          <input
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="purpose"
            className="w-full px-3 py-2 bg-transparent border border-border outline-none text-sm"
          />
          <input
            value={serverName}
            onChange={(e) => setServerName(e.target.value)}
            placeholder="server name"
            className="w-full px-3 py-2 bg-transparent border border-border outline-none text-sm"
          />
          <input
            value={operatingSystem}
            onChange={(e) => setOperatingSystem(e.target.value)}
            placeholder="operating system"
            className="w-full px-3 py-2 bg-transparent border border-border outline-none text-sm"
          />
          <input
            value={applicationUrl}
            onChange={(e) => setApplicationUrl(e.target.value)}
            placeholder="application url"
            className="w-full px-3 py-2 bg-transparent border border-border outline-none text-sm"
          />
          <input
            value={databaseInfo}
            onChange={(e) => setDatabaseInfo(e.target.value)}
            placeholder="database information"
            className="w-full px-3 py-2 bg-transparent border border-border outline-none text-sm"
          />
          <input
            value={monitoringLink}
            onChange={(e) => setMonitoringLink(e.target.value)}
            placeholder="monitoring link"
            className="w-full px-3 py-2 bg-transparent border border-border outline-none text-sm"
          />
          <input
            value={accessInstructions}
            onChange={(e) => setAccessInstructions(e.target.value)}
            placeholder="access instructions / reference (no passwords or secrets)"
            className="w-full px-3 py-2 bg-transparent border border-border outline-none text-sm"
          />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="notes"
            rows={2}
            className="w-full px-3 py-2 bg-transparent border border-border outline-none text-sm"
          />
          {error && <p className="text-danger text-xs">{error}</p>}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>{environment ? "Save" : "Add"}</Button>
        </div>
      </div>
    </div>
  );
}
