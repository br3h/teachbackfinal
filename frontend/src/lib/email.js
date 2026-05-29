/**
 * Email validation utility used by the waitlist form.
 * Returns null on success, or a user-facing error message on failure.
 */

export const EMAIL_REGEX =
  /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/;

export const MAX_EMAIL_LENGTH = 254; // RFC 5321

export function validateEmail(value) {
  const v = (value || "").trim();
  if (!v) return "Please enter your email.";
  if (v.length > MAX_EMAIL_LENGTH) return "That email looks too long.";
  if (!EMAIL_REGEX.test(v)) return "That email does not look right.";
  return null;
}
