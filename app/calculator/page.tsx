"use client";

import { useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { config } from "@/config";
import { Logo } from "@/app/components/Logo";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

// Same promo as the service cards (config.js). Covers printing, protectors and binding.
const PROMO_DISCOUNT_RATE = config.printShop.promoDiscountPercent / 100;
const MAX_AUTO_PAGES = 500; // Above this total, checkout is blocked for manual approval
const WHATSAPP_NUMBER = "96555039794"; // International format, digits only
const WHATSAPP_MESSAGE =
  "Hello, my print order exceeds 500 pages and requires manual approval.";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  WHATSAPP_MESSAGE,
)}`;

const PICKUP_HUB = {
  name: "Farwaniya Hub",
  address:
    "Farwaniya, Habib Al-Munawir Street, between Ibn Al-Wazeer and Al-Ameed Coffee, Shop 16 (Basement)",
};

// Per page, before promo and bulk steps. Matches config.js printShop (0.05, color = 2.5x).
const PRINT_RATES_KWD = {
  bw: 0.05, // per page, black & white
  color: 0.125, // per page, color (0.05 x 2.5)
} as const;

const BINDING_FEE_KWD = 0.75; // per piece (not per copy), spiral binding (750 fils)

// Extra bulk steps by total sheets, from config.js. Printing only; steps stack after the promo.
const BULK_STEPS = (
  config.printShop.paperTypes[0] as {
    bulkDiscounts?: { minSheets: number; percent: number }[];
  }
).bulkDiscounts ?? [];
// Regular price per sheet protector, by thickness, before promo (KWD). Matches config.js printShop.protectorThicknesses.
const PROTECTOR_RATES_KWD = {
  "50": 0.1, // 50 micron (thinner)
  "80": 0.125, // 80 micron (thicker)
} as const;
// Maximum protectors that can be chosen for a custom count, across all copies.
const PROTECTOR_MAX_COUNT = 50;

type PrintType = keyof typeof PRINT_RATES_KWD;
type Binding = "none" | "spiral";
type ProtectorType = "none" | "allCopies" | "eachSheet" | "custom";
type ProtectorMicron = keyof typeof PROTECTOR_RATES_KWD;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Every KWD display value passes through .toFixed(3). */
const formatKWD = (amount: number): string => `${amount.toFixed(3)} KWD`;

const toPositiveInt = (raw: string, fallback: number): number => {
  const parsed = Math.floor(Number(raw));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

// ---------------------------------------------------------------------------
// Styles (pure white background, pitch-black typography)
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#FFFFFF",
    color: "#000000",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
    padding: "48px 24px",
    boxSizing: "border-box",
  },
  container: { maxWidth: 720, margin: "0 auto" },
  title: { fontSize: 32, fontWeight: 700, margin: "0 0 8px", color: "#000000" },
  subtitle: { fontSize: 16, margin: "0 0 32px", color: "#000000" },
  section: {
    border: "2px solid #000000",
    padding: 24,
    marginBottom: 24,
    background: "#FFFFFF",
  },
  sectionTitle: { fontSize: 18, fontWeight: 700, margin: "0 0 16px" },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    padding: "8px 0",
    borderBottom: "1px solid #000000",
    fontSize: 16,
  },
  label: { display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6 },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "2px solid #000000",
    borderRadius: 0,
    fontSize: 16,
    color: "#000000",
    background: "#FFFFFF",
    boxSizing: "border-box",
    marginBottom: 16,
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    border: "2px solid #000000",
    borderRadius: 0,
    fontSize: 16,
    color: "#000000",
    background: "#FFFFFF",
    boxSizing: "border-box",
    marginBottom: 16,
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 0 0",
    fontSize: 22,
    fontWeight: 700,
  },
  button: {
    width: "100%",
    padding: "14px 16px",
    background: "#000000",
    color: "#FFFFFF",
    border: "2px solid #000000",
    borderRadius: 0,
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
  },
  buttonDisabled: {
    width: "100%",
    padding: "14px 16px",
    background: "#FFFFFF",
    color: "#000000",
    border: "2px solid #000000",
    borderRadius: 0,
    fontSize: 16,
    fontWeight: 700,
    cursor: "not-allowed",
    opacity: 0.4,
  },
  alert: {
    border: "3px solid #000000",
    padding: 20,
    marginBottom: 24,
    background: "#FFFFFF",
    color: "#000000",
  },
  alertLink: {
    display: "inline-block",
    marginTop: 12,
    padding: "12px 16px",
    background: "#000000",
    color: "#FFFFFF",
    fontWeight: 700,
    textDecoration: "none",
    border: "2px solid #000000",
  },
  note: { fontSize: 13, margin: "12px 0 0", color: "#000000" },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CalculatorPage() {
  const [pageCountInput, setPageCountInput] = useState<string>("100");
  const [copiesInput, setCopiesInput] = useState<string>("1");
  const [printType, setPrintType] = useState<PrintType>("bw");
  const [binding, setBinding] = useState<Binding>("none");
  const [protectorType, setProtectorType] = useState<ProtectorType>("none");
  const [protectorMicron, setProtectorMicron] = useState<ProtectorMicron>("50");
  const [protectorCountInput, setProtectorCountInput] = useState<string>("10");
  const [instructions, setInstructions] = useState<string>("");

  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);

  const pageCount = toPositiveInt(pageCountInput, 1);
  const copies = toPositiveInt(copiesInput, 1);
  const totalPages = pageCount * copies;
  const exceedsLimit = totalPages > MAX_AUTO_PAGES;
  const customProtectorCount = toPositiveInt(protectorCountInput, 0);
  const protectorsValid =
    protectorType !== "custom" ||
    (customProtectorCount >= 1 && customProtectorCount <= PROTECTOR_MAX_COUNT);
  // "allCopies" = one protector for the whole job, "eachSheet" = one per sheet across all copies,
  // "custom" = the typed count (1 to PROTECTOR_MAX_COUNT, across all copies).
  const protectorQuantity =
    protectorType === "allCopies"
      ? 1
      : protectorType === "eachSheet"
        ? totalPages
        : protectorType === "custom"
          ? customProtectorCount
          : 0;

  const pricing = useMemo(() => {
    const rate = PRINT_RATES_KWD[printType];
    const protectorCost = protectorQuantity * PROTECTOR_RATES_KWD[protectorMicron];
    const basePrint = totalPages * rate;
    const bindingTotal = binding === "spiral" ? BINDING_FEE_KWD : 0;
    // The promo covers printing, protectors and binding (same as the service cards).
    const promoDiscount = (basePrint + protectorCost + bindingTotal) * PROMO_DISCOUNT_RATE;
    // Bulk steps apply to printing only, after its promo.
    const promoPrint = basePrint * (1 - PROMO_DISCOUNT_RATE);
    const bulkSteps = BULK_STEPS.filter(
      (step) => totalPages >= step.minSheets,
    );
    const discountedPrint = bulkSteps.reduce(
      (value, step) => value * (1 - step.percent / 100),
      promoPrint,
    );
    const bulkDiscount = promoPrint - discountedPrint;
    const grandTotal =
      discountedPrint + (protectorCost + bindingTotal) * (1 - PROMO_DISCOUNT_RATE);

    return {
      protectorCost,
      basePrint,
      promoDiscount,
      bulkDiscount,
      bindingTotal,
      grandTotal,
    };
  }, [totalPages, printType, binding, protectorQuantity, protectorMicron]);

  const canCheckout =
    !exceedsLimit &&
    protectorsValid &&
    customerName.trim().length > 0 &&
    customerPhone.trim().length > 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canCheckout) return;
    setSubmitted(true);
  };

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <Logo className="w-48" />
        </div>
        <h1 style={styles.title}>Print Quote Calculator</h1>
        <p style={styles.subtitle}>
          Get an instant quote. Orders are collected by self-pickup only at our{" "}
          {PICKUP_HUB.name}.
        </p>

        {exceedsLimit && (
          <div role="alert" style={styles.alert}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 18 }}>
              Manual approval required
            </p>
            <p style={{ margin: "8px 0 0", fontSize: 15 }}>
              Your order totals {totalPages} pages, which exceeds the {MAX_AUTO_PAGES}-page
              automatic limit. Checkout is disabled for this order. Contact us over
              WhatsApp for manual approval.
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.alertLink}
            >
              Request manual approval on WhatsApp
            </a>
          </div>
        )}

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>1. Print Details</h2>

          <label htmlFor="pageCount" style={styles.label}>
            Pages per copy
          </label>
          <input
            id="pageCount"
            type="number"
            min={1}
            step={1}
            value={pageCountInput}
            onChange={(e) => setPageCountInput(e.target.value)}
            style={styles.input}
          />

          <label htmlFor="copies" style={styles.label}>
            Number of copies
          </label>
          <input
            id="copies"
            type="number"
            min={1}
            step={1}
            value={copiesInput}
            onChange={(e) => setCopiesInput(e.target.value)}
            style={styles.input}
          />

          <label htmlFor="protectorType" style={styles.label}>
            Sheet protectors
          </label>
          <select
            id="protectorType"
            value={protectorType}
            onChange={(e) => setProtectorType(e.target.value as ProtectorType)}
            style={styles.select}
          >
            <option value="none">No sheet protectors</option>
            <option value="allCopies">All copies (one protector for the whole job)</option>
            <option value="eachSheet">Each piece of paper (one protector per sheet)</option>
            <option value="custom">Choose a number of protectors (1 to 50)</option>
          </select>

          {protectorType !== "none" && (
            <>
              <label htmlFor="protectorMicron" style={styles.label}>
                Protector thickness
              </label>
              <select
                id="protectorMicron"
                value={protectorMicron}
                onChange={(e) => setProtectorMicron(e.target.value as ProtectorMicron)}
                style={styles.select}
              >
                <option value="50">Thinner (50 micron), more flexible</option>
                <option value="80">Thicker (80 micron), sturdier and harder to bend</option>
              </select>
              <p style={styles.note}>
                Thinner protectors (50 micron) are flexible plastic sleeves. Thicker protectors
                (80 micron) are stiffer, so they hold up better to frequent handling.
              </p>
            </>
          )}

          {protectorType === "custom" && (
            <>
              <label htmlFor="protectorCount" style={styles.label}>
                Number of sheet protectors
              </label>
              <input
                id="protectorCount"
                type="number"
                min={1}
                max={PROTECTOR_MAX_COUNT}
                step={1}
                value={protectorCountInput}
                onChange={(e) => setProtectorCountInput(e.target.value)}
                style={styles.input}
              />
              {!protectorsValid && (
                <p style={styles.note}>Enter a number from 1 to {PROTECTOR_MAX_COUNT}.</p>
              )}
            </>
          )}

          <label htmlFor="printType" style={styles.label}>
            Print type
          </label>
          <select
            id="printType"
            value={printType}
            onChange={(e) => setPrintType(e.target.value as PrintType)}
            style={styles.select}
          >
            <option value="bw">Black &amp; White</option>
            <option value="color">Color</option>
          </select>

          <label htmlFor="binding" style={styles.label}>
            Binding
          </label>
          <select
            id="binding"
            value={binding}
            onChange={(e) => setBinding(e.target.value as Binding)}
            style={styles.select}
          >
            <option value="none">No binding</option>
            <option value="spiral">Spiral binding</option>
          </select>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>2. Price Summary</h2>

          <div style={styles.row}>
            <span>Total pages</span>
            <span>{totalPages}</span>
          </div>
          <div style={styles.row}>
            <span>
              Sheet protectors
              {protectorQuantity > 0 && ` (${protectorQuantity} × ${formatKWD(PROTECTOR_RATES_KWD[protectorMicron])})`}
            </span>
            <span>{formatKWD(pricing.protectorCost)}</span>
          </div>
          <div style={styles.row}>
            <span>Base printing price</span>
            <span>{formatKWD(pricing.basePrint)}</span>
          </div>
          <div style={styles.row}>
            <span>Binding</span>
            <span>{formatKWD(pricing.bindingTotal)}</span>
          </div>
          <div style={{ ...styles.row, color: "#DC2626", fontWeight: 700 }}>
            <span>Promotion ({Math.round(PROMO_DISCOUNT_RATE * 100)}% Off)</span>
            <span>-{formatKWD(pricing.promoDiscount)}</span>
          </div>
          {pricing.bulkDiscount > 0 && (
            <div style={{ ...styles.row, color: "#DC2626", fontWeight: 700 }}>
              <span>Bulk Discount (printing)</span>
              <span>-{formatKWD(pricing.bulkDiscount)}</span>
            </div>
          )}
          <div style={styles.totalRow}>
            <span>Total</span>
            <span>{formatKWD(pricing.grandTotal)}</span>
          </div>
          <p style={styles.note}>
            Pickup: {PICKUP_HUB.name}, {PICKUP_HUB.address}. Self-pickup only.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>3. Checkout</h2>

          {submitted ? (
            <p style={{ fontSize: 16, margin: 0, fontWeight: 700 }}>
              Order received. Please collect your order at {PICKUP_HUB.name} on pickup.
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              <label htmlFor="customerName" style={styles.label}>
                Full name
              </label>
              <input
                id="customerName"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                disabled={exceedsLimit}
                style={styles.input}
              />

              <label htmlFor="customerPhone" style={styles.label}>
                Phone number
              </label>
              <input
                id="customerPhone"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                disabled={exceedsLimit}
                style={styles.input}
              />

              <label htmlFor="instructions" style={styles.label}>
                Instructions
              </label>
              <textarea
                id="instructions"
                rows={2}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                disabled={exceedsLimit}
                placeholder="Write any notes for us here, for example: staple each copy, print double-sided, or collect by Thursday"
                style={{ ...styles.input, resize: "vertical" }}
              />

              <button
                type="submit"
                disabled={!canCheckout}
                style={canCheckout ? styles.button : styles.buttonDisabled}
              >
                Confirm order ({formatKWD(pricing.grandTotal)})
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}

