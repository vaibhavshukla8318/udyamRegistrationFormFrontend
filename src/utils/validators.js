export const aadhaarRegex = /^[0-9]{12}$/;
export const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export function validateField(name, value) {
  if (!value) return 'This field is required';
  if (name === 'aadhaar' && !aadhaarRegex.test(value)) return 'Aadhaar must be 12 digits';
  if (name === 'pan' && !panRegex.test(value.toUpperCase())) return 'PAN format invalid (e.g., ABCDE1234F)';
  if (name === 'pinCode' && !/^\d{6}$/.test(value)) return 'PIN must be 6 digits';
  return null;
}
