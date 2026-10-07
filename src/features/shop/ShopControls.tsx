"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ActionFeedback, EditorSection, inputClass } from "@/components/common/EditorSection";
import { Button, Input } from "@/components/ui";
import type { ActionResult } from "@/lib/actions/result";
import {
  deleteDiscountAction,
  type DiscountInput,
  returnDecisionAction,
  saveDiscountAction,
  setStockAction,
  transitionOrderAction,
} from "./actions";
import type { Discount, OrderStatus } from "./api";

/** Inline stock count for one option (spec §16 "Manage inventory and stock"). */
export function StockCell({
  orgId,
  variantId,
  onHand,
}: {
  orgId: string;
  variantId: string;
  onHand: number;
}) {
  const router = useRouter();
  const [value, setValue] = useState(String(onHand));
  const [result, setResult] = useState<ActionResult>({});
  const [pending, start] = useTransition();
  const changed = value !== String(onHand);
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <input
        aria-label="Stock on hand"
        inputMode="numeric"
        value={value}
        onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))}
        className={`${inputClass} w-24`}
      />
      <Button
        size="sm"
        variant="secondary"
        disabled={!changed || value === ""}
        loading={pending}
        onClick={() =>
          start(async () => {
            const r = await setStockAction(orgId, variantId, Number(value));
            setResult(r);
            if (!r.error) router.refresh();
          })
        }
      >
        Save
      </Button>
      <ActionFeedback result={result} />
    </span>
  );
}

function localInput(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Create or edit a discount code (spec §16 "Set prices and discounts"). */
export function DiscountForm({
  orgId,
  discount,
  products,
  onDone,
}: {
  orgId: string;
  discount?: Discount;
  products: Array<{ id: string; name: string }>;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    code: discount?.code ?? "",
    description: discount?.description ?? "",
    type: discount?.type ?? ("PERCENT" as "PERCENT" | "FLAT"),
    value: String(discount?.value ?? ""),
    minOrderAmount: String(discount?.minOrderAmount ?? ""),
    maxDiscount: String(discount?.maxDiscount ?? ""),
    startsAt: localInput(discount?.startsAt) || localInput(new Date().toISOString()),
    endsAt: localInput(discount?.endsAt),
    usageLimit: String(discount?.usageLimit ?? ""),
    productId: discount?.productId ?? "",
    enabled: discount?.enabled ?? true,
  });
  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <EditorSection
      title={discount ? `Code ${discount.code}` : "New discount code"}
      description={
        discount
          ? `Used ${discount.usedCount}${discount.usageLimit ? ` of ${discount.usageLimit}` : ""} times.`
          : "Customers enter the code in their cart. It applies to your items only."
      }
      saveLabel={discount ? "Save" : "Create code"}
      onSave={async () => {
        const input: DiscountInput = {
          ...form,
          startsAt: new Date(form.startsAt).toISOString(),
          endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : undefined,
        };
        const r = await saveDiscountAction(orgId, discount?.id ?? null, input);
        if (!r.error) {
          router.refresh();
          onDone?.();
        }
        return r;
      }}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <Input label="Code" value={form.code} onChange={set("code")} maxLength={30} />
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Type</span>
          <select className={inputClass} value={form.type} onChange={set("type")}>
            <option value="PERCENT">Percentage off</option>
            <option value="FLAT">Fixed amount off (₹)</option>
          </select>
        </label>
        <Input
          label={form.type === "PERCENT" ? "Percent (max 90)" : "Amount (₹)"}
          inputMode="decimal"
          value={form.value}
          onChange={set("value")}
        />
        <Input
          label="Minimum spend (₹)"
          inputMode="decimal"
          value={form.minOrderAmount}
          onChange={set("minOrderAmount")}
        />
        <Input
          label="Maximum discount (₹)"
          inputMode="decimal"
          value={form.maxDiscount}
          onChange={set("maxDiscount")}
        />
        <Input label="Usage limit" inputMode="numeric" value={form.usageLimit} onChange={set("usageLimit")} />
        <Input label="Starts" type="datetime-local" value={form.startsAt} onChange={set("startsAt")} />
        <Input label="Ends (optional)" type="datetime-local" value={form.endsAt} onChange={set("endsAt")} />
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Applies to</span>
          <select className={inputClass} value={form.productId} onChange={set("productId")}>
            <option value="">All my products</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <Input
        label="Description (optional)"
        value={form.description}
        onChange={set("description")}
        maxLength={200}
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.enabled}
          onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))}
        />
        Enabled
      </label>
      {discount && discount.usedCount === 0 && (
        <Button
          variant="ghost"
          className="self-start"
          onClick={async () => {
            if (!window.confirm(`Delete code ${discount.code}?`)) return;
            const r = await deleteDiscountAction(orgId, discount.id);
            if (!r.error) router.refresh();
            else window.alert(r.error);
          }}
        >
          Delete code
        </Button>
      )}
    </EditorSection>
  );
}

