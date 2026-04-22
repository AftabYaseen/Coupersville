/**
 * Lightweight validators - no external deps.
 * Each returns { ok: true } or { ok: false, error: string }.
 */

export function validateEmail(email) {
  if (!email || typeof email !== "string") {
    return { ok: false, error: "Email is required." };
  }
  const trimmed = email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { ok: false, error: "Enter a valid email address." };
  }
  return { ok: true };
}

export function validatePassword(password) {
  if (!password || typeof password !== "string") {
    return { ok: false, error: "Password is required." };
  }
  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }
  return { ok: true };
}

export function validateRequired(value, fieldName = "This field") {
  if (!value || (typeof value === "string" && value.trim() === "")) {
    return { ok: false, error: `${fieldName} is required.` };
  }
  return { ok: true };
}

export function validatePhone(phone) {
  if (!phone) return { ok: true }; // optional field
  const cleaned = phone.replace(/[\s\-().+]/g, "");
  if (!/^\d{7,15}$/.test(cleaned)) {
    return { ok: false, error: "Enter a valid phone number." };
  }
  return { ok: true };
}

export function validateIncident({ title, category, severity }) {
  const errors = {};
  if (!title || title.trim() === "") errors.title = "Title is required.";
  if (!category) errors.category = "Category is required.";
  if (!severity) errors.severity = "Severity is required.";
  return Object.keys(errors).length > 0
    ? { ok: false, errors }
    : { ok: true, errors: {} };
}

export function validateCompany({ company_name, business_type }) {
  const errors = {};
  if (!company_name || company_name.trim() === "")
    errors.company_name = "Company name is required.";
  if (!business_type) errors.business_type = "Business type is required.";
  return Object.keys(errors).length > 0
    ? { ok: false, errors }
    : { ok: true, errors: {} };
}

// Severity and category constants
export const INCIDENT_CATEGORIES = [
  { value: "trespassing", label: "Trespassing" },
  { value: "vandalism", label: "Vandalism" },
  { value: "theft", label: "Theft" },
  { value: "medical", label: "Medical" },
  { value: "fire", label: "Fire" },
  { value: "suspicious_activity", label: "Suspicious Activity" },
  { value: "equipment_damage", label: "Equipment Damage" },
  { value: "other", label: "Other" },
];

export const INCIDENT_SEVERITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

export const INCIDENT_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

export const BUSINESS_TYPES = [
  { value: "security", label: "Security" },
  { value: "construction", label: "Construction" },
  { value: "cleaning", label: "Cleaning" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "technology", label: "Technology" },
  { value: "other", label: "Other" },
];

export const USER_ROLES = [
  { value: "management", label: "Management" },
  { value: "supervisor", label: "Supervisor" },
  { value: "guard", label: "Guard" },
  { value: "rover", label: "Rover" },
];
