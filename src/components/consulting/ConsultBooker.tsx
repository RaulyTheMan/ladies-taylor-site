"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useViewerTimezone } from "@/lib/consulting/useViewerTimezone";
import { useRouter } from "next/navigation";
import type { ConsultationType } from "@/lib/consulting";
import {
  formatDateInZone,
  formatTimeInZone,
  formatRupees,
  isoDayInZone,
  HOST_TIMEZONE,
} from "@/lib/consulting/time";
import { captureMetaSignals, trackMetaPixelEventWithId } from "@/lib/metaPixel";
import TimezoneSelect from "./TimezoneSelect";
import ConsultMonthGrid from "./ConsultMonthGrid";
import ConsultSlotColumn, { type SlotState } from "./ConsultSlotColumn";
import ConsultDetailsForm from "./ConsultDetailsForm";

type MonthCache = Record<string, { state: SlotState; slots: string[] }>;

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthRange(date: Date): { from: string; to: string } {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const iso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  return { from: iso(first), to: iso(last) };
}

export default function ConsultBooker({ type }: { type: ConsultationType }) {
  const router = useRouter();

  // Null on the server and on the first client render, then the viewer's real
  // zone. That null doubles as the loading gate for the whole slot column.
  const [timezone, setTimezone] = useViewerTimezone();

  const [month, setMonth] = useState(() => new Date());
  const [months, setMonths] = useState<MonthCache>({});
  const [selectedDay, setSelectedDay] = useState<Date | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [step, setStep] = useState<"pick" | "details">("pick");

  const [payError, setPayError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const loadedRef = useRef<Set<string>>(new Set());

  const maxDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + type.maxDaysAhead);
    return d;
  }, [type.maxDaysAhead]);

  const key = monthKey(month);
  const current = months[key];

  const loadMonth = useCallback(
    async (target: Date, force = false) => {
      const k = monthKey(target);
      // A ref, not the cache itself: reading `months` here would put it in the
      // dependency list and give loadMonth a new identity on every response.
      if (!force && loadedRef.current.has(k)) return;
      loadedRef.current.add(k);

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      // Deliberately no setState before the first await. A month with no cache
      // entry already renders as loading (see slotState), so the effect that
      // loads on mount never sets state synchronously. Callers that want an
      // explicit loading flash on a REFETCH use refetchMonth below.

      const { from, to } = monthRange(target);
      try {
        const res = await fetch(
          `/api/consulting/${type.slug}/slots?from=${from}&to=${to}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as { slots: string[] };
        setMonths((prev) => ({ ...prev, [k]: { state: "ready", slots: data.slots } }));
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        // Let a failed month be retried.
        loadedRef.current.delete(k);
        setMonths((prev) => ({ ...prev, [k]: { state: "error", slots: [] } }));
      }
    },
    [type.slug]
  );

  /** Refetch a month that may already be cached, showing a loading state. */
  const refetchMonth = useCallback(
    (target: Date) => {
      const k = monthKey(target);
      setMonths((prev) => ({
        ...prev,
        [k]: { state: "loading", slots: prev[k]?.slots ?? [] },
      }));
      return loadMonth(target, true);
    },
    [loadMonth]
  );

  useEffect(() => {
    if (!timezone) return;
    // Fetching the visible month IS synchronising with an external system, which
    // is what effects are for. loadMonth performs no setState before its first
    // await -- an uncached month already renders as loading -- but the rule
    // cannot see through the async call and flags the call site regardless.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadMonth(month);
  }, [month, timezone, loadMonth]);

  // Days are grouped in the VIEWER's zone, so a 00:30 IST slot lands on the day
  // that viewer would call it.
  const availableDays = useMemo(() => {
    const set = new Set<string>();
    if (!timezone) return set;
    for (const slot of current?.slots ?? []) set.add(isoDayInZone(slot, timezone));
    return set;
  }, [current?.slots, timezone]);

  const daySlots = useMemo(() => {
    if (!selectedDay || !timezone) return [];
    const key = [
      selectedDay.getFullYear(),
      String(selectedDay.getMonth() + 1).padStart(2, "0"),
      String(selectedDay.getDate()).padStart(2, "0"),
    ].join("-");
    return (current?.slots ?? []).filter((slot) => isoDayInZone(slot, timezone) === key);
  }, [current?.slots, selectedDay, timezone]);

  const slotState: SlotState = !timezone ? "loading" : (current?.state ?? "loading");

  function chooseTimezone(zone: string) {
    setTimezone(zone);
    // Days were grouped in the old zone, so the selection no longer means what
    // it did. Clearing it is less confusing than silently re-bucketing.
    setSelectedDay(undefined);
  }

  async function submitBooking(form: {
    name: string;
    email: string;
    phone: string;
    notes: string;
  }) {
    if (!selectedSlot) return;
    setSubmitting(true);
    setPayError(null);

    const meta = captureMetaSignals();

    try {
      const res = await fetch(`/api/consulting/${type.slug}/hold`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start: selectedSlot,
          name: form.name,
          email: form.email,
          phone: form.phone,
          notes: form.notes || undefined,
          timezone,
          meta,
        }),
      });

      const data = await res.json();

      if (res.status === 409) {
        // Don't just show an error -- refetch so the grid tells the truth, then
        // send them back to pick again.
        setStep("pick");
        setSelectedSlot(null);
        setPayError("Someone just took that time. Here's what's still open.");
        await refetchMonth(month);
        return;
      }

      if (!res.ok) {
        setPayError(data?.message ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      // A free session is already confirmed; there is nothing to pay.
      if (data.free) {
        router.push(`/consulting/booking/${data.manageToken}`);
        return;
      }

      // Fire the pixel BEFORE navigating away -- this browser is about to leave
      // for Razorpay and will come back on a different page. It records the
      // intent to pay, not the payment; the Purchase event can't be fired
      // client-side any more, because the browser is never told the payment
      // succeeded. Only the webhook knows that.
      trackMetaPixelEventWithId("InitiateCheckout", meta.eventId, {
        content_name: data.title,
        value: data.amountInr,
        currency: "INR",
      });

      // Same tab, not a popup: popups get blocked, and a payment page opening in
      // a tab the guest can lose is worse than leaving the site cleanly.
      window.location.href = data.paymentUrl;
    } catch {
      setPayError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="comic-border grid grid-cols-1 divide-y-2 divide-black rounded-squircle-lg bg-white lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)_minmax(0,220px)] lg:divide-x-2 lg:divide-y-0">
        <div className="p-5">
          <p className="font-display text-xs uppercase tracking-wide text-black/50">
            Ladies Taylor
          </p>
          <h1 className="mt-1 text-2xl font-extrabold leading-tight text-black">
            {type.title}
          </h1>

          <dl className="mt-4 flex flex-col gap-2 text-sm text-black/70">
            <div className="flex gap-2">
              <dt className="sr-only">Duration</dt>
              <dd>{type.durationMinutes} minutes</dd>
            </div>
            <div className="flex gap-2">
              <dt className="sr-only">Price</dt>
              <dd className="font-semibold text-black">
                {type.priceInr === 0 ? "Free" : formatRupees(type.priceInr)}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="sr-only">Location</dt>
              <dd>{type.locationLabel}</dd>
            </div>
          </dl>

          {type.description && (
            <p className="mt-4 whitespace-pre-line text-sm text-black/70">
              {type.description}
            </p>
          )}

          {selectedSlot && timezone && (
            <div className="comic-border-sm mt-5 rounded-squircle-xs bg-lt-yellow p-3">
              <p className="text-sm font-semibold text-black">
                {formatDateInZone(selectedSlot, timezone)}
              </p>
              <p className="text-sm text-black">{formatTimeInZone(selectedSlot, timezone)}</p>
              {step === "details" && (
                <button
                  type="button"
                  onClick={() => {
                    setStep("pick");
                    setSelectedSlot(null);
                    setPayError(null);
                  }}
                  className="mt-1 text-xs font-semibold text-black underline underline-offset-2"
                >
                  Change
                </button>
              )}
            </div>
          )}

          {timezone && (
            <div className="mt-5">
              <TimezoneSelect value={timezone} onChange={chooseTimezone} />
            </div>
          )}
        </div>

        {step === "pick" ? (
          <>
            <div>
              {payError && (
                <div className="border-b-2 border-black bg-lt-yellow px-4 py-2 text-sm font-semibold text-black">
                  {payError}
                </div>
              )}
              <ConsultMonthGrid
                month={month}
                onMonthChange={(next) => {
                  setMonth(next);
                  setSelectedDay(undefined);
                }}
                selected={selectedDay}
                onSelect={setSelectedDay}
                availableDays={availableDays}
                maxDate={maxDate}
                loading={slotState === "loading"}
              />
            </div>

            <div className="lg:border-l-0">
              <ConsultSlotColumn
                slots={daySlots}
                state={slotState}
                timezone={timezone ?? HOST_TIMEZONE}
                selectedDay={selectedDay}
                onPick={(iso) => {
                  setSelectedSlot(iso);
                  setStep("details");
                  setPayError(null);
                }}
                onRetry={() => void refetchMonth(month)}
                onNextMonth={() => {
                  const next = new Date(month);
                  next.setMonth(next.getMonth() + 1);
                  setMonth(next);
                  setSelectedDay(undefined);
                }}
              />
            </div>
          </>
        ) : (
          <div className="lg:col-span-2">
            <ConsultDetailsForm
              priceInr={type.priceInr}
              submitting={submitting}
              error={payError}
              onBack={() => {
                setStep("pick");
                setSelectedSlot(null);
                setPayError(null);
              }}
              onSubmit={submitBooking}
            />
          </div>
        )}
      </div>
    </>
  );
}
