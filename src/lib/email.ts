import { Resend } from "resend"
import { formatPrice } from "@/lib/utils"

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

const FROM = "YSI Fashion <orders@ysifashion.com>"

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
}

export async function sendOrderConfirmation(
  email: string,
  name: string,
  orderNumber: string,
  items: { name: string; quantity: number; price: number }[],
  total: number,
  isPreOrder?: boolean,
) {
  const resend = getResend()
  if (!resend) {
    console.log(`[email] Skipping order confirmation for ${email} — RESEND_API_KEY not set`)
    return { ok: true, skipped: true }
  }

  const itemRows = items
    .map((i) => `<tr><td style="padding:8px 0;border-bottom:1px solid #eee;font-size:14px">${i.name} x${i.quantity}</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;font-size:14px">${formatPrice(i.price * i.quantity)}</td></tr>`)
    .join("")

  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: isPreOrder ? `Pre-Order Confirmed — ${orderNumber}` : `Order Confirmed — ${orderNumber}`,
      html: `<div style="max-width:480px;margin:0 auto;font-family:Georgia,serif;color:#1a1a1a">
        <div style="text-align:center;padding:32px 0;border-bottom:2px solid #c9a84c">
          <h1 style="font-size:18px;letter-spacing:4px;font-weight:400">YSI FASHION</h1>
        </div>
        <div style="padding:32px 0">
          <p style="font-size:15px;color:#555">Dear ${name},</p>
          <p style="font-size:15px;color:#555">${isPreOrder ? "Your pre-order has been received." : "Thank you for your order."}</p>
          <p style="font-size:13px;color:#888">Order <strong style="color:#1a1a1a">${orderNumber}</strong></p>
          ${isPreOrder ? '<p style="font-size:13px;color:#c9a84c;margin:16px 0">We will notify you when your pre-ordered item is ready to ship.</p>' : ""}
          <table style="width:100%;border-collapse:collapse;margin-top:16px">${itemRows}</table>
          <div style="border-top:2px solid #1a1a1a;padding:12px 0;margin-top:8px;text-align:right;font-size:16px;font-weight:700">Total: ${formatPrice(total)}</div>
        </div>
        <div style="text-align:center;padding:24px 0;border-top:1px solid #eee;font-size:12px;color:#aaa">
          <a href="${appUrl()}/account" style="color:#c9a84c;text-decoration:none">View Order</a>
        </div>
      </div>`,
    })
    return { ok: true }
  } catch (err) {
    console.error(`[email] Failed to send order confirmation to ${email}:`, err)
    return { ok: false, error: String(err) }
  }
}

export async function sendPreOrderAvailable(
  email: string,
  name: string,
  productName: string,
  orderNumber: string,
) {
  const resend = getResend()
  if (!resend) {
    console.log(`[email] Skipping pre-order available for ${email} — RESEND_API_KEY not set`)
    return { ok: true, skipped: true }
  }

  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `Your Pre-Order is Ready — ${productName}`,
      html: `<div style="max-width:480px;margin:0 auto;font-family:Georgia,serif;color:#1a1a1a">
        <div style="text-align:center;padding:32px 0;border-bottom:2px solid #c9a84c">
          <h1 style="font-size:18px;letter-spacing:4px;font-weight:400">YSI FASHION</h1>
        </div>
        <div style="padding:32px 0">
          <p style="font-size:15px;color:#555">Dear ${name},</p>
          <p style="font-size:15px;color:#555">Great news — <strong style="color:#1a1a1a">${productName}</strong> is now available!</p>
          <p style="font-size:13px;color:#888">Order <strong style="color:#1a1a1a">${orderNumber}</strong></p>
          <p style="font-size:13px;color:#555;margin:16px 0">Your pre-ordered item is ready to ship. You will receive a shipping confirmation once it's on its way.</p>
        </div>
        <div style="text-align:center;padding:24px 0;border-top:1px solid #eee;font-size:12px;color:#aaa">
          <a href="${appUrl()}/account" style="color:#c9a84c;text-decoration:none">View Order</a>
        </div>
      </div>`,
    })
    return { ok: true }
  } catch (err) {
    console.error(`[email] Failed to send pre-order available to ${email}:`, err)
    return { ok: false, error: String(err) }
  }
}
