"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check, ArrowLeft, Eye } from "lucide-react";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");

  return (
    <div className="text-center max-w-md mx-auto px-6">
      <div className="w-20 h-20 rounded-full bg-emerald/10 flex items-center justify-center mx-auto">
        <Check size={36} className="text-emerald" />
      </div>
      <h1 className="font-display text-4xl text-jet mt-6">Order Confirmed</h1>
      <p className="text-jet/60 text-sm mt-3 font-poppins leading-relaxed">
        Thank you for your order. We&apos;ll send a confirmation to your email and begin preparing your pieces.
      </p>
      {orderNumber && (
        <div className="mt-6 p-4 bg-ivory border border-jet/5">
          <p className="text-[10px] font-poppins uppercase tracking-luxe text-jet/40 mb-1">Order Number</p>
          <p className="font-poppins text-lg font-medium text-jet tracking-wider">{orderNumber}</p>
        </div>
      )}
      <div className="mt-8 space-y-3">
        {orderNumber && (
          <Link href={`/orders/${orderNumber}`}
            className="inline-flex items-center justify-center h-12 px-8 border border-jet/10 text-jet text-[10px] font-poppins uppercase tracking-luxe hover:bg-jet hover:text-cream transition-all duration-300 gap-2">
            <Eye size={14} /> Track Order
          </Link>
        )}
        <br />
        <Link href="/shop"
          className="inline-flex items-center h-12 px-8 bg-jet text-cream text-[10px] font-poppins uppercase tracking-luxe hover:bg-gold hover:text-jet transition-all duration-300">
          Continue Shopping
        </Link>
        <br />
        <Link href="/"
          className="inline-flex items-center gap-1 text-xs font-poppins text-jet/40 hover:text-jet transition-colors mt-2">
          <ArrowLeft size={12} /> Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <div className="pt-[72px] lg:pt-20 min-h-screen flex items-center justify-center">
      <Suspense fallback={
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      }>
        <ConfirmationContent />
      </Suspense>
    </div>
  );
}
