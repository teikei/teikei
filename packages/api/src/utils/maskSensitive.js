const MASKED_VALUE = '[redacted]'
const SENSITIVE_KEY_PATTERNS = ['key', 'secret', 'pass', 'token', 'connection']

const shouldMaskKey = (key) =>
  SENSITIVE_KEY_PATTERNS.some((pattern) => key.toLowerCase().includes(pattern))

const maskLeaf = (value) => {
  if (value === null || value === undefined) {
    return value
  }
  if (Array.isArray(value)) {
    return value.map(() => MASKED_VALUE)
  }
  if (value && typeof value === 'object') {
    return Object.keys(value).reduce((acc, maskKey) => {
      acc[maskKey] = MASKED_VALUE
      return acc
    }, {})
  }
  return MASKED_VALUE
}

const maskSensitive = (value) => {
  if (Array.isArray(value)) {
    return value.map(maskSensitive)
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).reduce((acc, [key, val]) => {
      acc[key] = shouldMaskKey(key) ? maskLeaf(val) : maskSensitive(val)
      return acc
    }, {})
  }
  return value
}

export { maskSensitive }
