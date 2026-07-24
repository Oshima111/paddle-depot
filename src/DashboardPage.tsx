import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "./lib/supabase";
import { products as localProducts } from "./data/products";
import { getProductImageUrl, handleImageError } from "./lib/image";
import {
  LayersIcon, CheckCircleIcon, AlertTriangleIcon, XCircleIcon, StarIcon,
  PlusIcon, PackageIcon, ExternalLinkIcon, ChevronRightIcon,
PencilIcon, TrashIcon, SparklesIcon, RefreshIcon, ClockIcon, CircleAlertIcon
} from "./lib/icons";

interface DashboardStats {
  totalProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  featured: number;
}

interface ProductSummary {
  id: number;
  name: string;
  brand: string;
  price: number;
  image: string;
  stockStatus: string;
  updatedAt: string;
}

interface ActivityEntry {
  id: number;
  action: string;
  description: string;
  product_name?: string;
  created_at: string;
}

type ProductRow = Record<string, any>;

function StatCard({
  title,
  value,
  icon,
  color,
  onClick,
}: {
  title: string;
  value: number;
  icon: ReactNode;
  color: string;
  onClick?: () => void;
}) {
  const content = (
    <div
      className={`bg-white rounded-xl border border-gray-200 p-5 sm:p-6 flex items-start justify-between transition-all duration-200 h-full ${
        onClick
          ? "cursor-pointer hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5"
          : ""
      }`}
    >
      <div className="min-w-0">
        <p className="text-[11px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider truncate">{title}</p>
        <p className="text-3xl sm:text-4xl font-bold text-gray-900 mt-1.5 tabular-nums">{value}</p>
      </div>
      <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ml-3 ${color}`}>
        {icon}
      </div>
    </div>
  );

  if (onClick) {
    return <button onClick={onClick} className="block w-full text-left h-full" aria-label={`View ${title}`}>{content}</button>;
  }
  return <div className="h-full">{content}</div>;
}

const StockBadge = ({ status }: { status: string }) => {
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
          status === "In Stock" ? "bg-emerald-500" : status === "Low Stock" ? "bg-amber-500" : "bg-red-500"
        }`}
      />
      {status}
    </span>
  );
};

function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return "";
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  if (isNaN(then)) return "";
  const diffMs = now - then;
  if (diffMs < 0) return "";
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

function formatActionLabel(action: string): string {
  if (action.startsWith("product_created")) return "Product Added";
  if (action.startsWith("product_duplicated")) return "Product Duplicated";
  if (action.startsWith("product_updated")) return "Product Updated";
  if (action.startsWith("product_deleted")) return "Product Deleted";
  if (action.startsWith("stock_status")) return "Stock Updated";
  if (action.startsWith("featured")) return "Featured Changed";
  if (action.startsWith("is_new")) return "New Status Changed";
  if (action.startsWith("image_uploaded")) return "Image Uploaded";
  if (action.startsWith("image_replaced")) return "Image Replaced";
  if (action.startsWith("image_removed")) return "Image Removed";
  if (action.startsWith("price_changed")) return "Price Changed";
  return "Action";
}

const getActivityIcon = (action: string, size: number = 16) => {
  if (action.startsWith("product_created") || action.startsWith("product_duplicated")) return <PlusIcon size={size} />;
  if (action.startsWith("product_deleted")) return <TrashIcon size={size} />;
  if (action.startsWith("product_updated") || action.startsWith("price_changed")) return <PencilIcon size={size} />;
  if (action.startsWith("stock_status")) return <RefreshIcon size={size} />;
  if (action.startsWith("featured") || action.startsWith("is_new")) return <StarIcon size={size} />;
  if (action.startsWith("image")) return <SparklesIcon size={size} />;
  return <CircleAlertIcon size={size} />;
};

const getActivityColor = (action: string): string => {
  if (action.startsWith("product_deleted")) return "bg-red-100 text-red-600";
  if (action.startsWith("product_created") || action.startsWith("product_duplicated")) return "bg-emerald-100 text-emerald-600";
  if (action.startsWith("featured") || action.startsWith("is_new")) return "bg-amber-100 text-amber-600";
  if (action.startsWith("stock_status")) return "bg-amber-100 text-amber-600";
  if (action.startsWith("image")) return "bg-blue-100 text-blue-600";
  return "bg-blue-100 text-blue-600";
};

