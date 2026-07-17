import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { Captcha } from "@/components/ui/captcha"

describe("Captcha", () => {
  it("renders a security challenge question", () => {
    render(<Captcha onVerify={() => {}} />)
    expect(screen.getByText(/Security Check/)).toBeInTheDocument()
    expect(screen.getByLabelText("Security check answer")).toBeInTheDocument()
  })
})
