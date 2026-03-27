/**
 * Utility for robust email and password validation
 * Consistent with cross-platform security best practices
 */

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email) return "Email is required"
  if (!re.test(email)) return "Invalid email address"
  return null
}

export const validatePassword = (password) => {
  if (!password) return "Password is required"
  if (password.length < 8) return "Password must be at least 8 characters long"
  
  // Complexity checks: must have at least one uppercase, one lowercase, and one digit
  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasDigit = /\d/.test(password)
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  if (!(hasUpper && hasLower && hasDigit)) {
    return "Password must contain uppercase, lowercase, and numeric characters"
  }
  
  return null
}

/**
 * Basic input sanitization to remove any potentially harmful characters
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input
  return input.trim().replace(/[<>]/g, '') // Basic removal of HTML tags
}