function RecentProductCard({ product }: { product: ProductSummary }) {
  const PESO_SIGN = "\u20B1";
  return (
    <Link
      to={`/admin/products/edit/${product.id}`}
      className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
    >
      <div className="w-11 h-11 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
        <img
          src={getProductImageUrl(product.image)}
          alt={product.name}
          className="w-full h-full object-contain p-1.5"
          onError={handleImageError}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate leading-snug">{product.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">{product.brand}</p>
      </div>
      <div className="text-right flex-shrink-0 ml-2">
        <p className="text-sm font-semibold text-gray-900 tabular-nums">
          {PESO_SIGN}{product.price.toLocaleString()}
        </p>
        <div className="mt-1">
          <StockBadge status={product.stockStatus} />
        </div>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProducts, setRecentProducts] = useState<ProductSummary[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      let data: ProductRow[] = [];

      if (!isSupabaseConfigured) {
        data = localProducts as unknown as ProductRow[];
      } else {
        const { data: fetched, error } = await supabase
          .from("products")
          .select("*")
          .order("updated_at", { ascending: false });

        if (error) {
          console.error("Error fetching stats:", error);
        } else if (fetched) {
          data = fetched;
        }
      }

      if (data.length === 0) {
        setStats({
          totalProducts: 0,
          inStock: 0,
          lowStock: 0,
          outOfStock: 0,
          featured: 0,
        });
        setRecentProducts([]);
        setLoading(false);
        return;
      }

      const getStockStatus = (p: ProductRow) =>
        p.stock_status || p.stockStatus || "In Stock";

      setStats({
        totalProducts: data.length,
        inStock: data.filter((p) => getStockStatus(p) === "In Stock").length,
        lowStock: data.filter((p) => getStockStatus(p) === "Low Stock").length,
        outOfStock: data.filter((p) => getStockStatus(p) === "Out of Stock").length,
        featured: data.filter((p) => p.featured).length,
      });

      const recent = data.slice(0, 6).map((p) => ({
        id: p.id,
        name: p.name || "",
        brand: p.brand || "",
        price: p.price || 0,
        image: p.image || "",
        stockStatus: getStockStatus(p),
        updatedAt: p.updated_at || p.updatedAt || "",
      }));
      setRecentProducts(recent);

      setLoading(false);
    };

    fetchData();

    const fetchActivity = async () => {
      setActivityLoading(true);
      setActivityError(null);

      if (!isSupabaseConfigured) {
        setActivityLoading(false);
        return;
      }

      try {
        const { data: activityData, error: activityError } = await supabase
          .from("admin_log")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);

        if (activityError) {
          console.error("Error fetching activity:", activityError);
          if (activityError.message?.includes("does not exist")) {
            setActivityError("Activity log table not set up yet.");
          } else {
            setActivityError("Failed to load activity.");
          }
          setRecentActivity([]);
        } else {
          setRecentActivity(activityData || []);
        }
      } catch {
        setActivityError("Failed to load recent activity.");
        setRecentActivity([]);
      }
      setActivityLoading(false);
    };

    fetchActivity();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-emerald-600"></div>
      </div>
    );
  }

  const buildFilterUrl = (param: string) => {
    if (param === "all") return "/admin/products";
    if (param === "featured") return "/admin/products?filter=featured";
    return `/admin/products?filter=${param}`;
  };

