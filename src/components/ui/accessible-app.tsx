"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

function SkipLink() {
  return (
    <a
      href="#main-content"
      className="fixed top-0 left-0 z-[9999] -translate-y-full focus:translate-y-0 bg-gold text-jet text-xs font-poppins uppercase tracking-luxe px-4 py-2 transition-transform focus:outline-none"
    >
      Skip to content
    </a>
  )
}

function useFocusReset() {
  const pathname = usePathname()
  const prevPath = useRef(pathname)

  useEffect(() => {
    if (prevPath.current === pathname) return
    prevPath.current = pathname
    const main = document.getElementById("main-content") || document.querySelector("main")
    if (main && !document.activeElement?.closest("dialog, [role=dialog]")) {
      main.setAttribute("tabindex", "-1")
      main.focus({ preventScroll: true })
      setTimeout(() => main.removeAttribute("tabindex"), 100)
    }
  }, [pathname])
}

function useAriaAudit() {
  useEffect(() => {
    const audit = () => {
      const navs = document.querySelectorAll<HTMLElement>("nav:not([aria-label]):not([aria-labelledby])")
      navs.forEach((nav) => nav.setAttribute("aria-label", "Navigation"))
      const images = document.querySelectorAll<HTMLImageElement>("img:not([alt])")
      images.forEach((img) => img.setAttribute("alt", ""))
      const iframes = document.querySelectorAll<HTMLIFrameElement>("iframe:not([title])")
      iframes.forEach((iframe) => iframe.setAttribute("title", iframe.src || "Embedded content"))
    }
    audit()
    const observer = new MutationObserver(audit)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])
}

function useTrapFocus() {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        const modal = document.querySelector<HTMLElement>("[role=dialog][open], dialog[open]")
        if (modal) {
          const closeBtn = modal.querySelector<HTMLButtonElement>("button[aria-label*=close i], button[aria-label*=dismiss i]")
          closeBtn?.click()
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])
}

export function AccessibleApp() {
  useFocusReset()
  useAriaAudit()
  useTrapFocus()

  return (
    <>
      <SkipLink />
      <div id="aria-live-assertive" className="sr-only" aria-live="assertive" aria-atomic="true" />
      <div id="aria-live-polite" className="sr-only" aria-live="polite" aria-atomic="true" />
    </>
  )
}

export function announce(message: string, priority: "assertive" | "polite" = "polite") {
  const el = document.getElementById(`aria-live-${priority}`)
  if (el) {
    el.textContent = ""
    requestAnimationFrame(() => { el.textContent = message })
  }
}
