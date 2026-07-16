"use client";

import { useState, useEffect } from "react";
import { useAdminAuth } from "@/components/admin/auth-provider";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Save, Check, Loader2 } from "lucide-react";
import { sanitizeString, isValidEmail, isValidPhone } from "@/lib/validation";
import { useToast } from "@/components/ui/toast";

const ALL_PAYMENT_METHODS = ["Paystack", "Flutterwave", "Stripe", "Bank Transfer", "Cash on Delivery"] as const
const PAYMENT_METHOD_MAP: Record<string, string> = {
  "Paystack": "paystack",
  "Flutterwave": "flutterwave",
  "Stripe": "stripe",
  "Bank Transfer": "bank-transfer",
  "Cash on Delivery": "cash-on-delivery",
}
const PAYMENT_METHOD_REVERSE: Record<string, string> = Object.fromEntries(
  Object.entries(PAYMENT_METHOD_MAP).map(([k, v]) => [v, k])
)

interface StoreSettings {
  name: string;
  email: string;
  phone: string;
  address: string;
  freeShippingThreshold: string;
  flatShippingRate: string;
  paymentMethods: string[];
}

export default function AdminSettingsPage() {
  const { user } = useAdminAuth();
  const [store, setStore] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/settings");
        if (!res.ok) throw new Error("Failed to load settings");
        const data = await res.json();
        setStore(data);
        if (data.name) setProfileName(data.name);
      } catch {
        setError("Failed to load settings from server");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    if (!store) return;
    setError("");
    setFieldErrors({});

    const errors: Record<string, string> = {};
    let valid = true;

    if (!store.name.trim()) { errors.name = "Store name is required"; valid = false; }
    if (!store.email.trim()) { errors.email = "Email is required"; valid = false; }
    else if (!isValidEmail(store.email)) { errors.email = "Invalid email format"; valid = false; }
    if (store.phone && !isValidPhone(store.phone)) { errors.phone = "Invalid phone format"; valid = false; }

    const thresholdNum = Number(store.freeShippingThreshold);
    if (isNaN(thresholdNum) || thresholdNum < 0) { errors.freeShippingThreshold = "Must be a non-negative number"; valid = false; }

    const rateNum = Number(store.flatShippingRate);
    if (isNaN(rateNum) || rateNum < 0) { errors.flatShippingRate = "Must be a non-negative number"; valid = false; }

    setFieldErrors(errors);
    if (!valid) return;

    setSaving(true);
    try {
      const enabledPaymentMethods = ALL_PAYMENT_METHODS
        .filter((m) => store.paymentMethods.includes(PAYMENT_METHOD_MAP[m]))
        .map((m) => PAYMENT_METHOD_MAP[m])

      const sanitized: StoreSettings = {
        name: sanitizeString(store.name, 200),
        email: store.email.trim().toLowerCase(),
        phone: sanitizeString(store.phone, 50),
        address: sanitizeString(store.address, 500),
        freeShippingThreshold: store.freeShippingThreshold,
        flatShippingRate: store.flatShippingRate,
        paymentMethods: enabledPaymentMethods,
      };

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitized),
      });

      if (!res.ok) throw new Error("Save failed");

      setStore(sanitized);
      setSaved(true);
      toast({ title: "Settings saved", variant: "success" });
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      toast({ title: "Save failed", description: String(e), variant: "error" });
      setError(String(e));
    } finally {
      setSaving(false);
    }
  };

  const update = (key: keyof StoreSettings, value: string) => {
    setStore((prev) => prev ? { ...prev, [key]: value } : prev);
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const Field = ({ label, value, onChange, type = "text", error: fieldError }: {
    label: string; value: string; onChange: (v: string) => void; type?: string; error?: string;
  }) => (
    <div className="mb-4 last:mb-0">
      <label className="block text-xs font-poppins text-jet/60 mb-1.5">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className={`w-full h-11 px-4 bg-ivory/50 border text-jet text-sm font-poppins focus:outline-none focus:border-gold/50 transition-colors ${fieldError ? "border-burgundy" : "border-jet/10"}`} />
      {fieldError && <p className="text-burgundy text-[10px] font-poppins mt-1">{fieldError}</p>}
    </div>
  );

  const Section = ({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) => (
    <div className="bg-cream border border-jet/5 p-6">
      <h3 className="font-poppins text-[10px] uppercase tracking-luxe text-jet/40 mb-1">{title}</h3>
      {desc && <p className="text-xs text-jet/40 mb-4">{desc}</p>}
      {children}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-jet/30" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="text-center py-16">
        <p className="text-jet/50 font-poppins">Could not load settings</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-jet">Settings</h1>
          <p className="text-jet/50 text-sm font-poppins mt-1">Manage your store and profile</p>
        </div>
        <Button onClick={handleSave} variant="gold" size="sm" disabled={saving}>
          {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <><Check size={14} /> Saved</> : <><Save size={14} /> Save Changes</>}
        </Button>
      </div>

      {error && <div className="mb-6 p-4 bg-burgundy/10 border border-burgundy/20 text-burgundy text-sm font-poppins">{error}</div>}

      <div className="grid lg:grid-cols-2 gap-6">
        <Section title="Store Profile" desc="Your public store information">
          <Field label="Store Name" value={store.name} onChange={(v) => update("name", v)} error={fieldErrors.name} />
          <Field label="Email" value={store.email} onChange={(v) => update("email", v)} error={fieldErrors.email} />
          <Field label="Phone" value={store.phone} onChange={(v) => update("phone", v)} error={fieldErrors.phone} />
          <Field label="Address" value={store.address} onChange={(v) => update("address", v)} />
        </Section>

        <Section title="Shipping Configuration" desc="Set your shipping rates">
          <Field label="Free Shipping Threshold (₦)" value={store.freeShippingThreshold} onChange={(v) => update("freeShippingThreshold", v)} type="number" error={fieldErrors.freeShippingThreshold} />
          <Field label="Flat Shipping Rate (₦)" value={store.flatShippingRate} onChange={(v) => update("flatShippingRate", v)} type="number" error={fieldErrors.flatShippingRate} />
          <div className="mt-4 pt-4 border-t border-jet/5">
            <h4 className="text-[10px] font-poppins uppercase tracking-luxe text-jet/40 mb-3">Payment Methods</h4>
            {ALL_PAYMENT_METHODS.map((method) => {
              const key = PAYMENT_METHOD_MAP[method]
              const checked = store.paymentMethods.includes(key)
              return (
                <label key={method} className="flex items-center gap-3 py-2 cursor-pointer">
                  <input type="checkbox" checked={checked}
                    onChange={() => {
                      const updated = checked
                        ? store.paymentMethods.filter((m) => m !== key)
                        : [...store.paymentMethods, key]
                      setStore({ ...store, paymentMethods: updated })
                    }}
                    className="w-4 h-4 accent-jet" />
                  <span className="text-sm font-poppins text-jet/70">{method}</span>
                </label>
              )
            })}
          </div>
        </Section>

        <Section title="Your Profile" desc="Your admin account details">
          <div className="flex items-center gap-4 mb-4">
            <img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "A")}&background=1a1a1a&color=d4af37`} alt={user?.name || "Admin"} className="w-12 h-12 rounded-full object-cover" />
            <div>
              <p className="font-poppins text-sm text-jet font-medium">{user?.name}</p>
              <p className="text-xs text-jet/40">{user?.email}</p>
            </div>
          </div>
          <Field label="Full Name" value={profileName} onChange={(v) => setProfileName(v)} />
          <Field label="Email" value={user?.email || ""} onChange={() => {}} />
          <Field label="Phone" value={profilePhone} onChange={(v) => setProfilePhone(v)} />
          <div className="mt-3">
            <button onClick={async () => {
              setProfileSaving(true)
              try {
                const res = await fetch("/api/admin/settings", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name: sanitizeString(profileName, 200), phone: sanitizeString(profilePhone, 50) }),
                })
                if (!res.ok) throw new Error("Failed")
                toast({ title: "Profile updated", variant: "success" })
              } catch {
                toast({ title: "Profile update failed", variant: "error" })
              } finally { setProfileSaving(false) }
            }} disabled={profileSaving}
              className="h-8 px-4 bg-jet text-cream text-[10px] font-poppins uppercase tracking-luxe hover:bg-gold hover:text-jet transition-all duration-300">
              {profileSaving ? "Saving..." : "Update Profile"}
            </button>
          </div>
        </Section>

        <Section title="System" desc="Application info">
          <div className="space-y-2 text-sm font-poppins text-jet/60">
            <div className="flex justify-between py-2 border-b border-jet/5">
              <span>Version</span> <span className="text-jet">1.0.0</span>
            </div>
            <div className="flex justify-between py-2 border-b border-jet/5">
              <span>Environment</span> <span className="text-emerald">Development</span>
            </div>
            <div className="flex justify-between py-2 border-b border-jet/5">
              <span>Data Source</span> <span className="text-jet">Supabase</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Last Backup</span> <span className="text-jet">N/A</span>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