const ActionsCard = ({
    icon,
    title,
    subtitle,
    onClick,
  }: {
    icon: ReactNode;
    title: string;
    subtitle: string;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className="flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200 text-left w-full group"
      aria-label={title}
    >
      <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition-colors">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
      </div>
      <ChevronRightIcon size={20} className="text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
    </button>
  );

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Dashboard Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1.5">
          Here's an overview of your Paddle Depot inventory.
        </p>
      </div>

      {/* KPI / Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
        <StatCard
          title="Total Products"
          value={stats?.totalProducts || 0}
          color="bg-emerald-50 text-emerald-600"
          onClick={() => navigate(buildFilterUrl("all"))}
          icon={<LayersIcon size={22} />}
        />
        <StatCard
          title="In Stock"
          value={stats?.inStock || 0}
          color="bg-emerald-50 text-emerald-600"
          onClick={() => navigate(buildFilterUrl("in-stock"))}
          icon={<CheckCircleIcon size={22} />}
        />
        <StatCard
          title="Low Stock"
          value={stats?.lowStock || 0}
          color="bg-amber-50 text-amber-600"
          onClick={() => navigate(buildFilterUrl("low-stock"))}
          icon={<AlertTriangleIcon size={22} />}
        />
        <StatCard
          title="Out of Stock"
          value={stats?.outOfStock || 0}
          color="bg-red-50 text-red-600"
          onClick={() => navigate(buildFilterUrl("out-of-stock"))}
          icon={<XCircleIcon size={22} />}
        />
        <StatCard
          title="Featured"
          value={stats?.featured || 0}
          color="bg-amber-50 text-amber-600"
          onClick={() => navigate(buildFilterUrl("featured"))}
          icon={<StarIcon size={22} />}
        />
      </div>

      {/* Stock Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
        <h3 className="text-base font-semibold text-gray-900 mb-5">Stock Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {[
            { label: "In Stock", value: stats?.inStock || 0, color: "bg-emerald-500", icon: <CheckCircleIcon size={18} />, iconBg: "text-emerald-600" },
            { label: "Low Stock", value: stats?.lowStock || 0, color: "bg-amber-500", icon: <AlertTriangleIcon size={18} />, iconBg: "text-amber-600" },
            { label: "Out of Stock", value: stats?.outOfStock || 0, color: "bg-red-500", icon: <XCircleIcon size={18} />, iconBg: "text-red-600" },
          ].map((item) => {
            const maxStock = Math.max(stats?.totalProducts || 1, 1);
            const pct = maxStock > 0 ? Math.round((item.value / maxStock) * 100) : 0;
            return (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={item.iconBg}>{item.icon}</span>
                    <span className="text-sm font-medium text-gray-600">{item.label}</span>
                  </div>
                  <span className="text-sm font-bold tabular-nums text-gray-900">
                    {item.value}
                    <span className="text-gray-400 font-normal text-xs ml-1">
                      ({pct}%)
                    </span>
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 lg:col-span-2">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">Recent Activity</h3>
          </div>
          {activityLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-emerald-600"></div>
            </div>
          ) : activityError ? (
            <div className="px-6 py-10 text-center">
              <CircleAlertIcon size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-400">{activityError}</p>
            </div>
          ) : !isSupabaseConfigured ? (
            <div className="px-6 py-10 text-center">
              <ClockIcon size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-400">Activity log requires Supabase.</p>
              <p className="text-xs text-gray-300 mt-1">Set up your Supabase environment variables to track admin actions.</p>
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <ClockIcon size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-500">No Recent Activity</p>
              <p className="text-xs text-gray-400 mt-1">Admin actions and product updates will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentActivity.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-3.5 px-6 py-4 hover:bg-gray-50/50 transition-colors"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${getActivityColor(entry.action)}`}
                  >
                    {getActivityIcon(entry.action)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {formatActionLabel(entry.action)}
                    </p>
                    <p className="text-sm text-gray-900 mt-0.5 leading-snug">
                      {entry.product_name || entry.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatRelativeTime(entry.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <ActionsCard
              icon={<PlusIcon size={20} />}
              title="Add Paddle"
              subtitle="Add a new product to catalog"
              onClick={() => navigate("/admin/products/add")}
            />
            <ActionsCard
              icon={<PackageIcon size={20} />}
              title="Manage Products"
              subtitle="View and edit your catalog"
              onClick={() => navigate("/admin/products")}
            />
            <ActionsCard
              icon={<AlertTriangleIcon size={20} />}
              title="Manage Stock"
              subtitle="Update stock levels quickly"
              onClick={() => navigate("/admin/products?tab=stock")}
            />
            <ActionsCard
              icon={<ExternalLinkIcon size={20} />}
              title="View Website"
              subtitle="Open the public store"
              onClick={() => window.open("/", "_blank")}
            />
          </div>
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Recent Products</h3>
          <Link
            to="/admin/products"
            className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            View all
          </Link>
        </div>
        {recentProducts.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <PackageIcon size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-400">No products yet. Start by adding your first paddle.</p>
          </div>
        ) : (
          <div>
            {recentProducts.map((product) => (
              <RecentProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

