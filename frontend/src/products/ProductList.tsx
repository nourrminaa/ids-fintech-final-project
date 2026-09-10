import { useState } from "react";
import { Link } from "react-router-dom";
import { useData } from "../context/DataContext";
import ProductCard from "./ProductCard";
import EmptyState from "../shared/EmptyState";
import Button from "../shared/Button";
import usePageMeta from "../shared/usePageMeta";
import LoadingState from "../shared/LoadingState";

export default function ProductList() {
  usePageMeta(
    "Products",
    "Every product IDS Fintech maintains, with lifecycle status, technologies and current version at a glance.",
  );

  const { products, loadingProducts, productsError } = useData();
  const loading = loadingProducts;
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [technology, setTechnology] = useState("");

  const technologies = Array.from(
    new Set(products.flatMap((p) => p.technologies)),
  ).sort();

  const filtered = products.filter((p) => {
    const matchesName = p.name.toLowerCase().includes(name.toLowerCase());
    const matchesStatus = status ? p.lifecycleStatus === status : true;
    const matchesTech = technology ? p.technologies.includes(technology) : true;
    return matchesName && matchesStatus && matchesTech;
  });

  if (loading) return <LoadingState label="Loading products" />;
  if (productsError) return <EmptyState message={`Could not load products: ${productsError}`} />;

  return (
    <div>
      <div className="flex items-center justify-between max-[413px]:flex-col max-[413px]:items-start gap-3 mb-8">
        <h1 className="page-header text-3xl">Products</h1>
        <Link to="/products/new">
          <Button>
            <i className="bi bi-plus-lg mr-1"></i>New Product
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="search by name"
          className="px-4 py-3 bg-transparent border border-border outline-none focus:border-primary w-full text-base"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-4 py-3 bg-bg border border-border outline-none focus:border-primary text-base w-full"
        >
          <option value="">All statuses</option>
          <option value="Active">Active</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Planned">Planned</option>
          <option value="Deprecated">Deprecated</option>
        </select>
        <select
          value={technology}
          onChange={(e) => setTechnology(e.target.value)}
          className="px-4 py-3 bg-bg border border-border outline-none focus:border-primary text-base w-full"
        >
          <option value="">All technologies</option>
          {technologies.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No products match your filters." />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
