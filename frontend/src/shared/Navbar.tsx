import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { useTheme } from "../context/ThemeContext";

const baseLinks = [
  { to: "/products", label: "Products" },
  { to: "/clients", label: "Clients" },
  { to: "/deployments", label: "Deployments" },
  { to: "/team", label: "Team" },
];

export default function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { products, clients } = useData();
  const { theme } = useTheme();

  const matchingProducts = query
    ? products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    : [];
  const matchingClients = query
    ? clients.filter((c) =>
        c.companyName.toLowerCase().includes(query.toLowerCase()),
      )
    : [];

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery("");
  };

  const goToResult = (path: string) => {
    navigate(path);
    closeSearch();
    setMenuOpen(false);
  };

  const links =
    user?.role === "Admin"
      ? [...baseLinks, { to: "/admin/users", label: "Users" }]
      : baseLinks;
  const logoSrc = theme === "dark" ? "/logo-dark.svg" : "/logo-light.svg";

  return (
    <nav className="bg-bg text-text border-b border-border fixed top-0 left-0 right-0 z-30">
      <div className="flex flex-nowrap items-center gap-4 px-4 sm:px-8 h-24 navbar-text">
        <Link to="/" className="shrink-0">
          <img src={logoSrc} alt="IDS Fintech" className="h-10" />
        </Link>

        <div className="hidden min-[955px]:flex items-center gap-8 text-lg ml-6">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                isActive ? "text-primary" : "hover:text-primary"
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <div
            className={`relative items-center transition-all duration-300 ease-in-out max-[420px]:hidden ${searchOpen ? "w-56 sm:w-72 flex" : "w-11 flex"}`}
          >
            {!searchOpen ? (
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="search"
                className="icon-btn w-11 h-11 text-xl shrink-0"
              >
                <i className="bi bi-search"></i>
              </button>
            ) : (
              <div className="pill border border-border flex items-center w-full px-4 py-2 bg-bg">
                <i className="bi bi-search mr-2 opacity-60"></i>
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="search products or clients"
                  className="bg-transparent outline-none flex-1 text-base min-w-0"
                />
                <button
                  onClick={closeSearch}
                  aria-label="close search"
                  className="icon-btn ml-2 shrink-0"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
            )}

            {searchOpen && query && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-bg border border-border shadow-lg z-20">
                {matchingProducts.length === 0 &&
                  matchingClients.length === 0 && (
                    <p className="px-4 py-3 text-sm opacity-60">
                      no matches found
                    </p>
                  )}
                {matchingProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => goToResult(`/products/${p.id}`)}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-accent hover:text-black border-b border-border"
                  >
                    <i className="bi bi-box-seam mr-2"></i>
                    {p.name}
                  </button>
                ))}
                {matchingClients.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => goToResult(`/clients/${c.id}`)}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-accent hover:text-black"
                  >
                    <i className="bi bi-building mr-2"></i>
                    {c.companyName}
                  </button>
                ))}
              </div>
            )}
          </div>

          <NavLink
            to="/settings"
            aria-label="settings"
            className="icon-btn w-11 h-11 text-xl"
            style={({ isActive }) =>
              isActive
                ? { color: "var(--color-primary)", opacity: 1 }
                : undefined
            }
          >
            <i className="bi bi-gear"></i>
          </NavLink>

          <ThemeToggle />

          {user && (
            <button
              onClick={logout}
              className="hidden min-[955px]:flex items-center gap-2 px-4 py-2 border border-danger text-danger hover:bg-danger hover:text-white transition-colors text-base"
            >
              <i className="bi bi-box-arrow-right"></i>
              Log out
            </button>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="menu"
            className="icon-btn min-[955px]:hidden w-11 h-11 text-2xl"
          >
            <i className={menuOpen ? "bi bi-x-lg" : "bi bi-list"}></i>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="min-[955px]:hidden border-t border-border">
          <div className="max-[420px]:block hidden px-4 py-3 border-b border-border">
            <label className="block text-xs opacity-60 mb-2">Search</label>
            <div className="pill border border-border flex items-center px-4 py-2 bg-bg">
              <i className="bi bi-search mr-2 opacity-60"></i>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="search products or clients"
                className="bg-transparent outline-none flex-1 text-base min-w-0"
              />
            </div>

            {query && (
              <div className="mt-2 border border-border">
                {matchingProducts.length === 0 &&
                  matchingClients.length === 0 && (
                    <p className="px-4 py-3 text-sm opacity-60">
                      no matches found
                    </p>
                  )}
                {matchingProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => goToResult(`/products/${p.id}`)}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-accent hover:text-black border-b border-border"
                  >
                    <i className="bi bi-box-seam mr-2"></i>
                    {p.name}
                  </button>
                ))}
                {matchingClients.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => goToResult(`/clients/${c.id}`)}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-accent hover:text-black"
                  >
                    <i className="bi bi-building mr-2"></i>
                    {c.companyName}
                  </button>
                ))}
              </div>
            )}
          </div>

          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-3 text-base border-b border-border ${isActive ? "text-primary" : "hover:text-primary"}`
              }
            >
              {l.label}
            </NavLink>
          ))}
          {user && (
            <button
              onClick={() => {
                logout();
                setMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-3 text-base text-danger"
            >
              Log out
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
