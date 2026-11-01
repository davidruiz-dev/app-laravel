export function formatPhone(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 9)
    .replace(/(\d{3})(?=\d)/g, '$1 ');
}