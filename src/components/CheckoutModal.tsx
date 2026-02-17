"use client";

import { useState } from "react";
import { X, CreditCard, Lock, Check } from "lucide-react";
import type { Booking } from "@/lib/types";

interface CheckoutItem {
  type: "flight" | "hotel";
  itemName: string;
  price: number;
  details: string;
}

interface CheckoutModalProps {
  items: CheckoutItem[];
  onComplete: (bookings: CheckoutItem[]) => void;
  onClose: () => void;
}

export function CheckoutModal({ items, onComplete, onClose }: CheckoutModalProps) {
  const [step, setStep] = useState<"review" | "processing" | "confirmed">("review");
  const [cardName, setCardName] = useState("Cem Emir Senyurt");
  const total = items.reduce((s, i) => s + i.price, 0);
  const taxes = Math.round(total * 0.12);
  const grandTotal = total + taxes;

  const handlePay = () => {
    setStep("processing");
    setTimeout(() => {
      setStep("confirmed");
    }, 2000);
  };

  const handleDone = () => {
    onComplete(items);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
          <div className="flex items-center gap-2 text-white">
            <Lock className="h-4 w-4" />
            <span className="text-sm font-semibold">Secure Checkout</span>
          </div>
          {step === "review" && (
            <button onClick={onClose} className="text-white/70 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="p-6">
          {/* ── Step 1: Review & Pay ───────────────────── */}
          {step === "review" && (
            <>
              {/* Order Summary */}
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                Order Summary
              </p>
              <div className="space-y-2 mb-4">
                {items.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg border border-gray-100 p-3">
                    <span className="text-xl">{item.type === "flight" ? "✈️" : "🏨"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.itemName}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{item.details}</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900">${item.price.toLocaleString()}</p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-100 pt-3 mb-5 space-y-1.5">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span>${total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Taxes & fees (est.)</span>
                  <span>${taxes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-gray-900 pt-1">
                  <span>Total</span>
                  <span>${grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Card Info (pre-filled mock) */}
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                Payment Details
              </p>
              <div className="space-y-3 mb-5">
                <div>
                  <label className="text-[11px] font-medium text-gray-500">Name on card</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-gray-500">Card number</label>
                  <div className="mt-1 flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">•••• •••• •••• 4242</span>
                    <span className="ml-auto text-[10px] font-bold text-indigo-500">VISA</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-gray-500">Expiry</label>
                    <div className="mt-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900">
                      12 / 28
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-500">CVC</label>
                    <div className="mt-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900">
                      •••
                    </div>
                  </div>
                </div>
              </div>

              {/* Pay Button */}
              <button
                onClick={handlePay}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-bold text-white shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all active:scale-[0.98]"
              >
                Pay ${grandTotal.toLocaleString()}
              </button>
              <p className="mt-2 text-center text-[10px] text-gray-400">
                This is a demo — no real charges will be made
              </p>
            </>
          )}

          {/* ── Step 2: Processing ────────────────────── */}
          {step === "processing" && (
            <div className="py-12 text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
              <p className="mt-4 text-sm font-medium text-gray-900">Processing payment...</p>
              <p className="mt-1 text-xs text-gray-400">Confirming reservations</p>
            </div>
          )}

          {/* ── Step 3: Confirmed ─────────────────────── */}
          {step === "confirmed" && (
            <div className="py-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <p className="mt-4 text-lg font-bold text-gray-900">Payment Confirmed!</p>
              <p className="mt-1 text-sm text-gray-500">
                Your bookings have been confirmed
              </p>
              <div className="mt-4 space-y-2">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-green-50 px-4 py-2">
                    <div className="flex items-center gap-2">
                      <span>{item.type === "flight" ? "✈️" : "🏨"}</span>
                      <span className="text-sm font-medium text-green-800 truncate max-w-[250px]">{item.itemName}</span>
                    </div>
                    <span className="text-xs font-bold text-green-600">Confirmed</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-gray-400">
                Confirmation #{Math.random().toString(36).slice(2, 10).toUpperCase()}
              </p>
              <button
                onClick={handleDone}
                className="mt-5 w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition-colors"
              >
                Done — View My Trips
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
