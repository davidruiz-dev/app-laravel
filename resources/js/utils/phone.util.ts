export function formatPhone(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 9)
    .replace(/(\d{3})(?=\d)/g, '$1 ');
}

export const maskedPhone = (value: string) => {
  const digits = value.replace(/\D/g, "");

  if (digits.length !== 9) return "•••••••••";

  return `*** *** ${digits.slice(-3)}`;
};