"use client"

import { useEffect } from "react"

export function AccessibleApp() {
  useEffect(() => {
    const main = document.querySelector("main")
    if (main && !main.getAttribute("role")) {
      main.setAttribute("role", "main")
    }
    const navs = document.querySelectorAll("nav:not([aria-label])")
    navs.forEach((nav) => {
      if (!nav.getAttribute("aria-label")) {
        nav.setAttribute("aria-label", "Navigation")
      }
    })
    const images = document.querySelectorAll("img:not([alt])")
    images.forEach((img) => {
      img.setAttribute("alt", "")
    })
    const buttons = document.querySelectorAll("button:not([aria-label]):not(:has(span:only-child))")
    buttons.forEach((btn) => {
      if (!btn.textContent?.trim() && !btn.getAttribute("aria-label")) {
        btn.setAttribute("aria-label", "Button")
      }
    })
  }, [])

  return null
}
