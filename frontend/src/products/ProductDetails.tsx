import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";
import * as api from "../lib/api";
import type { ProductDetails as ProductDetailsType, TeamMember, DocumentType } from "../types";
import Badge from "../shared/Badge";
import Button from "../shared/Button";
import EmptyState from "../shared/EmptyState";
import ConfirmDialog from "../shared/ConfirmDialog";
import usePageMeta from "../shared/usePageMeta";
import LoadingState from "../shared/LoadingState";

const documentTypes: DocumentType[] = [
  "Technical Documentation",
  "Functional Documentation",
  "Deployment Guide",
  "Architecture Diagram",
  "Postman Collection",
  "API Documentation",
  "Release Notes",
  "User Guide",
];

export default function ProductDetails() {
  const { id } = useParams();
  const productId = Number(id);
  const navigate = useNavigate();
  const { deleteProduct } = useData();

  const [details, setDetails] = useState<ProductDetailsType | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [newModuleName, setNewModuleName] = useState("");

  const loadDetails = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await api.getProductDetails(productId);
      setDetails(data);
      setNotFound(false);
    } catch (err) {
      if (err instanceof api.ApiError && err.status === 404) {
        setNotFound(true);
      } else {
        console.error("failed to load product details", err);
        setLoadError(err instanceof api.ApiError ? err.message : "Could not reach the server");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
    // team members list is only needed for the "assign someone" dropdown,
    // fetched once regardless of whether this person can actually edit
    api.getTeamMembers().then(setTeamMembers).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  usePageMeta(
    details ? details.product.name : "Product Not Found",
    details
      ? `Details, modules, clients and team for ${details.product.name}.`
      : "This product could not be found.",
  );

  if (loading) return <LoadingState label="Loading product" />;
  if (loadError) return <EmptyState message={`Could not load this product: ${loadError}`} />;
  if (notFound || !details) return <EmptyState message="Product not found." />;

  const { product, modules, clientsUsingProduct, responsibleTeam, repositories, documents, canEdit } = details;

  const handleAddModule = async () => {
    if (!newModuleName.trim()) return;
    await api.addModule(product.id, { name: newModuleName, description: "", status: "Planned" });
    setNewModuleName("");
    await loadDetails();
  };

  const handleDeleteModule = async (moduleId: number) => {
    await api.deleteModule(moduleId);
    await loadDetails();
  };

  const handleDelete = async () => {
    await deleteProduct(product.id);
    navigate("/products");
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="page-header text-3xl mb-2">{product.name}</h1>
          <p className="opacity-70 text-base">{product.description}</p>
        </div>
        <div className="flex justify-between sm:justify-end gap-2 shrink-0 w-full sm:w-auto">
          <Link
            to={`/products/${product.id}/edit`}
            className="w-full sm:w-auto"
          >
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
            Product Information
          </h2>
          <dl className="space-y-3 text-sm">
            <Row label="Status">
              <Badge status={product.lifecycleStatus} />
            </Row>
            <Row label="Version">{product.currentVersion}</Row>
            <Row label="Criticality">{product.criticality}</Row>
            <Row label="Business Purpose">{product.businessPurpose}</Row>
            <Row label="Supported Markets">
              {product.supportedMarkets.join(", ") || "—"}
            </Row>
            <Row label="Technologies">
              {product.technologies.join(", ") || "—"}
            </Row>
            {product.notes && <Row label="Notes">{product.notes}</Row>}
          </dl>
        </div>

        <div className="border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold opacity-70">Modules</h2>
          </div>
          {modules.length === 0 ? (
            <EmptyState message="No modules added yet." />
          ) : (
            <ul className="divide-y divide-border mb-4">
              {modules.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <span>{m.name}</span>
                  <div className="flex items-center gap-3">
                    <Badge status={m.status} />
                    <button
                      onClick={() => handleDeleteModule(m.id)}
                      aria-label={`remove ${m.name} module`}
                      className="icon-btn text-base"
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            <input
              value={newModuleName}
              onChange={(e) => setNewModuleName(e.target.value)}
              placeholder="new module name"
              className="flex-1 px-3 py-2 bg-transparent border border-border outline-none focus:border-primary text-sm"
            />
            <Button variant="outline" onClick={handleAddModule}>
              Add
            </Button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-10">
        <div>
          <h2 className="text-base font-bold opacity-70 mb-4">
            Clients Using This Product
          </h2>
          {clientsUsingProduct.length === 0 ? (
            <EmptyState message="No clients yet." />
          ) : (
            <ul className="space-y-2">
              {clientsUsingProduct.map((c) => (
                <li key={c.id}>
                  <Link
                    to={`/clients/${c.id}`}
                    className="text-sm hover:text-primary"
                  >
                    <i className="bi bi-building mr-2"></i>
                    {c.companyName}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs opacity-50 mt-3">
            Set automatically when a product is assigned to a client from the client's page.
          </p>
        </div>

        <ResponsibleTeamSection
          productId={product.id}
          responsibleTeam={responsibleTeam}
          teamMembers={teamMembers}
          canEdit={canEdit}
          onChanged={loadDetails}
        />

        <RepositoriesSection
          productId={product.id}
          repositories={repositories}
          canEdit={canEdit}
          onChanged={loadDetails}
        />
      </div>

      <DocumentationSection
        productId={product.id}
        documents={documents}
        canEdit={canEdit}
        onChanged={loadDetails}
      />

      {showDelete && (
        <ConfirmDialog
          message={`Delete ${product.name}? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
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
      <dd className="text-right">{children}</dd>
    </div>
  );
}

function ResponsibleTeamSection({
  productId,
  responsibleTeam,
  teamMembers,
  canEdit,
  onChanged,
}: {
  productId: number;
  responsibleTeam: ProductDetailsType["responsibleTeam"];
  teamMembers: TeamMember[];
  canEdit: boolean;
  onChanged: () => Promise<void>;
}) {
  const [teamMemberId, setTeamMemberId] = useState<number | "">("");
  const [responsibility, setResponsibility] = useState("");

  const handleAdd = async () => {
    if (!teamMemberId || !responsibility.trim()) return;
    await api.addProductResponsibility(productId, Number(teamMemberId), responsibility, "");
    setTeamMemberId("");
    setResponsibility("");
    await onChanged();
  };

  const handleRemove = async (responsibilityId: number) => {
    await api.deleteProductResponsibility(productId, responsibilityId);
    await onChanged();
  };

  return (
    <div>
      <h2 className="text-base font-bold opacity-70 mb-4">Responsible Team</h2>
      {responsibleTeam.length === 0 ? (
        <EmptyState message="No team members assigned." />
      ) : (
        <ul className="space-y-3 mb-4">
          {responsibleTeam.map((r) => (
            <li key={r.id} className="text-sm flex items-start justify-between gap-2">
              <div>
                <p>{r.teamMemberName}</p>
                <p className="opacity-60 text-xs">{r.responsibility}</p>
              </div>
              {canEdit && (
                <button
                  onClick={() => handleRemove(r.id)}
                  aria-label={`remove ${r.teamMemberName}`}
                  className="icon-btn text-sm shrink-0"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {canEdit && (
        <div className="space-y-2">
          <select
            value={teamMemberId}
            onChange={(e) => setTeamMemberId(e.target.value ? Number(e.target.value) : "")}
            className="w-full px-3 py-2 bg-bg border border-border outline-none text-sm"
          >
            <option value="">Choose a team member</option>
            {teamMembers.map((t) => (
              <option key={t.id} value={t.id}>{t.fullName}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              value={responsibility}
              onChange={(e) => setResponsibility(e.target.value)}
              placeholder="responsibility, e.g. Backend Developer"
              className="flex-1 px-3 py-2 bg-transparent border border-border outline-none focus:border-primary text-sm"
            />
            <Button variant="outline" onClick={handleAdd}>Add</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function RepositoriesSection({
  productId,
  repositories,
  canEdit,
  onChanged,
}: {
  productId: number;
  repositories: ProductDetailsType["repositories"];
  canEdit: boolean;
  onChanged: () => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [githubUrl, setGithubUrl] = useState("");

  const handleAdd = async () => {
    if (!name.trim() || !githubUrl.trim()) return;
    await api.addRepository(productId, { name, githubUrl, mainBranch: "main", description: "" });
    setName("");
    setGithubUrl("");
    await onChanged();
  };

  const handleRemove = async (repositoryId: number) => {
    await api.deleteRepository(productId, repositoryId);
    await onChanged();
  };

  return (
    <div>
      <h2 className="text-base font-bold opacity-70 mb-4">Repositories</h2>
      {repositories.length === 0 ? (
        <EmptyState message="No repositories linked." />
      ) : (
        <ul className="space-y-2 mb-4">
          {repositories.map((r) => (
            <li key={r.id} className="text-sm flex items-center justify-between gap-2">
              <a
                href={r.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-primary cursor-pointer"
              >
                <i className="bi bi-github mr-2"></i>
                {r.name}
              </a>
              {canEdit && (
                <button
                  onClick={() => handleRemove(r.id)}
                  aria-label={`remove ${r.name}`}
                  className="icon-btn text-sm shrink-0"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {canEdit && (
        <div className="space-y-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="repository name"
            className="w-full px-3 py-2 bg-transparent border border-border outline-none focus:border-primary text-sm"
          />
          <div className="flex gap-2">
            <input
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="github url"
              className="flex-1 px-3 py-2 bg-transparent border border-border outline-none focus:border-primary text-sm"
            />
            <Button variant="outline" onClick={handleAdd}>Add</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function DocumentationSection({
  productId,
  documents,
  canEdit,
  onChanged,
}: {
  productId: number;
  documents: ProductDetailsType["documents"];
  canEdit: boolean;
  onChanged: () => Promise<void>;
}) {
  const [documentName, setDocumentName] = useState("");
  const [documentType, setDocumentType] = useState<DocumentType>("Technical Documentation");
  const [urlOrFileReference, setUrlOrFileReference] = useState("");

  const handleAdd = async () => {
    if (!documentName.trim() || !urlOrFileReference.trim()) return;
    await api.addDocument(productId, {
      documentName,
      documentType,
      description: "",
      urlOrFileReference,
      lastUpdatedDate: new Date().toISOString().slice(0, 10),
    });
    setDocumentName("");
    setUrlOrFileReference("");
    await onChanged();
  };

  const handleRemove = async (documentId: number) => {
    await api.deleteDocument(productId, documentId);
    await onChanged();
  };

  return (
    <div>
      <h2 className="text-base font-bold opacity-70 mb-4">Documentation</h2>
      {documents.length === 0 ? (
        <EmptyState message="No documentation linked." />
      ) : (
        <div className="grid md:grid-cols-2 gap-3 mb-4">
          {documents.map((d) => (
            <div key={d.id} className="border border-border p-4 flex items-start justify-between gap-2">
              <a
                href={d.urlOrFileReference}
                target="_blank"
                rel="noreferrer"
                className="hover:text-primary block"
              >
                <p className="text-sm">{d.documentName}</p>
                <p className="text-xs opacity-60">
                  {d.documentType}, updated {d.lastUpdatedDate}
                </p>
              </a>
              {canEdit && (
                <button
                  onClick={() => handleRemove(d.id)}
                  aria-label={`remove ${d.documentName}`}
                  className="icon-btn text-sm shrink-0"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {canEdit && (
        <div className="max-w-md space-y-2">
          <input
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            placeholder="document name"
            className="w-full px-3 py-2 bg-transparent border border-border outline-none focus:border-primary text-sm"
          />
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value as DocumentType)}
            className="w-full px-3 py-2 bg-bg border border-border outline-none text-sm"
          >
            {documentTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              value={urlOrFileReference}
              onChange={(e) => setUrlOrFileReference(e.target.value)}
              placeholder="url or file reference"
              className="flex-1 px-3 py-2 bg-transparent border border-border outline-none focus:border-primary text-sm"
            />
            <Button variant="outline" onClick={handleAdd}>Add</Button>
          </div>
        </div>
      )}
    </div>
  );
}