const MOVE_LABEL: Partial<Record<OrderStatus, string>> = {
  PROCESSING: "Start packing",
  SHIPPED: "Mark shipped",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Mark delivered",
  CANCELLED: "Cancel and refund",
};

/** Fulfilment (spec §16 "Manage order fulfillment") and return decisions. Only legal next steps are offered. */
export function OrderControls({
  orgId,
  orderId,
  next,
  returnRequest,
}: {
  orgId: string;
  orderId: string;
  next: OrderStatus[];
  returnRequest?: { id: string; status: string };
}) {
  const router = useRouter();
  const [carrier, setCarrier] = useState("");
  const [tracking, setTracking] = useState("");
  const [note, setNote] = useState("");
  const [result, setResult] = useState<ActionResult>({});
  const [pending, start] = useTransition();

  function run(action: () => Promise<ActionResult>, confirmText?: string) {
    if (confirmText && !window.confirm(confirmText)) return;
    start(async () => {
      const r = await action();
      setResult(r);
      if (!r.error) router.refresh();
    });
  }

  const openReturn =
    returnRequest && (returnRequest.status === "REQUESTED" || returnRequest.status === "APPROVED")
      ? returnRequest
      : undefined;
  if (next.length === 0 && !openReturn) return null;
  return (
    <div className="flex flex-col gap-4">
      {next.includes("SHIPPED") && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Courier"
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            maxLength={60}
          />
          <Input
            label="Tracking number"
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            maxLength={60}
          />
        </div>
      )}
      {(next.includes("CANCELLED") || openReturn) && (
        <Input
          label={openReturn ? "Note to the customer (optional)" : "Reason if you cancel (optional)"}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={300}
        />
      )}
      <div className="flex flex-wrap gap-2">
        {next.map((to) => (
          <Button
            key={to}
            variant={to === "CANCELLED" ? "danger" : "primary"}
            disabled={pending || (to === "SHIPPED" && (!carrier.trim() || !tracking.trim()))}
            onClick={() =>
              run(
                () =>
                  transitionOrderAction(orgId, orderId, {
                    to,
                    trackingCarrier: to === "SHIPPED" ? carrier : undefined,
                    trackingNo: to === "SHIPPED" ? tracking : undefined,
                    reason: to === "CANCELLED" ? note : undefined,
                  }),
                to === "CANCELLED" ? "Cancel this order? The customer is refunded in full." : undefined,
              )
            }
          >
            {MOVE_LABEL[to] ?? to}
          </Button>
        ))}
        {openReturn?.status === "REQUESTED" && (
          <>
            <Button
              disabled={pending}
              onClick={() => run(() => returnDecisionAction(orgId, openReturn.id, "approve", note))}
            >
              Approve return
            </Button>
            <Button
              variant="secondary"
              disabled={pending}
              onClick={() => run(() => returnDecisionAction(orgId, openReturn.id, "reject", note))}
            >
              Reject return
            </Button>
          </>
        )}
        {openReturn && (
          <Button
            variant="secondary"
            disabled={pending}
            onClick={() =>
              run(
                () => returnDecisionAction(orgId, openReturn.id, "received", note),
                "Confirm the items are back? Stock is restored and the customer refunded.",
              )
            }
          >
            Items received — refund
          </Button>
        )}
      </div>
      <ActionFeedback result={result} />
    </div>
  );
}
