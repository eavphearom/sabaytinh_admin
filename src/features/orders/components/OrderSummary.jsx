import { useQuery } from "@tanstack/react-query";
import { Package, Truck, User, CreditCard, Receipt, Clock } from "lucide-react";
import Button from "../../../components/ui/Button";
import orderService from "../services/orderService";

const display = (value) => value == null || value === "" ? "—" : value;
const money = (value, currency) => value == null || value === "" || !Number.isFinite(Number(value))
  ? "—" : `${currency ?? ""} ${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`.trim();

function Status({ value }) {
  const status = String(value ?? "").toUpperCase();
  const styles = {
    PAID: "bg-emerald-50 text-emerald-700 ring-emerald-200", DELIVERED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    PENDING: "bg-amber-50 text-amber-700 ring-amber-200", PROCESSING: "bg-orange-50 text-orange-700 ring-orange-200",
    SHIPPED: "bg-indigo-50 text-indigo-700 ring-indigo-200", CANCELLED: "bg-red-50 text-red-700 ring-red-200",
    FAILED: "bg-red-50 text-red-700 ring-red-200",
  };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${styles[status] || "bg-slate-50 text-slate-600 ring-slate-200"}`}>{status ? status.charAt(0) + status.slice(1).toLowerCase().replaceAll("_", " ") : "—"}</span>;
}

function Section({ title, icon: Icon, children }) {
  return <section className="min-w-0 rounded-xl border border-slate-200 bg-white">
    <h3 className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-900"><Icon size={17} className="text-slate-400" />{title}</h3>
    <div className="p-4">{children}</div>
  </section>;
}

function Fields({ entries }) {
  return <dl className="space-y-3">{entries.map(([label, value]) => <div key={label} className="min-w-0">
    <dt className="text-xs text-slate-500">{label}</dt><dd className="mt-0.5 whitespace-pre-wrap break-words text-sm font-medium text-slate-800">{display(value)}</dd>
  </div>)}</dl>;
}

function ProductImage({ src, name }) {
  return <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
    {src ? <img src={src} alt={name || "Product"} className="h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} /> : <Package size={24} className="text-slate-400" />}
  </div>;
}

export default function OrderSummary({ orderId }) {
  const { data: order, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin", "orders", "detail", orderId],
    enabled: orderId != null,
    queryFn: async ({ signal }) => {
      const response = await orderService.getById(orderId, signal);
      if (!response.data || typeof response.data !== "object" || Array.isArray(response.data)) throw new Error("Unexpected order details response.");
      return response.data;
    },
    retry: 1,
  });
  if (isPending) return <div role="status" className="space-y-4 py-6"><p className="text-center text-sm text-slate-500">Loading order details...</p><div className="h-24 animate-pulse rounded-xl bg-slate-100 motion-reduce:animate-none" /><div className="h-48 animate-pulse rounded-xl bg-slate-100 motion-reduce:animate-none" /></div>;
  if (isError) return <div role="alert" className="space-y-3 rounded-xl bg-red-50 p-5"><p className="font-semibold text-red-700">Could not load order details</p><p className="text-sm text-red-600">{error?.response?.data?.message || error.message}</p><Button variant="secondary" onClick={() => refetch()} loading={isFetching}>Try again</Button></div>;
  const items = order.items ?? [];
  const payments = order.payments ?? [];
  const history = order.status_history ?? [];
  const invoice = order.invoice;
  return <div className="space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl bg-slate-50 p-5">
      <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Order overview</p><h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">{display(order.order_code)}</h3><p className="mt-1 text-xs text-slate-500">Placed {display(order.created_at)}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3"><span className="flex items-center gap-2 text-xs text-slate-500">Order <Status value={order.order_status} /></span><span className="flex items-center gap-2 text-xs text-slate-500">Payment <Status value={order.payment_status} /></span></div>
      </div>
      <div><p className="text-xs text-slate-500">Order total</p><p className="mt-1 text-xl font-bold text-slate-950">{money(order.total_amount, order.currency)}</p></div>
    </div>
    <div className="grid items-start gap-5 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <div className="min-w-0 space-y-5">
        <Section title={`Order items (${items.length})`} icon={Package}>
          {items.length ? <ul className="divide-y divide-slate-100">{items.map(item => <li key={item.id} className="flex gap-3 py-4 first:pt-0 last:pb-0">
            <ProductImage src={item.image} name={item.product_name} />
            <div className="min-w-0 flex-1"><p className="break-words text-sm font-semibold text-slate-900">{display(item.product_name)}</p><p className="mt-1 text-xs text-slate-500">{display(item.color_name)} · Size {display(item.size_name)}</p><p className="mt-1 break-all text-xs text-slate-400">SKU: {display(item.sku)}</p><div className="mt-2 flex flex-wrap justify-between gap-2 text-sm"><span className="text-slate-500">{display(item.quantity)} × {money(item.unit_price, order.currency)}</span><span className="font-semibold text-slate-900">{money(item.subtotal, order.currency)}</span></div></div>
          </li>)}</ul> : <p className="text-sm text-slate-500">No items available.</p>}
        </Section>
        <Section title="Payments" icon={CreditCard}>
          {payments.length ? <div className="space-y-4">{payments.map(payment => <div key={payment.id} className="rounded-lg border border-slate-200 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold text-slate-900">{money(payment.amount, payment.currency)}</p><Status value={payment.payment_status} /></div>
            <p className="mb-3 mt-1 text-xs text-slate-500">{display(payment.payment_method)}</p>
            <Fields entries={[["Transaction ID", payment.transaction_id], ["Payment reference", payment.payment_reference], ["Paid at", payment.paid_at]]} />
            {payment.checkout_message && <p className="mt-3 text-xs text-slate-500">{payment.checkout_message}</p>}
            {payment.note && <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-600">{payment.note}</p>}
          </div>)}</div> : <p className="text-sm text-slate-500">No payment records yet.</p>}
        </Section>
        <Section title="Order timeline" icon={Clock}>
          {history.length ? <ol className="space-y-5 border-l border-slate-200 pl-4">{history.map(event => <li key={event.id} className="relative"><span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-orange-500 ring-4 ring-white" /><div className="flex flex-wrap items-center gap-2">{event.old_status && <><Status value={event.old_status} /><span className="text-xs text-slate-400">→</span></>}<Status value={event.new_status} /></div><p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-700">{display(event.note)}</p><p className="mt-1 text-xs text-slate-400">{display(event.changed_at)}{event.changed_by != null ? ` · User #${event.changed_by}` : ""}</p></li>)}</ol> : <p className="text-sm text-slate-500">No status history available.</p>}
        </Section>
      </div>
      <div className="min-w-0 space-y-5">
        <Section title="Customer" icon={User}><Fields entries={[["Name", order.customer?.username], ["Email", order.customer?.email], ["Phone", order.customer?.phone]]} /></Section>
        <Section title="Delivery details" icon={Truck}><Fields entries={[["Recipient", order.recipient_name], ["Phone", order.recipient_phone], ["Delivery method", order.delivery_method_name], ["Address", order.delivery_address], ...(order.delivered_at ? [["Delivered at", order.delivered_at]] : []), ...(order.cancelled_at ? [["Cancelled at", order.cancelled_at]] : [])]} /></Section>
        <Section title="Order summary" icon={Receipt}>
          <dl className="space-y-3 text-sm">{[["Subtotal", order.subtotal], ["Shipping", order.shipping_fee], ["Discount", order.discount_amount]].map(([label, value]) => <div key={label} className="flex flex-wrap justify-between gap-2"><dt className="text-slate-500">{label}</dt><dd className="font-medium text-slate-800">{money(value, order.currency)}</dd></div>)}<div className="flex flex-wrap justify-between gap-2 border-t border-slate-200 pt-3 font-bold text-slate-950"><dt>Total</dt><dd>{money(order.total_amount, order.currency)}</dd></div></dl>
          {invoice ? <div className="mt-4 border-t border-dashed border-slate-200 pt-4"><Fields entries={[["Invoice", invoice.invoice_no], ["Invoice total", money(invoice.total_amount, invoice.currency)], ["Issued at", invoice.issued_at], ["Paid at", invoice.paid_at]]} /><div className="mt-3"><Status value={invoice.payment_status} /></div></div> : <p className="mt-4 text-xs text-slate-500">No invoice issued yet.</p>}
        </Section>
        {order.note && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4"><h3 className="text-sm font-semibold text-amber-900">Order note</h3><p className="mt-2 whitespace-pre-wrap break-words text-sm text-amber-800">{order.note}</p></div>}
      </div>
    </div>
  </div>;
}
