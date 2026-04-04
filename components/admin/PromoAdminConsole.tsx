"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, Tag, Trash2 } from "lucide-react";
import { createPromoCode, deletePromoCode, updatePromoCode } from "@/actions/admin-promo";
import { useToast } from "@/components/ui/ToastProvider";

type PromoItem = {
  id: string;
  code: string;
  description: string | null;
  kind: "PERCENT" | "FIXED" | "FREE_SHIPPING";
  amount: number;
  minOrder: number | null;
  active: boolean;
  startsAt: string | null;
  endsAt: string | null;
  maxUses: number | null;
  usedCount: number;
  orderCount: number;
  updatedAt: string;
};

type PromoDraft = {
  code: string;
  description: string;
  kind: "PERCENT" | "FIXED" | "FREE_SHIPPING";
  amount: string;
  minOrder: string;
  active: boolean;
  startsAt: string;
  endsAt: string;
  maxUses: string;
};

type PromoErrors = Partial<Record<keyof PromoDraft, string>>;

function toLocalDateTimeInput(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  const pad = (num: number) => String(num).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toIsoString(value: string) {
  if (!value.trim()) return null;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  return date.toISOString();
}

function toDraft(promo: PromoItem | null): PromoDraft {
  if (!promo) {
    return {
      code: "",
      description: "",
      kind: "PERCENT",
      amount: "10",
      minOrder: "",
      active: true,
      startsAt: "",
      endsAt: "",
      maxUses: "",
    };
  }

  return {
    code: promo.code,
    description: promo.description ?? "",
    kind: promo.kind,
    amount: String(promo.amount),
    minOrder: promo.minOrder == null ? "" : String(promo.minOrder),
    active: promo.active,
    startsAt: toLocalDateTimeInput(promo.startsAt),
    endsAt: toLocalDateTimeInput(promo.endsAt),
    maxUses: promo.maxUses == null ? "" : String(promo.maxUses),
  };
}

export function PromoAdminConsole({ promos }: { promos: PromoItem[] }) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState<string | null>(promos[0]?.id ?? null);
  const [isCreating, setIsCreating] = useState(promos.length === 0);
  const [draft, setDraft] = useState<PromoDraft>(() => toDraft(promos[0] ?? null));
  const [errors, setErrors] = useState<PromoErrors>({});

  const selectedPromo = useMemo(() => {
    if (isCreating) return null;
    return promos.find((item) => item.id === selectedId) ?? promos[0] ?? null;
  }, [isCreating, promos, selectedId]);

  const startCreateMode = () => {
    setIsCreating(true);
    setSelectedId(null);
    setDraft(toDraft(null));
    setErrors({});
  };

  const selectPromo = (promoId: string) => {
    const promo = promos.find((item) => item.id === promoId) ?? null;
    if (!promo) return;
    setIsCreating(false);
    setSelectedId(promo.id);
    setDraft(toDraft(promo));
    setErrors({});
  };

  const validateDraft = () => {
    const nextErrors: PromoErrors = {};
    if (!/^[A-Z0-9_-]{3,32}$/i.test(draft.code.trim())) {
      nextErrors.code = "Use 3-32 chars (letters, numbers, _ or -).";
    }

    if (draft.description.trim().length > 120) {
      nextErrors.description = "Description cannot exceed 120 characters.";
    }

    const amount = Number(draft.amount);
    if (!Number.isFinite(amount) || amount < 0 || !Number.isInteger(amount)) {
      nextErrors.amount = "Amount must be a whole number.";
    } else if (draft.kind === "PERCENT" && (amount < 1 || amount > 100)) {
      nextErrors.amount = "Percent must be between 1 and 100.";
    } else if (draft.kind === "FIXED" && amount < 1) {
      nextErrors.amount = "Fixed amount must be at least 1.";
    } else if (draft.kind === "FREE_SHIPPING" && amount !== 0) {
      nextErrors.amount = "Free shipping amount must be 0.";
    }

    if (draft.minOrder.trim()) {
      const minOrder = Number(draft.minOrder);
      if (!Number.isFinite(minOrder) || minOrder < 0 || !Number.isInteger(minOrder)) {
        nextErrors.minOrder = "Minimum order must be a whole number >= 0.";
      }
    }

    if (draft.maxUses.trim()) {
      const maxUses = Number(draft.maxUses);
      if (!Number.isFinite(maxUses) || maxUses < 1 || !Number.isInteger(maxUses)) {
        nextErrors.maxUses = "Usage limit must be a whole number >= 1.";
      } else if (selectedPromo && maxUses < selectedPromo.usedCount) {
        nextErrors.maxUses = "Usage limit cannot be less than used count.";
      }
    }

    const startsAt = toIsoString(draft.startsAt);
    const endsAt = toIsoString(draft.endsAt);
    if (draft.startsAt.trim() && !startsAt) nextErrors.startsAt = "Invalid start date.";
    if (draft.endsAt.trim() && !endsAt) nextErrors.endsAt = "Invalid end date.";
    if (startsAt && endsAt && new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
      nextErrors.endsAt = "End date must be after start date.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateDraft()) return;

    startTransition(async () => {
      try {
        const payload = {
          code: draft.code.trim().toUpperCase(),
          description: draft.description.trim() || null,
          kind: draft.kind,
          amount: draft.kind === "FREE_SHIPPING" ? 0 : Number(draft.amount),
          minOrder: draft.minOrder.trim() ? Number(draft.minOrder) : null,
          active: draft.active,
          startsAt: toIsoString(draft.startsAt),
          endsAt: toIsoString(draft.endsAt),
          maxUses: draft.maxUses.trim() ? Number(draft.maxUses) : null,
        } as const;

        const promoTargetId = selectedPromo?.id ?? null;
        const result = isCreating || !promoTargetId ? await createPromoCode(payload) : await updatePromoCode(promoTargetId, payload);
        if (!result.success) {
          pushToast({
            title: "Promo save failed",
            description: result.error || "Unable to save promo code.",
            variant: "warning",
          });
          return;
        }

        pushToast({
          title: isCreating || !promoTargetId ? "Promo created" : "Promo updated",
          description: payload.code,
          variant: "success",
        });

        router.refresh();
      } catch {
        pushToast({
          title: "Promo save failed",
          description: "Unable to save promo code right now.",
          variant: "warning",
        });
      }
    });
  };

  const handleDelete = () => {
    if (!selectedPromo) return;
    if (!window.confirm(`Delete promo "${selectedPromo.code}"?`)) return;

    startTransition(async () => {
      try {
        const result = await deletePromoCode(selectedPromo.id);
        if (!result.success) {
          pushToast({
            title: "Delete failed",
            description: result.error || "Unable to delete promo.",
            variant: "warning",
          });
          return;
        }

        pushToast({
          title: "Promo deleted",
          description: selectedPromo.code,
          variant: "info",
        });
        router.refresh();
      } catch {
        pushToast({
          title: "Delete failed",
          description: "Unable to delete promo right now.",
          variant: "warning",
        });
      }
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
      <section className="rounded-[1.75rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-[0_18px_50px_rgba(var(--shadow-neutral-rgb),0.08)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Promo codes</h2>
          <button
            type="button"
            onClick={startCreateMode}
            className="rounded-full border border-[var(--border-subtle)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-secondary transition-colors hover:text-[var(--foreground)]"
          >
            <Plus size={14} className="mr-1 inline-block" />
            New
          </button>
        </div>
        <div className="max-h-[560px] space-y-2 overflow-y-auto pr-1">
          {promos.map((promo) => (
            <button
              key={promo.id}
              type="button"
              onClick={() => selectPromo(promo.id)}
              className={`w-full rounded-xl border p-3 text-left text-sm ${
                promo.id === selectedPromo?.id && !isCreating
                  ? "border-primary/40 bg-primary/10 text-[var(--foreground)]"
                  : "border-[var(--border-subtle)] bg-[var(--surface-soft)] text-secondary"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-[var(--foreground)]">{promo.code}</p>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                    promo.active
                      ? "border border-[var(--status-success)]/30 bg-[var(--status-success)]/10 text-[var(--status-success)]"
                      : "border border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--text-soft)]"
                  }`}
                >
                  {promo.active ? "active" : "paused"}
                </span>
              </div>
              <p className="mt-1 text-xs uppercase tracking-[0.16em]">
                {promo.kind} • {promo.kind === "PERCENT" ? `${promo.amount}%` : promo.kind === "FREE_SHIPPING" ? "Free shipping" : `₦${promo.amount.toLocaleString()}`}
              </p>
              <p className="mt-1 text-xs text-[var(--text-soft)]">
                Used {promo.usedCount}
                {typeof promo.maxUses === "number" ? ` / ${promo.maxUses}` : ""}
                {" • "}
                Orders {promo.orderCount}
              </p>
            </button>
          ))}
          {promos.length === 0 ? (
            <p className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-3 text-sm text-secondary">
              No promo codes yet.
            </p>
          ) : null}
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] p-6 shadow-[0_18px_50px_rgba(var(--shadow-neutral-rgb),0.08)]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">
              {isCreating ? "Create promo" : "Edit promo"}
            </p>
            <h2 className="mt-2 text-3xl font-bold text-[var(--foreground)]">
              {isCreating ? "New discount rule" : draft.code || "Promo editor"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-secondary">Manage offer rules, validity windows, and usage limits from one place.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
            <Tag size={14} />
            {isCreating ? "Draft" : selectedPromo?.id.slice(-6).toUpperCase()}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)]">Code</span>
            <input
              value={draft.code}
              onChange={(event) => {
                setDraft((prev) => ({ ...prev, code: event.target.value.toUpperCase() }));
                setErrors((prev) => ({ ...prev, code: undefined }));
              }}
              placeholder="SAVE10"
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
            />
            {errors.code ? <p className="mt-2 text-xs font-medium text-[var(--status-error)]">{errors.code}</p> : null}
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)]">Type</span>
            <select
              value={draft.kind}
              onChange={(event) => {
                const nextKind = event.target.value as PromoDraft["kind"];
                setDraft((prev) => ({ ...prev, kind: nextKind, amount: nextKind === "FREE_SHIPPING" ? "0" : prev.amount }));
                setErrors((prev) => ({ ...prev, kind: undefined, amount: undefined }));
              }}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
            >
              <option value="PERCENT" className="bg-[var(--panel-bg)] text-[var(--foreground)]">
                Percent discount
              </option>
              <option value="FIXED" className="bg-[var(--panel-bg)] text-[var(--foreground)]">
                Fixed amount
              </option>
              <option value="FREE_SHIPPING" className="bg-[var(--panel-bg)] text-[var(--foreground)]">
                Free shipping
              </option>
            </select>
          </label>

          <label className="md:col-span-2 block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)]">Description</span>
            <input
              value={draft.description}
              onChange={(event) => {
                setDraft((prev) => ({ ...prev, description: event.target.value }));
                setErrors((prev) => ({ ...prev, description: undefined }));
              }}
              placeholder="10% off orders above ₦200,000"
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
            />
            {errors.description ? <p className="mt-2 text-xs font-medium text-[var(--status-error)]">{errors.description}</p> : null}
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)]">
              {draft.kind === "PERCENT" ? "Percent amount" : draft.kind === "FIXED" ? "Fixed amount (NGN)" : "Amount"}
            </span>
            <input
              type="number"
              min="0"
              value={draft.amount}
              disabled={draft.kind === "FREE_SHIPPING"}
              onChange={(event) => {
                setDraft((prev) => ({ ...prev, amount: event.target.value }));
                setErrors((prev) => ({ ...prev, amount: undefined }));
              }}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3 text-sm text-[var(--foreground)] outline-none disabled:cursor-not-allowed disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-primary/25"
            />
            {errors.amount ? <p className="mt-2 text-xs font-medium text-[var(--status-error)]">{errors.amount}</p> : null}
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)]">Minimum order (NGN)</span>
            <input
              type="number"
              min="0"
              value={draft.minOrder}
              onChange={(event) => {
                setDraft((prev) => ({ ...prev, minOrder: event.target.value }));
                setErrors((prev) => ({ ...prev, minOrder: undefined }));
              }}
              placeholder="Optional"
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
            />
            {errors.minOrder ? <p className="mt-2 text-xs font-medium text-[var(--status-error)]">{errors.minOrder}</p> : null}
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)]">Starts at</span>
            <input
              type="datetime-local"
              value={draft.startsAt}
              onChange={(event) => {
                setDraft((prev) => ({ ...prev, startsAt: event.target.value }));
                setErrors((prev) => ({ ...prev, startsAt: undefined }));
              }}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
            />
            {errors.startsAt ? <p className="mt-2 text-xs font-medium text-[var(--status-error)]">{errors.startsAt}</p> : null}
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)]">Ends at</span>
            <input
              type="datetime-local"
              value={draft.endsAt}
              onChange={(event) => {
                setDraft((prev) => ({ ...prev, endsAt: event.target.value }));
                setErrors((prev) => ({ ...prev, endsAt: undefined }));
              }}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
            />
            {errors.endsAt ? <p className="mt-2 text-xs font-medium text-[var(--status-error)]">{errors.endsAt}</p> : null}
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)]">Usage limit</span>
            <input
              type="number"
              min="1"
              value={draft.maxUses}
              onChange={(event) => {
                setDraft((prev) => ({ ...prev, maxUses: event.target.value }));
                setErrors((prev) => ({ ...prev, maxUses: undefined }));
              }}
              placeholder="Unlimited"
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
            />
            {errors.maxUses ? <p className="mt-2 text-xs font-medium text-[var(--status-error)]">{errors.maxUses}</p> : null}
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3 text-sm text-[var(--foreground)]">
            <input
              type="checkbox"
              checked={draft.active}
              onChange={(event) => setDraft((prev) => ({ ...prev, active: event.target.checked }))}
              className="h-4 w-4 accent-primary"
            />
            Active promo
          </label>
        </div>

        {selectedPromo ? (
          <div className="mt-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 text-xs text-secondary">
            <p>
              Used <span className="font-semibold text-[var(--foreground)]">{selectedPromo.usedCount}</span>
              {typeof selectedPromo.maxUses === "number" ? (
                <>
                  {" / "}
                  <span className="font-semibold text-[var(--foreground)]">{selectedPromo.maxUses}</span>
                </>
              ) : null}{" "}
              • Orders <span className="font-semibold text-[var(--foreground)]">{selectedPromo.orderCount}</span> • Last updated{" "}
              {new Date(selectedPromo.updatedAt).toLocaleString("en-NG")}
            </p>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-[var(--primary-contrast)] disabled:opacity-60"
          >
            <Save size={14} className="mr-2 inline-block" />
            {isPending ? "Saving..." : isCreating ? "Create promo" : "Save changes"}
          </button>
          {!isCreating && selectedPromo ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="rounded-full border border-[var(--status-error)]/25 bg-[var(--status-error)]/10 px-5 py-2.5 text-sm font-semibold text-[var(--status-error)] disabled:opacity-60"
            >
              <Trash2 size={14} className="mr-2 inline-block" />
              Delete promo
            </button>
          ) : null}
          {!isCreating ? (
            <button
              type="button"
              onClick={startCreateMode}
              disabled={isPending}
              className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-card)] px-5 py-2.5 text-sm font-semibold text-secondary transition-colors hover:text-[var(--foreground)] disabled:opacity-60"
            >
              New promo
            </button>
          ) : null}
        </div>
      </section>
    </div>
  );
}

