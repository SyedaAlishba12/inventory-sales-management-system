"use client";

import { useMemo, useState } from "react";
import {
  Banknote,
  Building2,
  CreditCard,
  Loader2,
  Lock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/utils/cn";
import { formatCurrency } from "@/utils/currency";

// ---------------------------------------------------------------------------
// Maps down to the backend's `payment_method` enum: CASH | CARD | ONLINE.
// The finalized ERD has no field for *which* wallet/bank was used — only
// the method category. "provider" below is UI-only state; if the team wants
// Easypaisa vs JazzCash vs bank transfer distinguished in the database,
// that needs a new column and should go through an ERD review first.
// ---------------------------------------------------------------------------

type PaymentCategory = "CASH" | "ONLINE_GROUP";
type OnlineProvider = "CARD" | "EASYPAISA" | "JAZZCASH" | "NAYAPAY" | "BANK_TRANSFER";

// Drop the official logo files into frontend/public/icons/ with these exact
// names. If a file is missing, ProviderIcon falls back to a colored text
// badge so the UI never shows a broken image.
const WALLET_LOGOS: Record<string, { src: string; fallbackLabel: string; fallbackClass: string }> = {
  EASYPAISA: { src: "/icons/easypaisa.png", fallbackLabel: "EP", fallbackClass: "bg-green-600 text-white" },
  JAZZCASH: { src: "/icons/jazzcash.png", fallbackLabel: "JC", fallbackClass: "bg-red-600 text-white" },
  NAYAPAY: { src: "/icons/nayapay.png", fallbackLabel: "NP", fallbackClass: "bg-teal-700 text-white" },
};

function ProviderIcon({ provider }: { provider: keyof typeof WALLET_LOGOS }) {
  const [failed, setFailed] = useState(false);
  const logo = WALLET_LOGOS[provider];

  if (failed) {
    return (
      <span className={cn("flex size-4 items-center justify-center rounded text-[9px] font-bold", logo.fallbackClass)}>
        {logo.fallbackLabel}
      </span>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={logo.src} alt="" className="size-4 object-contain" onError={() => setFailed(true)} />;
}

const PK_BANKS = [
  "HBL",
  "MCB",
  "UBL",
  "Bank Alfalah",
  "Meezan Bank",
  "Allied Bank",
  "Faysal Bank",
  "Standard Chartered",
];

type CardBrand = "visa" | "mastercard" | "amex" | null;

function detectBrand(digits: string): CardBrand {
  if (/^4/.test(digits)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "mastercard";
  if (/^3[47]/.test(digits)) return "amex";
  return null;
}

function formatCardNumber(raw: string, brand: CardBrand) {
  const digits = raw.replace(/\D/g, "").slice(0, brand === "amex" ? 15 : 16);
  if (brand === "amex") {
    return digits.replace(/^(\d{4})(\d{0,6})(\d{0,5}).*/, (_m, a, b, c) =>
      [a, b, c].filter(Boolean).join(" "),
    );
  }
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatExpiry(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  return digits.length <= 2 ? digits : `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function isValidLuhn(digits: string) {
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let d = Number(digits[i]);
    if (shouldDouble) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    shouldDouble = !shouldDouble;
  }
  return digits.length > 0 && sum % 10 === 0;
}

function isExpiryValid(mmYY: string) {
  const match = /^(\d{2})\/(\d{2})$/.exec(mmYY);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  return year > currentYear || (year === currentYear && month >= currentMonth);
}

function formatPkMobile(raw: string) {
  return raw.replace(/\D/g, "").slice(0, 10);
}

function isValidPkMobile(digits: string) {
  return /^3\d{9}$/.test(digits);
}

interface OrderLine {
  name: string;
  quantity: number;
  price: number;
}

interface PaymentCheckoutProps {
  items: OrderLine[];
  subtotal: number;
  discount?: number;
  onDiscountChange?: (value: number) => void;
  tax?: number;
  currency?: string;
  onConfirm: (details: {
    paymentMethod: "CASH" | "CARD" | "ONLINE";
    provider?: OnlineProvider;
  }) => Promise<void> | void;
}

export function PaymentCheckout({
  items,
  subtotal,
  discount = 0,
  onDiscountChange,
  tax = 0,
  currency = "PKR",
  onConfirm,
}: PaymentCheckoutProps) {
  const total = Math.max(subtotal - discount, 0) + tax;

  const [category, setCategory] = useState<PaymentCategory>("ONLINE_GROUP");
  const [provider, setProvider] = useState<OnlineProvider>("CARD");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // card fields
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const brand = useMemo(() => detectBrand(cardNumber.replace(/\D/g, "")), [cardNumber]);
  const cvcLength = brand === "amex" ? 4 : 3;

  // wallet fields (Easypaisa / JazzCash / NayaPay)
  const [walletPhone, setWalletPhone] = useState("");

  // bank transfer
  const [bank, setBank] = useState(PK_BANKS[0]);

  function validate(): boolean {
    const next: Record<string, string> = {};

    if (category === "ONLINE_GROUP") {
      if (provider === "CARD") {
        const digits = cardNumber.replace(/\D/g, "");
        if (digits.length < 13 || !isValidLuhn(digits)) next.cardNumber = "Enter a valid card number.";
        if (!isExpiryValid(expiry)) next.expiry = "Enter a valid, non-expired MM/YY.";
        if (cvc.length < cvcLength) next.cvc = `${cvcLength} digits required.`;
        if (!cardholderName.trim()) next.cardholderName = "Enter the name on the card.";
      } else if (provider === "EASYPAISA" || provider === "JAZZCASH" || provider === "NAYAPAY") {
        if (!isValidPkMobile(walletPhone)) {
          next.walletPhone = "Enter a valid number, e.g. 300 1234567.";
        }
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleConfirm() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (category === "CASH") {
        await onConfirm({ paymentMethod: "CASH" });
      } else if (provider === "CARD") {
        await onConfirm({ paymentMethod: "CARD", provider: "CARD" });
      } else {
        await onConfirm({ paymentMethod: "ONLINE", provider });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Left: payment method */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Payment Method</h2>
          <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Lock className="size-3.5" /> Secure Checkout
          </span>
        </div>

        {/* Toggle: Cash on Delivery <-> Card/Online */}
        <div className="inline-flex rounded-full bg-muted p-1">
          <button
            type="button"
            onClick={() => setCategory("CASH")}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              category === "CASH"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Banknote className="size-4" /> Cash on Delivery
          </button>
          <button
            type="button"
            onClick={() => setCategory("ONLINE_GROUP")}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              category === "ONLINE_GROUP"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <CreditCard className="size-4" /> Card / Online
          </button>
        </div>

        {category === "CASH" && (
          <p className="text-sm text-muted-foreground">
            Customer pays in cash when the order is delivered.
          </p>
        )}

        {category === "ONLINE_GROUP" && (
          <div className="space-y-4">
            {/* Provider pills */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setProvider("CARD")}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  provider === "CARD"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-input text-muted-foreground hover:bg-muted",
                )}
              >
                <CreditCard className="size-3.5" />
                Card
              </button>
              {(
                [
                  { id: "EASYPAISA", label: "Easypaisa" },
                  { id: "JAZZCASH", label: "JazzCash" },
                  { id: "NAYAPAY", label: "NayaPay" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setProvider(opt.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    provider === opt.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input text-muted-foreground hover:bg-muted",
                  )}
                >
                  <ProviderIcon provider={opt.id} />
                  {opt.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setProvider("BANK_TRANSFER")}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  provider === "BANK_TRANSFER"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-input text-muted-foreground hover:bg-muted",
                )}
              >
                <Building2 className="size-3.5" />
                Bank Transfer
              </button>
            </div>

            {/* Dynamic fields per provider */}
            {provider === "CARD" && (
              <div className="space-y-3">
                <div>
                  <Label>Card information</Label>
                  <div className="mt-1.5 overflow-hidden rounded-lg border focus-within:ring-2 focus-within:ring-primary">
                    <div className="relative">
                      <Input
                        inputMode="numeric"
                        placeholder="1234 1234 1234 1234"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value, brand))}
                        disabled={submitting}
                        className="rounded-none border-0 border-b pr-16 shadow-none focus-visible:ring-0"
                      />
                      {brand && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                          {brand.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2">
                      <Input
                        inputMode="numeric"
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                        disabled={submitting}
                        className="rounded-none border-0 border-r shadow-none focus-visible:ring-0"
                      />
                      <Input
                        inputMode="numeric"
                        placeholder="CVC"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, cvcLength))}
                        disabled={submitting}
                        className="rounded-none border-0 shadow-none focus-visible:ring-0"
                      />
                    </div>
                  </div>
                  {(errors.cardNumber || errors.expiry || errors.cvc) && (
                    <p className="mt-1 text-xs text-danger">
                      {errors.cardNumber || errors.expiry || errors.cvc}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="cardholder-name">Cardholder name</Label>
                  <Input
                    id="cardholder-name"
                    placeholder="Full name on card"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    disabled={submitting}
                    className="mt-1.5"
                  />
                  {errors.cardholderName && (
                    <p className="mt-1 text-xs text-danger">{errors.cardholderName}</p>
                  )}
                </div>
              </div>
            )}

            {(provider === "EASYPAISA" || provider === "JAZZCASH" || provider === "NAYAPAY") && (
              <div className="space-y-1.5">
                <Label htmlFor="wallet-phone">Mobile account number</Label>
                <div className="flex overflow-hidden rounded-lg border focus-within:ring-2 focus-within:ring-primary">
                  <span className="flex items-center bg-muted px-3 text-sm text-muted-foreground">
                    +92
                  </span>
                  <Input
                    id="wallet-phone"
                    inputMode="numeric"
                    placeholder="300 1234567"
                    value={walletPhone}
                    onChange={(e) => setWalletPhone(formatPkMobile(e.target.value))}
                    disabled={submitting}
                    className="rounded-none border-0 shadow-none focus-visible:ring-0"
                  />
                </div>
                {errors.walletPhone && <p className="text-xs text-danger">{errors.walletPhone}</p>}
              </div>
            )}

            {provider === "BANK_TRANSFER" && (
              <div className="space-y-1.5">
                <Label htmlFor="bank-select">Select bank</Label>
                <select
                  id="bank-select"
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  disabled={submitting}
                  className="h-10 w-full rounded-lg border bg-card px-3 text-sm"
                >
                  {PK_BANKS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: order summary */}
      <Card className="h-fit">
        <CardContent className="space-y-4 p-4">
          <h3 className="font-semibold">Order Summary</h3>
          <div className="space-y-2 text-sm">
            {items.map((line, idx) => (
              <div key={idx} className="flex justify-between text-muted-foreground">
                <span>
                  {line.name} {line.quantity > 1 && `× ${line.quantity}`}
                </span>
                <span>{formatCurrency(line.price * line.quantity, currency)}</span>
              </div>
            ))}
          </div>

          {onDiscountChange && (
            <Input
              placeholder="Discount (PKR)"
              type="number"
              min={0}
              value={discount || ""}
              onChange={(e) => onDiscountChange(Math.max(0, Number(e.target.value) || 0))}
            />
          )}

          <div className="space-y-1.5 border-t pt-3 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal, currency)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Discount</span>
                <span>-{formatCurrency(discount, currency)}</span>
              </div>
            )}
            {tax > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Tax</span>
                <span>{formatCurrency(tax, currency)}</span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between border-t pt-3">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-bold">{formatCurrency(total, currency)}</span>
          </div>

          <Button size="lg" className="w-full" disabled={submitting} onClick={handleConfirm}>
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Processing...
              </>
            ) : (
              "Confirm Payment"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
