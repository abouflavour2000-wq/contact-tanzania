export function cleanName(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ").slice(0, 80);
}
export function cleanPhone(value: unknown) {
  if (typeof value !== "string") return "";
  const digits = value.replace(/\D/g, "");
  // Accept local 9-digit number or full Tanzania number 255 + 9 digits.
  const local = digits.startsWith("255") && digits.length === 12 ? digits.slice(3) : digits;
  return /^[67]\d{8}$/.test(local) ? `+255${local}` : "";
}
export function validGroupLink(value: unknown) {
  if (typeof value !== "string") return false;
  try {
    const u = new URL(value);
    return u.protocol === "https:" && (u.hostname === "chat.whatsapp.com" || u.hostname === "wa.me");
  } catch { return false; }
}
