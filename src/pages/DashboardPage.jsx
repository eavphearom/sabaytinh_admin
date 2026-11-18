import {
  ArrowDownRight,
  ArrowUpRight,
  CircleDollarSign,
  PackageCheck,
  ShoppingCart,
  Users,
} from "lucide-react";
import useDashboard from "../features/dashboard/hooks/useDashboard";
import RecentOrders from "../features/dashboard/components/RecentOrders";
const statDefinitions = [
  { label: "Total Revenue", key: "total_revenue", icon: CircleDollarSign, money: true },
  { label: "Orders", key: "orders", icon: ShoppingCart },
  { label: "Customers", key: "customers", icon: Users },
  { label: "Low Stock", key: "low_stock", icon: PackageCheck },
];
function formatValue(value, currency) {
  if (value === null || value === undefined || value === "") return "—";
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return currency
    ? new Intl.NumberFormat("en-US", { style: "currency", currency, currencyDisplay: "code" }).format(number)
    : new Intl.NumberFormat("en-US").format(number);
}
function formatChange(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(String(value).replace("%", ""));
  if (!Number.isFinite(n)) return null;
  return { change: `${n > 0 ? "+" : ""}${n}%`, trend: n >= 0 ? "up" : "down" };
}
const salesData = [44, 58, 42, 72, 64, 86, 78, 92, 84, 96, 88, 104];
const topProducts = [
  {
    name: "Air Runner Pro",
    category: "Running Shoes",
    sales: 328,
    stock: 42,
  },
  {
    name: "Urban Court Low",
    category: "Sneakers",
    sales: 286,
    stock: 36,
  },
  {
    name: "Trail Flex Max",
    category: "Outdoor",
    sales: 214,
    stock: 18,
  },
];
const activities = [
  "New order placed for Air Runner Pro",
  "Classic Leather stock updated",
  "New customer account created",
  "Trail Flex Max moved to low stock",
];
export default function DashboardPage() {
  const { dashboard, isLoading, isError, error, refetch } = useDashboard();
  const stats = statDefinitions.map(({ key, money, ...definition }) => {
    const metric = dashboard?.[key];
    const entries = money
      ? [Array.isArray(metric) ? metric.find((entry) => entry.currency === "USD") : null]
      : [metric];
    return {
      ...definition,
      money,
      values: entries.map((entry, index) => ({
        key: entry?.currency ?? index,
        value: isLoading ? "Loading..." : formatValue(entry?.value, money ? entry?.currency : undefined),
        ...formatChange(entry?.percentage_change),
      })),
    };
  });

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track your shoe store performance and recent activity.
          </p>
        </div>
        {/* <div className="flex gap-3">
          <Button variant="secondary">Export</Button>
          <Button>New Product</Button>
        </div> */}
      </section>
      {isError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-white p-4">
          <p className="font-semibold text-red-600">Failed to load dashboard statistics</p>
          <p className="mt-1 text-sm text-slate-500">
            {error?.response?.data?.message || error?.message || "Please try again."}
          </p>
          <button type="button" onClick={() => refetch()} className="mt-3 rounded-md bg-slate-900 px-4 py-2 text-sm text-white">
            Retry
          </button>
        </div>
      )}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.label}
                  </p>
                  {stat.values.map((entry) => {
                    const TrendIcon = entry.trend === "up" ? ArrowUpRight : ArrowDownRight;
                    return (
                      <div key={entry.key} className="mt-2">
                        <p className={`${stat.money ? "text-xl" : "text-2xl"} font-bold text-slate-950`}>{entry.value}</p>
                        {entry.change && (
                          <div className="mt-4 flex items-center gap-2 text-sm">
                            <span className={`inline-flex items-center gap-1 font-semibold ${entry.trend === "up" ? "text-emerald-600" : "text-red-600"}`}>
                              <TrendIcon size={16} />
                              {entry.change}
                            </span>
                            <span className="text-slate-500">from last month</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="rounded-lg bg-orange-50 p-2 text-orange-700">
                  <Icon size={22} />
                </div>
              </div>
            </div>
          );
        })}
      </section>
      {/* <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Sales Overview
              </h2>
              <p className="text-sm text-slate-500">
                Monthly revenue across the year
              </p>
            </div>
            <button
              type="button"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              aria-label="More sales options"
            >
              <MoreHorizontal size={20} />
            </button>
          </div>
          <div className="flex h-72 items-end gap-3 border-b border-slate-100 pb-4">
            {salesData.map((value, index) => (
              <div
                key={index}
                className="flex flex-1 flex-col items-center gap-3"
              >
                <div className="flex h-56 w-full items-end rounded-t-lg bg-slate-100">
                  <div
                    className="w-full rounded-t-lg bg-[#F97316] transition hover:bg-[#EA580C]"
                    style={{ height: `${value}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-slate-400">
                  {[
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                  ][index]}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Top Products
              </h2>
              <p className="text-sm text-slate-500">
                Best sellers this month
              </p>
            </div>
            <Star size={20} className="text-amber-400" />
          </div>
          <div className="space-y-4">
            {topProducts.map((product) => (
              <div
                key={product.name}
                className="rounded-lg border border-slate-100 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {product.name}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {product.category}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-orange-700">
                    {product.sales} sold
                  </span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-[#F97316]"
                    style={{ width: `${Math.min(product.sales / 4, 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {product.stock} items in stock
                </p>
              </div>
            ))}
          </div>
        </div>
      </section> */}
      <RecentOrders />
      <section>
        {/* <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            Activity
          </h2>
          <p className="text-sm text-slate-500">
            Store updates and alerts
          </p>
          <div className="mt-5 space-y-4">
            {activities.map((activity, index) => (
              <div key={activity} className="flex gap-3">
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-[#F97316]" />
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {activity}
                  </p>
                  <p className="text-xs text-slate-500">
                    {index + 1}h ago
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div> */}
      </section>
    </div>
  );
}
