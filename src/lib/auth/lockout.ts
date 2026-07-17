export async function checkAccountLockout(email: string): Promise<{ locked: boolean; remainingMinutes: number }> {
  try {
    const res = await fetch("/api/auth/lockout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()
    return { locked: data.locked || false, remainingMinutes: data.remainingMinutes || 0 }
  } catch {
    return { locked: false, remainingMinutes: 0 }
  }
}

export async function recordFailedAttempt(email: string): Promise<void> {
  try {
    await fetch("/api/auth/lockout", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, success: false }),
    })
  } catch {}
}

export async function recordSuccessfulLogin(email: string): Promise<void> {
  try {
    await fetch("/api/auth/lockout", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, success: true }),
    })
  } catch {}
}
