import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useData } from "../context/DataContext";
import * as api from "../lib/api";
import type { Client } from "../types";
import ClientCard from "./ClientCard";
import EmptyState from "../shared/EmptyState";
import Button from "../shared/Button";
import usePageMeta from "../shared/usePageMeta";
import LoadingState from "../shared/LoadingState";

export default function ClientList() {
  usePageMeta(
    "Clients",
    "Every client IDS Fintech works with, filterable by country and the products they use.",
  );

  // products only needed here to populate the product filter dropdown, the
  // client list itself is fetched fresh below whenever a filter changes,
  // the backend already supports these filters server side
  const { products } = useData();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [productId, setProductId] = useState("");

  const [countries, setCountries] = useState<string[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setLoadError(null);
    api
      .getClients({
        companyName: name || undefined,
        country: country || undefined,
        productId: productId ? Number(productId) : undefined,
      })
      .then((result) => {
        setClients(result);
        // only build the countries dropdown off an unfiltered fetch, otherwise
        // it would keep shrinking to match whatever is currently filtered
        if (!name && !country && !productId) {
          setCountries(Array.from(new Set(result.map((c) => c.country))).sort());
        }
      })
      .catch((err) => {
        console.error('failed to load clients', err);
        setLoadError(err instanceof api.ApiError ? err.message : 'Could not reach the server');
      })
      .finally(() => setLoading(false));
  }, [name, country, productId]);

  if (loading && clients.length === 0) return <LoadingState label="Loading clients" />;
  if (loadError) return <EmptyState message={`Could not load clients: ${loadError}`} />;

  return (
    <div>
      <div className="flex items-center justify-between max-[413px]:flex-col max-[413px]:items-start gap-3 mb-8">
        <h1 className="page-header text-3xl">Clients</h1>
        <Link to="/clients/new">
          <Button>
            <i className="bi bi-plus-lg mr-1"></i>New Client
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="search by company name"
          className="px-4 py-3 bg-transparent border border-border outline-none focus:border-primary w-full text-base"
        />
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="px-4 py-3 bg-bg border border-border outline-none focus:border-primary text-base w-full"
        >
          <option value="">All countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="px-4 py-3 bg-bg border border-border outline-none focus:border-primary text-base w-full"
        >
          <option value="">All products</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {clients.length === 0 ? (
        <EmptyState message="No clients match your filters." />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {clients.map((c) => (
            <ClientCard key={c.id} client={c} />
          ))}
        </div>
      )}
    </div>
  );
}
