export function friendlyError(err: unknown): string {
  const msg = typeof err === "string" ? err : err instanceof Error ? err.message : String(err)

  const insufficientStock = msg.match(/^Insufficient stock for "(.+)"\. Available: (\d+), requested: (\d+)$/)
  if (insufficientStock) {
    const [, name, available, requested] = insufficientStock
    if (available === "0") {
      return `"${name}" is currently out of stock. You requested ${requested}, but unfortunately none are available right now. Please adjust your order or choose an alternative.`
    }
    return `We only have ${available} units of "${name}" available, but you requested ${requested}. Please reduce the quantity and try again.`
  }

  if (msg === "One or more products are unavailable") {
    return "Some items in your cart are no longer available. Please review your order and remove any unavailable items."
  }

  if (msg.startsWith("Too many requests")) {
    return "You've made several attempts in a short period. Please wait a moment and try again."
  }

  if (msg === "Duplicate request") {
    return "This order appears to have already been submitted. Please check your account for recent orders."
  }

  if (msg === "Invalid request body") {
    return "Something unexpected happened. Please try submitting your order again."
  }

  if (msg === "Validation failed") {
    return "Please review the highlighted fields and correct any errors before continuing."
  }

  if (msg === "Email and password are required") {
    return "Please enter both your email address and password to continue."
  }

  if (msg === "Invalid email or password") {
    return "The email or password you entered doesn't match our records. Please double-check and try again."
  }

  if (msg === "Access denied") {
    return "This area is for customers only. If you're an admin, please use the admin login page."
  }

  if (msg === "Login failed") {
    return "We couldn't sign you in. Please check your credentials and try again."
  }

  if (msg === "Registration failed") {
    return "We weren't able to create your account. Please try again or contact support if the issue persists."
  }

  if (msg.startsWith("Failed to")) {
    return `We weren't able to process your request. ${msg}. Please try again or contact support if the issue continues.`
  }

  if (msg.startsWith("Name is required") || msg.startsWith("Email is required") || msg.startsWith("Password is required")) {
    return msg.charAt(0).toUpperCase() + msg.slice(1).replace(/ is required$/, " is required to continue.")
  }

  return msg
}
