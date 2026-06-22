type RedactionRule = {
  label: string
  regex: RegExp
}

// Heuristic, regex-based PII redaction. Order matters: more specific patterns
// (email, ssn) run before broader ones (phone, long digit runs) so they win.
const RULES: RedactionRule[] = [
  { label: 'EMAIL', regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
  { label: 'SSN', regex: /\b\d{3}-\d{2}-\d{4}\b/g },
  { label: 'CREDIT_CARD', regex: /\b(?:\d[ -]?){13,16}\b/g },
  {
    label: 'PHONE',
    regex: /(?:\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g
  },
  { label: 'IP', regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g }
]

export function redactPii(text: string): string {
  if (!text) {
    return text
  }

  return RULES.reduce(
    (redacted, { label, regex }) => redacted.replace(regex, `[REDACTED_${label}]`),
    text
  )
}
