import { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "./lib/supabase";
import { products as localProducts } from "./data/products";
import { getProductImageUrl, handleImageError } from "./lib/image";
import { logAdminActivity } from "./lib/activity";
import {
  PlusIcon, PencilIcon, CopyIcon, TrashIcon,
  SearchIcon, SearchXIcon, ChevronDownIcon, ListIcon, GridIcon,
  StarIcon, CheckIcon, MoreHorizontalIcon,
CircleAlertIcon
} from "./lib/icons";

const PESO_SIGN = "\u20B1";

type ProductRow = Record<string, any>;

const brandList = [
  "All",
  "RPM",
  "CRBN",
  "JOOLA",
  "Honolulu",
  "Franklin",
  "Kamito",
  "Selkirk",
  "Bread and Butter",
  "Gearbox",
  "Sypik",
  "Luzz",
  "Friday",
];

const stockFilterOptions = ["All", "In Stock", "Low Stock", "Out of Stock"];

function StockBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "In Stock": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Low Stock": "bg-amber-50 text-amber-700 border-amber-200",
    "Out of Stock": "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${
        styles[status] || "bg-gray-50 text-gray-600 border-gray-200"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === "In Stock"
            ? "bg-emerald-500"
            : status === "Low Stock"
            ? "bg-amber-500"
            : "bg-red-500"
        }`}
      />
      {status}
    </span>
  );
}

function InlineStockDropdown({
  currentStatus,
  productId,
  productName,
  onUpdate,
}: {
  currentStatus: string;
  productId: number;
  productName: string;
  onUpdate: (id: number, newStatus: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(currentStatus);
  const [updating, setUpdating] = useState(false);

  const handleChange = async (newStatus: string) => {
    const prevStatus = status;
    setStatus(newStatus);
    setOpen(false);
    setUpdating(true);

    if (!isSupabaseConfigured) {
      onUpdate(productId, newStatus);
      setUpdating(false);
      return;
    }

    const { error } = await supabase
      .from("products")
      .update({ stock_status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", productId);

    if (error) {
      console.error("Failed to update stock:", error);
      setStatus(prevStatus);
      setUpdating(false);
      return;
    }

    onUpdate(productId, newStatus);
    setUpdating(false);

    await logAdminActivity({
      action: "stock_status_changed",
      description: `Updated ${productName} → ${newStatus}`,
      product_id: productId,
      product_name: productName,
      metadata: { from: prevStatus, to: newStatus },
    });
  };

  const options = ["In Stock", "Low Stock", "Out of Stock"];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={updating}
        className="flex items-center gap-1 disabled:opacity-50"
        aria-label={`Stock status: ${status}. Click to change.`}
      >
        <StockBadge status={status} />
        <ChevronDownIcon size={12} className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-20 bg-white rounded-lg border border-gray-200 shadow-lg py-1 min-w-[140px]">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleChange(opt)}
                className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                  opt === status ? "text-gray-900" : "text-gray-600"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    opt === "In Stock"
                      ? "bg-emerald-500"
                      : opt === "Low Stock"
                      ? "bg-amber-500"
                      : "bg-red-500"
                  }`}
                />
                {opt}
                {opt === status && (
                  <CheckIcon size={12} className="ml-auto text-emerald-500" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ToggleButton({
  enabled,
  loading: toggling,
  onToggle,
  labelOn,
  labelOff,
  colorOn,
}: {
  enabled: boolean;
  loading?: boolean;
  onToggle: () => void;
  labelOn: string;
  labelOff: string;
  colorOn: string;
}) {
  return (
    <button
      onClick={onToggle}
      disabled={toggling}
      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border transition-all duration-200 ${
        enabled
          ? `${colorOn} border-current`
          : "text-gray-400 border-gray-200 hover:text-gray-600 hover:border-gray-300"
      } disabled:opacity-50`}
      aria-label={`${enabled ? "Disable" : "Enable"} ${labelOn}`}
    >
      {toggling ? (
        <span className="inline-block w-3 h-3 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
      ) : enabled ? (
        <StarIcon size={12} className="fill-current" />
      ) : (
        <StarIcon size={12} />
      )}
      {enabled ? labelOn : labelOff}
    </button>
  );
}

export default function ProductListPage() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<ProductRow | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [notif, setNotif] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<number | null>(null);

  const showNotification = useCallback(
    (type: "success" | "error", message: string) => {
      setNotif({ type, message });
      setTimeout(() => setNotif(null), 3000);
    },
    []
  );

  useEffect(() => {
    fetchProducts();
  }, []);

  // Read URL filter param from dashboard stat card clicks
  useEffect(() => {
    const filter = searchParams.get("filter");
    if (filter === "featured") {
      setStockFilter("All");
      setBrandFilter("All");
    } else if (filter === "in-stock") {
      setStockFilter("In Stock");
    } else if (filter === "low-stock") {
      setStockFilter("Low Stock");
    } else if (filter === "out-of-stock") {
      setStockFilter("Out of Stock");
    }
  }, [searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    if (!isSupabaseConfigured) {
      setProducts(
        localProducts.map((p, i) => ({ ...p, id: p.id || i + 1 })) as unknown as ProductRow[]
      );
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      setError("Failed to fetch products.");
      console.error(error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;

    const deletedProduct = { ...productToDelete };

    if (!isSupabaseConfigured) {
      setProducts(products.filter((p) => p.id !== productToDelete.id));
      setProductToDelete(null);
      showNotification("success", `Deleted ${deletedProduct.name}`);
      return;
    }

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productToDelete.id);

    if (error) {
      showNotification("error", "Failed to delete product.");
      console.error(error);
    } else {
      setProducts(products.filter((p) => p.id !== productToDelete.id));
      setProductToDelete(null);
      showNotification("success", `Deleted ${deletedProduct.name}`);

      await logAdminActivity({
        action: "product_deleted",
        description: `Deleted ${deletedProduct.name}`,
        product_id: deletedProduct.id,
        product_name: deletedProduct.name,
      });
    }
    setProductToDelete(null);
  };

  const handleDuplicate = async (product: ProductRow) => {
    const newName = `${product.name} (Copy)`;

    if (!isSupabaseConfigured) {
      const newId = Math.max(...products.map((p) => p.id), 0) + 1;
      const newProduct = {
        ...product,
        id: newId,
        name: newName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setProducts([newProduct, ...products]);
      showNotification("success", `Duplicated as "${newName}"`);
      return;
    }

    const { data, error } = await supabase
      .from("products")
      .insert({
        name: newName,
        brand: product.brand,
        price: product.price,
        description: product.description || "",
        stock_status: getStockStatus(product),
        featured: false,
        is_new: false,
        image: product.image || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      showNotification("error", "Failed to duplicate product.");
      console.error(error);
    } else if (data) {
      setProducts([data as ProductRow, ...products]);
      showNotification("success", `Duplicated as "${newName}"`);

      await logAdminActivity({
        action: "product_duplicated",
        description: `Duplicated ${product.name} as "${newName}"`,
        product_id: (data as any).id,
        product_name: newName,
      });
    }
  };

  const handleToggleField = async (
    product: ProductRow,
    field: "featured" | "is_new",
    newValue: boolean
  ) => {
    const prevValue = product[field];

    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, [field]: newValue } : p))
    );

    if (!isSupabaseConfigured) {
      showNotification("success", `Updated ${product.name}`);
      return;
    }

    const updateData: Record<string, any> = {
      [field]: newValue,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", product.id);

    if (error) {
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, [field]: prevValue } : p))
      );
      showNotification("error", `Failed to update ${product.name}`);
      console.error(error);
      return;
    }

    showNotification("success", `${field === "featured" ? "Featured" : "New"} status updated`);

    const actionType =
      field === "featured" ? "featured_changed" : "is_new_changed";
    await logAdminActivity({
      action: actionType,
      description: `${product.name} → ${field}: ${newValue}`,
      product_id: product.id,
      product_name: product.name,
      metadata: { [field]: newValue },
    });
  };

  const handleStockUpdate = (id: number, newStatus: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock_status: newStatus, stockStatus: newStatus } : p))
    );
    showNotification("success", "Stock status updated");
  };

  const getStockStatus = (p: ProductRow) =>
    p.stock_status || p.stockStatus || "In Stock";

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          (p.name || "").toLowerCase().includes(q) ||
          (p.brand || "").toLowerCase().includes(q)
      );
    }
    if (brandFilter !== "All") result = result.filter((p) => p.brand === brandFilter);
    if (stockFilter !== "All") result = result.filter((p) => getStockStatus(p) === stockFilter);

    const urlFilter = searchParams.get("filter");
    if (urlFilter === "featured") {
      result = result.filter((p) => p.featured === true);
    }

    switch (sortBy) {
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
        break;
      case "oldest":
        result.sort(
          (a, b) =>
            new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
        );
        break;
      case "price-asc":
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-desc":
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "name-asc":
        result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "name-desc":
        result.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
        break;
      case "brand-asc":
        result.sort((a, b) => (a.brand || "").localeCompare(b.brand || ""));
        break;
      case "brand-desc":
        result.sort((a, b) => (b.brand || "").localeCompare(a.brand || ""));
        break;
    }
    return result;
  }, [products, searchQuery, brandFilter, stockFilter, sortBy, searchParams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-emerald-600"></div>
      </div>
    );
  }

  if (error) return <div className="text-red-500 text-center py-12">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notif && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all duration-300 ${
            notif.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {notif.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Products</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {filteredProducts.length} paddle{filteredProducts.length !== 1 ? "s" : ""} in catalog
          </p>
        </div>
        <Link
          to="/admin/products/add"
          className="sm:inline-flex hidden items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <PlusIcon size={16} />
          Add Paddle
        </Link>
      </div>

      {/* Mobile full-width Add Paddle button */}
      <Link
        to="/admin/products/add"
        className="sm:hidden w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
      >
        <PlusIcon size={16} />
        Add Paddle
      </Link>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
        {/* Mobile stacked layout */}
        <div className="sm:hidden flex flex-col gap-2.5">
          <div className="relative w-full">
            <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
            />
          </div>
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
          >
            {brandList.map((b) => (
              <option key={b} value={b}>
                {b === "All" ? "All Brands" : b}
              </option>
            ))}
          </select>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
          >
            {stockFilterOptions.map((s) => (
              <option key={s} value={s}>
                {s === "All" ? "All Stock" : s}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="brand-asc">Brand: A to Z</option>
            <option value="brand-desc">Brand: Z to A</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
          {/* Mobile View toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5 w-full">
            <button
              onClick={() => setViewMode("table")}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-all ${
                viewMode === "table"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              aria-label="List view"
            >
              <ListIcon size={16} />
              List
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-all ${
                viewMode === "grid"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              aria-label="Grid view"
            >
              <GridIcon size={16} />
              Grid
            </button>
          </div>
        </div>

        {/* Desktop filters grid */}
        <div className="hidden sm:grid sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="relative col-span-1 lg:col-span-2">
            <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
            />
          </div>
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
          >
            {brandList.map((b) => (
              <option key={b} value={b}>
                {b === "All" ? "All Brands" : b}
              </option>
            ))}
          </select>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
          >
            {stockFilterOptions.map((s) => (
              <option key={s} value={s}>
                {s === "All" ? "All Stock" : s}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="brand-asc">Brand: A to Z</option>
            <option value="brand-desc">Brand: Z to A</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
          {/* Desktop View toggle */}
          <div className="flex items-center gap-1 bg-gray-50 rounded-lg border border-gray-200 p-0.5">
            <button
              onClick={() => setViewMode("table")}
              className={`flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                viewMode === "table"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
              aria-label="Table view"
            >
              <ListIcon size={14} />
              Table
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                viewMode === "grid"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
              aria-label="Grid view"
            >
              <GridIcon size={14} />
              Grid
            </button>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {filteredProducts.length === 0 && (
        <div className="p-12 text-center bg-white rounded-xl border border-gray-200">
          <SearchXIcon size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm text-gray-400">No products match your filters</p>
        </div>
      )}

      {/* ===== DESKTOP TABLE VIEW ===== */}
      {viewMode === "table" && filteredProducts.length > 0 && (
        <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Brand</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Price</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Stock</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Featured</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">New</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product);
                return (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0 max-w-[240px]">
                        <div className="w-9 h-9 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={getProductImageUrl(product.image)}
                            alt={product.name}
                            className="w-full h-full object-contain p-1"
                            onError={handleImageError}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 truncate">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{product.brand || "—"}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 tabular-nums">
                      {product.price != null
                        ? `${PESO_SIGN}${Number(product.price).toLocaleString()}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <InlineStockDropdown
                        currentStatus={stockStatus}
                        productId={product.id}
                        productName={product.name}
                        onUpdate={handleStockUpdate}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <ToggleButton
                        enabled={!!product.featured}
                        onToggle={() => handleToggleField(product, "featured", !product.featured)}
                        labelOn="Featured"
                        labelOff="Featured"
                        colorOn="text-amber-600 bg-amber-50 border-amber-200"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <ToggleButton
                        enabled={!!product.is_new}
                        onToggle={() => handleToggleField(product, "is_new", !product.is_new)}
                        labelOn="New"
                        labelOff="New"
                        colorOn="text-blue-600 bg-blue-50 border-blue-200"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/products/edit/${product.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-gray-800 transition-colors"
                          aria-label={`Edit ${product.name}`}
                        >
                          <PencilIcon size={14} />
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDuplicate(product)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-gray-800 transition-colors"
                          title="Duplicate product"
                          aria-label={`Duplicate ${product.name}`}
                        >
                          <CopyIcon size={14} />
                          Duplicate
                        </button>
                        <button
                          onClick={() => setProductToDelete(product)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                          aria-label={`Delete ${product.name}`}
                        >
                          <TrashIcon size={14} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ===== DESKTOP GRID VIEW ===== */}
      {viewMode === "grid" && filteredProducts.length > 0 && (
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => {
            const stockStatus = getStockStatus(product);
            return (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 group"
              >
                <div className="aspect-[4/3] bg-gray-50 flex items-center justify-center p-4">
                  <img
                    src={getProductImageUrl(product.image)}
                    alt={product.name}
                    className="w-full h-full object-contain"
                    onError={handleImageError}
                  />
                </div>
                <div className="p-4 space-y-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{product.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{product.brand || "—"}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900 tabular-nums">
                      {product.price != null
                        ? `${PESO_SIGN}${Number(product.price).toLocaleString()}`
                        : "—"}
                    </span>
                    <InlineStockDropdown
                      currentStatus={stockStatus}
                      productId={product.id}
                      productName={product.name}
                      onUpdate={handleStockUpdate}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <ToggleButton
                      enabled={!!product.featured}
                      onToggle={() => handleToggleField(product, "featured", !product.featured)}
                      labelOn="Featured"
                      labelOff="Featured"
                      colorOn="text-amber-600 bg-amber-50 border-amber-200"
                    />
                    <ToggleButton
                      enabled={!!product.is_new}
                      onToggle={() => handleToggleField(product, "is_new", !product.is_new)}
                      labelOn="New"
                      labelOff="New"
                      colorOn="text-blue-600 bg-blue-50 border-blue-200"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      to={`/admin/products/edit/${product.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                      aria-label={`Edit ${product.name}`}
                    >
                      <PencilIcon size={14} />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDuplicate(product)}
                      className="inline-flex items-center justify-center px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Duplicate"
                      aria-label={`Duplicate ${product.name}`}
                    >
                      <CopyIcon size={14} />
                    </button>
                    <button
                      onClick={() => setProductToDelete(product)}
                      className="inline-flex items-center justify-center px-3 py-2 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                      title="Delete"
                      aria-label={`Delete ${product.name}`}
                    >
                      <TrashIcon size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== MOBILE CARDS ===== */}
      <div className="md:hidden space-y-3">
        {filteredProducts.map((product) => {
          const stockStatus = getStockStatus(product);
          return (
            <div key={product.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex gap-3">
                <div className="w-[72px] h-[72px] bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={getProductImageUrl(product.image)}
                    alt={product.name}
                    className="w-full h-full object-contain p-1.5"
                    onError={handleImageError}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 leading-snug">{product.name}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{product.brand || "—"}</p>
                    </div>
                    {/* 3-dot menu */}
                    <div className="relative flex-shrink-0 self-start">
                      <button
                        onClick={() =>
                          setMobileMenuOpen(mobileMenuOpen === product.id ? null : product.id)
                        }
                        className="p-2 -mr-1 -mt-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        aria-label="Product actions"
                      >
                        <MoreHorizontalIcon size={20} />
                      </button>
                      {mobileMenuOpen === product.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setMobileMenuOpen(null)} />
                          <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-lg border border-gray-200 shadow-lg py-1 w-[160px] origin-top-right">
                            <Link
                              to={`/admin/products/edit/${product.id}`}
                              onClick={() => setMobileMenuOpen(null)}
                              className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <PencilIcon size={14} className="text-gray-400 flex-shrink-0" />
                              Edit
                            </Link>
                            <button
                              onClick={() => {
                                handleDuplicate(product);
                                setMobileMenuOpen(null);
                              }}
                              className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
                            >
                              <CopyIcon size={14} className="text-gray-400 flex-shrink-0" />
                              Duplicate
                            </button>
                            <button
                              onClick={() => {
                                setProductToDelete(product);
                                setMobileMenuOpen(null);
                              }}
                              className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                            >
                              <TrashIcon size={14} className="text-red-400 flex-shrink-0" />
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-900 mt-1.5 tabular-nums">
                    {product.price != null
                      ? `${PESO_SIGN}${Number(product.price).toLocaleString()}`
                      : "—"}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <InlineStockDropdown
                      currentStatus={stockStatus}
                      productId={product.id}
                      productName={product.name}
                      onUpdate={handleStockUpdate}
                    />
                    <ToggleButton
                      enabled={!!product.featured}
                      onToggle={() => handleToggleField(product, "featured", !product.featured)}
                      labelOn="Feat."
                      labelOff="Feat."
                      colorOn="text-amber-600 bg-amber-50 border-amber-200"
                    />
                    <ToggleButton
                      enabled={!!product.is_new}
                      onToggle={() => handleToggleField(product, "is_new", !product.is_new)}
                      labelOn="New"
                      labelOff="New"
                      colorOn="text-blue-600 bg-blue-50 border-blue-200"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setProductToDelete(null)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <CircleAlertIcon size={20} className="text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center">Delete Product</h3>
            <p className="text-sm text-gray-500 text-center mt-2">
              Are you sure you want to delete{" "}
              <strong className="text-gray-900">{productToDelete.name}</strong>? This action cannot
              be undone.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setProductToDelete(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
