import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { type ReactNode } from "react"
import { Captcha } from "@/components/ui/captcha"
import { ErrorBoundary } from "@/components/ui/error-boundary"

describe("Captcha", () => {
  it("renders a security challenge question", () => {
    render(<Captcha onVerify={() => {}} />)
    expect(screen.getByText(/Security Check/)).toBeInTheDocument()
    expect(screen.getByLabelText("Enter the correct answer")).toBeInTheDocument()
  })

  it("shows verified state after correct answer", async () => {
    render(<Captcha onVerify={() => {}} />)
    const label = screen.getByText(/Security Check/).textContent || ""
    const match = label.match(/What is (\d+)\s*(\S)\s*(\d+)/)
    if (match) {
      const a = parseInt(match[1], 10)
      const op = match[2]
      const b = parseInt(match[3], 10)
      const answer = op === "+" ? a + b : a - b
      fireEvent.change(screen.getByLabelText("Enter the correct answer"), { target: { value: String(answer) } })
      fireEvent.click(screen.getByLabelText("Verify security answer"))
      expect(await screen.findByText("Security verified")).toBeInTheDocument()
    }
  })

  it("shows error on incorrect answer", async () => {
    render(<Captcha onVerify={() => {}} />)
    fireEvent.change(screen.getByLabelText("Enter the correct answer"), { target: { value: "999" } })
    fireEvent.click(screen.getByLabelText("Verify security answer"))
    expect(await screen.findByText(/Incorrect answer/)).toBeInTheDocument()
  })

  it("generates a new challenge via refresh button", () => {
    render(<Captcha onVerify={() => {}} />)
    const initialLabel = screen.getByText(/Security Check/).textContent
    fireEvent.click(screen.getByLabelText("Generate new security challenge"))
    const newLabel = screen.getByText(/Security Check/).textContent
    expect(newLabel).not.toBe(initialLabel)
  })
})

describe("ErrorBoundary", () => {
  function Bomb(): ReactNode {
    throw new Error("💥")
  }

  it("catches errors and displays fallback", () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    )
    expect(screen.getByText("Something went wrong")).toBeInTheDocument()
    expect(screen.getByText("💥")).toBeInTheDocument()
    expect(screen.getByText("Try again")).toBeInTheDocument()
    vi.mocked(console.error).mockRestore()
  })
})
